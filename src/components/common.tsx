"use client";

import { useEffect } from "react";
import { Icon } from "./IceWolvesIcons";

export const fmt = (n: number) => {
  const abs = Math.abs(n);
  return (n < 0 ? "−" : "") + abs.toLocaleString("ru-RU") + " RSD";
};

export const fmtShort = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1000) {
    const base = (abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1);
    return (n < 0 ? "−" : "") + base + "k";
  }
  return (n < 0 ? "−" : "") + abs;
};

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const dateStr = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const today = () => new Date().toISOString().slice(0, 10);

export function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#fff",
        border: "1px solid var(--border)",
        borderLeft: "4px solid var(--green)",
        borderRadius: 10,
        padding: "12px 18px",
        zIndex: 200,
        color: "var(--white)",
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        animation: "fadeUp 0.25s ease",
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--green)" }}>{Icon.check}</span>
      {msg}
    </div>
  );
}

