import React from 'react';
import './Sidebar.css';

function Sidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>Conversations</h2>
        <button className="new-chat-btn" onClick={onNewConversation} title="New conversation">
          + New Chat
        </button>
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet</p>
            <p className="empty-hint">Start a new chat!</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv)}
            >
              <div className="conversation-content">
                <div className="conversation-title">{conv.title}</div>
                <div className="conversation-meta">
                  <span className="conversation-date">{formatDate(conv.updated_at)}</span>
                  <span className="conversation-count">{conv.message_count} messages</span>
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this conversation?')) {
                    onDeleteConversation(conv.id);
                  }
                }}
                title="Delete conversation"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="footer-info">
          <p className="app-name">AISvoi v1.0</p>
          <p className="app-desc">Your Personal AI Assistant</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
