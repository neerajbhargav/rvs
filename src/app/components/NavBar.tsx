"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-md transition-all duration-200 hover:bg-[var(--surface-hover)] active:scale-95"
      style={{
        border: "1px solid var(--border)",
        color: "var(--muted)",
      }}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

const navItems = [
  { href: "/", label: "Onboarding" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/data", label: "Data" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 bg-[var(--bg)]"
      style={{ borderBottom: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--ink)]">
              <span className="text-[var(--bg)] font-bold text-lg display-font leading-none" style={{ marginLeft: 2, marginTop: -2 }}>IQ*</span>
            </div>
            <span className="font-bold text-lg tracking-tight display-font" style={{ color: "var(--ink)" }}>
              NewCo
            </span>
          </div>
        </Link>

        {/* Links + Toggle */}
        <div className="flex items-center gap-2">
          {pathname !== "/" && navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? "var(--ink)" : "var(--muted)",
                  background: isActive ? "var(--border-soft)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--ink)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--muted)";
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-2 pl-4" style={{ borderLeft: "1px solid var(--border)" }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
