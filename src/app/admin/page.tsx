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
  about_me: { icon: "📝", desc: "Free-text field for users to describe themselves" },
  address: { icon: "📍", desc: "Street, city, state, and ZIP code fields" },
  birthdate: { icon: "📅", desc: "Date picker for date of birth" },
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

    // Validate: can't leave a page empty
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="animate-spin">
          <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const renderPage = (pageKey: "page2" | "page3", pageNum: number) => {
    const comps = config?.[pageKey] || [];
    const otherPage = pageKey === "page2" ? 3 : 2;

    return (
      <div className="anim-in" style={{ animationDelay: `${pageNum * 0.1}s` }}>
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-md"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            PAGE {pageNum}
          </span>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            {comps.length} component{comps.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {comps.map((comp) => {
            const meta = COMP_META[comp.type] || { icon: "📦", desc: "Unknown component" };
            return (
              <div
                key={comp.id}
                className="glass glass-hover p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                      {comp.label}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {meta.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => moveComponent(comp.id, pageKey)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={{
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  Move to Page {otherPage} →
                </button>
              </div>
            );
          })}
          {comps.length === 0 && (
            <div
              className="glass p-8 text-center"
              style={{ borderStyle: "dashed" }}
            >
              <p className="text-sm" style={{ color: "var(--subtle)" }}>
                No components assigned to this page
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 anim-in">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md"
            style={{
              background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
              color: "white",
            }}
          >
            ADMIN
          </span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
          Onboarding Configuration
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Drag components between pages to customize the onboarding flow. Each page must have at least one component.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm font-medium anim-scale"
          style={{ background: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error)" }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Pages */}
      <div className="space-y-8 mb-8">
        {renderPage("page2", 2)}
        {renderPage("page3", 3)}
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : null}
          {saving ? "Saving..." : "Save Configuration"}
        </button>
        {saved && (
          <span className="text-sm font-semibold anim-scale" style={{ color: "var(--accent)" }}>
            ✓ Saved!
          </span>
        )}
      </div>
    </div>
  );
}
