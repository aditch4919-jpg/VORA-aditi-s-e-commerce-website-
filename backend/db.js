// db.js
// Sets up a local SQLite database file (vora.db) and seeds it with
// starter product data the first time the server runs.

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'vora.db'));

db.pragma('journal_mode = WAL');

// ---- Schema ----
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    total REAL NOT NULL,
    items_json TEXT NOT NULL
  );
`);

// ---- Seed data (only runs once, if the table is empty) ----
const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category)
    VALUES (@name, @description, @price, @image_url, @category)
  `);

  const seedProducts = [
    {
      name: 'Vintage Wool Throw',
      description: 'Handwoven wool throw blanket, warm autumn tones.',
      price: 1499,
      image_url: '/assets/images/throw.jpg',
      category: 'home-decor',
    },
    {
      name: 'Linen Wrap Dress',
      description: 'Handcrafted linen wrap dress, vintage-inspired cut.',
      price: 2199,
      image_url: '/assets/images/dress.jpg',
      category: 'fashion',
    },
    {
      name: 'Ceramic Table Lamp',
      description: 'Warm-glow ceramic lamp, handmade shade.',
      price: 1899,
      image_url: '/assets/images/lamp.jpg',
      category: 'home-decor',
    },
    {
      name: 'Vintage Leather Satchel',
      description: 'Worn-in leather satchel with brass fittings.',
      price: 3299,
      image_url: '/assets/images/satchel.jpg',
      category: 'fashion',
    },
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(seedProducts);
  console.log(`Seeded ${seedProducts.length} products into vora.db`);
}

module.exports = db;
