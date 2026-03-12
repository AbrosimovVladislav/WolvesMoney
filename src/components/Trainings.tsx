"use client";

import { useState } from "react";
import { useFinance, TrainingState } from "../context/FinanceState";
import { Toast, today, fmtShort, fmt } from "./common";
import { Icon } from "./IceWolvesIcons";

type Props = {
  onOpenPayments: (training: TrainingState) => void;
};

export function Trainings({ onOpenPayments }: Props) {
  const { state, createTraining, removeTraining } = useFinance();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    iceCost: 18000,
    notes: "",
  });
  const [toast, setToast] = useState<string | null>(null);

  const sorted = [...state.trainings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handleCreate = async () => {
    if (!form.date) return;
    await createTraining({
      date: form.date,
      iceCost: Number(form.iceCost) || 18000,
      notes: form.notes,
    });
    setForm({ date: today(), iceCost: 18000, notes: "" });
    setShowCreate(false);
    setToast("Training created");
  };

  const handleRemove = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeTraining(id);
    setToast("Training removed");
  };

  const getTrainingStats = (t: TrainingState) => {
    const pays = state.payments.filter((p) => p.trainingId === t.id);
    const collected = pays.reduce((s, p) => s + p.amount, 0);
    const totalCost = t.iceCost + (t.goalieCost ?? 0);
    const result = collected - totalCost;
    const attended = pays.filter((p) => p.attended).length;
    return { collected, totalCost, result, attended };
  };

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0 14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div className="section-title">TRAININGS</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
            {state.trainings.length}
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          {Icon.plus} New
        </button>
      </div>

      {sorted.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏒</div>
          <div>No trainings yet. Create your first one!</div>
        </div>
      )}

      {sorted.map((t, i) => {
        const { collected, totalCost, result, attended } = getTrainingStats(t);
        return (
          <div
            key={t.id}
            className="training-card card-hover fade-up"
            style={{
              animationDelay: `${i * 40}ms`,
              cursor: "pointer",
              borderLeft: `3px solid ${result >= 0 ? "var(--green)" : "var(--red)"}`,
            }}
            onClick={() => onOpenPayments(t)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    letterSpacing: "0.04em",
                  }}
                >
                  {new Date(t.date)
                    .toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </div>
                {t.notes && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {t.notes}
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
                <div
                  className={`tag ${
                    result >= 0 ? "tag-green" : "tag-red"
                  }`}
                >
                  {result >= 0 ? "+" : ""}
                  {fmtShort(result)}
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ padding: "5px 8px" }}
                  onClick={(e) => handleRemove(t.id, e)}
                >
                  {Icon.trash}
                </button>
              </div>
            </div>
            <div className="divider" style={{ margin: "12px 0" }} />
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
                  v: fmtShort(collected) + " RSD",
                  c: "var(--green)",
                },
                {
                  l: t.goalieCost ? "Total Cost" : "Ice Cost",
                  v: fmtShort(totalCost) + " RSD",
                  c: "var(--red)",
                },
                {
                  l: "Attended",
                  v: `${attended}/${state.players.length}`,
                  c: "var(--blue)",
                },
              ].map(({ l, v, c }) => (
                <div
                  key={l}
                  style={{
                    background: "var(--bg3)",
                    borderRadius: 8,
                    padding: "8px 6px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 3,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                      color: c,
                      fontWeight: 500,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                fontSize: 12,
                color: "var(--blue)",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              TAP TO ENTER PAYMENTS →
            </div>
          </div>
        );
      })}

      {showCreate && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />
            <div className="modal-title">New Training</div>
            <div className="label">Date</div>
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((f) => ({ ...f, date: e.target.value }))
              }
              style={{ marginBottom: 14 }}
            />
            <div className="label">Ice Cost (RSD)</div>
            <input
              type="number"
              value={form.iceCost}
              onChange={(e) =>
                setForm((f) => ({ ...f, iceCost: Number(e.target.value) }))
              }
              style={{ marginBottom: 14 }}
            />
            <div className="label">Notes (optional)</div>
            <input
              placeholder="e.g. Pre-game practice"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              style={{ marginBottom: 18 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-block"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

