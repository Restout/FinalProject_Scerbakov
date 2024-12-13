const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const ShoppingList = require('../models/ShoppingList');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Добавить участника в группу (создать группу, если её нет)
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    let group = await Group.findOne({ members: req.user.id });
    if (!group) {
      group = new Group({
        name: `${req.user.id}'s Group`,
        members: [req.user.id],
      });
      await group.save();
    }

    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already in the group' });
    }

    group.members.push(userToAdd._id);
    await group.save();

    res.status(200).json({ message: 'User added to the group', group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Выйти из группы
router.post('/leave', authMiddleware, async (req, res) => {
  try {

    const group = await Group.findOne({ members: req.user.id });
    if (!group) {
      return res.status(404).json({ message: 'You are not part of any group' });
    }

    group.members = group.members.filter(memberId => memberId.toString() !== req.user.id);

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(group._id);
      return res.status(200).json({ message: 'You left the group. Group deleted as it has no members.' });
    }

    await group.save();
    res.status(200).json({ message: 'You left the group', group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить список участников группы
router.get('/members', authMiddleware, async (req, res) => {
    try {
      // Найти группу, в которой состоит текущий пользователь
      const group = await Group.findOne({ members: req.user.id }).populate('members', 'name email');
      if (!group) {
        return res.status(404).json({ message: 'You are not part of any group' });
      }
  
      res.status(200).json({ members: group.members });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/user-lists/:userId', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Получить списки пользователя
      const userLists = await ShoppingList.find({ userId }).populate('items');
  
      const group = await Group.findOne({ members: userId });
  
      if (group) {
        // Получить списки всех участников группы
        const allMembersLists = await ShoppingList.find({
          userId: { $in: group.members },
        }).populate('items');
  
        return res.status(200).json({
          userLists,
          groupLists: allMembersLists,
        });
      }
  
      // Если группы нет, вернуть только списки пользователя
      res.status(200).json({ userLists });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
