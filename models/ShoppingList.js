const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }], 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);
