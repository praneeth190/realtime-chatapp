const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('username email createdAt')
      .sort({ username: 1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.post('/dm/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myId = req.user.id;

    if (otherUserId === myId) {
      return res.status(400).json({ message: 'Cannot DM yourself' });
    }


    const otherUser = await User.findById(otherUserId).select('username email');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }


    let dmRoom = await Room.findOne({
      isDirect: true,
      members: { $all: [myId, otherUserId], $size: 2 }
    })
      .populate('members', 'username email')
      .populate('createdBy', 'username');

    if (dmRoom) {
      return res.json(dmRoom);
    }

    dmRoom = new Room({
      name: otherUser.username, 
      isDirect: true,
      isPrivate: true,
      members: [myId, otherUserId],
      createdBy: myId
    });
    await dmRoom.save();

    const populated = await Room.findById(dmRoom._id)
      .populate('members', 'username email')
      .populate('createdBy', 'username');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
