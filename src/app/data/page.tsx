"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(u => 
      u.email.toLowerCase().includes(lower) || 
      (u.aboutMe && u.aboutMe.toLowerCase().includes(lower)) ||
      (u.city && u.city.toLowerCase().includes(lower))
    );
  }, [users, search]);

  const toggleAll = () => {
    if (selectedIds.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const exportCsv = () => {
    const toExport = filteredUsers.filter(u => selectedIds.size === 0 || selectedIds.has(u.id));
    if (toExport.length === 0) return;
    
    const headers = ["ID", "Email", "Step", "About", "City", "State", "Created At"];
    const rows = toExport.map(u => [
      u.id, u.email, u.step, `"${(u.aboutMe || "").replace(/"/g, '""')}"`, u.city || "", u.state || "", u.createdAt || ""
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `supportiq_users_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 min-h-[calc(100vh-80px)] flex flex-col">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold display-font mb-1" style={{ color: "var(--ink)" }}>
            Customer Directory
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Enterprise Customer Data Grid
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2 text-xs py-2 h-auto" disabled={filteredUsers.length === 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export {selectedIds.size > 0 ? `(${selectedIds.size})` : "All"} to CSV
          </button>
          <button onClick={loadUsers} disabled={loading} className="btn-primary flex items-center gap-2 text-xs py-2 h-auto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? "animate-spin" : ""}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Sync Database
          </button>
        </div>
      </div>

      {/* Toolbar Area */}
      <div className="flex items-center justify-between mb-4 shrink-0 bg-[var(--surface-hover)] p-3 rounded-xl border border-[var(--border)]">
        <div className="flex items-center gap-3 w-1/3">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search by email, city, or bio..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-1.5 text-sm outline-none focus:border-[var(--petronas-teal)] transition-colors text-[var(--ink)]"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-bold display-font bg-[var(--bg)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--muted)] shadow-sm">
            Total Records: {filteredUsers.length}
          </span>
          <span className="text-xs font-bold display-font bg-[var(--petronas-teal)] text-white px-3 py-1.5 rounded-lg shadow-sm">
            Status: Live
          </span>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--petronas-teal)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col p-16 text-center">
            <div className="h-12 w-12 rounded-xl mb-4 flex items-center justify-center bg-[var(--surface-hover)] border border-[var(--border)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
            </div>
            <h3 className="font-bold text-lg display-font mb-1 text-[var(--ink)] tracking-tight">No records found</h3>
            <p className="text-sm mb-6 text-[var(--muted)]">Either the database is empty or your search yielded no results.</p>
            {users.length === 0 && (
              <Link href="/" className="btn-primary">Go to Onboarding</Link>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)] shadow-sm">
                  <th className="px-5 py-3 text-left w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-[var(--border)] text-[var(--petronas-teal)] focus:ring-[var(--petronas-teal)] cursor-pointer"
                      checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  {["User Email", "Status", "About Summary", "Location", "Created"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-wider uppercase display-font text-[var(--muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user, i) => {
                    const isComplete = user.step >= 4;
                    const isSelected = selectedIds.has(user.id);
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        key={user.id}
                        className={`group transition-colors duration-200 border-b border-[var(--border-soft)] hover:bg-[var(--surface-hover)] ${isSelected ? 'bg-[var(--surface-hover)]' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-[var(--border)] text-[var(--petronas-teal)] focus:ring-[var(--petronas-teal)] cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                            checked={isSelected}
                            onChange={() => toggleOne(user.id)}
                          />
                        </td>
                        <td className="px-5 py-4 font-semibold text-[var(--ink)] flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center text-[10px] display-font">{user.email.charAt(0).toUpperCase()}</div>
                          {user.email}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold display-font uppercase tracking-wider ${isComplete ? 'bg-[var(--accent-soft)] text-[var(--petronas-teal)] border border-[var(--petronas-teal)]' : 'bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]'}`}>
                            {isComplete ? "Verified" : `Step ${user.step}/3`}
                          </span>
                        </td>
                        <td className="px-5 py-4 truncate max-w-[200px] text-[var(--ink-soft)] text-xs" title={user.aboutMe || "—"}>
                          {user.aboutMe || <span className="text-[var(--subtle)] italic">No bio provided</span>}
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--ink-soft)] font-medium">
                          {user.city && user.state ? `${user.city}, ${user.state}` : <span className="text-[var(--subtle)]">Unknown</span>}
                        </td>
                        <td className="px-5 py-4 mono text-[10px] text-[var(--muted)]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
