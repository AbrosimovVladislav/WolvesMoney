"use client";

import { useState } from "react";
import { useFinance } from "../context/FinanceState";
import { Toast, initials, fmtShort, fmt, dateStr } from "./common";
import { Icon } from "./IceWolvesIcons";

export function Players() {
  const { state, addPlayer, removePlayer, updatePlayerFee, addDeposit } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState(1500);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositNote, setDepositNote] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selected =
    selectedId != null
      ? state.players.find((p) => p.id === selectedId) ?? null
      : null;

  const filtered = state.players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Only count attended payments
  const attendedCount = (pid: number) =>
    state.payments.filter((p) => p.playerId === pid && p.attended).length;

  const playerPayments = (pid: number) =>
    state.payments.filter((p) => p.playerId === pid);

  const playerDeposits = (pid: number) =>
    state.deposits.filter((d) => d.playerId === pid);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addPlayer(newName.trim(), newFee);
    setNewName("");
    setNewFee(1500);
    setShowAdd(false);
    setToast("Player added");
  };

  const handleRemove = async (id: number) => {
    await removePlayer(id);
    setSelectedId(null);
    setToast("Player removed");
  };

  const handleSaveFee = async () => {
    if (!selected) return;
    await updatePlayerFee(selected.id, feeInput);
    setEditingFee(false);
    setToast("Fee updated");
  };

  const handleDeposit = async () => {
    if (!selected || !depositAmount) return;
    await addDeposit(selected.id, depositAmount, depositNote);
    setDepositAmount(0);
    setDepositNote("");
    setShowDeposit(false);
    setToast(`Deposit +${fmt(depositAmount)} recorded`);
  };

  const openDetail = (id: number) => {
    const p = state.players.find((pl) => pl.id === id);
    setSelectedId(id);
    setFeeInput(p?.defaultFee ?? 1500);
    setEditingFee(false);
    setShowDeposit(false);
    setDepositAmount(0);
    setDepositNote("");
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
          <div className="section-title">PLAYERS</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
            {state.players.length}
          </div>
        </div>
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
          { l: "Total", v: state.players.length, c: "var(--blue)" },
          { l: "Debtors", v: state.players.filter((p) => p.balance < 0).length, c: "var(--red)" },
          { l: "Credits", v: state.players.filter((p) => p.balance > 0).length, c: "var(--green)" },
        ].map(({ l, v, c }) => (
          <div key={l} className="card" style={{ flex: 1, textAlign: "center", padding: "10px 6px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
            style={{ animationDelay: `${i * 25}ms`, cursor: "pointer" }}
            onClick={() => openDetail(p.id)}
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
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {attendedCount(p.id)} training{attendedCount(p.id) !== 1 ? "s" : ""}
                {p.defaultFee !== 1500 && (
                  <span style={{ color: "var(--blue)", marginLeft: 6 }}>
                    · {fmtShort(p.defaultFee)} RSD/tr
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                className={`tag ${p.balance > 0 ? "tag-green" : p.balance < 0 ? "tag-red" : "tag-muted"}`}
                style={{ fontSize: 12 }}
              >
                {p.balance > 0 ? "+" : ""}
                {fmtShort(p.balance)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Player Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Player</div>
            <div className="label">Full Name</div>
            <input
              autoFocus
              placeholder="e.g. Ivan Petrov"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{ marginBottom: 14 }}
            />
            <div className="label">Fee per Training (RSD)</div>
            <input
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(Number(e.target.value))}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary btn-block" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-block" onClick={handleAdd}>
                Add Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelectedId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
                {initials(selected.name)}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
                  {selected.name.toUpperCase()}
                </div>
                <div className={`tag ${selected.balance > 0 ? "tag-green" : selected.balance < 0 ? "tag-red" : "tag-muted"}`}>
                  {selected.balance > 0 ? "Credit" : selected.balance < 0 ? "Debt" : "Even"}
                  : {fmt(selected.balance)}
                </div>
              </div>
            </div>

            {/* Fee */}
            <div className="label">Fee per Training</div>
            {editingFee ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="number"
                  value={feeInput}
                  onChange={(e) => setFeeInput(Number(e.target.value))}
                  autoFocus
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSaveFee}>Save</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingFee(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 16 }}>
                  {fmt(selected.defaultFee)} RSD
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setFeeInput(selected.defaultFee); setEditingFee(true); }}
                >
                  Edit
                </button>
              </div>
            )}

            {/* Deposit section */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div className="label" style={{ marginBottom: 0 }}>Deposit</div>
                <button
                  className="btn btn-sm"
                  onClick={() => setShowDeposit((v) => !v)}
                  style={{
                    padding: "4px 10px",
                    background: showDeposit ? "rgba(22,163,74,0.12)" : "var(--bg3)",
                    color: showDeposit ? "var(--green)" : "var(--muted)",
                    border: `1px solid ${showDeposit ? "rgba(22,163,74,0.3)" : "var(--border)"}`,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  + Add
                </button>
              </div>

              {showDeposit && (
                <div
                  style={{
                    background: "rgba(22,163,74,0.05)",
                    border: "1px solid rgba(22,163,74,0.2)",
                    borderRadius: 10,
                    padding: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {[1000, 3000, 5000].map((preset) => (
                      <button
                        key={preset}
                        className="btn btn-sm"
                        onClick={() => setDepositAmount(preset)}
                        style={{
                          flex: 1,
                          padding: "5px 4px",
                          background: depositAmount === preset ? "rgba(22,163,74,0.15)" : "var(--bg3)",
                          color: depositAmount === preset ? "var(--green)" : "var(--muted)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      >
                        {fmtShort(preset)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Amount (RSD)"
                    value={depositAmount === 0 ? "" : depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                    style={{ marginBottom: 8 }}
                  />
                  <input
                    placeholder="Note (optional)"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <button
                    className="btn btn-primary btn-block btn-sm"
                    onClick={handleDeposit}
                    disabled={!depositAmount}
                    style={{ opacity: !depositAmount ? 0.5 : 1 }}
                  >
                    {Icon.check} Record Deposit
                  </button>
                </div>
              )}

              {/* Deposit history */}
              {playerDeposits(selected.id).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {playerDeposits(selected.id).map((d) => (
                    <div
                      key={d.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <span style={{ color: "var(--muted)" }}>
                          {d.createdAt ? dateStr(d.createdAt) : "Deposit"}
                        </span>
                        {d.note && (
                          <span style={{ color: "var(--muted)", marginLeft: 6, fontSize: 11 }}>
                            · {d.note}
                          </span>
                        )}
                      </div>
                      <span style={{ color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        +{fmt(d.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attendance history */}
            <div className="label">Attendance History</div>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
              {playerPayments(selected.id).length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 14, padding: "12px 0" }}>
                  No history yet
                </div>
              ) : (
                playerPayments(selected.id)
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((pay) => {
                    const tr = state.trainings.find((t) => t.id === pay.trainingId);
                    return (
                      <div
                        key={pay.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid var(--border)",
                          fontSize: 14,
                        }}
                      >
                        <span style={{ color: "var(--muted)" }}>
                          {tr ? dateStr(tr.date) : "—"}
                        </span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {pay.attended ? (
                            <span style={{ fontSize: 11, color: "var(--green)", background: "rgba(48,209,88,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                              attended
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--muted)", background: "var(--bg3)", padding: "2px 6px", borderRadius: 4 }}>
                              absent
                            </span>
                          )}
                          {pay.attended && (
                            <span style={{ color: pay.amount > 0 ? "var(--green)" : "var(--muted)", fontFamily: "var(--font-mono)" }}>
                              {pay.amount > 0 ? `+${fmt(pay.amount)}` : "—"}
                            </span>
                          )}
                        </div>
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
