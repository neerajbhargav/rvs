"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string; email: string; step: number; aboutMe: string | null;
  street: string | null; city: string | null; state: string | null;
  zip: string | null; birthdate: string | null; createdAt: string;
}

export default function DataPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try { const res = await fetch("/api/users"); setUsers(await res.json()); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="mono rounded bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">DATABASE</span>
            <h1 className="text-xl font-semibold text-[var(--ink)]">User Data</h1>
          </div>
          <p className="text-sm text-[var(--muted)]">{users.length} record{users.length !== 1 ? "s" : ""} in database · Refreshes on page load</p>
        </div>
        <button onClick={() => { setLoading(true); fetchUsers(); }}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" /></div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-sm text-[var(--muted)]">No users yet. Complete the <a href="/" className="text-[var(--accent)] underline">onboarding flow</a> to see data here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                {["Email", "Status", "About Me", "Street", "City", "State", "Zip", "Birthdate", "Created"].map(h => (
                  <th key={h} className="mono px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--bg)]/50">
                  <td className="px-4 py-3 font-medium text-[var(--ink)]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: u.step >= 4 ? "var(--accent-soft)" : "var(--warning-bg)", color: u.step >= 4 ? "var(--accent)" : "var(--warning)" }}>
                      {u.step >= 4 ? "Complete" : `Step ${u.step}/3`}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-[var(--muted)]">{u.aboutMe || "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.street || "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.city || "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.state || "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.zip || "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.birthdate || "—"}</td>
                  <td className="mono px-4 py-3 text-xs text-[var(--muted)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
