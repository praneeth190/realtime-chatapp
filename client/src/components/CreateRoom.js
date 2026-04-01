import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function CreateRoom({ onClose, onRoomCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/rooms/users/search?q=${encodeURIComponent(query)}`);
  
      const filtered = res.data.filter(
        (u) => !selectedMembers.find((m) => m._id === u._id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const addMember = (user) => {
    setSelectedMembers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u._id !== user._id));
    setSearchQuery('');
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Room name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/rooms`, {
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        members: selectedMembers.map((m) => m._id)
      });
      onRoomCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Room</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General, Project Discussion"
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about?"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              Private room (invite only)
            </label>
          </div>

          <div className="form-group">
            <label>Add Members (optional)</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by username..."
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((u) => (
                  <div key={u._id} className="search-result-item" onClick={() => addMember(u)}>
                    {u.username} ({u.email})
                  </div>
                ))}
              </div>
            )}
            {selectedMembers.length > 0 && (
              <div className="selected-members">
                {selectedMembers.map((m) => (
                  <span key={m._id} className="member-tag">
                    {m.username}
                    <button type="button" onClick={() => removeMember(m._id)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;
