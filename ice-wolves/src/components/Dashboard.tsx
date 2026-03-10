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
    blue: "var(--blue)",
    gold: "var(--gold)",
  };
  return (
    <div
      className="card fade-up"
      style={{
        animationDelay: `${delay}ms`,
        flex: wide ? "1 0 100%" : "1 1 calc(50% - 6px)",
        minWidth: 0,
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
  const { players, trainings, payments, teamBalance } = state;
  const totalDebt = players.reduce(
    (s, p) => s + (p.balance < 0 ? -p.balance : 0),
    0,
  );
  const totalCredit = players.reduce(
    (s, p) => s + (p.balance > 0 ? p.balance : 0),
    0,
  );
  const lastTraining = [...trainings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];
  const totalCollectedAllTime = payments.reduce(
    (s, p) => s + p.amount,
    0,
  );
  const totalIceCost = trainings.reduce(
    (s, t) => s + t.iceCost,
    0,
  );
  const debtors = players.filter((p) => p.balance < 0);

  const lastResult = lastTraining
    ? payments
        .filter((p) => p.trainingId === lastTraining.id)
        .reduce((s, p) => s + p.amount, 0) - lastTraining.iceCost
    : null;

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div
        className="ice-pattern"
        style={{
          margin: "0 -16px 20px",
          padding: "24px 20px 20px",
          background:
            "linear-gradient(160deg, #0d1929 0%, #0a1428 60%, #0d1f35 100%)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -10,
            opacity: 0.06,
          }}
        >
          <svg width="180" height="180" viewBox="0 0 100 100" fill="white">
            <path d="M20 10 L35 35 L15 40 L25 55 L20 75 L40 65 L50 80 L60 65 L80 75 L75 55 L85 40 L65 35 L80 10 L55 30 L50 15 L45 30 Z" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div style={{ color: "var(--blue)" }}>{Icon.wolf}</div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                letterSpacing: "0.06em",
                color: "var(--white)",
              }}
            >
              ICE WOLVES
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--cyan)",
                letterSpacing: "0.1em",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Finance Dashboard
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 44,
              color: teamBalance >= 0 ? "var(--white)" : "var(--red)",
              letterSpacing: "0.02em",
            }}
          >
            {fmtShort(teamBalance)}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "var(--muted)",
              fontWeight: 500,
            }}
          >
            RSD
          </div>
          <div
            className={`tag ${
              teamBalance >= 0 ? "tag-green" : "tag-red"
            }`}
            style={{ marginLeft: "auto" }}
          >
            Team Bank
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 12 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(
                100,
                Math.max(5, (teamBalance / 50000) * 100),
              )}%`,
            }}
          />
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
          label="Team Balance"
          value={fmt(teamBalance)}
          color={teamBalance >= 0 ? "white" : "red"}
          delay={0}
        />
        <StatCard
          label="Total Debt"
          value={fmt(-totalDebt)}
          color="red"
          delay={60}
        />
        <StatCard
          label="Credits"
          value={fmt(totalCredit)}
          color="green"
          delay={120}
        />
        <StatCard
          label="Trainings"
          value={trainings.length}
          sub="total sessions"
          delay={180}
        />
      </div>

      {lastTraining && (
        <div
          className="card fade-up"
          style={{
            marginBottom: 14,
            animationDelay: "240ms",
            background:
              "linear-gradient(135deg, var(--card) 0%, #152038 100%)",
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
              l: "Total Collected",
              v: fmt(totalCollectedAllTime),
              c: "var(--green)",
            },
            {
              l: "Total Ice Costs",
              v: fmt(totalIceCost),
              c: "var(--red)",
            },
            {
              l: "Net Result",
              v: fmt(totalCollectedAllTime - totalIceCost),
              c:
                totalCollectedAllTime - totalIceCost >= 0
                  ? "var(--green)"
                  : "var(--red)",
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
    </div>
  );
}

