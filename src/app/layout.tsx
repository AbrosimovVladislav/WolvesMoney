import type { Metadata } from "next";
import "./globals.css";
import { ClientRoot } from "../components/ClientRoot";

export const metadata: Metadata = {
  title: "HC Vukovi Finance",
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
        <ClientRoot>
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
        </ClientRoot>
      </body>
    </html>
  );
}
