import httpx
import os
from typing import AsyncGenerator, List, Dict, Optional
import json


class OllamaClient:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_HOST", "http://ollama:11434")
        self.client = httpx.AsyncClient(timeout=300.0)

    async def generate_stream(
        self,
        model: str,
        prompt: str,
        context: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        """Stream response from Ollama"""
        messages = context or []
        messages.append({"role": "user", "content": prompt})

        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }

        async with self.client.stream("POST", url, json=payload) as response:
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            yield data["message"]["content"]
                    except json.JSONDecodeError:
                        continue

    async def list_models(self) -> List[Dict]:
        """Get list of available models"""
        try:
            url = f"{self.base_url}/api/tags"
            response = await self.client.get(url)
            response.raise_for_status()
            data = response.json()
            return data.get("models", [])
        except Exception as e:
            print(f"Error listing models: {e}")
            return []

    async def pull_model(self, model_name: str) -> AsyncGenerator[Dict, None]:
        """Pull a model from Ollama registry"""
        url = f"{self.base_url}/api/pull"
        payload = {"name": model_name, "stream": True}

        async with self.client.stream("POST", url, json=payload) as response:
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        yield data
                    except json.JSONDecodeError:
                        continue

    async def delete_model(self, model_name: str) -> bool:
        """Delete a model"""
        try:
            url = f"{self.base_url}/api/delete"
            payload = {"name": model_name}
            response = await self.client.delete(url, json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Error deleting model: {e}")
            return False

    async def check_health(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except Exception:
            return False

    async def close(self):
        await self.client.aclose()


ollama_client = OllamaClient()
