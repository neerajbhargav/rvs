"use client";

import { useEffect, useState } from "react";

interface ComponentConfig {
  id: string;
  type: string;
  label: string;
}
interface PageConfig {
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

  const moveComponent = (compId: string, from: "page2" | "page3") => {
    if (!config) return;
    setError("");
    setSaved(false);

    const to = from === "page2" ? "page3" : "page2";
    const sourceComps = config[from];
    const comp = sourceComps.find((c) => c.id === compId);
    if (!comp) return;

    if (sourceComps.length <= 1) {
      setError(`Cannot move — ${from === "page2" ? "Page 2" : "Page 3"} must have at least one component.`);
      return;
    }

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

  const renderPage = (pageKey: "page2" | "page3", pageNum: number) => {
    const comps = config?.[pageKey] || [];
    const otherPage = pageKey === "page2" ? 3 : 2;
    // Use F1 accents
    const accentColor = pageNum === 2 ? "var(--petronas-teal)" : "var(--ferrari-red)";

    return (
      <div className="anim-in glass p-6" style={{ animationDelay: `${pageNum * 0.1}s`, borderLeft: `3px solid ${accentColor}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold display-font" style={{ color: "var(--ink)" }}>
            Page {pageNum}
          </h2>
          <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: "var(--surface-hover)", color: "var(--muted)" }}>
            {comps.length} field{comps.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {comps.map((comp) => {
            const meta = COMP_META[comp.type] || { icon: "📦", desc: "Field component" };
            return (
              <div
                key={comp.id}
                className="flex items-center justify-between p-4 rounded-md bg-[var(--bg)] border border-[var(--border)] transition-colors duration-200 hover:border-[var(--muted)]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm display-font" style={{ color: "var(--ink)" }}>
                      {comp.label}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {meta.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => moveComponent(comp.id, pageKey)}
                  className="text-xs font-semibold px-3 py-1.5 rounded transition-all duration-200 active:scale-95"
                  style={{
                    color: "var(--ink)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  Move to Page {otherPage} →
                </button>
              </div>
            );
          })}
          {comps.length === 0 && (
            <div className="p-6 text-center rounded-md border border-dashed border-[var(--border)]">
              <p className="text-sm" style={{ color: "var(--subtle)" }}>
                No components assigned
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="mb-10 anim-in">
        <h1 className="text-3xl font-bold display-font mb-2" style={{ color: "var(--ink)" }}>
          Configuration
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Assign dynamic components to the onboarding flow. Each step must contain at least one field.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded px-4 py-3 text-sm font-medium anim-fade flex items-center gap-2" style={{ background: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Pages */}
      <div className="space-y-6 mb-8">
        {renderPage("page2", 2)}
        {renderPage("page3", 3)}
      </div>

      {/* Save */}
      <div className="flex items-center gap-4 border-t border-[var(--border)] pt-8">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
          ) : null}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm font-semibold anim-fade flex items-center gap-1" style={{ color: "var(--accent)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
