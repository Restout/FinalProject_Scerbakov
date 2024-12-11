const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  shoppingListId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingList', required: true },
});

module.exports = mongoose.model('Item', ItemSchema);
