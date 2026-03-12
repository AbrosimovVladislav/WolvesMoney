"use client";

import type { FinanceState } from "../context/FinanceState";
import { fmt, fmtShort, dateStr } from "./common";
import { Icon } from "./IceWolvesIcons";

function StatCard(props: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "white" | "green" | "red" | "blue" | "gold";
  delay?: number;
  wide?: boolean;
}) {
  const { label, value, sub, color = "white", delay = 0, wide = false } = props;
  const colors: Record<string, string> = {
    white: "var(--white)",
    green: "var(--green)",
    red: "var(--red)",
    blue: "var(--primary)",
    gold: "var(--gold)",
  };
  const accents: Record<string, string> = {
    white: "var(--border)",
    green: "var(--green)",
    red: "var(--red)",
    blue: "var(--primary)",
    gold: "var(--gold)",
  };
  return (
    <div
      className="card fade-up"
      style={{
        animationDelay: `${delay}ms`,
        flex: wide ? "1 0 100%" : "1 1 calc(50% - 6px)",
        minWidth: 0,
        borderTop: `3px solid ${accents[color]}`,
      }}
    >
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        style={{
          color: colors[color],
          fontSize:
            Math.abs(parseInt(String(value || 0))) > 99999 ? "26px" : "32px",
          marginTop: 6,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function Dashboard({ state }: { state: FinanceState }) {
  const { players, trainings, payments, deposits } = state;
  const lastTraining = [...trainings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const totalDeposits = deposits.reduce((s, d) => s + d.amount, 0);
  const totalIncome = totalPayments + totalDeposits;
  const totalExpenses = trainings.reduce(
    (s, t) => s + t.iceCost + (t.goalieCost ?? 0),
    0,
  );
  const netBalance = totalIncome - totalExpenses;

  const debtors = players.filter((p) => p.balance < 0);
  const creditors = players.filter((p) => p.balance > 0);

  const lastResult = lastTraining
    ? payments
        .filter((p) => p.trainingId === lastTraining.id)
        .reduce((s, p) => s + p.amount, 0) -
      lastTraining.iceCost - (lastTraining.goalieCost ?? 0)
    : null;

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div
        style={{
          margin: "0 -16px 20px",
          padding: "22px 20px 20px",
          background: netBalance >= 0
            ? "linear-gradient(135deg, #002868 0%, #1A4FA0 100%)"
            : "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Ice Wolves · Team Balance
          </div>
          <div style={{
            width: 62,
            height: 62,
            borderRadius: 16,
            overflow: "hidden",
            border: "2.5px solid rgba(255,255,255,0.5)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            flexShrink: 0,
            marginTop: -6,
          }}>
            <img
              src="/raw-logo.png"
              alt="Ice Wolves"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
            {fmtShort(netBalance)}
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>RSD</div>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            borderRadius: 3,
            background: "rgba(255,255,255,0.85)",
            width: `${Math.min(100, Math.max(4, (Math.abs(netBalance) / 50000) * 100))}%`,
            transition: "width 0.6s ease",
          }} />
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 5, textAlign: "right" }}>
          {Math.round((Math.abs(netBalance) / 50000) * 100)}% of 50k target
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <StatCard
          label="Net Balance"
          value={fmt(netBalance)}
          color={netBalance >= 0 ? "green" : "red"}
          delay={0}
        />
        <StatCard
          label="Trainings"
          value={trainings.length}
          sub="total sessions"
          delay={60}
        />
      </div>

      {lastTraining && (
        <div
          className="card fade-up"
          style={{
            marginBottom: 14,
            animationDelay: "240ms",
            background: "var(--card)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div>
              <div className="label">Last Training</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {dateStr(lastTraining.date)}
              </div>
            </div>
            <div
              className={`tag ${
                (lastResult ?? 0) >= 0 ? "tag-green" : "tag-red"
              }`}
            >
              {lastResult && lastResult >= 0 ? "+" : ""}
              {lastResult !== null ? fmtShort(lastResult) : "0"} RSD
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              {
                l: "Collected",
                v: fmt(
                  payments
                    .filter((p) => p.trainingId === lastTraining.id)
                    .reduce((s, p) => s + p.amount, 0),
                ),
                c: "var(--green)",
              },
              {
                l: "Ice Cost",
                v: fmt(lastTraining.iceCost),
                c: "var(--red)",
              },
              {
                l: "Result",
                v: fmt(lastResult ?? 0),
                c:
                  (lastResult ?? 0) >= 0
                    ? "var(--green)"
                    : "var(--red)",
              },
            ].map(({ l, v, c }) => (
              <div
                key={l}
                style={{
                  background: "var(--bg3)",
                  borderRadius: 10,
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: c,
                    fontWeight: 500,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card fade-up" style={{ marginBottom: 14, animationDelay: "300ms" }}>
        <div className="label" style={{ marginBottom: 12 }}>
          All-Time Summary
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              l: "Total Income",
              v: fmt(totalIncome),
              c: "var(--green)",
            },
            {
              l: "Total Expenses",
              v: fmt(totalExpenses),
              c: "var(--red)",
            },
            {
              l: "Net Balance",
              v: fmt(netBalance),
              c: netBalance >= 0 ? "var(--green)" : "var(--red)",
            },
          ].map(({ l, v, c }) => (
            <div
              key={l}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "var(--muted)",
                  fontSize: 14,
                }}
              >
                {l}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  color: c,
                  fontSize: 14,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {debtors.length > 0 && (
        <div
          className="fade-up"
          style={{
            animationDelay: "360ms",
            background: "rgba(255,69,58,0.08)",
            border: "1px solid rgba(255,69,58,0.2)",
            borderRadius: "var(--radius)",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ color: "var(--red)" }}>{Icon.alert}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--red)",
              }}
            >
              {debtors.length} Player
              {debtors.length > 1 ? "s" : ""} Owe Money
            </span>
          </div>
          {debtors.slice(0, 3).map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "var(--muted)",
                padding: "2px 0",
              }}
            >
              <span>{p.name}</span>
              <span
                style={{
                  color: "var(--red)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {fmt(p.balance)}
              </span>
            </div>
          ))}
          {debtors.length > 3 && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              +{debtors.length - 3} more
            </div>
          )}
        </div>
      )}

      {creditors.length > 0 && (
        <div
          className="fade-up"
          style={{
            animationDelay: "400ms",
            background: "rgba(22,163,74,0.07)",
            border: "1px solid rgba(22,163,74,0.2)",
            borderRadius: "var(--radius)",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ color: "var(--green)" }}>{Icon.check}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--green)",
              }}
            >
              {creditors.length} Player{creditors.length > 1 ? "s" : ""} Have Credit
            </span>
          </div>
          {creditors.slice(0, 3).map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "var(--muted)",
                padding: "2px 0",
              }}
            >
              <span>{p.name}</span>
              <span
                style={{
                  color: "var(--green)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                +{fmt(p.balance)}
              </span>
            </div>
          ))}
          {creditors.length > 3 && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              +{creditors.length - 3} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

