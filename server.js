// ─── ICE WOLVES — Backend API ─────────────────────────────────────────────────
// Node.js + Express + SQLite
// Deploy to Railway: railway up

import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── DATABASE SETUP ───────────────────────────────────────────────────────────
const db = new Database(process.env.DB_PATH || "./icewolves.db");

db.exec(`
  PRAGMA journal_mode=WAL;

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    ice_cost INTEGER NOT NULL DEFAULT 18000,
    total_collected INTEGER NOT NULL DEFAULT 0,
    result_balance INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(player_id, training_id)
  );

  CREATE TABLE IF NOT EXISTS team_balance (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    balance INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  INSERT OR IGNORE INTO team_balance (id, balance) VALUES (1, 0);
`);

// Seed initial players if empty
const playerCount = db.prepare("SELECT COUNT(*) as c FROM players").get();
if (playerCount.c === 0) {
  const names = [
    "Vladislav Abrosimov","Konstantin Ryzhenko","Roman Pertsev","Valentin Savchenko",
    "Nikita Garaev","Maxim Grishunin","Aleksandr Panin","Zhan Bozhok",
    "Anton Zabroda","Vladislav Zakirov","Vladimir Lavrenchenko","Egor Nugmanov",
    "Simon Nagorny","Dmitriy Moiseev","Sergey Sevastianov","Anton Semenovykh",
    "Mihailo Pantić","Pavel Borisov","Andrey Soloviev","Ilya","Vuk",
    "Dejan Tatić","Bojan Slijepčević","Marko Crnoglavac","Goran Kengur","Vladimir Sijaković"
  ];
  const insert = db.prepare("INSERT INTO players (name) VALUES (?)");
  const insertMany = db.transaction((names) => names.forEach(n => insert.run(n)));
  insertMany(names);
  console.log(`✓ Seeded ${names.length} players`);
}

const DEFAULT_FEE = 1500;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getBalance = () => db.prepare("SELECT balance FROM team_balance WHERE id=1").get().balance;
const setBalance = (b) => db.prepare("UPDATE team_balance SET balance=?, updated_at=datetime('now') WHERE id=1").run(b);

// ─── PLAYERS ─────────────────────────────────────────────────────────────────
app.get("/api/players", (req, res) => {
  const players = db.prepare("SELECT * FROM players ORDER BY name").all();
  res.json(players);
});

app.post("/api/players", (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name required" });
  const r = db.prepare("INSERT INTO players (name) VALUES (?)").run(name.trim());
  res.json({ id: r.lastInsertRowid, name: name.trim(), balance: 0 });
});

