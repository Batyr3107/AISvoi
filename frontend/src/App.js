import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ModelSelector from './components/ModelSelector';
import api from './api';

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('llama2');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadConversations();
    loadModels();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadModels = async () => {
    try {
      const data = await api.getModels();
      setModels(data.models || []);
      if (data.models && data.models.length > 0) {
        setSelectedModel(data.models[0].name);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await api.createConversation('New Conversation');
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await api.deleteConversation(id);
      setConversations(conversations.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);

    const userMessage = {
      role: 'user',
      content: content,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let conversationId = currentConversation?.id;
      let assistantContent = '';

      const assistantMessage = {
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      await api.chatStream(
        content,
        conversationId,
        selectedModel,
        (chunk) => {
          if (chunk.type === 'metadata') {
            conversationId = chunk.conversation_id;
            if (!currentConversation) {
              loadConversations();
              api.getConversations().then(convs => {
                const newConv = convs.find(c => c.id === conversationId);
                if (newConv) {
                  setCurrentConversation(newConv);
                }
              });
            }
          } else if (chunk.type === 'chunk') {
            assistantContent += chunk.content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: assistantContent
              };
              return newMessages;
            });
          }
        }
      );

      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onSelectConversation={setCurrentConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`main-content ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <div className="header">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>AISvoi</h1>
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onRefreshModels={loadModels}
          />
        </div>
        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
