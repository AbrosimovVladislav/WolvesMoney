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

  const maxVal =
    trainingData.length > 0
      ? Math.max(
          ...trainingData.map((d) => Math.max(d.collected, d.iceCost)),
          1,
        )
      : 1;

  const playerTotals = state.players
    .map((p) => ({
      ...p,
      total:
        state.payments
          .filter((pay) => pay.playerId === p.id)
          .reduce((s, pay) => s + pay.amount, 0) +
        state.deposits
          .filter((d) => d.playerId === p.id)
          .reduce((s, d) => s + d.amount, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const exportCSV = () => {
    const header = "Date,Collected,Ice Cost,Result,Balance\n";
    const rows = balanceData
      .map(
        (d) =>
          `${d.date},${d.collected},${d.iceCost},${d.result},${d.balance}`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ice_wolves_finance.csv";
    a.click();
  };

  const exportPlayersCSV = () => {
    const header = "Name,Balance,Total Paid\n";
    const rows = state.players
      .map((p) => {
        const total = state.payments
          .filter((pay) => pay.playerId === p.id)
          .reduce((s, pay) => s + pay.amount, 0);
        return `${p.name},${p.balance},${total}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ice_wolves_players.csv";
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
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportCSV}
          >
            {Icon.download} Training
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportPlayersCSV}
          >
            {Icon.download} Players
          </button>
        </div>
      </div>

      {trainingData.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div>No data yet. Add trainings to see stats!</div>
        </div>
      ) : (
        <>
          <div className="card fade-up" style={{ marginBottom: 14 }}>
            <div className="label" style={{ marginBottom: 14 }}>
              Collected vs Ice Cost per Training
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                height: 100,
                padding: "0 4px",
              }}
            >
              {trainingData.slice(-10).map((d, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      width: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <div
                      className="chart-bar"
                      style={{
                        width: "45%",
                        borderRadius: "3px 3px 0 0",
                        height: `${(d.collected / maxVal) * 100}%`,
                        background: "var(--green)",
                        minHeight: d.collected > 0 ? 2 : 0,
                        opacity: 0.85,
                      }}
                    />
                    <div
                      className="chart-bar"
                      style={{
                        width: "45%",
                        borderRadius: "3px 3px 0 0",
                        height: `${(d.iceCost / maxVal) * 100}%`,
                        background: "var(--red)",
                        opacity: 0.7,
                        minHeight: 2,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "var(--muted)",
                      textAlign: "center",
                    }}
                  >
                    {new Date(d.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 10,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "var(--green)",
                  }}
                />
                <span style={{ color: "var(--muted)" }}>Collected</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "var(--red)",
                  }}
                />
                <span style={{ color: "var(--muted)" }}>Ice Cost</span>
              </div>
            </div>
          </div>

          <div
            className="card fade-up"
            style={{ marginBottom: 14, animationDelay: "80ms" }}
          >
            <div className="label" style={{ marginBottom: 14 }}>
              Team Balance Over Time
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 80,
                padding: "0 4px",
              }}
            >
              {(() => {
                const vals = balanceData.map((d) => d.balance);
                const minV = Math.min(...vals, 0);
                const maxV = Math.max(...vals, 1);
                const range = maxV - minV || 1;
                return balanceData.slice(-12).map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        className="chart-bar"
                        style={{
                          width: "70%",
                          borderRadius: "3px 3px 0 0",
                          height: `${Math.max(
                            3,
                            ((d.balance - minV) / range) * 100,
                          )}%`,
                          background:
                            d.balance >= 0
                              ? "linear-gradient(180deg, var(--blue), var(--cyan))"
                              : "linear-gradient(180deg, #ff453a, #c0392b)",
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "var(--muted)",
                      }}
                    >
                      {new Date(d.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "numeric",
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div
            className="card fade-up"
            style={{ marginBottom: 14, animationDelay: "160ms" }}
          >
            <div className="label" style={{ marginBottom: 12 }}>
              Top Contributors (All Time)
            </div>
            {playerTotals.map((p, i) => {
              const maxT = playerTotals[0]?.total || 1;
              return (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        color:
                          i === 0 ? "var(--gold)" : "var(--white)",
                      }}
                    >
                      {i === 0 ? "🏆 " : `${i + 1}. `}
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--green)",
                        fontSize: 12,
                      }}
                    >
                      {fmt(p.total)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(p.total / maxT) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="card fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <div className="label" style={{ marginBottom: 12 }}>
              Training Log
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    {["Date", "Collected", "Ice", "Result"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign:
                            h === "Date" ? "left" : "right",
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
                  {balanceData
                    .slice()
                    .reverse()
                    .map((d, i) => (
                      <tr
                        key={i}
                        style={{
                          borderTop:
                            "1px solid var(--border)",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px",
                            color: "var(--ice)",
                          }}
                        >
                          {new Date(d.date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            textAlign: "right",
                            fontFamily: "var(--font-mono)",
                            color: "var(--green)",
                          }}
                        >
                          {fmtShort(d.collected)}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            textAlign: "right",
                            fontFamily: "var(--font-mono)",
                            color: "var(--red)",
                          }}
                        >
                          {fmtShort(d.iceCost)}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            textAlign: "right",
                            fontFamily: "var(--font-mono)",
                            color:
                              d.result >= 0
                                ? "var(--green)"
                                : "var(--red)",
                          }}
                        >
                          {d.result >= 0 ? "+" : ""}
                          {fmtShort(d.result)}
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

