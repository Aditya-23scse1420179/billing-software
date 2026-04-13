<div align="center">

# 🧾 Billing Software

**A modern, full-stack retail Point-of-Sale (POS) system**  
Built with pure **HTML · CSS · JavaScript** on the front-end  
and **Node.js · Express · SQLite** on the back-end.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)](https://www.sqlite.org/)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Database Schema](#-database-schema)
6. [API Reference](#-api-reference)
7. [Getting Started](#-getting-started)
8. [How to Use](#-how-to-use)
9. [Product Catalogue](#-product-catalogue)
10. [Screenshots](#-screenshots)
11. [Roadmap](#-roadmap)

---

## 🌟 Overview

**Billing Software** is a lightweight, browser-based Point-of-Sale application designed for small retail shops.  
A cashier can select product quantities across three departments — **Cosmetics**, **Grocery**, and **Cold Drinks** — and generate a formatted receipt in seconds.

Every bill is persisted in a **SQLite database** via a REST API, so no bill is ever lost.  
Bills can also be downloaded instantly as a `.txt` file for offline record-keeping.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **3 Product Departments** | Cosmetics, Grocery & Cold Drinks — 18 products total |
| 🧮 **Auto Tax Calculation** | 5% on Cosmetics & Cold Drinks, 10% on Grocery — calculated instantly |
| 🧾 **Formatted Bill Receipt** | Clean monospace receipt with itemised lines, tax rows & grand total |
| 💾 **SQLite Persistence** | Every bill saved to a real SQL database via REST API |
| 🗂 **Normalised DB Tables** | `customer`, `product`, `invoice`, `invoice_item`, `payment` tables for structured data |
| 🔍 **Bill Search** | Find any previously saved bill by its 4-digit bill number |
| 📋 **All Bills View** | List every saved bill in the bill area with one click |
| ⬇️ **Download as TXT** | Instantly download any generated bill as a `.txt` file |
| 🖨️ **Print Support** | Renders a clean, styled HTML invoice and opens the browser print dialog |
| 🎲 **Auto Bill Number** | A unique 4-digit number is generated for every new bill |
| 📱 **Responsive Layout** | Works on desktops, tablets & phones (CSS Grid breakpoints) |
| 🪟 **Custom Modals** | No browser `alert()`/`confirm()` — all dialogs are styled in-app |

---

## 🛠 Tech Stack

### Front-End
| Technology | Purpose |
|---|---|
| **HTML5** | Semantic markup & layout |
| **CSS3** | Responsive Grid layout, custom modals, groove/inset borders |
| **Vanilla JavaScript (ES2017+)** | All UI logic, fetch API calls, DOM manipulation |

### Back-End
| Technology | Purpose |
|---|---|
| **Node.js 18+** | JavaScript runtime |
| **Express 4** | HTTP server & REST API routing |
| **better-sqlite3** | Fast, synchronous SQLite driver |
| **cors** | Cross-Origin Resource Sharing middleware |

### Database
| Technology | Purpose |
|---|---|
| **SQLite 3** | Embedded relational database (`bills.db` file) |
| **WAL mode** | Write-Ahead Logging for better concurrent read performance |

---

## 📁 Project Structure

```
billing-software/
│
├── public/
│   ├── index.html      # Single-page application shell
│   ├── style.css       # All styles (responsive, modals, grid)
│   └── script.js       # Front-end logic – fetch API, bill generation, print
│
├── server.js           # Express server + REST API
├── schema.sql          # SQLite table/index definitions (all tables)
├── bills.db            # SQLite database (auto-created on first run, git-ignored)
│
├── .gitignore          # Excludes node_modules, bills.db, package-lock.json
├── package.json        # Node.js project metadata & dependencies
└── README.md           # This file
```

---

## 🗄 Database Schema

The database is initialised automatically on startup from `schema.sql`.  
It contains six tables:

### Legacy flat store
```sql
CREATE TABLE IF NOT EXISTS bills (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  bill_no       TEXT     NOT NULL UNIQUE,
  customer_name TEXT     NOT NULL,
  phone         TEXT     NOT NULL,
  cosmetic_raw  REAL     NOT NULL DEFAULT 0,
  cosmetic_tax  REAL     NOT NULL DEFAULT 0,
  grocery_raw   REAL     NOT NULL DEFAULT 0,
  grocery_tax   REAL     NOT NULL DEFAULT 0,
  drink_raw     REAL     NOT NULL DEFAULT 0,
  drink_tax     REAL     NOT NULL DEFAULT 0,
  grand_total   REAL     NOT NULL DEFAULT 0,
  bill_text     TEXT     NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Normalised tables

```sql
CREATE TABLE IF NOT EXISTS customer (
  id, name, phone, email, address, created_at
);

CREATE TABLE IF NOT EXISTS product (
  id, name, sku UNIQUE, price, tax_rate, stock_qty, created_at
);

CREATE TABLE IF NOT EXISTS invoice (
  id, invoice_number UNIQUE, customer_id FK, invoice_date,
  subtotal, tax, discount, total,
  status CHECK('unpaid'|'paid'|'cancelled'), created_at
);

CREATE TABLE IF NOT EXISTS invoice_item (
  id, invoice_id FK, product_id FK,
  description, qty, unit_price, tax_rate, line_total
);

CREATE TABLE IF NOT EXISTS payment (
  id, invoice_id FK, amount, method,
  paid_at, reference, notes
);
```

Full DDL is in [`schema.sql`](./schema.sql).  
Every time a bill is saved from the UI, the server also writes normalised records to `customer`, `invoice`, and `invoice_item` in a single transaction.

> **Reset the database:** Stop the server, delete `bills.db`, and restart. The schema will be re-applied automatically.

---

## 🔌 API Reference

Base URL: `http://localhost:3000/api`

### Bills (legacy)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bills` | Save a new bill; also creates normalised invoice records when `items` is provided |
| `GET` | `/bills` | List summary of all saved bills |
| `GET` | `/bills/:billNo` | Retrieve a specific bill by number |
| `DELETE` | `/bills` | Delete all saved bills |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers` | List all customers |
| `POST` | `/customers` | Create a customer `{ name, phone, email?, address? }` |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List all products (seeded with 18 defaults on startup) |
| `POST` | `/products` | Create a product `{ name, price, sku?, tax_rate?, stock_qty? }` |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/invoices` | List all invoices with customer info |
| `GET` | `/invoices/:id` | Get full invoice (customer + items + payments) — used by the print view |
| `POST` | `/invoices/:id/payments` | Record a payment `{ amount, method?, reference?, notes? }` |

### POST `/api/bills` – Request Body

```json
{
  "bill_no":       "4721",
  "customer_name": "Ravi Kumar",
  "phone":         "9876543210",
  "cosmetic_raw":  200,
  "cosmetic_tax":  10,
  "grocery_raw":   400,
  "grocery_tax":   40,
  "drink_raw":     120,
  "drink_tax":     6,
  "grand_total":   776,
  "bill_text":     "... full receipt text ...",
  "items": [
    { "sku": "soap", "name": "Bath Soap", "qty": 2, "unit_price": 40, "tax_rate": 5, "line_total": 84 }
  ]
}
```

The response includes `invoice_id` which the front-end uses to fetch the full invoice for printing.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Aditya-23scse1420179/billing-software.git
cd billing-software

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Open your browser at **http://localhost:3000** 🎉

> The SQLite database (`bills.db`) is created automatically on the first run.  
> The schema is applied and the product catalogue is seeded on every startup (idempotent).  
> No separate database installation is needed.

### Development Mode (auto-restart on file changes)

```bash
npm run dev
```

### Reset the database

```bash
# Stop the server first, then:
rm bills.db
npm start   # re-creates and re-seeds automatically
```

---

## 📖 How to Use

```
1. Fill in Customer Name and Phone Number at the top.
2. Enter quantities for any products you are selling.
3. Click [Total]  →  the tax and subtotals are calculated.
4. Click [Generate Bill]  →  the receipt appears in the Bill Area.
5. A prompt asks whether to save the bill:
      • Yes  →  bill is stored in the SQLite database (bills + invoice tables)
               AND downloaded as .txt
      • No   →  bill is shown but not saved
6. Click [Print Bill]  →  a styled HTML invoice opens in a new tab and the
                          browser print dialog launches automatically.
7. Click [All Bills]   →  a summary list of every saved bill appears.
8. To retrieve an old bill, type its number in "Search Bill No." and click [Search].
9. Click [Clear Bill]  →  all fields reset, a new bill number is generated.
```

---

## 🛍 Product Catalogue

### Cosmetics (Tax: 5%)

| Product | Price (Rs.) |
|---|---|
| Bath Soap | 40 |
| Face Cream | 120 |
| Face Wash | 60 |
| Hair Spray | 180 |
| Hair Gel | 140 |
| Body Lotion | 180 |

### Grocery (Tax: 10%)

| Product | Price (Rs.) |
|---|---|
| Rice | 40 |
| Food Oil | 120 |
| Daal | 60 |
| Wheat | 180 |
| Sugar | 140 |
| Tea | 180 |

### Cold Drinks (Tax: 5%)

| Product | Price (Rs.) |
|---|---|
| Maza | 60 |
| Coke | 60 |
| Thumbs Up | 50 |
| Limca | 45 |
| Pepsi | 45 |
| Sprite | 60 |

---

## 📸 Screenshots

> _Run the app locally and visit `http://localhost:3000` to see the interface._

- **Main Screen** — Three product panels side-by-side with the bill area on the right.
- **Generated Bill** — A neatly formatted monospace receipt with itemised lines and tax totals.
- **All Bills View** — Tabular summary of every saved bill displayed in the bill textarea.
- **Print Invoice** — Styled HTML invoice with per-line tax breakdown, totals, and payment info.

---

## 🗺 Roadmap

- [ ] Authentication (cashier login)
- [ ] Product management UI (add/edit/remove products)
- [ ] Daily sales report page with Chart.js
- [ ] Export all bills to CSV / Excel
- [ ] Dark / light theme toggle
- [ ] Barcode scanner support

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.

---
