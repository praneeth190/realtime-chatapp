import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SERVER_URL = 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

  
    const newSocket = io(SERVER_URL);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      
      newSocket.emit('user-online', {
        userId: user.id,
        username: user.username
      });
    });

    
    newSocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
