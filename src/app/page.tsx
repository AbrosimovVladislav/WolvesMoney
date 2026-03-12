"use client";

import { useState, useRef, useEffect, type ReactElement } from "react";
import { useFinance, TrainingState } from "../context/FinanceState";
import { useAuth } from "../context/AuthContext";
import { Dashboard } from "../components/Dashboard";
import { Icon } from "../components/IceWolvesIcons";
import { Players } from "../components/Players";
import { Trainings } from "../components/Trainings";
import { PaymentsView } from "../components/PaymentsView";
import { Statistics } from "../components/Statistics";

type TabId = "dashboard" | "players" | "trainings" | "stats";

function UserMenu({ isAdmin, logout }: { isAdmin: boolean; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: isAdmin
            ? "linear-gradient(135deg, #002868 0%, #1A4FA0 100%)"
            : "linear-gradient(135deg, #5B9BD5 0%, #002868 100%)",
          border: "2px solid rgba(255,255,255,0.8)",
          boxShadow: "0 2px 8px rgba(0,40,104,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 16,
          transition: "transform 0.15s",
          transform: open ? "scale(0.93)" : "scale(1)",
        }}
      >
        {isAdmin ? "🛡️" : "🏒"}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,40,104,0.15)",
            minWidth: 180,
            zIndex: 200,
            overflow: "hidden",
            animation: "fadeIn 0.12s ease",
          }}
        >
          {/* User info */}
          <div style={{
            padding: "14px 16px 10px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--white)" }}>
              {isAdmin ? "Администратор" : "Игрок"}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {isAdmin ? "Полный доступ" : "Только просмотр"}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => { setOpen(false); logout(); }}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--red)",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16 }}>↩️</span>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { state } = useFinance();
  const { isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [paymentTraining, setPaymentTraining] = useState<TrainingState | null>(null);

  const tabs: { id: TabId; label: string; icon: ReactElement }[] = [
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
          onBack={() => setPaymentTraining(null)}
        />
      );
    }

    if (state.loading) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>
          Loading HC Vukovi data...
        </div>
      );
    }

    if (state.error) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--red)" }}>
          {state.error}
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard": return <Dashboard state={state} />;
      case "players": return <Players />;
      case "trainings": return <Trainings onOpenPayments={(t) => setPaymentTraining(t)} />;
      case "stats": return <Statistics />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <>
      {/* Top header */}
      {!paymentTraining && (
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              overflow: "hidden",
              border: "1.5px solid var(--border)",
              flexShrink: 0,
            }}>
              <img src="/raw-logo.png" alt="HC Vukovi" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.04em" }}>
              HC VUKOVI
            </div>
          </div>

          <UserMenu isAdmin={isAdmin} logout={logout} />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
        {renderContent()}
      </div>

      {/* Bottom nav */}
      {!paymentTraining && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          zIndex: 50,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
