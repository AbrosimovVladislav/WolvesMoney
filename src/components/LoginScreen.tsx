"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
  const { login } = useAuth();
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleAdmin = () => {
    const ok = login("admin", password);
    if (!ok) {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg, #001845 0%, #002868 60%, #0D3A7A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          overflow: "hidden",
          border: "3px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          marginBottom: 24,
        }}
      >
        <img
          src="/raw-logo.png"
          alt="HC Vukovi"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.01em",
          marginBottom: 4,
        }}
      >
        HC VUKOVI
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 48,
        }}
      >
        Finance Tracker
      </div>

      {!showAdminForm ? (
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => login("player")}
            style={{
              padding: "16px",
              background: "rgba(255,255,255,0.1)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: 14,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "background 0.15s",
            }}
          >
            <span style={{ fontSize: 24 }}>🏒</span>
            <div style={{ textAlign: "left" }}>
              <div>Продолжить как игрок</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                Только просмотр
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowAdminForm(true)}
            style={{
              padding: "16px",
              background: "rgba(255,255,255,0.92)",
              border: "none",
              borderRadius: 14,
              color: "#002868",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "opacity 0.15s",
            }}
          >
            <span style={{ fontSize: 24 }}>🛡️</span>
            <div style={{ textAlign: "left" }}>
              <div>Войти как администратор</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "#5A7A9A", marginTop: 2 }}>
                Полный доступ
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: 16,
              padding: "24px 20px",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Вход для администратора
            </div>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              autoFocus
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdmin()}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: `1.5px solid ${error ? "#ff453a" : "rgba(255,255,255,0.25)"}`,
                color: "#fff",
                marginBottom: error ? 6 : 12,
              }}
            />
            {error && (
              <div style={{ color: "#ff453a", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
                Неверный пароль
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setShowAdminForm(false); setPassword(""); setError(false); }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Назад
              </button>
              <button
                onClick={handleAdmin}
                style={{
                  flex: 2,
                  padding: "12px",
                  background: "rgba(255,255,255,0.92)",
                  border: "none",
                  borderRadius: 10,
                  color: "#002868",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
