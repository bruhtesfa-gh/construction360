"use client";
import { api } from "../lib/trpc";
import { ThemeProvider } from "../lib/theme-context";
import { AGGridProvider } from "../lib/ag-grid-provider";

export { api };

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AGGridProvider>{children}</AGGridProvider>
    </ThemeProvider>
  );
}
