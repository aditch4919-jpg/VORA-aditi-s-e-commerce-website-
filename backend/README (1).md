# VORA Backend

A minimal Express + SQLite backend for the VORA e-commerce site
(`vora.html`). Built to give the static frontend real data instead
of hardcoded product listings.

## Stack
- Node.js + Express
- SQLite (via `better-sqlite3`) — zero-config, single file DB, no server to install
- CORS enabled so `vora.html` can call it directly from the file system or a local server

## Setup

```bash
cd vora-backend
npm install
npm start
```

Server runs at `http://localhost:3000`. A `vora.db` file is created
and seeded with sample products automatically on first run.

## Endpoints

| Method | Route              | Description                          |
|--------|---------------------|---------------------------------------|
| GET    | `/api/health`        | Health check                          |
| GET    | `/api/products`      | List all products (optional `?category=`) |
| GET    | `/api/products/:id`  | Single product                        |
| GET    | `/api/cart`           | View cart + total                     |
| POST   | `/api/cart`           | Add item — body: `{ product_id, quantity }` |
| DELETE | `/api/cart/:id`       | Remove a cart item                    |
| POST   | `/api/orders`         | Checkout — snapshots cart into an order, clears cart |
| GET    | `/api/orders`         | List past orders                      |

## Wiring this into `vora.html`

Replace any hardcoded product arrays in your JS with a fetch call, e.g.:

```javascript
async function loadProducts() {
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  // ...render products into the DOM as before
}

async function addToCart(productId) {
  await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, quantity: 1 }),
  });
  // ...refresh cart UI
}
```

Note: if you open `vora.html` directly as a `file://` URL, some browsers
block fetch requests to `localhost`. If you hit CORS/fetch errors, serve
the frontend with a simple local server instead, e.g. `npx serve .`
inside the frontend folder, then open `http://localhost:PORT/vora.html`.

## Notes for interviews / resume framing
- Cart is currently a single global cart (no user accounts/sessions) —
  intentional scope-cut for a portfolio project. A natural "what would
  you add next" answer is per-user carts via sessions or auth.
- `orders` table demonstrates a full write flow (cart → order → clear
  cart), useful to point to if asked about your DB design.
