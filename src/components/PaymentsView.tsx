"use client";

import { useState } from "react";
import { useFinance, TrainingState } from "../context/FinanceState";
import { Toast, initials, fmt, fmtShort, dateStr } from "./common";
import { Icon } from "./IceWolvesIcons";

type Props = {
  training: TrainingState;
  onBack: () => void;
};

export function PaymentsView({ training, onBack }: Props) {
  const { state, savePayments } = useFinance();
  const trainingPayments = state.payments.filter(
    (p) => p.trainingId === training.id,
  );

  const [attended, setAttended] = useState<Record<number, boolean>>(() => {
    const m: Record<number, boolean> = {};
    state.players.forEach((p) => {
      m[p.id] = trainingPayments.find((tp) => tp.playerId === p.id)?.attended ?? false;
    });
    return m;
  });

  const [amounts, setAmounts] = useState<Record<number, number>>(() => {
    const m: Record<number, number> = {};
    state.players.forEach((p) => {
      m[p.id] = trainingPayments.find((tp) => tp.playerId === p.id)?.amount ?? 0;
    });
    return m;
  });

  const [goalieEnabled, setGoalieEnabled] = useState(training.goalieCost > 0);
  const [goalieAmount, setGoalieAmount] = useState(training.goalieCost || 0);

  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const totalCollected = state.players.reduce(
    (s, p) => s + (attended[p.id] ? Number(amounts[p.id]) || 0 : 0),
    0,
  );
  const effectiveGoalie = goalieEnabled ? (Number(goalieAmount) || 0) : 0;
  const result = totalCollected - training.iceCost - effectiveGoalie;

  const toggleAttended = (pid: number) =>
    setAttended((a) => ({ ...a, [pid]: !a[pid] }));

  const setQuickPay = (pid: number, val: number) =>
    setAmounts((a) => ({ ...a, [pid]: val }));

  const fillAll = () => {
    const newAttended: Record<number, boolean> = {};
    const newAmounts: Record<number, number> = {};
    state.players.forEach((p) => {
      newAttended[p.id] = true;
      newAmounts[p.id] = p.defaultFee;
    });
    setAttended(newAttended);
    setAmounts(newAmounts);
  };

  const clearAll = () => {
    const newAttended: Record<number, boolean> = {};
    const newAmounts: Record<number, number> = {};
    state.players.forEach((p) => {
      newAttended[p.id] = false;
      newAmounts[p.id] = 0;
    });
    setAttended(newAttended);
    setAmounts(newAmounts);
  };

  const handleSave = async () => {
    const entries: Record<number, { attended: boolean; amount: number }> = {};
    state.players.forEach((p) => {
      entries[p.id] = {
        attended: attended[p.id] ?? false,
        amount: attended[p.id] ? Number(amounts[p.id]) || 0 : 0,
      };
    });
    await savePayments(training.id, entries, effectiveGoalie);
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
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.01em" }}>
            Payments
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, marginTop: 1 }}>
            {dateStr(training.date)}
          </div>
        </div>
      </div>

      {/* Stats card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {[
            { l: "Collected", v: fmt(totalCollected), c: "var(--green)" },
            { l: "Ice Cost", v: fmt(training.iceCost), c: "var(--red)" },
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (totalCollected / training.iceCost) * 100)}%`,
              }}
            />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", minWidth: 36, textAlign: "right", fontFamily: "var(--font-mono)" }}>
            {Math.round((totalCollected / training.iceCost) * 100)}%
          </div>
        </div>
      </div>

      {/* Goalie payment */}
      <div
        className="card"
        style={{
          marginBottom: 14,
          borderLeft: `3px solid ${goalieEnabled ? "var(--gold)" : "var(--border)"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: goalieEnabled ? "var(--gold)" : "var(--muted)" }}>
              🥅 Goalie Fee
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Additional cost paid to goalie
            </div>
          </div>
          <button
            className="btn btn-sm"
            onClick={() => setGoalieEnabled((v) => !v)}
            style={{
              padding: "5px 12px",
              background: goalieEnabled ? "rgba(217,119,6,0.12)" : "var(--bg3)",
              color: goalieEnabled ? "var(--gold)" : "var(--muted)",
              border: `1px solid ${goalieEnabled ? "rgba(217,119,6,0.3)" : "var(--border)"}`,
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {goalieEnabled ? "Yes" : "No"}
          </button>
        </div>

        {goalieEnabled && (
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
            {[3000, 4000, 5000].map((preset) => (
              <button
                key={preset}
                className="btn btn-sm"
                onClick={() => setGoalieAmount(preset)}
                style={{
                  padding: "4px 10px",
                  background: goalieAmount === preset ? "rgba(217,119,6,0.15)" : "var(--bg3)",
                  color: goalieAmount === preset ? "var(--gold)" : "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize: 11,
                }}
              >
                {fmtShort(preset)}
              </button>
            ))}
            <input
              type="number"
              value={goalieAmount === 0 ? "" : goalieAmount}
              placeholder="0"
              onChange={(e) => setGoalieAmount(e.target.value === "" ? 0 : Number(e.target.value))}
              style={{
                flex: 1,
                textAlign: "right",
                padding: "7px 8px",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                background: goalieAmount > 0 ? "rgba(217,119,6,0.06)" : "var(--bg3)",
                borderColor: goalieAmount > 0 ? "rgba(217,119,6,0.3)" : "var(--border)",
              }}
            />
          </div>
        )}
      </div>

      {/* Fill/Clear buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="btn btn-secondary btn-sm btn-block" onClick={fillAll}>
          Fill All
        </button>
        <button className="btn btn-secondary btn-sm btn-block" onClick={clearAll}>
          Clear All
        </button>
      </div>

      {/* Player list */}
      <div className="card" style={{ padding: "8px 14px", marginBottom: 14 }}>
        {state.players.map((p, i) => {
          const isAttended = attended[p.id] ?? false;
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
                style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0 }}
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
                  <div style={{ fontSize: 11, color: p.balance > 0 ? "var(--green)" : "var(--red)" }}>
                    {p.balance > 0 ? `Credit: +${p.balance}` : `Debt: ${p.balance}`} RSD
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  className="btn btn-sm"
                  onClick={() => toggleAttended(p.id)}
                  style={{
                    padding: "4px 10px",
                    background: isAttended ? "rgba(48,209,88,0.15)" : "var(--bg3)",
                    color: isAttended ? "var(--green)" : "var(--muted)",
                    border: `1px solid ${isAttended ? "rgba(48,209,88,0.4)" : "var(--border)"}`,
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    minWidth: 32,
                  }}
                >
                  {isAttended ? "✓" : "—"}
                </button>

                {isAttended && (
                  <>
                    <button
                      className="btn btn-sm"
                      onClick={() => setQuickPay(p.id, p.defaultFee)}
                      style={{
                        padding: "4px 8px",
                        background: amt === p.defaultFee ? "rgba(10,132,255,0.2)" : "var(--bg3)",
                        color: amt === p.defaultFee ? "var(--blue)" : "var(--muted)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    >
                      {fmtShort(p.defaultFee)}
                    </button>
                    <input
                      type="number"
                      value={amt === 0 ? "" : amt}
                      placeholder="0"
                      onChange={(e) =>
                        setAmounts((a) => ({
                          ...a,
                          [p.id]: e.target.value === "" ? 0 : Number(e.target.value),
                        }))
                      }
                      style={{
                        width: 72,
                        textAlign: "right",
                        padding: "7px 8px",
                        fontSize: 13,
                        fontFamily: "var(--font-mono)",
                        background: amt > 0 ? "rgba(48,209,88,0.06)" : "var(--bg3)",
                        borderColor: amt > 0 ? "rgba(48,209,88,0.3)" : "var(--border)",
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={handleSave}
        style={{ fontSize: 15, padding: 14, borderRadius: 14 }}
      >
        {saved ? <>{Icon.check} Saved!</> : <>Save Payments</>}
      </button>
    </div>
  );
}
