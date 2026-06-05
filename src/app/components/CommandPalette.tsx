"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"menu" | "architecture">("menu");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setView("menu");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const ACTIONS = [
    { id: "arch", label: "View System Architecture", icon: "🧠", type: "system", action: () => setView("architecture") },
    { id: "onboard", label: "Go to Onboarding Flow", icon: "⚡", type: "navigation", action: () => { window.location.href = "/"; setIsOpen(false); } },
    { id: "dash", label: "Go to Dashboard", icon: "📊", type: "navigation", action: () => { router.push("/dashboard"); setIsOpen(false); } },
    { id: "admin", label: "Go to Admin Portal", icon: "⚙️", type: "navigation", action: () => { router.push("/admin"); setIsOpen(false); } },
    { id: "data", label: "Go to Data Grid", icon: "🗄️", type: "navigation", action: () => { router.push("/data"); setIsOpen(false); } },
  ];

  const filtered = ACTIONS.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => setIsOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[var(--bg)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]"
          >
            {view === "menu" && (
              <>
                <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface-hover)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type a command or search..."
                    className="w-full bg-transparent outline-none text-lg display-font text-[var(--ink)] placeholder-[var(--muted)]"
                  />
                  <span className="text-[10px] font-bold tracking-widest text-[var(--muted)] uppercase border border-[var(--border)] px-1.5 py-0.5 rounded display-font">ESC</span>
                </div>
                <div className="p-2 max-h-[400px] overflow-y-auto">
                  {filtered.length === 0 && <div className="p-8 text-center text-[var(--muted)] text-sm">No results found.</div>}
                  {filtered.map((action, i) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] text-[var(--ink-soft)] transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{action.icon}</span>
                        <span className="font-medium text-sm">{action.label}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] group-hover:text-[var(--petronas-teal)]">{action.type}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {view === "architecture" && (
              <div className="p-6 bg-[var(--bg)] min-h-[500px] flex flex-col relative">
                <button onClick={() => setView("menu")} className="absolute top-4 left-4 p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--muted)] transition-colors z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </button>
                <div className="text-center mb-10 mt-2">
                  <h2 className="text-xl font-bold display-font text-[var(--ink)] tracking-tight">System Architecture</h2>
                  <p className="text-xs text-[var(--muted)] font-medium mt-1">Real-time SupportIQ Topology</p>
                </div>

                <div className="flex-1 relative flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-8 w-full max-w-lg relative z-10">
                    
                    {/* UI Layer */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-3 flex justify-center mb-4">
                      <div className="px-6 py-3 rounded-xl border-2 border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] shadow-lg font-bold display-font text-sm flex items-center gap-2">
                        📱 Next.js React UI
                      </div>
                    </motion.div>

                    {/* Server Layer */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center gap-2">
                      <div className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] shadow-sm font-semibold text-xs text-[var(--ink)] text-center w-full">
                        Server Actions<br/><span className="text-[9px] text-[var(--muted)]">API Routes</span>
                      </div>
                      <div className="w-0.5 h-6 bg-[var(--border)]" />
                      <div className="px-4 py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 shadow-sm font-semibold text-xs text-blue-600 dark:text-blue-400 text-center w-full">
                        Prisma ORM<br/><span className="text-[9px] opacity-70">PostgreSQL</span>
                      </div>
                    </motion.div>

                    {/* Routing */}
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center relative">
                      <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <svg className="w-full h-full text-[var(--border)]" style={{ overflow: "visible" }}><path d="M 0,50 Q 50,0 100,50 T 200,50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" /></path></svg>
                      </div>
                      <div className="px-4 py-3 rounded-full border-2 border-[var(--petronas-teal)] bg-[var(--petronas-teal)] text-white shadow-lg font-bold text-xs display-font shadow-[0_0_15px_var(--petronas-teal)] z-10">
                        AI SDK Core
                      </div>
                    </motion.div>

                    {/* LLM Layer */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col items-center gap-2">
                      <div className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] shadow-sm font-semibold text-xs text-[var(--ink)] text-center w-full">
                        Tool Router<br/><span className="text-[9px] text-[var(--muted)]">Zod Schemas</span>
                      </div>
                      <div className="w-0.5 h-6 bg-[var(--border)]" />
                      <div className="px-4 py-3 rounded-xl border border-orange-500/30 bg-orange-500/10 shadow-sm font-semibold text-xs text-orange-600 dark:text-orange-400 text-center w-full">
                        GPT-4o<br/><span className="text-[9px] opacity-70">OpenAI</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full -z-10" style={{ pointerEvents: "none" }}>
                    <path d="M 250,100 L 120,200" fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4"><animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" /></path>
                    <path d="M 250,100 L 380,200" fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4"><animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" /></path>
                  </svg>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
