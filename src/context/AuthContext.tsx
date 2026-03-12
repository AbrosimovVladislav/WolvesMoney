"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Role = "admin" | "player" | null;

type AuthContextValue = {
  role: Role;
  isAdmin: boolean;
  login: (role: "admin" | "player", password?: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ADMIN_PASSWORD = "HCVUKOVISILA";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wolves_role");
    if (saved === "admin" || saved === "player") {
      setRole(saved);
    }
  }, []);

  const login = (r: "admin" | "player", password?: string): boolean => {
    if (r === "admin" && password !== ADMIN_PASSWORD) return false;
    setRole(r);
    localStorage.setItem("wolves_role", r);
    return true;
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("wolves_role");
  };

  return (
    <AuthContext.Provider value={{ role, isAdmin: role === "admin", login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
