import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "./providers";
import { NavigationProvider } from "../lib/navigation-context";
import { ConditionalNavigation } from "../components/layout/ConditionalNavigation";
import { Provider } from "react-redux";
import { store } from "../store";
import StoreProvider from "@/core/providers/store_provider";
import { Navigation } from "@/components/layout/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Construction App - Home Builder Management",
  description: "Complete construction management platform for home builders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
