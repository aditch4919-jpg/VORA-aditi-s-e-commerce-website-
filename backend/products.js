// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/products - list all products (optionally filter by category)
router.get('/', (req, res) => {
  const { category } = req.query;

  let products;
  if (category) {
    products = db
      .prepare('SELECT * FROM products WHERE category = ?')
      .all(category);
  } else {
    products = db.prepare('SELECT * FROM products').all();
  }

  res.json(products);
});

// GET /api/products/:id - single product detail
router.get('/:id', (req, res) => {
  const product = db
    .prepare('SELECT * FROM products WHERE id = ?')
    .get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

module.exports = router;
