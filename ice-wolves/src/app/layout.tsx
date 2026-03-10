import type { Metadata } from "next";
import "./globals.css";
import { FinanceStateProvider } from "../context/FinanceState";

export const metadata: Metadata = {
  title: "Ice Wolves Finance",
  description: "Team finance tracker for ice hockey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FinanceStateProvider>
          <div
            style={{
              minHeight: "100dvh",
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            {children}
          </div>
        </FinanceStateProvider>
      </body>
    </html>
  );
}
