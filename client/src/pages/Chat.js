import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import CreateRoom from '../components/CreateRoom';

const API_URL = 'http://localhost:5000/api';

function Chat() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

 
  useEffect(() => {
    fetchRooms();
    fetchAllUsers();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setAllUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleStartDM = async (otherUserId) => {
    try {
      const res = await axios.post(`${API_URL}/users/dm/${otherUserId}`);
      const dmRoom = res.data;

      
      setRooms((prev) => {
        const exists = prev.find((r) => r._id === dmRoom._id);
        if (!exists) return [dmRoom, ...prev];
        return prev;
      });

      setActiveRoom(dmRoom);

      
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Error starting DM:', err);
    }
  };

  
  useEffect(() => {
    if (!activeRoom || !socket) return;

    
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/messages/${activeRoom._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    
    socket.emit('join-room', activeRoom._id);

    
    return () => {
      socket.emit('leave-room', activeRoom._id);
    };
  }, [activeRoom, socket]);

  
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      
      if (activeRoom && message.room === activeRoom._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('receive-message', handleNewMessage);

    return () => {
      socket.off('receive-message', handleNewMessage);
    };
  }, [socket, activeRoom]);

  const handleRoomCreated = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoom(newRoom);
    setShowCreateRoom(false);
  };

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
   
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="chat-page">
      {/* header bar */}
      <header className="chat-header">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <h1>ChatApp</h1>
        <div className="header-right">
          <span className="username-display">Hi, {user.username}</span>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="chat-body">
        {/* sidebar */}
        <Sidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={() => setShowCreateRoom(true)}
          isOpen={sidebarOpen}
          allUsers={allUsers}
          onlineUsers={onlineUsers}
          onStartDM={handleStartDM}
          currentUser={user}
        />

        {/* main chat area */}
        <div className="chat-main">
          {activeRoom ? (
            <ChatWindow
              room={activeRoom}
              messages={messages}
              user={user}
              socket={socket}
            />
          ) : (
            <div className="no-room-selected">
              <h2>Welcome to ChatApp</h2>
              <p>Select a room from the sidebar or create a new one to start chatting.</p>
            </div>
          )}
        </div>
      </div>

      {/* create room modal */}
      {showCreateRoom && (
        <CreateRoom
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
}

export default Chat;
