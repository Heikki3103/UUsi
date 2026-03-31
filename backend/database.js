const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    sku TEXT UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (countRow.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, description, category, sku, quantity, price)
    VALUES (@name, @description, @category, @sku, @quantity, @price)
  `);

  const products = [
    {
      name: 'Wireless Ergonomic Keyboard',
      description: 'Compact wireless keyboard with ergonomic design and long battery life.',
      category: 'Electronics',
      sku: 'ELEC-KB-001',
      quantity: 45,
      price: 79.99,
    },
    {
      name: 'USB-C Hub 7-in-1',
      description: 'Multi-port hub with HDMI, USB 3.0, SD card reader, and PD charging.',
      category: 'Electronics',
      sku: 'ELEC-HUB-002',
      quantity: 120,
      price: 39.99,
    },
    {
      name: '27" 4K Monitor',
      description: 'Ultra-sharp 4K IPS display with 144Hz refresh rate and HDR support.',
      category: 'Electronics',
      sku: 'ELEC-MON-003',
      quantity: 18,
      price: 549.99,
    },
    {
      name: 'Noise-Cancelling Headphones',
      description: 'Premium over-ear headphones with active noise cancellation and 30h battery.',
      category: 'Electronics',
      sku: 'ELEC-HP-004',
      quantity: 62,
      price: 199.99,
    },
    {
      name: 'Mechanical Mouse',
      description: 'High-precision gaming mouse with adjustable DPI and RGB lighting.',
      category: 'Electronics',
      sku: 'ELEC-MS-005',
      quantity: 88,
      price: 49.99,
    },
    {
      name: 'Adjustable Standing Desk',
      description: 'Electric height-adjustable desk with memory presets and cable management.',
      category: 'Furniture',
      sku: 'FURN-DESK-001',
      quantity: 10,
      price: 449.00,
    },
    {
      name: 'Ergonomic Office Chair',
      description: 'Lumbar-support chair with breathable mesh back and adjustable armrests.',
      category: 'Furniture',
      sku: 'FURN-CHAIR-002',
      quantity: 25,
      price: 319.00,
    },
    {
      name: 'Monitor Arm Mount',
      description: 'Dual monitor arm with full articulation and cable management.',
      category: 'Furniture',
      sku: 'FURN-ARM-003',
      quantity: 34,
      price: 89.99,
    },
    {
      name: 'Whey Protein Powder',
      description: 'Premium whey protein isolate, 2kg bag, chocolate flavour.',
      category: 'Health & Fitness',
      sku: 'HLTH-PRO-001',
      quantity: 200,
      price: 49.99,
    },
    {
      name: 'Resistance Band Set',
      description: 'Set of 5 resistance bands with different tension levels and carry bag.',
      category: 'Health & Fitness',
      sku: 'HLTH-BAND-002',
      quantity: 150,
      price: 24.99,
    },
    {
      name: 'Yoga Mat',
      description: 'Non-slip 6mm thick yoga mat with alignment lines, eco-friendly material.',
      category: 'Health & Fitness',
      sku: 'HLTH-YM-003',
      quantity: 75,
      price: 34.99,
    },
    {
      name: 'Stainless Steel Water Bottle',
      description: '1L insulated bottle, keeps drinks cold 24h or hot 12h.',
      category: 'Health & Fitness',
      sku: 'HLTH-BTL-004',
      quantity: 310,
      price: 22.99,
    },
    {
      name: 'Notebook A5 (Pack of 3)',
      description: 'Dotted hardcover notebooks, 160 pages each, lay-flat binding.',
      category: 'Stationery',
      sku: 'STAT-NB-001',
      quantity: 95,
      price: 18.99,
    },
    {
      name: 'Ballpoint Pen Set',
      description: 'Smooth-writing pens, pack of 20, assorted colours.',
      category: 'Stationery',
      sku: 'STAT-PEN-002',
      quantity: 180,
      price: 8.99,
    },
    {
      name: 'Desk Organiser',
      description: 'Bamboo desk organiser with multiple compartments for pens, notes, and accessories.',
      category: 'Stationery',
      sku: 'STAT-ORG-003',
      quantity: 42,
      price: 29.99,
    },
    {
      name: 'Portable Charger 20000mAh',
      description: 'High-capacity power bank with dual USB-A and USB-C ports, 22.5W fast charge.',
      category: 'Electronics',
      sku: 'ELEC-PB-006',
      quantity: 73,
      price: 44.99,
    },
    {
      name: 'Smart LED Desk Lamp',
      description: 'Touch-controlled lamp with adjustable colour temperature, USB charging port.',
      category: 'Electronics',
      sku: 'ELEC-LAMP-007',
      quantity: 55,
      price: 34.99,
    },
    {
      name: 'Webcam 1080p HD',
      description: 'Full HD webcam with built-in microphone and privacy cover.',
      category: 'Electronics',
      sku: 'ELEC-CAM-008',
      quantity: 38,
      price: 59.99,
    },
    {
      name: 'Cable Management Box',
      description: 'Large cable management box to hide power strips and cables, wood finish.',
      category: 'Furniture',
      sku: 'FURN-CBX-004',
      quantity: 60,
      price: 19.99,
    },
    {
      name: 'Laptop Stand Aluminium',
      description: 'Adjustable aluminium laptop stand, compatible with 10"–17" laptops.',
      category: 'Electronics',
      sku: 'ELEC-LS-009',
      quantity: 90,
      price: 29.99,
    },
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item);
    }
  });

  insertMany(products);
  console.log('Database seeded with 20 sample products.');
}

module.exports = db;
