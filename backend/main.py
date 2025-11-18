from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from database import init_db, get_db, Conversation, Message, ModelConfig
from ollama_client import ollama_client

app = FastAPI(title="AISvoi - Personal AI Assistant", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class MessageCreate(BaseModel):
    content: str
    role: str = "user"


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    model: str = "llama2"


class ModelPull(BaseModel):
    name: str


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    model: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("Database initialized")


@app.on_event("shutdown")
async def shutdown_event():
    await ollama_client.close()


# Health check
@app.get("/")
async def root():
    return {"message": "AISvoi API is running", "status": "ok"}


@app.get("/health")
async def health_check():
    ollama_health = await ollama_client.check_health()
    return {
        "status": "healthy" if ollama_health else "degraded",
        "ollama": "connected" if ollama_health else "disconnected"
    }


# Conversations endpoints
@app.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    result = []
    for conv in conversations:
        message_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
        conv_dict = {
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "message_count": message_count
        }
        result.append(ConversationResponse(**conv_dict))
    return result


@app.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db)
):
    db_conversation = Conversation(title=conversation.title)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return ConversationResponse(
        id=db_conversation.id,
        title=db_conversation.title,
        created_at=db_conversation.created_at,
        updated_at=db_conversation.updated_at,
        message_count=0
    )


@app.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    return messages


@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    # Delete messages first
    db.query(Message).filter(Message.conversation_id == conversation_id).delete()
    # Delete conversation
    db.query(Conversation).filter(Conversation.id == conversation_id).delete()
    db.commit()
    return {"status": "deleted"}


# Chat endpoint with streaming
@app.post("/chat/stream")
async def chat_stream(request: ChatRequest, db: Session = Depends(get_db)):
    # Create or get conversation
    if request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(title=request.message[:50])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )
    db.add(user_message)
    db.commit()

    # Get conversation history
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at).all()

    context = [{"role": msg.role, "content": msg.content} for msg in messages[:-1]]

    async def generate():
        full_response = ""
        try:
            # Send conversation ID first
            yield f"data: {json.dumps({'conversation_id': conversation.id, 'type': 'metadata'})}\n\n"

            async for chunk in ollama_client.generate_stream(
                model=request.model,
                prompt=request.message,
                context=context
            ):
                full_response += chunk
                yield f"data: {json.dumps({'content': chunk, 'type': 'chunk'})}\n\n"

            # Save assistant message
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
                model=request.model
            )
            db.add(assistant_message)
            conversation.updated_at = datetime.utcnow()
            db.commit()

            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# Models endpoints
@app.get("/models")
async def list_models():
    models = await ollama_client.list_models()
    return {"models": models}


@app.post("/models/pull")
async def pull_model(model: ModelPull):
    async def generate():
        try:
            async for progress in ollama_client.pull_model(model.name):
                yield f"data: {json.dumps(progress)}\n\n"
            yield f"data: {json.dumps({'status': 'success'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.delete("/models/{model_name}")
async def delete_model(model_name: str):
    success = await ollama_client.delete_model(model_name)
    if success:
        return {"status": "deleted"}
    raise HTTPException(status_code=500, detail="Failed to delete model")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
