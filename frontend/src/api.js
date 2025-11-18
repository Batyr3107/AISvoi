const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = {
  async getConversations() {
    const response = await fetch(`${API_URL}/conversations`);
    return response.json();
  },

  async createConversation(title) {
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return response.json();
  },

  async deleteConversation(id) {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  async getMessages(conversationId) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`);
    return response.json();
  },

  async chatStream(message, conversationId, model, onChunk) {
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        model
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          onChunk(data);
        }
      }
    }
  },

  async getModels() {
    const response = await fetch(`${API_URL}/models`);
    return response.json();
  },

  async pullModel(name, onProgress) {
    const response = await fetch(`${API_URL}/models/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          onProgress(data);
        }
      }
    }
  },

  async deleteModel(name) {
    const response = await fetch(`${API_URL}/models/${name}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

export default api;
