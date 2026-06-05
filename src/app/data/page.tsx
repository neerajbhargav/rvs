"use client";

import { useEffect, useState } from "react";

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

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 anim-in">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md"
              style={{
                background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                color: "white",
              }}
            >
              DATABASE
            </span>
            <span className="text-xs mono" style={{ color: "var(--subtle)" }}>
              {users.length} record{users.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
            User Data
          </h1>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="animate-spin">
            <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      ) : users.length === 0 ? (
        <div className="glass p-16 text-center anim-in">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--ink)" }}>
            No users yet
          </h3>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Complete the <a href="/" className="underline" style={{ color: "var(--accent)" }}>onboarding flow</a> to see data here.
          </p>
        </div>
      ) : (
        <div className="glass overflow-hidden anim-in">
          <div className="overflow-x-auto scroll">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Email", "Status", "About Me", "Street", "City", "State", "Zip", "Birthdate", "Created"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold tracking-wide"
                        style={{ color: "var(--muted)", background: "var(--surface-hover)" }}
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
                      className="transition-colors"
                      style={{
                        borderBottom: i < users.length - 1 ? "1px solid var(--border-soft)" : "none",
                        animationDelay: `${i * 0.03}s`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--surface-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td className="px-5 py-3.5 font-medium" style={{ color: "var(--ink)" }}>
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            background: isComplete ? "var(--accent-soft)" : "var(--warning-bg)",
                            color: isComplete ? "var(--accent)" : "var(--warning)",
                          }}
                        >
                          {isComplete ? "✓ Complete" : `Step ${user.step}/3`}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 truncate"
                        style={{ maxWidth: 160, color: "var(--ink-soft)" }}
                        title={user.aboutMe || "—"}
                      >
                        {user.aboutMe || "—"}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--ink-soft)" }}>
                        {user.street || "—"}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--ink-soft)" }}>
                        {user.city || "—"}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "var(--ink-soft)" }}>
                        {user.state || "—"}
                      </td>
                      <td className="px-5 py-3.5 mono text-xs" style={{ color: "var(--ink-soft)" }}>
                        {user.zip || "—"}
                      </td>
                      <td className="px-5 py-3.5 mono text-xs" style={{ color: "var(--ink-soft)" }}>
                        {user.birthdate || "—"}
                      </td>
                      <td className="px-5 py-3.5 mono text-xs" style={{ color: "var(--subtle)" }}>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
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
