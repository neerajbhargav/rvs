import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "./components/NavBar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SupportIQ — AI Customer Support Platform",
  description: "AI-native customer support built for modern businesses. Onboard, configure, and deploy intelligent support agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen" style={{ fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif" }}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
