// routes/orders.js
// A minimal "checkout" endpoint: snapshots the current cart into an order
// row and clears the cart. No payment processing (out of scope for a
// portfolio project) — this just demonstrates a full write-flow.

const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/orders - checkout the current cart
router.post('/', (req, res) => {
  const items = db
    .prepare(
      `SELECT cart_items.quantity, products.id, products.name, products.price
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id`
    )
    .all();

  if (items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const result = db
    .prepare('INSERT INTO orders (total, items_json) VALUES (?, ?)')
    .run(total, JSON.stringify(items));

  db.prepare('DELETE FROM cart_items').run();

  res.status(201).json({ order_id: result.lastInsertRowid, total, items });
});

// GET /api/orders - list past orders (handy for demoing the DB in an interview)
router.get('/', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders);
});

module.exports = router;
