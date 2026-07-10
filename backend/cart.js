// routes/cart.js
// NOTE: this is a simple single-cart implementation (no user accounts/sessions)
// which is fine for a portfolio project. A production version would key
// cart_items by a session or user id.

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/cart - view current cart, joined with product info
router.get('/', (req, res) => {
  const items = db
    .prepare(
      `SELECT cart_items.id, cart_items.quantity, products.*
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id`
    )
    .all();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({ items, total });
});

// POST /api/cart - add an item to the cart
// body: { product_id: number, quantity?: number }
router.post('/', (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE product_id = ?')
    .get(product_id);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(
      quantity,
      existing.id
    );
  } else {
    db.prepare('INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)').run(
      product_id,
      quantity
    );
  }

  res.status(201).json({ message: 'Added to cart' });
});

// DELETE /api/cart/:id - remove a cart item (by cart_items.id)
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  res.json({ message: 'Removed from cart' });
});

module.exports = router;
