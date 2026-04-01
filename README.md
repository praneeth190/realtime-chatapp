# ChatApp - Real-Time Chat Application

A real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and WebSockets (Socket.io).

---

## Features

- **Real-time messaging** using WebSockets (Socket.io)
- **User authentication** (Register / Login with JWT)
- **Chat rooms** - create public or private rooms
- **Private conversations** - invite specific users to private rooms
- **Media sharing** - send images and files (PDF, DOC, TXT) up to 5MB
- **Persistent messages** - all chat history saved in MongoDB
- **Responsive design** - works on desktop, tablet, and mobile
- **Online user tracking** - see who's currently online

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | v18+ | Runtime |
| Express.js | 4.18.2 | Backend server |
| React | 18.2.0 | Frontend UI |
| MongoDB | 6.0+ | Database |
| Mongoose | 7.6.3 | MongoDB ODM |
| Socket.io | 4.7.2 | WebSocket real-time communication |
| JSON Web Token | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Multer | 1.4.5 | File uploads |
| Axios | 1.6.0 | HTTP client |
| React Router DOM | 6.18.0 | Client-side routing |

---

## Project Structure

```
smartwinnr_assignment/
├── server/                     # Backend
│   ├── index.js                # Main server file (Express + Socket.io)
│   ├── .env                    # Environment variables (MongoDB URI, JWT secret)
│   ├── package.json
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Room.js             # Chat room model
│   │   └── Message.js          # Message model
│   ├── routes/
│   │   ├── auth.js             # Login / Register routes
│   │   ├── rooms.js            # Room CRUD routes
│   │   ├── messages.js         # Message fetch route
│   │   └── upload.js           # File upload route
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   └── uploads/                # Uploaded files stored here
│
├── client/                     # Frontend (React)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js              # Main app with routing
│   │   ├── App.css             # All styles
│   │   ├── context/
│   │   │   ├── AuthContext.js   # Authentication state
│   │   │   └── SocketContext.js # Socket.io connection
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Chat.js         # Main chat page
│   │   └── components/
│   │       ├── Sidebar.js      # Room list sidebar
│   │       ├── ChatWindow.js   # Message display area
│   │       ├── MessageInput.js # Message input + file attach
│   │       └── CreateRoom.js   # Create room modal
│   └── package.json
│
└── README.md
```

---

## Prerequisites

Before setting up, make sure you have installed:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Either:
   - **Local MongoDB** (v6.0+) - [Download here](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (free cloud) - [Create free cluster](https://www.mongodb.com/atlas)

To check your versions:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
mongod --version  # If using local MongoDB
```

---

## Setup Instructions

### Step 1: Clone / Download the project

Place the project folder anywhere on your machine.

### Step 2: Configure Environment Variables

Open `server/.env` and update these values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=replace_this_with_any_random_string
```

- **MONGODB_URI**: 
  - For local MongoDB: `mongodb://localhost:27017/chatapp`
  - For MongoDB Atlas: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/chatapp`
- **JWT_SECRET**: Any random string (e.g., `mySecretKey2024xyz`)

### Step 3: Install Dependencies

Open a terminal in the project root folder:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 4: Start MongoDB (if using local)

Make sure MongoDB is running on your machine:
```bash
mongod
```

### Step 5: Start the Application

You need **two terminal windows**:

**Terminal 1 - Start the backend server:**
```bash
cd server
npm start
```
You should see:
```
Connected to MongoDB
Server running on port 5000
```

**Terminal 2 - Start the React frontend:**
```bash
cd client
npm start
```
This will open `http://localhost:3000` in your browser.

---

## How to Use

1. **Register** - Create a new account with username, email, and password
2. **Login** - Login with your email and password
3. **Create a Room** - Click "+ New Room" in the sidebar
   - Give it a name
   - Optionally make it private
   - Optionally search and add other users
4. **Chat** - Select a room and start sending messages
5. **Send Files** - Click the 📎 button to send images or documents
6. **Logout** - Click the Logout button in the header

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login user | No |
| GET | /api/rooms | Get user's rooms | Yes |
| POST | /api/rooms | Create new room | Yes |
| GET | /api/rooms/public | Get all public rooms | Yes |
| POST | /api/rooms/:id/join | Join a public room | Yes |
| GET | /api/rooms/users/search | Search users | Yes |
| GET | /api/messages/:roomId | Get room messages | Yes |
| POST | /api/upload | Upload a file | Yes |

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| user-online | Client → Server | User comes online |
| online-users | Server → Client | Updated online users list |
| join-room | Client → Server | User joins a chat room |
| leave-room | Client → Server | User leaves a chat room |
| send-message | Client → Server | User sends a message |
| receive-message | Server → Client | New message broadcast |
| typing | Client → Server | Typing indicator |
| user-typing | Server → Client | Broadcast typing status |

---


