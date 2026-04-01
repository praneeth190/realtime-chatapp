import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function MessageInput({ room, user, socket }) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!message.trim()) return;

    socket.emit('send-message', {
      content: message.trim(),
      senderId: user.id,
      senderName: user.username,
      roomId: room._id,
      messageType: 'text'
    });

    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

  
      socket.emit('send-message', {
        content: '',
        senderId: user.id,
        senderName: user.username,
        roomId: room._id,
        messageType: res.data.messageType,
        fileUrl: res.data.fileUrl,
        fileName: res.data.fileName
      });
    } catch (err) {
      alert('Failed to upload file. Max size is 5MB.');
      console.error('Upload error:', err);
    }
    setUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="message-input-container">
      <button
        className="btn-attach"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        disabled={uploading}
        title="Attach file"
      >
        📎
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <input
        type="text"
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={uploading ? 'Uploading file...' : 'Type a message...'}
        disabled={uploading}
      />
      <button className="btn-send" onClick={handleSend} disabled={!message.trim() || uploading}>
        Send
      </button>
    </div>
  );
}

export default MessageInput;
