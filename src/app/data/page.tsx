"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface UserRecord {
  id: string;
  email: string;
  step: number;
  aboutMe?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  birthdate?: string;
  createdAt?: string;
}

export default function DataPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(() => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 anim-in">
        <div>
          <h1 className="text-3xl font-bold display-font mb-1" style={{ color: "var(--ink)" }}>
            User Data
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            {users.length} {users.length === 1 ? "record" : "records"} found in database
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin">
            <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      ) : users.length === 0 ? (
        <div className="glass p-16 text-center anim-in flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg display-font mb-1" style={{ color: "var(--ink)" }}>
            No records found
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Complete the onboarding flow to see data here.
          </p>
          <Link href="/" className="btn-primary">
            Go to Onboarding
          </Link>
        </div>
      ) : (
        <div className="glass overflow-hidden anim-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
                  {["Email", "Status", "About Me", "Street", "City", "State", "Zip", "Birthdate", "Created"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold tracking-wider uppercase display-font"
                        style={{ color: "var(--muted)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const isComplete = user.step >= 4;
                  return (
                    <tr
                      key={user.id}
                      className="group transition-colors duration-200"
                      style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border-soft)" : "none" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--ink)" }}>
                        {user.email}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold display-font"
                          style={{
                            background: isComplete ? "var(--accent-soft)" : "var(--warning-bg)",
                            color: isComplete ? "var(--accent)" : "var(--warning)",
                            border: `1px solid ${isComplete ? 'var(--accent)' : 'var(--warning)'}`
                          }}
                        >
                          {isComplete ? "COMPLETE" : `STEP ${user.step}/3`}
                        </span>
                      </td>
                      <td className="px-5 py-4 truncate" style={{ maxWidth: 180, color: "var(--ink-soft)" }} title={user.aboutMe || "—"}>
                        {user.aboutMe || "—"}
                      </td>
                      <td className="px-5 py-4" style={{ color: "var(--ink-soft)" }}>{user.street || "—"}</td>
                      <td className="px-5 py-4" style={{ color: "var(--ink-soft)" }}>{user.city || "—"}</td>
                      <td className="px-5 py-4" style={{ color: "var(--ink-soft)" }}>{user.state || "—"}</td>
                      <td className="px-5 py-4 mono text-xs" style={{ color: "var(--ink-soft)" }}>{user.zip || "—"}</td>
                      <td className="px-5 py-4 mono text-xs" style={{ color: "var(--ink-soft)" }}>{user.birthdate || "—"}</td>
                      <td className="px-5 py-4 mono text-xs" style={{ color: "var(--subtle)" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
