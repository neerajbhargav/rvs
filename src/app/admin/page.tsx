"use client";

import { useState, useEffect } from "react";

interface PageConfig { aboutMe: number; address: number; birthdate: number; }
type ComponentKey = "aboutMe" | "address" | "birthdate";

const LABELS: Record<ComponentKey, { name: string; desc: string; icon: string }> = {
  aboutMe: { name: "About Me", desc: "Large text area for user bio", icon: "📝" },
  address: { name: "Address", desc: "Street, city, state, zip fields", icon: "📍" },
  birthdate: { name: "Birthdate", desc: "Date selection input", icon: "📅" },
};

export default function AdminPage() {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/config").then(r => r.json()).then(setConfig); }, []);

  function toggle(key: ComponentKey) {
    if (!config) return;
    const next = config[key] === 2 ? 3 : 2;
    const newConfig = { ...config, [key]: next };
    const p2 = (Object.keys(newConfig) as ComponentKey[]).filter(k => newConfig[k] === 2).length;
    const p3 = (Object.keys(newConfig) as ComponentKey[]).filter(k => newConfig[k] === 3).length;
    if (p2 === 0 || p3 === 0) { setError("Each page must have at least one component."); setTimeout(() => setError(""), 2500); return; }
    setConfig(newConfig); setError(""); setSaved(false);
  }

  async function save() {
    if (!config) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); }
      else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch { setError("Network error"); }
    setSaving(false);
  }

  if (!config) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" /></div>;

  const page2 = (Object.keys(config) as ComponentKey[]).filter(k => config[k] === 2);
  const page3 = (Object.keys(config) as ComponentKey[]).filter(k => config[k] === 3);

  const card = (key: ComponentKey) => {
    const c = LABELS[key];
    return (
      <div key={key} className="anim-in flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl">{c.icon}</span>
          <div>
            <div className="text-sm font-medium text-[var(--ink)]">{c.name}</div>
            <div className="text-xs text-[var(--muted)]">{c.desc}</div>
          </div>
        </div>
        <button onClick={() => toggle(key)}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
          Move to Page {config[key] === 2 ? 3 : 2} →
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-1 flex items-center gap-2">
        <span className="mono rounded bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">ADMIN</span>
        <h1 className="text-xl font-semibold text-[var(--ink)]">Onboarding Configuration</h1>
      </div>
      <p className="mb-6 text-sm text-[var(--muted)]">Configure which data components appear on each page of the onboarding wizard. Each page must have at least one component.</p>
      {error && <div className="mb-4 rounded-lg bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">{error}</div>}
      <div className="mb-6 space-y-6">
        <div>
          <h2 className="mono mb-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Page 2 · {page2.length} component{page2.length !== 1 ? "s" : ""}
          </h2>
          <div className="space-y-2">{page2.map(card)}</div>
        </div>
        <div>
          <h2 className="mono mb-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Page 3 · {page3.length} component{page3.length !== 1 ? "s" : ""}
          </h2>
          <div className="space-y-2">{page3.map(card)}</div>
        </div>
      </div>
      <button onClick={save} disabled={saving}
        className="w-full rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50">
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Configuration"}
      </button>
    </div>
  );
}
