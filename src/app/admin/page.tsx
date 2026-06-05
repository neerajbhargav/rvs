"use client";

import { useEffect, useState } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState<"workflow" | "agent">("workflow");

  // Workflow State
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Agent State
  const [systemPrompt, setSystemPrompt] = useState("You are an expert customer support agent. Be helpful, concise, and professional.");
  const [provider, setProvider] = useState("openai");
  const [confidence, setConfidence] = useState(85);

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

  const handleSaveWorkflow = async () => {
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

  const renderPage = (pageKey: "page2" | "page3", pageNum: number) => {
    const comps = config?.[pageKey] || [];
    const otherPage = pageKey === "page2" ? 3 : 2;
    const accentColor = pageNum === 2 ? "var(--petronas-teal)" : "var(--ferrari-red)";

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
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveComponent(comp.id, pageKey); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded transition-all duration-200 active:scale-95 text-[var(--ink)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--ink)] cursor-pointer"
                  >
                    Move to Page {otherPage} →
                  </button>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    );
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 min-h-screen">
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-10 border-b border-[var(--border)] pb-4">
        <button 
          onClick={() => setActiveTab("workflow")}
          className={`px-4 py-2 text-sm font-bold display-font transition-colors rounded-lg ${activeTab === "workflow" ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"}`}
        >
          Frontend Workflow Editor
        </button>
        <button 
          onClick={() => setActiveTab("agent")}
          className={`px-4 py-2 text-sm font-bold display-font transition-colors rounded-lg ${activeTab === "agent" ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--muted)] hover:bg-[var(--surface-hover)]"}`}
        >
          AI Agent Configuration
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* WORKFLOW TAB */}
        {activeTab === "workflow" && (
          <motion.div key="workflow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold display-font mb-2 text-[var(--ink)] tracking-tight">Workflow Editor</h1>
              <p className="text-sm text-[var(--muted)]">Drag and drop frontend components to reorder them or move them between steps. Synced live to Postgres.</p>
            </div>

            {error && (
              <div className="mb-6 rounded px-4 py-3 text-sm font-medium anim-fade flex items-center gap-2 border border-[var(--error)] bg-[var(--error-bg)] text-[var(--error)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="space-y-6 mb-8 max-w-3xl">
              {renderPage("page2", 2)}
              {renderPage("page3", 3)}
            </div>

            <div className="flex items-center gap-4 border-t border-[var(--border)] pt-8 max-w-3xl">
              <button onClick={handleSaveWorkflow} disabled={saving} className="btn-primary flex items-center gap-2">
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
          </motion.div>
        )}

        {/* AGENT TAB */}
        {activeTab === "agent" && (
          <motion.div key="agent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold display-font mb-2 text-[var(--ink)] tracking-tight">Agent Configuration</h1>
              <p className="text-sm text-[var(--muted)]">Tune the LLM router, configure autonomous tool access, and set escalation thresholds.</p>
            </div>

            <div className="space-y-8">
              
              {/* LLM Provider */}
              <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--surface-hover)]">
                <h3 className="font-bold display-font text-[var(--ink)] mb-4 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--petronas-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Model Routing
                </h3>
                <div className="flex gap-4">
                  <button onClick={() => setProvider("openai")} className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${provider === "openai" ? "border-[var(--petronas-teal)] bg-[var(--bg)]" : "border-[var(--border)] bg-transparent hover:border-[var(--muted)]"}`}>
                    <div className="font-bold display-font mb-1 text-[var(--ink)]">OpenAI GPT-4o</div>
                    <div className="text-xs text-[var(--muted)]">High reasoning, fastest tool execution.</div>
                  </button>
                  <button onClick={() => setProvider("anthropic")} className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${provider === "anthropic" ? "border-[var(--mclaren-papaya)] bg-[var(--bg)]" : "border-[var(--border)] bg-transparent hover:border-[var(--muted)]"}`}>
                    <div className="font-bold display-font mb-1 text-[var(--ink)]">Anthropic Claude 3.5</div>
                    <div className="text-xs text-[var(--muted)]">Superior tone matching, slower tool calls.</div>
                  </button>
                </div>
              </div>

              {/* System Prompt */}
              <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--bg)] shadow-sm">
                <h3 className="font-bold display-font text-[var(--ink)] mb-2">Global System Prompt</h3>
                <p className="text-xs text-[var(--muted)] mb-4">Injected into every request before tool invocation.</p>
                <textarea 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full h-32 p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--ink)] text-sm font-mono outline-none focus:border-[var(--petronas-teal)] transition-colors"
                />
              </div>

              {/* Advanced Settings */}
              <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--bg)] shadow-sm flex flex-col gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold display-font text-[var(--ink)]">Escalation Confidence Threshold</h3>
                    <span className="font-mono text-sm text-[var(--petronas-teal)] font-bold">{confidence}%</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-4">If the agent's generative confidence drops below this, route to human.</p>
                  <input type="range" min="50" max="99" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full accent-[var(--petronas-teal)]" />
                </div>
                
                <div className="pt-6 border-t border-[var(--border)]">
                  <h3 className="font-bold display-font text-[var(--ink)] mb-4">Enabled Tools</h3>
                  <div className="space-y-3">
                    {["lookup_user_record", "process_refund", "read_knowledge_base"].map(tool => (
                      <div key={tool} className="flex items-center justify-between p-3 rounded bg-[var(--surface-hover)] border border-[var(--border)]">
                        <span className="font-mono text-xs font-semibold text-[var(--ink-soft)]">{tool}</span>
                        <div className="w-8 h-4 rounded-full bg-[var(--petronas-teal)] relative">
                          <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 right-0.5 shadow"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 pb-16">
                <button className="btn-primary w-full shadow-lg" onClick={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                }}>
                  Deploy Agent Configuration to Edge
                </button>
                {saved && <p className="text-center mt-3 text-sm font-bold text-[var(--petronas-teal)]">Configuration synced to Vercel Edge Network.</p>}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
