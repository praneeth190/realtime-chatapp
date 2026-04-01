import React, { useState } from 'react';

function Sidebar({ rooms, activeRoom, onSelectRoom, onCreateRoom, isOpen, allUsers, onlineUsers, onStartDM, currentUser }) {
  const [activeTab, setActiveTab] = useState('users');


  const isUserOnline = (userId) => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  
  const getRoomDisplayName = (room) => {
    if (room.isDirect && currentUser) {
      const otherMember = room.members.find((m) => m._id !== currentUser.id);
      return otherMember ? otherMember.username : room.name;
    }
    return room.name;
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* tab switcher */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          Rooms
        </button>
      </div>

      {/* users tab */}
      {activeTab === 'users' && (
        <div className="room-list">
          {allUsers.length === 0 ? (
            <p className="no-rooms">No other users yet.</p>
          ) : (
            allUsers.map((u) => {
              const online = isUserOnline(u._id);
              return (
                <div
                  key={u._id}
                  className="room-item user-item"
                  onClick={() => onStartDM(u._id)}
                >
                  <div className="user-avatar">
                    {u.username.charAt(0).toUpperCase()}
                    <span className={`status-dot ${online ? 'online' : 'offline'}`}></span>
                  </div>
                  <div className="room-info">
                    <span className="room-name">{u.username}</span>
                    <span className="room-members">{online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* rooms tab */}
      {activeTab === 'rooms' && (
        <>
          <div className="sidebar-header">
            <h3>Chat Rooms</h3>
            <button className="btn-create-room" onClick={onCreateRoom}>
              + New Room
            </button>
          </div>
          <div className="room-list">
            {rooms.length === 0 ? (
              <p className="no-rooms">No rooms yet. Create one!</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className={`room-item ${activeRoom && activeRoom._id === room._id ? 'active' : ''}`}
                  onClick={() => onSelectRoom(room)}
                >
                  <div className="room-icon">
                    {room.isDirect ? '💬' : room.isPrivate ? '🔒' : '#'}
                  </div>
                  <div className="room-info">
                    <span className="room-name">{getRoomDisplayName(room)}</span>
                    <span className="room-members">
                      {room.isDirect ? 'Direct message' : `${room.members.length} members`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;