app.delete("/api/players/:id", (req, res) => {
  db.prepare("DELETE FROM players WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ─── TRAININGS ───────────────────────────────────────────────────────────────
app.get("/api/trainings", (req, res) => {
  const trainings = db.prepare("SELECT * FROM trainings ORDER BY date DESC").all();
  res.json(trainings);
});

app.post("/api/trainings", (req, res) => {
  const { date, ice_cost = 18000, notes = "" } = req.body;
  if (!date) return res.status(400).json({ error: "Date required" });
  const r = db.prepare(
    "INSERT INTO trainings (date, ice_cost, notes) VALUES (?,?,?)"
  ).run(date, ice_cost, notes);
  res.json({ id: r.lastInsertRowid, date, ice_cost, total_collected: 0, result_balance: -ice_cost, notes });
});

app.delete("/api/trainings/:id", (req, res) => {
  const id = Number(req.params.id);
  const training = db.prepare("SELECT * FROM trainings WHERE id=?").get(id);
  if (!training) return res.status(404).json({ error: "Not found" });
  // Revert balance
  const bal = getBalance();
  setBalance(bal - training.result_balance);
  db.prepare("DELETE FROM trainings WHERE id=?").run(id);
  res.json({ ok: true });
});

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
app.get("/api/payments/:trainingId", (req, res) => {
  const payments = db.prepare(
    "SELECT p.*, pl.name as player_name FROM payments p JOIN players pl ON p.player_id=pl.id WHERE p.training_id=?"
  ).all(req.params.trainingId);
  res.json(payments);
});

app.get("/api/payments/player/:playerId", (req, res) => {
  const payments = db.prepare(
    "SELECT p.*, t.date as training_date FROM payments p JOIN trainings t ON p.training_id=t.id WHERE p.player_id=? ORDER BY t.date DESC"
  ).all(req.params.playerId);
  res.json(payments);
});

// Bulk save payments for a training
app.post("/api/payments/bulk", (req, res) => {
  const { trainingId, payments: payList } = req.body;
  // payList: [{playerId, amount}]
  
  const training = db.prepare("SELECT * FROM trainings WHERE id=?").get(trainingId);
  if (!training) return res.status(404).json({ error: "Training not found" });

  const saveAll = db.transaction(() => {
    const oldPayments = db.prepare("SELECT * FROM payments WHERE training_id=?").all(trainingId);
    const oldCollected = oldPayments.reduce((s, p) => s + p.amount, 0);
    const oldResult = oldCollected - training.ice_cost;

    // Revert player balances
    oldPayments.forEach(pay => {
      const diff = pay.amount - DEFAULT_FEE;
      db.prepare("UPDATE players SET balance = balance - ? WHERE id=?").run(diff, pay.player_id);
    });

    // Delete old
    db.prepare("DELETE FROM payments WHERE training_id=?").run(trainingId);

    // Insert new
    let newCollected = 0;
    payList.forEach(({ playerId, amount }) => {
      const amt = Number(amount) || 0;
      if (amt >= 0) {
        db.prepare(
          "INSERT OR REPLACE INTO payments (player_id, training_id, amount) VALUES (?,?,?)"
        ).run(playerId, trainingId, amt);
        newCollected += amt;
        const diff = amt - DEFAULT_FEE;
        db.prepare("UPDATE players SET balance = balance + ? WHERE id=?").run(diff, playerId);
      }
    });

    const newResult = newCollected - training.ice_cost;

    // Update training summary
    db.prepare(
      "UPDATE trainings SET total_collected=?, result_balance=? WHERE id=?"
    ).run(newCollected, newResult, trainingId);

    // Update team balance
    const currentBal = getBalance();
    setBalance(currentBal - oldResult + newResult);

    return { collected: newCollected, result: newResult, balance: getBalance() };
  });

  try {
    const result = saveAll();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BALANCE ─────────────────────────────────────────────────────────────────
app.get("/api/balance", (req, res) => {
  res.json({ balance: getBalance() });
});

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
app.get("/api/dashboard", (req, res) => {
  const balance = getBalance();
  const players = db.prepare("SELECT * FROM players ORDER BY name").all();
  const lastTraining = db.prepare("SELECT * FROM trainings ORDER BY date DESC LIMIT 1").get();
  const totalCollected = db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM payments").get().s;
  const totalIce = db.prepare("SELECT COALESCE(SUM(ice_cost),0) as s FROM trainings").get().s;
  const debtors = players.filter(p => p.balance < 0);
  const creditors = players.filter(p => p.balance > 0);

  res.json({
    balance, totalCollected, totalIce,
    netResult: totalCollected - totalIce,
    lastTraining,
    debtors: debtors.length,
    creditors: creditors.length,
    playerCount: players.length,
  });
});

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
app.get("/api/export/trainings", (req, res) => {
  const rows = db.prepare(`
    SELECT t.date, t.ice_cost, t.total_collected, t.result_balance, t.notes
    FROM trainings t ORDER BY t.date
  `).all();
  let csv = "Date,Ice Cost,Collected,Result,Notes\n";
  rows.forEach(r => {
    csv += `${r.date},${r.ice_cost},${r.total_collected},${r.result_balance},"${r.notes}"\n`;
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=ice_wolves_trainings.csv");
  res.send(csv);
});

app.get("/api/export/players", (req, res) => {
  const players = db.prepare("SELECT * FROM players ORDER BY name").all();
  let csv = "Name,Balance,Total Paid\n";
  players.forEach(p => {
    const total = db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE player_id=?").get(p.id).s;
    csv += `"${p.name}",${p.balance},${total}\n`;
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=ice_wolves_players.csv");
  res.send(csv);
});

// ─── SERVE FRONTEND ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => console.log(`🐺 Ice Wolves API running on port ${PORT}`));
