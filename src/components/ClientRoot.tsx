"use client";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { FinanceStateProvider } from "../context/FinanceState";
import { LoginScreen } from "./LoginScreen";

function AppContent({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (role === null) return <LoginScreen />;
  return <FinanceStateProvider>{children}</FinanceStateProvider>;
}

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
