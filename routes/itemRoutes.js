const express = require('express');
const Item = require('../models/Item');
const ShoppingList = require('../models/ShoppingList');
const auth = require('../middleware/auth');

const router = express.Router();

// Добавить товар
router.post('/', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();

    await ShoppingList.findByIdAndUpdate(item.shoppingListId, {
      $push: { items: item._id },
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Удалить товар
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    await ShoppingList.findByIdAndUpdate(item.shoppingListId, {
      $pull: { items: item._id },
    });

    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
