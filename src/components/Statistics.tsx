"use client";

import { useFinance } from "../context/FinanceState";
import { fmt, fmtShort } from "./common";
import { Icon } from "./IceWolvesIcons";

export function Statistics() {
  const { state } = useFinance();
  const sortedTrainings = [...state.trainings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const trainingData = sortedTrainings.map((t) => {
    const collected = state.payments
      .filter((p) => p.trainingId === t.id)
      .reduce((s, p) => s + p.amount, 0);
    return {
      date: t.date,
      collected,
      iceCost: t.iceCost,
      result: collected - t.iceCost,
    };
  });

  let runBal = 0;
  const balanceData = trainingData.map((d) => {
    runBal += d.result;
    return { ...d, balance: runBal };
  });

  // Players the treasury owes money to (positive balance = team owes them)
  const creditors = [...state.players]
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  // Players who owe the treasury
  const debtors = [...state.players]
    .filter((p) => p.balance < 0)
    .sort((a, b) => a.balance - b.balance);

  const totalOwedToPlayers = creditors.reduce((s, p) => s + p.balance, 0);
  const totalOwedByPlayers = debtors.reduce((s, p) => s + Math.abs(p.balance), 0);

  const totalPayments = state.payments.reduce((s, p) => s + p.amount, 0);
  const totalDeposits = state.deposits.reduce((s, d) => s + d.amount, 0);
  const totalExpenses = state.trainings.reduce((s, t) => s + t.iceCost + (t.goalieCost ?? 0), 0);
  // Balance = training payments − expenses − deposits (deposits are liabilities owed to players)
  const netBalance = totalPayments - totalExpenses - totalDeposits;

  const exportCSV = () => {
    const header = "Date,Collected,Ice Cost,Result,Balance\n";
    const rows = balanceData
      .map((d) => `${d.date},${d.collected},${d.iceCost},${d.result},${d.balance}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hc_vukovi_finance.csv";
    a.click();
  };

  return (
    <div style={{ padding: "0 16px 32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0 14px",
        }}
      >
        <div className="section-title">STATS</div>
        <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
          {Icon.download} Export
        </button>
      </div>

      {trainingData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div>No data yet. Add trainings to see stats!</div>
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Net Balance", value: fmtShort(netBalance), color: netBalance >= 0 ? "var(--green)" : "var(--red)" },
              { label: "Trainings", value: String(state.trainings.length), color: "var(--primary)" },
              { label: "Players", value: String(state.players.length), color: "var(--cyan)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ flex: 1, textAlign: "center", padding: "12px 6px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Balance over time */}
          <div className="card fade-up" style={{ marginBottom: 14 }}>
            <div className="label" style={{ marginBottom: 14 }}>
              Баланс казны по времени
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, padding: "0 4px" }}>
              {(() => {
                const vals = balanceData.map((d) => d.balance);
                const minV = Math.min(...vals, 0);
                const maxV = Math.max(...vals, 1);
                const range = maxV - minV || 1;
                return balanceData.slice(-14).map((d, i) => (
                  <div
                    key={i}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}
                    title={`${new Date(d.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}: ${fmt(d.balance)} RSD`}
                  >
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div
                        style={{
                          width: "70%",
                          borderRadius: "3px 3px 0 0",
                          height: `${Math.max(3, ((d.balance - minV) / range) * 100)}%`,
                          background: d.balance >= 0
                            ? "linear-gradient(180deg, #002868, #5B9BD5)"
                            : "linear-gradient(180deg, #ff453a, #c0392b)",
                          opacity: 0.85,
                          transition: "height 0.4s ease",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 8, color: "var(--muted)", marginTop: 3, textAlign: "center" }}>
                      {new Date(d.date).toLocaleDateString("ru-RU", { day: "numeric", month: "numeric" })}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>
                Начало: <span style={{ fontFamily: "var(--font-mono)", color: balanceData[0]?.balance >= 0 ? "var(--green)" : "var(--red)" }}>
                  {fmtShort(balanceData[0]?.balance ?? 0)} RSD
                </span>
              </span>
              <span style={{ color: "var(--muted)" }}>
                Сейчас: <span style={{ fontFamily: "var(--font-mono)", color: netBalance >= 0 ? "var(--green)" : "var(--red)" }}>
                  {fmtShort(netBalance)} RSD
                </span>
              </span>
            </div>
          </div>

          {/* Treasury owes players */}
          {creditors.length > 0 && (
            <div className="card fade-up" style={{ marginBottom: 14, animationDelay: "80ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="label" style={{ marginBottom: 0 }}>Казна должна игрокам</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
                  {fmt(totalOwedToPlayers)} RSD
                </div>
              </div>
              {creditors.map((p, i) => {
                const maxBal = creditors[0]?.balance || 1;
                return (
                  <div key={p.id} style={{ marginBottom: i < creditors.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span style={{ color: "var(--white)" }}>{p.name}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontSize: 12 }}>
                        +{fmt(p.balance)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(p.balance / maxBal) * 100}%`,
                          background: "linear-gradient(90deg, #002868, #5B9BD5)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Players who owe the treasury */}
          {debtors.length > 0 && (
            <div className="card fade-up" style={{ marginBottom: 14, animationDelay: "120ms" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="label" style={{ marginBottom: 0 }}>Должны казне</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--red)" }}>
                  {fmt(totalOwedByPlayers)} RSD
                </div>
              </div>
              {debtors.map((p, i) => {
                const maxDebt = Math.abs(debtors[0]?.balance || 1);
                return (
                  <div key={p.id} style={{ marginBottom: i < debtors.length - 1 ? 10 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span style={{ color: "var(--white)" }}>{p.name}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--red)", fontSize: 12 }}>
                        {fmt(p.balance)}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(Math.abs(p.balance) / maxDebt) * 100}%`,
                          background: "linear-gradient(90deg, #DC2626, #EF4444)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Training log */}
          <div className="card fade-up" style={{ animationDelay: "160ms" }}>
            <div className="label" style={{ marginBottom: 12 }}>Training Log</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Date", "Collected", "Ice", "Result"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: h === "Date" ? "left" : "right",
                          color: "var(--muted)",
                          fontWeight: 600,
                          padding: "4px 8px 8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontSize: 10,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {balanceData.slice().reverse().map((d, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px", color: "var(--ice)" }}>
                        {new Date(d.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                      </td>
                      <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--green)" }}>
                        {fmtShort(d.collected)}
                      </td>
                      <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--red)" }}>
                        {fmtShort(d.iceCost)}
                      </td>
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
