"use client";

import { useState } from "react";
import { useFinance } from "../context/FinanceState";
import { Toast, initials, fmtShort, fmt, dateStr } from "./common";
import { Icon } from "./IceWolvesIcons";

export function Players() {
  const { state, addPlayer, removePlayer } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selected =
    selectedId != null
      ? state.players.find((p) => p.id === selectedId) ?? null
      : null;

  const filtered = state.players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const playerPayments = (pid: number) =>
    state.payments.filter((p) => p.playerId === pid);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addPlayer(newName.trim());
    setNewName("");
    setShowAdd(false);
    setToast("Player added");
  };

  const handleRemove = async (id: number) => {
    await removePlayer(id);
    setSelectedId(null);
    setToast("Player removed");
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
        <div className="section-title">PLAYERS</div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowAdd(true)}
        >
          {Icon.plus} Add
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="🔍  Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          {
            l: "Total",
            v: state.players.length,
            c: "var(--blue)",
          },
          {
            l: "Debtors",
            v: state.players.filter((p) => p.balance < 0).length,
            c: "var(--red)",
          },
          {
            l: "Credits",
            v: state.players.filter((p) => p.balance > 0).length,
            c: "var(--green)",
          },
        ].map(({ l, v, c }) => (
          <div
            key={l}
            className="card"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 6px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                color: c,
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: "4px 16px" }}>
        {filtered.map((p, i) => (
          <div
            key={p.id}
            className="player-row fade-up"
            style={{
              animationDelay: `${i * 25}ms`,
              cursor: "pointer",
            }}
            onClick={() => setSelectedId(p.id)}
          >
            <div
              className="avatar"
              style={{
                background:
                  p.balance < 0
                    ? "linear-gradient(135deg,#7c1a14,#c0392b)"
                    : p.balance > 0
                    ? "linear-gradient(135deg,#145a32,#27ae60)"
                    : "linear-gradient(135deg,var(--blue2),var(--cyan))",
              }}
            >
              {initials(p.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                }}
              >
                {playerPayments(p.id).length} payment
                {playerPayments(p.id).length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                className={`tag ${
                  p.balance > 0
                    ? "tag-green"
                    : p.balance < 0
                    ? "tag-red"
                    : "tag-muted"
                }`}
                style={{ fontSize: 12 }}
              >
                {p.balance > 0 ? "+" : ""}
                {fmtShort(p.balance)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                marginBottom: 18,
              }}
            >
              ADD PLAYER
            </div>
            <div className="label">Full Name</div>
            <input
              autoFocus
              placeholder="e.g. Ivan Petrov"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-block"
                onClick={handleAdd}
              >
                Add Player
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                className="avatar"
                style={{ width: 52, height: 52, fontSize: 18 }}
              >
                {initials(selected.name)}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                  }}
                >
                  {selected.name.toUpperCase()}
                </div>
                <div
                  className={`tag ${
                    selected.balance > 0
                      ? "tag-green"
                      : selected.balance < 0
                      ? "tag-red"
                      : "tag-muted"
                  }`}
                >
                  {selected.balance > 0
                    ? "Credit"
                    : selected.balance < 0
                    ? "Debt"
                    : "Even"}
                  : {fmt(selected.balance)}
                </div>
              </div>
            </div>
            <div className="label">Payment History</div>
            <div
              style={{
                maxHeight: 220,
                overflowY: "auto",
                marginBottom: 16,
              }}
            >
              {playerPayments(selected.id).length === 0 ? (
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    padding: "12px 0",
                  }}
                >
                  No payments yet
                </div>
              ) : (
                playerPayments(selected.id)
                  .slice()
                  .sort(
                    (a, b) =>
                      a.id - b.id,
                  )
                  .reverse()
                  .map((pay) => {
                    const tr = state.trainings.find(
                      (t) => t.id === pay.trainingId,
                    );
                    return (
                      <div
                        key={pay.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid var(--border)",
                          fontSize: 14,
                        }}
                      >
                        <span style={{ color: "var(--muted)" }}>
                          {tr ? dateStr(tr.date) : "—"}
                        </span>
                        <span
                          style={{
                            color: "var(--green)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          +{fmt(pay.amount)}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
            <button
              className="btn btn-danger btn-block"
              onClick={() => handleRemove(selected.id)}
            >
              {Icon.trash} Remove Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

