"use client";

import { useState, type ReactElement } from "react";
import { useFinance, TrainingState } from "../context/FinanceState";
import { Dashboard } from "../components/Dashboard";
import { Icon } from "../components/IceWolvesIcons";
import { Players } from "../components/Players";
import { Trainings } from "../components/Trainings";
import { PaymentsView } from "../components/PaymentsView";
import { Statistics } from "../components/Statistics";

type TabId = "dashboard" | "players" | "trainings" | "stats";

export default function Home() {
  const { state } = useFinance();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [paymentTraining, setPaymentTraining] = useState<TrainingState | null>(
    null,
  );

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
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          Loading Ice Wolves data...
        </div>
      );
    }

    if (state.error) {
      return (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--red)",
          }}
        >
          {state.error}
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard state={state} />;
      case "players":
        return <Players />;
      case "trainings":
        return (
          <Trainings
            onOpenPayments={(t) => setPaymentTraining(t)}
          />
        );
      case "stats":
        return <Statistics />;
      default:
        return <Dashboard state={state} />;
    }
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 72,
        }}
      >
        {renderContent()}
      </div>

      {!paymentTraining && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 480,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--border)",
            boxShadow: "0 -1px 0 var(--border)",
            display: "flex",
            zIndex: 50,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${
                activeTab === tab.id ? "active" : ""
              }`}
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
