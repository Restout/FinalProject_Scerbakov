const express = require('express');
const ShoppingList = require('../models/ShoppingList');
const Item = require('../models/Item'); 
const auth = require('../middleware/auth');

const router = express.Router();

// Создать список покупок
router.post('/', async (req, res) => {
  try {
    const list = new ShoppingList(req.body);
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Получить все списки для пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const lists = await ShoppingList.find({ userId: req.params.userId }).populate('items');
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить конкретный список покупок
router.get('/:listId', async (req, res) => {
    try {
      const { listId } = req.params;
  
      const list = await ShoppingList.findById(listId).populate('items');
      if (!list) {
        return res.status(404).json({ message: 'Shopping list not found' });
      }
  
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Добавить новый товар в существующий список
router.post('/:listId/items', async (req, res) => {
    try {
        const { listId } = req.params;
        const { name, price, quantity } = req.body;
    
        const shoppingList = await ShoppingList.findById(listId);
        if (!shoppingList) {
          return res.status(404).json({ message: 'Shopping list not found' });
        }
    
        let item = await Item.findOne({ name, shoppingListId: listId });
    
        if (item) {
          item.quantity += quantity;
          await item.save();
        } else {
          item = new Item({ name, price, quantity, shoppingListId: listId });
          await item.save();
    
          shoppingList.items.push(item._id);
          await shoppingList.save();
        }
    
        const updatedList = await ShoppingList.findById(listId).populate('items');
        res.status(201).json(updatedList);
      } catch (err) {
        res.status(500).json({ error: err.message + "error"});
      }
  });

module.exports = router;
