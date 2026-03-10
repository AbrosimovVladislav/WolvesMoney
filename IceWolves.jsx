import { useState, useEffect, useCallback, useMemo } from "react";

// ─── FONTS & GLOBAL STYLES ───────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0e1a;
      --bg2: #111827;
      --bg3: #1a2235;
      --card: #141c2e;
      --card2: #1e2a3d;
      --border: rgba(255,255,255,0.07);
      --blue: #0a84ff;
      --blue2: #0066cc;
      --blue-glow: rgba(10,132,255,0.25);
      --cyan: #32d4f5;
      --ice: #b8d4f0;
      --white: #f0f4ff;
      --muted: rgba(176,196,222,0.55);
      --green: #30d158;
      --red: #ff453a;
      --gold: #ffd60a;
      --font-display: 'Bebas Neue', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --font-mono: 'DM Mono', monospace;
      --radius: 16px;
      --radius-sm: 10px;
      --shadow: 0 8px 32px rgba(0,0,0,0.45);
      --shadow-blue: 0 0 24px rgba(10,132,255,0.18);
    }

    html, body, #root { height: 100%; background: var(--bg); color: var(--white); }
    body { font-family: var(--font-body); font-size: 15px; line-height: 1.5; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

    input, select, textarea {
      font-family: var(--font-body);
      background: var(--bg3);
      border: 1.5px solid var(--border);
      color: var(--white);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      width: 100%;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--blue); }
    input::placeholder { color: var(--muted); }

    button { font-family: var(--font-body); cursor: pointer; border: none; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 12px var(--blue-glow); }
      50% { box-shadow: 0 0 28px rgba(10,132,255,0.45); }
    }

    .fade-up { animation: fadeUp 0.45s ease both; }
    .fade-in { animation: fadeIn 0.3s ease both; }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px;
      box-shadow: var(--shadow);
    }
    .card-hover {
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .card-hover:hover {
      transform: translateY(-2px);
      border-color: rgba(10,132,255,0.3);
      box-shadow: var(--shadow), var(--shadow-blue);
    }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      padding: 11px 20px; border-radius: var(--radius-sm); font-size: 14px;
      font-weight: 600; transition: all 0.18s; letter-spacing: 0.02em;
    }
    .btn-primary { background: var(--blue); color: #fff; }
    .btn-primary:hover { background: var(--blue2); }
    .btn-secondary { background: var(--bg3); color: var(--ice); border: 1px solid var(--border); }
    .btn-secondary:hover { border-color: var(--blue); color: var(--blue); }
    .btn-danger { background: rgba(255,69,58,0.12); color: var(--red); border: 1px solid rgba(255,69,58,0.2); }
    .btn-danger:hover { background: rgba(255,69,58,0.22); }
    .btn-sm { padding: 7px 13px; font-size: 13px; }
    .btn-block { width: 100%; }

    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 20px; font-size: 12px; font-weight: 600;
      letter-spacing: 0.03em;
    }
    .tag-green { background: rgba(48,209,88,0.12); color: var(--green); }
    .tag-red { background: rgba(255,69,58,0.12); color: var(--red); }
    .tag-blue { background: rgba(10,132,255,0.12); color: var(--blue); }
    .tag-gold { background: rgba(255,214,10,0.12); color: var(--gold); }
    .tag-muted { background: rgba(255,255,255,0.06); color: var(--muted); }

    .nav-tab {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 8px 4px 6px; font-size: 10px; font-weight: 600;
      color: var(--muted); background: none; letter-spacing: 0.04em; text-transform: uppercase;
      transition: color 0.18s;
    }
    .nav-tab.active { color: var(--blue); }
    .nav-tab svg { transition: transform 0.18s; }
    .nav-tab.active svg { transform: scale(1.1); }

    .section-title {
      font-family: var(--font-display);
      font-size: 28px; letter-spacing: 0.04em;
      color: var(--white); line-height: 1.1;
    }
    .label { font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }

    .stat-value { font-family: var(--font-display); font-size: 36px; letter-spacing: 0.02em; line-height: 1; }
    .stat-label { font-size: 11px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 4px; }

    .divider { height: 1px; background: var(--border); margin: 14px 0; }

    .player-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0; border-bottom: 1px solid var(--border);
      transition: background 0.15s;
    }
    .player-row:last-child { border-bottom: none; }

    .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, var(--blue2), var(--cyan));
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
      text-transform: uppercase;
    }

    .modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
      display: flex; align-items: flex-end; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .modal {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 24px 24px 0 0; padding: 24px 20px 32px;
      width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
      animation: fadeUp 0.3s ease;
    }
    .modal-handle {
      width: 40px; height: 4px; background: var(--border);
      border-radius: 2px; margin: 0 auto 20px;
    }

    .chart-bar {
      transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .ice-pattern {
      background-image: repeating-linear-gradient(
        60deg,
        rgba(10,132,255,0.03) 0px,
        rgba(10,132,255,0.03) 1px,
        transparent 1px,
        transparent 20px
      ),
      repeating-linear-gradient(
        -60deg,
        rgba(10,132,255,0.03) 0px,
        rgba(10,132,255,0.03) 1px,
        transparent 1px,
        transparent 20px
      );
    }

    .glow-border { animation: glow 3s ease infinite; }

    .number-badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--blue); color: #fff;
      font-size: 11px; font-weight: 700;
    }

    .training-card {
      background: linear-gradient(135deg, var(--card) 0%, var(--card2) 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.2s;
    }
    .training-card:hover { border-color: rgba(10,132,255,0.3); }

    .progress-bar {
      height: 4px; background: var(--bg3); border-radius: 2px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, var(--blue), var(--cyan));
      transition: width 0.8s ease;
    }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
    input[type=number] { -moz-appearance: textfield; }
  `}</style>
);

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INITIAL_PLAYERS = [
  "Vladislav Abrosimov","Konstantin Ryzhenko","Roman Pertsev","Valentin Savchenko",
  "Nikita Garaev","Maxim Grishunin","Aleksandr Panin","Zhan Bozhok",
  "Anton Zabroda","Vladislav Zakirov","Vladimir Lavrenchenko","Egor Nugmanov",
  "Simon Nagorny","Dmitriy Moiseev","Sergey Sevastianov","Anton Semenovykh",
  "Mihailo Pantić","Pavel Borisov","Andrey Soloviev","Ilya","Vuk",
  "Dejan Tatić","Bojan Slijepčević","Marko Crnoglavac","Goran Kengur","Vladimir Sijaković"
].map((name, i) => ({ id: i + 1, name, balance: 0 }));

const DEFAULT_ICE_COST = 18000;
const DEFAULT_PLAYER_FEE = 1500;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "ice_wolves_v2";

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => {
  const abs = Math.abs(n);
  return (n < 0 ? "−" : "") + abs.toLocaleString("ru-RU") + " RSD";
};
const fmtShort = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1000) return (n < 0 ? "−" : "") + (abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1) + "k";
  return (n < 0 ? "−" : "") + abs;
};
const initials = (name) => name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
const dateStr = (d) => new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
const today = () => new Date().toISOString().slice(0, 10);

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = {
  dashboard: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  players: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/></svg>,
  training: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  payments: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  stats: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 20h18M5 20V10l5-5 5 5 5-7v17"/></svg>,
  plus: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  back: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  trash: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  check: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  wolf: <svg width="28" height="28" viewBox="0 0 100 100" fill="currentColor"><path d="M20 10 L35 35 L15 40 L25 55 L20 75 L40 65 L50 80 L60 65 L80 75 L75 55 L85 40 L65 35 L80 10 L55 30 L50 15 L45 30 Z" opacity="0.9"/><circle cx="38" cy="38" r="4" fill="var(--cyan)"/><circle cx="62" cy="38" r="4" fill="var(--cyan)"/></svg>,
  download: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  alert: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  edit: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "white", delay = 0, wide = false }) {
  const colors = { white: "var(--white)", green: "var(--green)", red: "var(--red)", blue: "var(--blue)", gold: "var(--gold)" };
  return (
    <div className="card fade-up" style={{ animationDelay: `${delay}ms`, flex: wide ? "1 0 100%" : "1 1 calc(50% - 6px)", minWidth: 0 }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: colors[color], fontSize: Math.abs(parseInt(value || 0)) > 99999 ? "26px" : "32px", marginTop: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "12px 20px", zIndex: 200,
      color: "var(--white)", fontSize: 14, fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      animation: "fadeUp 0.3s ease", display: "flex", alignItems: "center", gap: 8
    }}>
      <span style={{ color: "var(--green)" }}>{Icon.check}</span>{msg}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ state }) {
  const { players, trainings, payments, teamBalance } = state;
  const totalDebt = players.reduce((s, p) => s + (p.balance < 0 ? -p.balance : 0), 0);
  const totalCredit = players.reduce((s, p) => s + (p.balance > 0 ? p.balance : 0), 0);
  const lastTraining = [...trainings].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const totalCollectedAllTime = payments.reduce((s, p) => s + p.amount, 0);
  const totalIceCost = trainings.reduce((s, t) => s + t.iceCost, 0);
  const debtors = players.filter(p => p.balance < 0);

  const lastResult = lastTraining
    ? payments.filter(p => p.trainingId === lastTraining.id).reduce((s, p) => s + p.amount, 0) - lastTraining.iceCost
    : null;

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {/* Hero Header */}
      <div className="ice-pattern" style={{
        margin: "0 -16px 20px",
        padding: "24px 20px 20px",
        background: "linear-gradient(160deg, #0d1929 0%, #0a1428 60%, #0d1f35 100%)",
        borderBottom: "1px solid var(--border)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -20, right: -10, opacity: 0.06 }}>
          <svg width="180" height="180" viewBox="0 0 100 100" fill="white">
            <path d="M20 10 L35 35 L15 40 L25 55 L20 75 L40 65 L50 80 L60 65 L80 75 L75 55 L85 40 L65 35 L80 10 L55 30 L50 15 L45 30 Z"/>
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ color: "var(--blue)" }}>{Icon.wolf}</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: "0.06em", color: "var(--white)" }}>ICE WOLVES</div>
            <div style={{ fontSize: 11, color: "var(--cyan)", letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase" }}>Finance Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: teamBalance >= 0 ? "var(--white)" : "var(--red)", letterSpacing: "0.02em" }}>
            {fmtShort(teamBalance)}
          </div>
          <div style={{ fontSize: 15, color: "var(--muted)", fontWeight: 500 }}>RSD</div>
          <div className={`tag ${teamBalance >= 0 ? "tag-green" : "tag-red"}`} style={{ marginLeft: "auto" }}>
            Team Bank
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 12 }}>
          <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(5, (teamBalance / 50000) * 100))}%` }} />
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <StatCard label="Team Balance" value={fmt(teamBalance)} color={teamBalance >= 0 ? "white" : "red"} delay={0} />
        <StatCard label="Total Debt" value={fmt(-totalDebt)} color="red" delay={60} />
        <StatCard label="Credits" value={fmt(totalCredit)} color="green" delay={120} />
        <StatCard label="Trainings" value={trainings.length} sub="total sessions" delay={180} />
      </div>

      {/* Last Training */}
      {lastTraining && (
        <div className="card fade-up" style={{ marginBottom: 14, animationDelay: "240ms", background: "linear-gradient(135deg, var(--card) 0%, #152038 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div className="label">Last Training</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{dateStr(lastTraining.date)}</div>
            </div>
            <div className={`tag ${lastResult >= 0 ? "tag-green" : "tag-red"}`}>
              {lastResult >= 0 ? "+" : ""}{fmtShort(lastResult)} RSD
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { l: "Collected", v: fmt(payments.filter(p=>p.trainingId===lastTraining.id).reduce((s,p)=>s+p.amount,0)), c: "var(--green)" },
              { l: "Ice Cost", v: fmt(lastTraining.iceCost), c: "var(--red)" },
              { l: "Result", v: fmt(lastResult), c: lastResult >= 0 ? "var(--green)" : "var(--red)" },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: c, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All-time */}
      <div className="card fade-up" style={{ marginBottom: 14, animationDelay: "300ms" }}>
        <div className="label" style={{ marginBottom: 12 }}>All-Time Summary</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { l: "Total Collected", v: fmt(totalCollectedAllTime), c: "var(--green)" },
            { l: "Total Ice Costs", v: fmt(totalIceCost), c: "var(--red)" },
            { l: "Net Result", v: fmt(totalCollectedAllTime - totalIceCost), c: totalCollectedAllTime - totalIceCost >= 0 ? "var(--green)" : "var(--red)" },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>{l}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: c, fontSize: 14 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Debtors Alert */}
      {debtors.length > 0 && (
        <div className="fade-up" style={{
          animationDelay: "360ms",
          background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)",
          borderRadius: "var(--radius)", padding: "14px 16px"
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "var(--red)" }}>{Icon.alert}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{debtors.length} Player{debtors.length > 1 ? "s" : ""} Owe Money</span>
          </div>
          {debtors.slice(0, 3).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--muted)", padding: "2px 0" }}>
              <span>{p.name}</span>
              <span style={{ color: "var(--red)", fontFamily: "var(--font-mono)" }}>{fmt(p.balance)}</span>
            </div>
          ))}
          {debtors.length > 3 && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>+{debtors.length - 3} more</div>}
        </div>
      )}
    </div>
  );
}

