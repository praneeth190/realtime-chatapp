const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// serve uploaded files as static
app.use('/uploads', express.static(uploadsDir));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// basic health check
app.get('/', (req, res) => {
  res.json({ message: 'Chat server is running' });
});

// ---- SOCKET.IO ----

// keep track of online users
const onlineUsers = new Map(); // socketId -> { userId, username }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // when user comes online
  socket.on('user-online', (userData) => {
    onlineUsers.set(socket.id, userData);
    io.emit('online-users', Array.from(onlineUsers.values()));
  });

  // join a chat room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // leave a chat room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  // handle sending a message
  socket.on('send-message', async (data) => {
    try {
      const { content, senderId, senderName, roomId, messageType, fileUrl, fileName } = data;

      // save to database
      const message = new Message({
        content: content || '',
        sender: senderId,
        room: roomId,
        messageType: messageType || 'text',
        fileUrl: fileUrl || '',
        fileName: fileName || ''
      });
      await message.save();

      
      const populated = await Message.findById(message._id)
        .populate('sender', 'username');

      io.to(roomId).emit('receive-message', populated);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });


  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      username: data.username,
      isTyping: data.isTyping
    });
  });

 
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('online-users', Array.from(onlineUsers.values()));
    console.log('User disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
