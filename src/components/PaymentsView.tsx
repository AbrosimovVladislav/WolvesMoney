"use client";

import { useState } from "react";
import { useFinance, TrainingState } from "../context/FinanceState";
import { Toast, initials, fmt, fmtShort, dateStr } from "./common";
import { Icon } from "./IceWolvesIcons";

const DEFAULT_PLAYER_FEE = 1500;

type Props = {
  training: TrainingState;
  onBack: () => void;
};

export function PaymentsView({ training, onBack }: Props) {
  const { state, savePayments } = useFinance();
  const trainingPayments = state.payments.filter(
    (p) => p.trainingId === training.id,
  );

  const getPlayerAmount = (pid: number) =>
    trainingPayments.find((p) => p.playerId === pid)?.amount ?? 0;

  const [amounts, setAmounts] = useState<Record<number, number>>(() => {
    const m: Record<number, number> = {};
    state.players.forEach((p) => {
      m[p.id] = getPlayerAmount(p.id);
    });
    return m;
  });
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const totalCollected = Object.values(amounts).reduce(
    (s, v) => s + (Number(v) || 0),
    0,
  );
  const result = totalCollected - training.iceCost;

  const setQuickPay = (pid: number, val: number) =>
    setAmounts((a) => ({ ...a, [pid]: val }));

  const fillAll = () => {
    const m: Record<number, number> = {};
    state.players.forEach((p) => {
      m[p.id] = DEFAULT_PLAYER_FEE;
    });
    setAmounts(m);
  };

  const clearAll = () => {
    const m: Record<number, number> = {};
    state.players.forEach((p) => {
      m[p.id] = 0;
    });
    setAmounts(m);
  };

  const handleSave = async () => {
    const numeric: Record<number, number> = {};
    Object.entries(amounts).forEach(([pid, val]) => {
      numeric[Number(pid)] = Number(val) || 0;
    });
    await savePayments(training.id, numeric);
    setSaved(true);
    setToast("Payments saved!");
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div
        style={{
          padding: "14px 0 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          {Icon.back}
        </button>
        <div>
          <div className="section-title" style={{ fontSize: 22 }}>
            PAYMENTS
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {dateStr(training.date)}
          </div>
        </div>
      </div>

      <div
        className="card glow-border"
        style={{
          marginBottom: 14,
          background: "linear-gradient(135deg, #0d1929, #0a1e36)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {[
            {
              l: "Collected",
              v: fmt(totalCollected),
              c: "var(--green)",
            },
            {
              l: "Ice Cost",
              v: fmt(training.iceCost),
              c: "var(--red)",
            },
            {
              l: "Result",
              v: fmt(result),
              c: result >= 0 ? "var(--green)" : "var(--red)",
            },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 4,
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: c,
                  fontWeight: 600,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(
                100,
                (totalCollected / training.iceCost) * 100,
              )}%`,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--muted)",
            textAlign: "right",
            marginTop: 4,
          }}
        >
          {Math.round((totalCollected / training.iceCost) * 100)}% of ice cost
          covered
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          className="btn btn-secondary btn-sm btn-block"
          onClick={fillAll}
        >
          Fill All ({DEFAULT_PLAYER_FEE})
        </button>
        <button
          className="btn btn-secondary btn-sm btn-block"
          onClick={clearAll}
        >
          Clear All
        </button>
      </div>

      <div
        className="card"
        style={{ padding: "8px 14px", marginBottom: 14 }}
      >
        {state.players.map((p, i) => {
          const amt = Number(amounts[p.id]) || 0;
          return (
            <div
              key={p.id}
              className="fade-up"
              style={{
                animationDelay: `${i * 20}ms`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 0",
                borderBottom:
                  i < state.players.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <div
                className="avatar"
                style={{
                  width: 32,
                  height: 32,
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                {initials(p.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.name}
                </div>
                {p.balance !== 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color:
                        p.balance > 0
                          ? "var(--green)"
                          : "var(--red)",
                    }}
                  >
                    {p.balance > 0
                      ? `Credit: +${p.balance}`
                      : `Debt: ${p.balance}`}{" "}
                    RSD
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <button
                  className="btn btn-sm"
                  onClick={() => setQuickPay(p.id, 0)}
                  style={{
                    padding: "4px 8px",
                    background:
                      amt === 0
                        ? "rgba(255,69,58,0.15)"
                        : "var(--bg3)",
                    color:
                      amt === 0
                        ? "var(--red)"
                        : "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  ✕
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    setQuickPay(p.id, DEFAULT_PLAYER_FEE)
                  }
                  style={{
                    padding: "4px 8px",
                    background:
                      amt === DEFAULT_PLAYER_FEE
                        ? "rgba(10,132,255,0.2)"
                        : "var(--bg3)",
                    color:
                      amt === DEFAULT_PLAYER_FEE
                        ? "var(--blue)"
                        : "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  {fmtShort(DEFAULT_PLAYER_FEE)}
                </button>
                <input
                  type="number"
                  value={amounts[p.id] === 0 ? "" : amounts[p.id]}
                  placeholder="0"
                  onChange={(e) =>
                    setAmounts((a) => ({
                      ...a,
                      [p.id]:
                        e.target.value === ""
                          ? 0
                          : Number(e.target.value),
                    }))
                  }
                  style={{
                    width: 72,
                    textAlign: "right",
                    padding: "7px 8px",
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    background:
                      amt > 0
                        ? "rgba(48,209,88,0.06)"
                        : "var(--bg3)",
                    borderColor:
                      amt > 0
                        ? "rgba(48,209,88,0.3)"
                        : "var(--border)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={handleSave}
        style={{
          fontSize: 15,
          padding: 14,
          borderRadius: 14,
        }}
      >
        {saved ? (
          <>
            {Icon.check} Saved!
          </>
        ) : (
          <>💾 Save All Payments</>
        )}
      </button>
    </div>
  );
}

