const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(cors());
app.use(express.json());
app.use('/api', limiter);

// GET all products (with optional search and category filter)
app.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM products';
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push("(name LIKE ? OR description LIKE ? OR sku LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY name ASC';

  try {
    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET categories list
app.get('/api/categories', (req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
    res.json(rows.map((r) => r.category).filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product.' });
  }
});

// POST create product
app.post('/api/products', (req, res) => {
  const { name, description = '', category = '', sku = '', quantity = 0, price = 0 } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required.' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO products (name, description, category, sku, quantity, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name.trim(), description.trim(), category.trim(), sku.trim(), quantity, price);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'A product with that SKU already exists.' });
    }
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, sku, quantity, price } = req.body;

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  const updatedName = name !== undefined ? name : existing.name;
  const updatedDescription = description !== undefined ? description : existing.description;
  const updatedCategory = category !== undefined ? category : existing.category;
  const updatedSku = sku !== undefined ? sku : existing.sku;
  const updatedQuantity = quantity !== undefined ? quantity : existing.quantity;
  const updatedPrice = price !== undefined ? price : existing.price;

  if (!updatedName || typeof updatedName !== 'string' || updatedName.trim() === '') {
    return res.status(400).json({ error: 'Product name is required.' });
  }
  if (typeof updatedPrice !== 'number' || updatedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (!Number.isInteger(updatedQuantity) || updatedQuantity < 0) {
    return res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
  }

  try {
    db.prepare(`
      UPDATE products
      SET name = ?, description = ?, category = ?, sku = ?, quantity = ?, price = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      updatedName.trim(),
      updatedDescription.trim(),
      updatedCategory.trim(),
      updatedSku.trim(),
      updatedQuantity,
      updatedPrice,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'A product with that SKU already exists.' });
    }
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// PATCH update quantity only
app.patch('/api/products/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'Quantity must be a non-negative integer.' });
  }

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  try {
    db.prepare(`
      UPDATE products SET quantity = ?, updated_at = datetime('now') WHERE id = ?
    `).run(quantity, id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quantity.' });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory API running at http://localhost:${PORT}`);
});
