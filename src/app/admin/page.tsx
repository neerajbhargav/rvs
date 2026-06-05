"use client";

import { useEffect, useState } from "react";
import { Reorder, AnimatePresence } from "framer-motion";

interface ComponentConfig {
  id: string;
  type: string;
  label: string;
}
interface PageConfig {
  page1: ComponentConfig[];
  page2: ComponentConfig[];
  page3: ComponentConfig[];
}

const COMP_META: Record<string, { icon: string; desc: string }> = {
  about_me: { icon: "📝", desc: "Text area for user bio" },
  address: { icon: "📍", desc: "Street, city, state, ZIP fields" },
  birthdate: { icon: "📅", desc: "Standard date picker" },
};

export default function AdminPage() {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setError("Failed to load configuration"))
      .finally(() => setLoading(false));
  }, []);

  const moveComponent = (compId: string, from: "page1" | "page2" | "page3", to: "page1" | "page2" | "page3") => {
    if (!config) return;
    setError("");
    setSaved(false);

    const sourceComps = config[from];
    const comp = sourceComps.find((c) => c.id === compId);
    if (!comp) return;

    setConfig({
      ...config,
      [from]: sourceComps.filter((c) => c.id !== compId),
      [to]: [...config[to], comp],
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin">
          <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const renderPage = (pageKey: "page1" | "page2" | "page3", pageNum: number) => {
    const comps = config?.[pageKey] || [];
    const accentColor = pageNum === 1 ? "var(--ink)" : pageNum === 2 ? "var(--petronas-teal)" : "var(--ferrari-red)";

    return (
      <div className="anim-in glass p-6 transition-all duration-300" style={{ animationDelay: `${pageNum * 0.1}s`, borderLeft: `3px solid ${accentColor}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold display-font" style={{ color: "var(--ink)" }}>
            Page {pageNum} <span className="text-[10px] font-mono text-[var(--muted)] ml-2 uppercase tracking-widest">(Drag to Reorder)</span>
          </h2>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--surface-hover)] text-[var(--muted)]">
            {comps.length} field{comps.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Reorder.Group 
          axis="y" 
          values={comps} 
          onReorder={(newComps) => setConfig({ ...config!, [pageKey]: newComps })}
          className="space-y-3"
        >
          <AnimatePresence>
            {comps.map((comp) => {
              const meta = COMP_META[comp.type] || { icon: "📦", desc: "Field component" };
              return (
                <Reorder.Item
                  key={comp.id}
                  value={comp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  whileDrag={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 50 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] cursor-grab active:cursor-grabbing hover:border-[var(--muted)] transition-colors duration-200"
                >
                  <div className="flex items-center gap-4 pointer-events-none">
                    <div className="text-xl w-8 h-8 rounded bg-[var(--surface-hover)] flex items-center justify-center">{meta.icon}</div>
                    <div>
                      <h3 className="font-semibold text-sm display-font text-[var(--ink)]">{comp.label}</h3>
                      <p className="text-xs mt-0.5 text-[var(--muted)]">{meta.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {pageNum !== 1 && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveComponent(comp.id, pageKey, "page1"); }} className="text-[10px] font-semibold px-2 py-1 rounded transition-all duration-200 active:scale-95 text-[var(--ink)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--ink)] cursor-pointer">To P1</button>}
                    {pageNum !== 2 && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveComponent(comp.id, pageKey, "page2"); }} className="text-[10px] font-semibold px-2 py-1 rounded transition-all duration-200 active:scale-95 text-[var(--ink)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--ink)] cursor-pointer">To P2</button>}
                    {pageNum !== 3 && <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveComponent(comp.id, pageKey, "page3"); }} className="text-[10px] font-semibold px-2 py-1 rounded transition-all duration-200 active:scale-95 text-[var(--ink)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--ink)] cursor-pointer">To P3</button>}
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
          {comps.length === 0 && (
            <div className="p-6 text-center rounded-xl border border-dashed border-[var(--border)]">
              <p className="text-sm text-[var(--subtle)]">No components assigned</p>
            </div>
          )}
        </Reorder.Group>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 min-h-screen">
      <div className="mb-10 anim-in">
        <h1 className="text-3xl font-bold display-font mb-2 text-[var(--ink)]">Workflow Editor</h1>
        <p className="text-sm text-[var(--muted)]">Drag and drop components to reorder them, or move them between steps.</p>
      </div>

      {error && (
        <div className="mb-6 rounded px-4 py-3 text-sm font-medium anim-fade flex items-center gap-2 border border-[var(--error)] bg-[var(--error-bg)] text-[var(--error)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <div className="space-y-6 mb-8">
        {renderPage("page1", 1)}
        {renderPage("page2", 2)}
        {renderPage("page3", 3)}
      </div>

      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-8">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          ) : null}
          {saving ? "Saving..." : "Deploy Configuration"}
        </button>
        {saved && (
          <span className="text-sm font-semibold anim-fade flex items-center gap-1 text-[var(--petronas-teal)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Live synced to PostgreSQL
          </span>
        )}
      </div>
    </div>
  );
}
