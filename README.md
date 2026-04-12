<div align="center">

# 🧾 Billing Software

**A modern, full-stack retail Point-of-Sale (POS) system**  
Built with pure **HTML · CSS · JavaScript** on the front-end  
and **Node.js · Express · SQLite** on the back-end.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

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
| 🔍 **Bill Search** | Find any previously saved bill by its 4-digit bill number |
| 📋 **All Bills View** | List every saved bill in the bill area with one click |
| ⬇️ **Download as TXT** | Instantly download any generated bill as a `.txt` file |
| 🖨️ **Print Support** | Browser print dialog opens a clean, formatted print preview |
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
├── index.html          # Single-page application shell
├── style.css           # All styles (responsive, modals, grid)
├── script.js           # Front-end logic – fetch API, bill generation
│
├── server.js           # Express server + REST API
├── schema.sql          # SQLite table/index definitions
├── bills.db            # SQLite database (auto-created on first run)
│
├── package.json        # Node.js project metadata & dependencies
└── README.md           # This file
```

---

## 🗄 Database Schema

```sql
CREATE TABLE IF NOT EXISTS bills (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  bill_no       TEXT     NOT NULL UNIQUE,   -- e.g. "4721"
  customer_name TEXT     NOT NULL,
  phone         TEXT     NOT NULL,
  cosmetic_raw  REAL     NOT NULL DEFAULT 0,
  cosmetic_tax  REAL     NOT NULL DEFAULT 0,
  grocery_raw   REAL     NOT NULL DEFAULT 0,
  grocery_tax   REAL     NOT NULL DEFAULT 0,
  drink_raw     REAL     NOT NULL DEFAULT 0,
  drink_tax     REAL     NOT NULL DEFAULT 0,
  grand_total   REAL     NOT NULL DEFAULT 0,
  bill_text     TEXT     NOT NULL,          -- full formatted receipt
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bills_bill_no ON bills (bill_no);
```

Every time a cashier saves a bill, all monetary breakdowns are stored in dedicated columns.  
This makes it easy to run future SQL analytics (e.g. `SELECT SUM(grand_total) FROM bills WHERE DATE(created_at) = DATE('now')`).

---

## 🔌 API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bills` | Save a new bill to the database |
| `GET` | `/bills` | List summary of all saved bills |
| `GET` | `/bills/:billNo` | Retrieve a specific bill by number |
| `DELETE` | `/bills` | Delete all saved bills |

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
  "bill_text":     "... full receipt text ..."
}
```

### GET `/api/bills/:billNo` – Response

```json
{
  "id": 1,
  "bill_no": "4721",
  "customer_name": "Ravi Kumar",
  "phone": "9876543210",
  "grand_total": 776,
  "bill_text": "...",
  "created_at": "2026-04-12 10:30:00"
}
```

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
> No separate database installation is needed.

### Development Mode (auto-restart on file changes)

```bash
npm run dev
```

---

## 📖 How to Use

```
1. Fill in Customer Name and Phone Number at the top.
2. Enter quantities for any products you are selling.
3. Click [Total]  →  the tax and subtotals are calculated.
4. Click [Generate Bill]  →  the receipt appears in the Bill Area.
5. A prompt asks whether to save the bill:
      • Yes  →  bill is stored in the SQLite database AND downloaded as .txt
      • No   →  bill is shown but not saved
6. Click [Print Bill]  →  a print-friendly window opens.
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

## 📄 License

[MIT](LICENSE) © 2026 Aditya
