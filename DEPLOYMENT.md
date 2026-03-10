# 🐺 Ice Wolves — Telegram Mini App
## Complete Deployment Guide & Architecture

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TELEGRAM CLIENT                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Ice Wolves Mini App (WebApp)             │  │
│  │  React + TailwindCSS + Framer Motion               │  │
│  │                                                     │  │
│  │  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌───────┐  │  │
│  │  │Dashboard │ │ Players │ │Trainings │ │ Stats │  │  │
│  │  └──────────┘ └─────────┘ └──────────┘ └───────┘  │  │
│  └───────────────────────┬───────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │ HTTPS REST API
┌──────────────────────────▼──────────────────────────────┐
│                    RAILWAY / VERCEL                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │           Node.js + Express API                     │  │
│  │  /api/players  /api/trainings  /api/payments        │  │
│  │  /api/balance  /api/dashboard  /api/export          │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                         │                                 │
│  ┌──────────────────────▼─────────────────────────────┐  │
│  │                  SQLite Database                     │  │
│  │  players | trainings | payments | team_balance       │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```sql
-- Players table
CREATE TABLE players (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT    NOT NULL,
  balance  INTEGER NOT NULL DEFAULT 0,   -- positive = credit, negative = debt
  created_at TEXT  DEFAULT (datetime('now'))
);

-- Training sessions
CREATE TABLE trainings (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  date             TEXT    NOT NULL,
  ice_cost         INTEGER NOT NULL DEFAULT 18000,
  total_collected  INTEGER NOT NULL DEFAULT 0,
  result_balance   INTEGER NOT NULL DEFAULT 0,  -- collected - ice_cost
  notes            TEXT    DEFAULT '',
  created_at       TEXT    DEFAULT (datetime('now'))
);

-- Individual payments
CREATE TABLE payments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    DEFAULT (datetime('now')),
  UNIQUE(player_id, training_id)
);

-- Team bank balance (single-row table)
CREATE TABLE team_balance (
  id       INTEGER PRIMARY KEY CHECK (id = 1),
  balance  INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT  DEFAULT (datetime('now'))
);
```

**Financial Logic:**
```
training_result = total_collected - ice_cost
team_balance   += training_result
player_balance += (amount_paid - 1500)   -- 1500 = standard fee
```

---

## 📁 Project Structure

```
ice-wolves/
├── frontend/                  # React Vite app
│   ├── src/
│   │   ├── App.jsx            # ← IceWolves.jsx (main file)
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server.js                  # ← Express API
├── package.json
├── railway.toml
└── .env.example
```

---

## 🚀 Quick Start (Local)

### 1. Prerequisites
```bash
node >= 18
npm >= 9
```

### 2. Backend Setup
```bash
# Create project
mkdir ice-wolves && cd ice-wolves

# Install backend deps
npm init -y
npm install express better-sqlite3 cors

# Copy server.js here
# Start API
node server.js
# → API running on http://localhost:3001
```

### 3. Frontend Setup
```bash
# Create Vite React app
npm create vite@latest frontend -- --template react
cd frontend

# Install deps
npm install
npm install @twa-dev/sdk

# Replace src/App.jsx with IceWolves.jsx content
# Update src/main.jsx:

# main.jsx:
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(<App />)

# Start frontend
npm run dev
# → http://localhost:5173
```

### 4. Connect Frontend to Backend
In `IceWolves.jsx`, add to the top:
```js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

---

## ☁️ Deploy to Railway (Recommended)

Railway supports full-stack Node.js with persistent SQLite.

### Step 1 — Prepare files
```bash
# package.json (root)
{
  "name": "ice-wolves",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "build": "cd frontend && npm install && npm run build",
    "deploy": "npm run build && npm start"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5"
  }
}
```

### Step 2 — railway.toml
```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/balance"
```

### Step 3 — Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login & deploy
railway login
railway init
railway up

# Get your URL
railway domain
# → https://ice-wolves-production.up.railway.app
```

### Step 4 — Set env vars in Railway dashboard
```
PORT=3001
DB_PATH=/app/data/icewolves.db
```

---

## ☁️ Deploy to Vercel (Frontend) + Railway (Backend)

If you prefer splitting:

**Backend (Railway):**
```bash
railway up  # deploys server.js
```

**Frontend (Vercel):**
```bash
cd frontend
# Add to .env.production:
VITE_API_URL=https://your-railway-url.railway.app

vercel deploy
```

---

## 🤖 Telegram Bot Setup

### Step 1 — Create Bot
```
1. Open @BotFather on Telegram
2. Send /newbot
3. Name: IceWolvesBot
4. Username: ice_wolves_finance_bot
5. Copy your BOT_TOKEN
```

### Step 2 — Set Mini App URL
```
1. Send /newapp to @BotFather
2. Select your bot
3. Set Web App URL: https://your-railway-url.railway.app
4. Title: Ice Wolves Finance
5. Description: Team finance tracker for ice hockey
```

### Step 3 — Add Menu Button
```
/mybots → Select bot → Bot Settings → Menu Button
→ Set URL: https://your-railway-url.railway.app
```

### Step 4 — Telegram WebApp SDK (optional enhanced integration)
```jsx
// In App.jsx, add at top:
import WebApp from '@twa-dev/sdk'

// Initialize
useEffect(() => {
  WebApp.ready()
  WebApp.expand()
  WebApp.setHeaderColor('#0a0e1a')
  WebApp.setBackgroundColor('#0a0e1a')
}, [])

// Get Telegram user
const user = WebApp.initDataUnsafe?.user
// user.first_name, user.last_name, user.id
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/players | List all players |
| POST | /api/players | Add player `{name}` |
| DELETE | /api/players/:id | Remove player |
| GET | /api/trainings | List all trainings |
| POST | /api/trainings | Create training `{date, ice_cost, notes}` |
| DELETE | /api/trainings/:id | Remove training |
| GET | /api/payments/:trainingId | Get payments for training |
| GET | /api/payments/player/:id | Get player payment history |
| POST | /api/payments/bulk | Save all payments `{trainingId, payments:[{playerId,amount}]}` |
| GET | /api/balance | Team balance |
| GET | /api/dashboard | Dashboard summary |
| GET | /api/export/trainings | CSV download |
| GET | /api/export/players | CSV download |

---

## 💡 Financial Logic Summary

```
Standard fee:    1,500 RSD per player per training
Ice rental:     18,000 RSD per training
Break-even:     12 players paying full fee

Per training:
  result = Σ(payments) − ice_cost
  team_balance += result

Per player:
  player_balance += (paid − 1,500)
  > 0 → credit (team owes player)
  < 0 → debt  (player owes team)
```

---

## 🛠️ Tech Stack Summary

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite |
| Styling | CSS-in-JS (vars + classes) |
| Fonts | Bebas Neue + DM Sans + DM Mono |
| Backend | Node.js 18, Express 4 |
| Database | SQLite (better-sqlite3) |
| Hosting | Railway (recommended) |
| Telegram | @twa-dev/sdk |

---

## 📱 Screen Reference

1. **Dashboard** — Team balance hero, stat cards, last training result, debtors alert
2. **Players** — Searchable list, balance indicators, payment history per player
3. **Ice Time** — Training sessions, create/delete, tap to enter payments
4. **Payments** — Per-training payment entry with live calculation, quick-fill buttons
5. **Stats** — Bar charts, balance timeline, top contributors, training log table, CSV export

---

*Built for Ice Wolves Amateur Hockey Team 🐺🏒*
