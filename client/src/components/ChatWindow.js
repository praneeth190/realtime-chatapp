import React, { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';

function ChatWindow({ room, messages, user, socket }) {
  const messagesEndRef = useRef(null);

  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  
  const groupedMessages = [];
  let lastDate = '';
  messages.forEach((msg) => {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: 'date', date: msgDate });
      lastDate = msgDate;
    }
    groupedMessages.push({ type: 'message', data: msg });
  });

  const renderMessage = (msg) => {
    const isOwnMessage = msg.sender && msg.sender._id === user.id;
    const senderName = msg.sender ? msg.sender.username : 'Unknown';

    return (
      <div key={msg._id} className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
        {!isOwnMessage && <span className="message-sender">{senderName}</span>}
        <div className="message-bubble">
          {msg.messageType === 'image' && msg.fileUrl && (
            <img
              src={`http://localhost:5000${msg.fileUrl}`}
              alt="shared"
              className="message-image"
              onClick={() => window.open(`http://localhost:5000${msg.fileUrl}`, '_blank')}
            />
          )}
          {msg.messageType === 'file' && msg.fileUrl && (
            <a
              href={`http://localhost:5000${msg.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
            >
              📎 {msg.fileName || 'Download file'}
            </a>
          )}
          {msg.content && <p className="message-text">{msg.content}</p>}
          <span className="message-time">{formatTime(msg.createdAt)}</span>
        </div>
      </div>
    );
  };

  
  const getDisplayName = () => {
    if (room.isDirect) {
      const other = room.members.find((m) => m._id !== user.id);
      return other ? other.username : room.name;
    }
    return room.name;
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <h3>
          {room.isDirect ? '💬 ' : room.isPrivate ? '🔒 ' : '# '}
          {getDisplayName()}
        </h3>
        <span className="room-member-count">
          {room.isDirect ? 'Direct message' : `${room.members.length} members`}
        </span>
      </div>

      <div className="messages-container">
        {groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${index}`} className="date-separator">
                <span>{item.date}</span>
              </div>
            );
          }
          return renderMessage(item.data);
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput room={room} user={user} socket={socket} />
    </div>
  );
}

export default ChatWindow;
