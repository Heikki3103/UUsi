# Inventory Manager

A modern full-stack web application for managing product inventory. Browse, add, edit and delete products and update stock quantities in real time.

![Inventory Manager](https://github.com/user-attachments/assets/78f216ad-0896-4a9f-b3b8-11f797549757)

## Features

- **Product listing** — sortable table with name, description, category, SKU, price and quantity
- **Search** — instant full-text search across name, description and SKU
- **Category filter** — filter products by category using a dropdown
- **Add product** — modal form with validation (name, description, category, SKU, price, quantity)
- **Edit product** — pre-filled modal to update any product detail
- **Quantity control** — inline +/- buttons or direct text input per row; changes are saved immediately
- **Delete product** — delete with a confirmation dialog to avoid accidents
- **Stats bar** — live totals for product count, categories, stock value and low-stock items
- **Toast notifications** — success/error feedback for every action
- **20 pre-seeded products** across 4 categories (Electronics, Furniture, Health & Fitness, Stationery)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Backend | Node.js, Express 4 |
| Database | SQLite (via `better-sqlite3`) |
| Styling | Custom CSS (no UI library) |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Running in Development

Start both the backend API and the frontend dev server in one command:

```bash
npm install          # install root dev deps (concurrently)
npm run dev          # starts backend on :3001 and frontend on :5173
```

Or start each service separately:

```bash
# Terminal 1 – API server
npm run start:backend   # http://localhost:3001

# Terminal 2 – Frontend
npm run start:frontend  # http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build        # builds the React app into frontend/dist/
```

Serve `frontend/dist/` with any static file server alongside the running backend.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/products` | List all products (supports `?search=` and `?category=`) |
| `GET` | `/api/products/:id` | Get a single product |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Update a product |
| `PATCH` | `/api/products/:id/quantity` | Update quantity only |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/categories` | List distinct categories |

## Project Structure

```
├── backend/
│   ├── server.js       # Express API server
│   ├── database.js     # SQLite setup & seed data (20 products)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app shell
│   │   ├── App.css              # All styles
│   │   └── components/
│   │       ├── Icons.jsx        # SVG icon components
│   │       ├── StatsBar.jsx     # Summary statistics
│   │       ├── ProductTable.jsx # Products table with inline qty
│   │       ├── ProductModal.jsx # Add / Edit modal
│   │       ├── ConfirmModal.jsx # Delete confirmation
│   │       └── Toast.jsx        # Toast notifications
│   └── package.json
└── package.json        # Root scripts (dev, build, install:all)
```