// ─── PLAYERS ─────────────────────────────────────────────────────────────────
function Players({ state, dispatch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = state.players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const addPlayer = () => {
    if (!newName.trim()) return;
    dispatch({ type: "ADD_PLAYER", name: newName.trim() });
    setNewName(""); setShowAdd(false);
    setToast("Player added");
  };

  const removePlayer = (id) => {
    dispatch({ type: "REMOVE_PLAYER", id });
    setSelected(null); setToast("Player removed");
  };

  const playerPayments = (pid) => state.payments.filter(p => p.playerId === pid);

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 14px" }}>
        <div className="section-title">PLAYERS</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>{Icon.plus} Add</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input placeholder="🔍  Search players..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Summary row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { l: "Total", v: state.players.length, c: "var(--blue)" },
          { l: "Debtors", v: state.players.filter(p=>p.balance<0).length, c: "var(--red)" },
          { l: "Credits", v: state.players.filter(p=>p.balance>0).length, c: "var(--green)" },
        ].map(({ l, v, c }) => (
          <div key={l} className="card" style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "4px 16px" }}>
        {filtered.map((p, i) => (
          <div key={p.id} className="player-row fade-up" style={{ animationDelay: `${i * 25}ms`, cursor: "pointer" }}
            onClick={() => setSelected(p)}>
            <div className="avatar" style={{ background: p.balance < 0 ? "linear-gradient(135deg,#7c1a14,#c0392b)" : p.balance > 0 ? "linear-gradient(135deg,#145a32,#27ae60)" : "linear-gradient(135deg,var(--blue2),var(--cyan))" }}>
              {initials(p.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {playerPayments(p.id).length} payment{playerPayments(p.id).length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className={`tag ${p.balance > 0 ? "tag-green" : p.balance < 0 ? "tag-red" : "tag-muted"}`} style={{ fontSize: 12 }}>
                {p.balance > 0 ? "+" : ""}{fmtShort(p.balance)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add player modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 18 }}>ADD PLAYER</div>
            <div className="label">Full Name</div>
            <input autoFocus placeholder="e.g. Ivan Petrov" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addPlayer()} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary btn-block" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary btn-block" onClick={addPlayer}>Add Player</button>
            </div>
          </div>
        </div>
      )}

      {/* Player detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{initials(selected.name)}</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{selected.name.toUpperCase()}</div>
                <div className={`tag ${selected.balance > 0 ? "tag-green" : selected.balance < 0 ? "tag-red" : "tag-muted"}`}>
                  {selected.balance > 0 ? "Credit" : selected.balance < 0 ? "Debt" : "Even"}: {fmt(selected.balance)}
                </div>
              </div>
            </div>
            <div className="label">Payment History</div>
            <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 16 }}>
              {playerPayments(selected.id).length === 0
                ? <div style={{ color: "var(--muted)", fontSize: 14, padding: "12px 0" }}>No payments yet</div>
                : playerPayments(selected.id).reverse().map(pay => {
                  const tr = state.trainings.find(t => t.id === pay.trainingId);
                  return (
                    <div key={pay.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                      <span style={{ color: "var(--muted)" }}>{tr ? dateStr(tr.date) : "—"}</span>
                      <span style={{ color: "var(--green)", fontFamily: "var(--font-mono)" }}>+{fmt(pay.amount)}</span>
                    </div>
                  );
                })
              }
            </div>
            <button className="btn btn-danger btn-block" onClick={() => removePlayer(selected.id)}>
              {Icon.trash} Remove Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TRAININGS ───────────────────────────────────────────────────────────────
function Trainings({ state, dispatch, onOpenPayments }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ date: today(), iceCost: DEFAULT_ICE_COST, notes: "" });
  const [toast, setToast] = useState(null);

  const sorted = [...state.trainings].sort((a, b) => new Date(b.date) - new Date(a.date));

  const createTraining = () => {
    if (!form.date) return;
    dispatch({ type: "CREATE_TRAINING", training: { date: form.date, iceCost: Number(form.iceCost) || DEFAULT_ICE_COST, notes: form.notes } });
    setForm({ date: today(), iceCost: DEFAULT_ICE_COST, notes: "" });
    setShowCreate(false); setToast("Training created");
  };

  const removeTraining = (id, e) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_TRAINING", id });
    setToast("Training removed");
  };

  const getTrainingStats = (t) => {
    const pays = state.payments.filter(p => p.trainingId === t.id);
    const collected = pays.reduce((s, p) => s + p.amount, 0);
    const result = collected - t.iceCost;
    const paid = new Set(pays.filter(p=>p.amount>0).map(p=>p.playerId)).size;
    return { collected, result, paid };
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 14px" }}>
        <div className="section-title">TRAININGS</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>{Icon.plus} New</button>
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏒</div>
          <div>No trainings yet. Create your first one!</div>
        </div>
      )}

      {sorted.map((t, i) => {
        const { collected, result, paid } = getTrainingStats(t);
        return (
          <div key={t.id} className="training-card card-hover fade-up" style={{ animationDelay: `${i * 40}ms`, cursor: "pointer" }}
            onClick={() => onOpenPayments(t)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: "0.04em" }}>
                  {dateStr(t.date).toUpperCase()}
                </div>
                {t.notes && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{t.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div className={`tag ${result >= 0 ? "tag-green" : "tag-red"}`}>
                  {result >= 0 ? "+" : ""}{fmtShort(result)}
                </div>
                <button className="btn btn-danger btn-sm" style={{ padding: "5px 8px" }} onClick={e => removeTraining(t.id, e)}>{Icon.trash}</button>
              </div>
            </div>
            <div className="divider" style={{ margin: "12px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { l: "Collected", v: fmtShort(collected) + " RSD", c: "var(--green)" },
                { l: "Ice Cost", v: fmtShort(t.iceCost) + " RSD", c: "var(--red)" },
                { l: "Paid", v: `${paid}/${state.players.length}`, c: "var(--blue)" },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ background: "var(--bg3)", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: c, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "var(--blue)", fontWeight: 600, letterSpacing: "0.04em" }}>
              TAP TO ENTER PAYMENTS →
            </div>
          </div>
        );
      })}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 18 }}>NEW TRAINING</div>
            <div className="label">Date</div>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ marginBottom: 14 }} />
            <div className="label">Ice Cost (RSD)</div>
            <input type="number" value={form.iceCost} onChange={e => setForm(f => ({ ...f, iceCost: e.target.value }))} style={{ marginBottom: 14 }} />
            <div className="label">Notes (optional)</div>
            <input placeholder="e.g. Pre-game practice" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary btn-block" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary btn-block" onClick={createTraining}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
function PaymentsView({ training, state, dispatch, onBack }) {
  const trainingPayments = state.payments.filter(p => p.trainingId === training.id);
  const getPlayerAmount = (pid) => trainingPayments.find(p => p.playerId === pid)?.amount ?? 0;

  const [amounts, setAmounts] = useState(() => {
    const m = {};
    state.players.forEach(p => { m[p.id] = getPlayerAmount(p.id); });
    return m;
  });
  const [toast, setToast] = useState(null);
  const [saved, setSaved] = useState(false);

  const totalCollected = Object.values(amounts).reduce((s, v) => s + (Number(v) || 0), 0);
  const result = totalCollected - training.iceCost;

  const setQuickPay = (pid, val) => setAmounts(a => ({ ...a, [pid]: val }));
  const fillAll = () => {
    const m = {};
    state.players.forEach(p => { m[p.id] = DEFAULT_PLAYER_FEE; });
    setAmounts(m);
  };
  const clearAll = () => {
    const m = {};
    state.players.forEach(p => { m[p.id] = 0; });
    setAmounts(m);
  };

  const save = () => {
    dispatch({ type: "SAVE_PAYMENTS", trainingId: training.id, amounts });
    setSaved(true); setToast("Payments saved!");
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div style={{ padding: "14px 0 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>{Icon.back}</button>
        <div>
          <div className="section-title" style={{ fontSize: 22 }}>PAYMENTS</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{dateStr(training.date)}</div>
        </div>
      </div>

      {/* Live summary */}
      <div className="card glow-border" style={{ marginBottom: 14, background: "linear-gradient(135deg, #0d1929, #0a1e36)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[
            { l: "Collected", v: fmt(totalCollected), c: "var(--green)" },
            { l: "Ice Cost", v: fmt(training.iceCost), c: "var(--red)" },
            { l: "Result", v: fmt(result), c: result >= 0 ? "var(--green)" : "var(--red)" },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: c, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, (totalCollected / training.iceCost) * 100)}%` }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "right", marginTop: 4 }}>
          {Math.round((totalCollected / training.iceCost) * 100)}% of ice cost covered
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="btn btn-secondary btn-sm btn-block" onClick={fillAll}>Fill All ({DEFAULT_PLAYER_FEE})</button>
        <button className="btn btn-secondary btn-sm btn-block" onClick={clearAll}>Clear All</button>
      </div>

      <div className="card" style={{ padding: "8px 14px", marginBottom: 14 }}>
        {state.players.map((p, i) => {
          const amt = Number(amounts[p.id]) || 0;
          const paid = trainingPayments.find(pay => pay.playerId === p.id);
          return (
            <div key={p.id} className="fade-up" style={{
              animationDelay: `${i * 20}ms`,
              display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
              borderBottom: i < state.players.length - 1 ? "1px solid var(--border)" : "none"
            }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0 }}>{initials(p.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                {p.balance !== 0 && (
                  <div style={{ fontSize: 11, color: p.balance > 0 ? "var(--green)" : "var(--red)" }}>
                    {p.balance > 0 ? `Credit: +${p.balance}` : `Debt: ${p.balance}`} RSD
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button className="btn btn-sm" onClick={() => setQuickPay(p.id, 0)}
                  style={{ padding: "4px 8px", background: amt === 0 ? "rgba(255,69,58,0.15)" : "var(--bg3)", color: amt === 0 ? "var(--red)" : "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }}>
                  ✕
                </button>
                <button className="btn btn-sm" onClick={() => setQuickPay(p.id, DEFAULT_PLAYER_FEE)}
                  style={{ padding: "4px 8px", background: amt === DEFAULT_PLAYER_FEE ? "rgba(10,132,255,0.2)" : "var(--bg3)", color: amt === DEFAULT_PLAYER_FEE ? "var(--blue)" : "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11 }}>
                  {fmtShort(DEFAULT_PLAYER_FEE)}
                </button>
                <input type="number" value={amounts[p.id] === 0 ? "" : amounts[p.id]}
                  placeholder="0"
                  onChange={e => setAmounts(a => ({ ...a, [p.id]: e.target.value === "" ? 0 : Number(e.target.value) }))}
                  style={{ width: 72, textAlign: "right", padding: "7px 8px", fontSize: 13, fontFamily: "var(--font-mono)",
                    background: amt > 0 ? "rgba(48,209,88,0.06)" : "var(--bg3)",
                    borderColor: amt > 0 ? "rgba(48,209,88,0.3)" : "var(--border)"
                  }} />
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn-primary btn-block" onClick={save} style={{ fontSize: 15, padding: 14, borderRadius: 14 }}>
        {saved ? <>{Icon.check} Saved!</> : <>💾 Save All Payments</>}
      </button>
    </div>
  );
}

// ─── STATISTICS ──────────────────────────────────────────────────────────────
function Statistics({ state }) {
  const sorted = [...state.trainings].sort((a, b) => new Date(a.date) - new Date(b.date));

  const trainingData = sorted.map(t => {
    const collected = state.payments.filter(p => p.trainingId === t.id).reduce((s, p) => s + p.amount, 0);
    return { date: t.date, collected, iceCost: t.iceCost, result: collected - t.iceCost };
  });

  // Running balance
  let runBal = 0;
  const balanceData = trainingData.map(d => {
    runBal += d.result;
    return { ...d, balance: runBal };
  });

  const maxVal = Math.max(...trainingData.map(d => Math.max(d.collected, d.iceCost)), 1);

  // Top payers
  const playerTotals = state.players.map(p => ({
    ...p, total: state.payments.filter(pay => pay.playerId === p.id).reduce((s, pay) => s + pay.amount, 0)
  })).sort((a, b) => b.total - a.total).slice(0, 8);

  const exportCSV = () => {
    const header = "Date,Collected,Ice Cost,Result,Balance\n";
    const rows = balanceData.map(d => `${d.date},${d.collected},${d.iceCost},${d.result},${d.balance}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ice_wolves_finance.csv"; a.click();
  };

  const exportPlayersCSV = () => {
    const header = "Name,Balance,Total Paid\n";
    const rows = state.players.map(p => {
      const total = state.payments.filter(pay => pay.playerId === p.id).reduce((s, pay) => s + pay.amount, 0);
      return `${p.name},${p.balance},${total}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ice_wolves_players.csv"; a.click();
  };

  return (
    <div style={{ padding: "0 16px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 14px" }}>
        <div className="section-title">STATS</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>{Icon.download} Training</button>
          <button className="btn btn-secondary btn-sm" onClick={exportPlayersCSV}>{Icon.download} Players</button>
        </div>
      </div>

      {trainingData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div>No data yet. Add trainings to see stats!</div>
        </div>
      ) : (
        <>
          {/* Bar chart: collected vs ice cost */}
          <div className="card fade-up" style={{ marginBottom: 14 }}>
            <div className="label" style={{ marginBottom: 14 }}>Collected vs Ice Cost per Training</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, padding: "0 4px" }}>
              {trainingData.slice(-10).map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2 }}>
                    <div className="chart-bar" style={{
                      width: "45%", borderRadius: "3px 3px 0 0",
                      height: `${(d.collected / maxVal) * 100}%`,
                      background: "var(--green)", minHeight: d.collected > 0 ? 2 : 0, opacity: 0.85
                    }} />
                    <div className="chart-bar" style={{
                      width: "45%", borderRadius: "3px 3px 0 0",
                      height: `${(d.iceCost / maxVal) * 100}%`,
                      background: "var(--red)", opacity: 0.7, minHeight: 2
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textAlign: "center" }}>
                    {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--green)" }} /><span style={{ color: "var(--muted)" }}>Collected</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--red)" }} /><span style={{ color: "var(--muted)" }}>Ice Cost</span>
              </div>
            </div>
          </div>

          {/* Balance over time */}
          <div className="card fade-up" style={{ marginBottom: 14, animationDelay: "80ms" }}>
            <div className="label" style={{ marginBottom: 14 }}>Team Balance Over Time</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, padding: "0 4px" }}>
              {(() => {
                const vals = balanceData.map(d => d.balance);
                const minV = Math.min(...vals, 0);
                const maxV = Math.max(...vals, 1);
                const range = maxV - minV || 1;
                return balanceData.slice(-12).map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div className="chart-bar" style={{
                        width: "70%", borderRadius: "3px 3px 0 0",
                        height: `${Math.max(3, ((d.balance - minV) / range) * 100)}%`,
                        background: d.balance >= 0
                          ? "linear-gradient(180deg, var(--blue), var(--cyan))"
                          : "linear-gradient(180deg, #ff453a, #c0392b)",
                        opacity: 0.85
                      }} />
                    </div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>
                      {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "numeric" })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Top payers */}
          <div className="card fade-up" style={{ marginBottom: 14, animationDelay: "160ms" }}>
            <div className="label" style={{ marginBottom: 12 }}>Top Contributors (All Time)</div>
            {playerTotals.map((p, i) => {
              const maxT = playerTotals[0]?.total || 1;
              return (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: i === 0 ? "var(--gold)" : "var(--white)" }}>
                      {i === 0 ? "🏆 " : `${i + 1}. `}{p.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontSize: 12 }}>{fmt(p.total)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(p.total / maxT) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Training summary table */}
          <div className="card fade-up" style={{ animationDelay: "240ms" }}>
            <div className="label" style={{ marginBottom: 12 }}>Training Log</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Date","Collected","Ice","Result"].map(h => (
                      <th key={h} style={{ textAlign: h === "Date" ? "left" : "right", color: "var(--muted)", fontWeight: 600, padding: "4px 8px 8px", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {balanceData.slice().reverse().map((d, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px", color: "var(--ice)" }}>{new Date(d.date).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--green)" }}>{fmtShort(d.collected)}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--red)" }}>{fmtShort(d.iceCost)}</td>
                      <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)", color: d.result >= 0 ? "var(--green)" : "var(--red)" }}>
                        {d.result >= 0 ? "+" : ""}{fmtShort(d.result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "ADD_PLAYER": {
      const id = Date.now();
      return { ...state, players: [...state.players, { id, name: action.name, balance: 0 }] };
    }
    case "REMOVE_PLAYER": {
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.id),
        payments: state.payments.filter(p => p.playerId !== action.id),
      };
    }
    case "CREATE_TRAINING": {
      const t = { id: Date.now(), date: action.training.date, iceCost: action.training.iceCost, notes: action.training.notes };
      return { ...state, trainings: [...state.trainings, t] };
    }
    case "REMOVE_TRAINING": {
      const trainingPayments = state.payments.filter(p => p.trainingId === action.id);
      let players = state.players.map(p => {
        const pay = trainingPayments.find(pay => pay.playerId === p.id);
        if (!pay) return p;
        const diff = pay.amount - DEFAULT_PLAYER_FEE;
        return { ...p, balance: p.balance - diff };
      });
      const training = state.trainings.find(t => t.id === action.id);
      const collected = trainingPayments.reduce((s, p) => s + p.amount, 0);
      const result = training ? collected - training.iceCost : 0;
      return {
        ...state,
        trainings: state.trainings.filter(t => t.id !== action.id),
        payments: state.payments.filter(p => p.trainingId !== action.id),
        players,
        teamBalance: state.teamBalance - result,
      };
    }
    case "SAVE_PAYMENTS": {
      const { trainingId, amounts } = action;
      const training = state.trainings.find(t => t.id === trainingId);
      if (!training) return state;

      const oldPayments = state.payments.filter(p => p.trainingId === trainingId);
      const newPayments = state.payments.filter(p => p.trainingId !== trainingId);

      const oldCollected = oldPayments.reduce((s, p) => s + p.amount, 0);
      const oldResult = oldCollected - training.iceCost;

      // Revert old player balance changes
      let players = state.players.map(p => {
        const oldPay = oldPayments.find(pay => pay.playerId === p.id);
        if (!oldPay) return p;
        const oldDiff = oldPay.amount - DEFAULT_PLAYER_FEE;
        return { ...p, balance: p.balance - oldDiff };
      });

      // Apply new payments
      const freshPayments = [];
      let newCollected = 0;
      Object.entries(amounts).forEach(([pid, amt]) => {
        const numAmt = Number(amt) || 0;
        if (numAmt >= 0) {
          freshPayments.push({ id: Date.now() + Number(pid), playerId: Number(pid), trainingId, amount: numAmt });
          newCollected += numAmt;
        }
      });

      players = players.map(p => {
        const pay = freshPayments.find(pay => pay.playerId === p.id);
        if (!pay) return p;
        const diff = pay.amount - DEFAULT_PLAYER_FEE;
        return { ...p, balance: p.balance + diff };
      });

      const newResult = newCollected - training.iceCost;
      const teamBalance = state.teamBalance - oldResult + newResult;

      return {
        ...state,
        payments: [...newPayments, ...freshPayments],
        players,
        teamBalance,
      };
    }
    default: return state;
  }
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [paymentTraining, setPaymentTraining] = useState(null);

  const initState = useMemo(() => {
    const saved = loadState();
    return saved || { players: INITIAL_PLAYERS, trainings: [], payments: [], teamBalance: 0 };
  }, []);

  const [state, dispatch] = useState(initState);

  const dispatchAndSave = useCallback((action) => {
    const next = reducer(state, action);
    saveState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setState(next);
  }, [state]);

  const [stateInternal, setState] = useState(initState);
  const finalState = stateInternal;

  const fullDispatch = useCallback((action) => {
    setState(prev => {
      const next = reducer(prev, action);
      saveState(next);
      return next;
    });
  }, []);

  const tabs = [
    { id: "dashboard", label: "Home", icon: Icon.dashboard },
    { id: "players", label: "Players", icon: Icon.players },
    { id: "trainings", label: "Ice Time", icon: Icon.training },
    { id: "stats", label: "Stats", icon: Icon.stats },
  ];

  const renderContent = () => {
    if (paymentTraining) {
      return (
        <PaymentsView
          training={paymentTraining}
          state={finalState}
          dispatch={fullDispatch}
          onBack={() => setPaymentTraining(null)}
        />
      );
    }
    switch (activeTab) {
      case "dashboard": return <Dashboard state={finalState} />;
      case "players": return <Players state={finalState} dispatch={fullDispatch} />;
      case "trainings": return <Trainings state={finalState} dispatch={fullDispatch} onOpenPayments={(t) => { setPaymentTraining(t); }} />;
      case "stats": return <Statistics state={finalState} />;
      default: return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
          {renderContent()}
        </div>

        {/* Bottom Nav */}
        {!paymentTraining && (
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 480,
            background: "rgba(10,14,26,0.92)", backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border)",
            display: "flex", zIndex: 50,
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}>
            {tabs.map(tab => (
              <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
