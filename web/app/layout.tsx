import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Lenis from "./lenis";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Veritas — Verifiable Smart-Money Intel for Mantle",
  description:
    "The Nansen for Mantle's RWA/LST flows. Proprietary on-chain intelligence, every signal verifiable on-chain, delivered via Telegram.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="antialiased">
        <Lenis />
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
