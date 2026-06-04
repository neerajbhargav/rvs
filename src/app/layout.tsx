import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportIQ — AI Customer Support Platform",
  description: "AI-native customer support built for modern businesses",
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm text-[var(--muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
    >
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-[var(--ink)]">
                Support<span className="text-[var(--accent)]">IQ</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <NavLink href="/" label="Onboarding" />
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/admin" label="Admin" />
              <NavLink href="/data" label="Data" />
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
