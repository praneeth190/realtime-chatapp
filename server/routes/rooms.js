const express = require('express');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.id })
      .populate('members', 'username email')
      .populate('createdBy', 'username')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate, members } = req.body;


    const memberList = members ? [...new Set([req.user.id, ...members])] : [req.user.id];

    const room = new Room({
      name,
      description: description || '',
      isPrivate: isPrivate || false,
      members: memberList,
      createdBy: req.user.id
    });

    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('members', 'username email')
      .populate('createdBy', 'username');

    res.status(201).json(populatedRoom);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.isPrivate) {
      return res.status(403).json({ message: 'Cannot join a private room' });
    }

    if (!room.members.includes(req.user.id)) {
      room.members.push(req.user.id);
      await room.save();
    }

    const populatedRoom = await Room.findById(room._id)
      .populate('members', 'username email')
      .populate('createdBy', 'username');

    res.json(populatedRoom);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/public', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('members', 'username email')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/users/search', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const search = req.query.q || '';
    if (search.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: search, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('username email').limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
