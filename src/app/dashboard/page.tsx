"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const CHART_DATA = [
  { time: "08:00", saved: 120, baseline: 550 },
  { time: "10:00", saved: 350, baseline: 550 },
  { time: "12:00", saved: 680, baseline: 550 },
  { time: "14:00", saved: 520, baseline: 550 },
  { time: "16:00", saved: 890, baseline: 550 },
  { time: "18:00", saved: 710, baseline: 550 },
];

const QUICK_ACTIONS = [
  { id: "policy", label: "Check Refund Policy", prompt: "What is the policy for refunds?" },
  { id: "record", label: "Look up my record", prompt: "Can you look up the patient record for test@newco.com?" },
  { id: "escalate", label: "Billing Dispute", prompt: "I was double charged $150 and want a refund." },
];

export default function DashboardPage() {
  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const activeToolCalls = messages
    .filter((m) => m.toolInvocations && m.toolInvocations.length > 0)
    .flatMap((m) => m.toolInvocations!);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Time,Sessions Deflected,Baseline Expected\n"
      + CHART_DATA.map(e => `${e.time},${e.saved},${e.baseline}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "supportiq_live_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6 h-[calc(100vh-70px)] flex flex-col overflow-hidden">
      
      {/* 1. Header Row */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center shrink-0 mb-4">
        <div>
          <h1 className="text-2xl font-bold display-font text-[var(--ink)] tracking-tight">SupportIQ Command Center</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary text-xs flex items-center gap-2 py-1.5 h-auto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Report
          </button>
          <button className="btn-primary text-xs flex items-center gap-2 py-1.5 h-auto pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            System Live
          </button>
        </div>
      </motion.div>

      {/* 2. Consolidated High-Level Ribbon */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex w-full shrink-0 mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-sm divide-x divide-[var(--border)]">
        {[
          { label: "Active Sessions", value: "1,204", trend: "+12%" },
          { label: "Avg Resolution", value: "4s", trend: "-85%" },
          { label: "Deflection Rate", value: "87.3%", trend: "+5%" },
          { label: "Human Cost (Avg)", value: "$5.50", color: "var(--mclaren-papaya)" },
          { label: "AI Cost (Avg)", value: "$1.30", color: "var(--petronas-teal)" },
          { label: "Net Savings", value: "$4.20", color: "var(--ink)", isTotal: true },
        ].map((stat, i) => (
          <div key={stat.label} className={`flex-1 px-4 py-3 ${stat.isTotal ? 'bg-[var(--surface-hover)]' : ''}`}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] display-font mb-1">{stat.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold display-font" style={{ color: stat.color || "var(--ink)" }}>{stat.value}</span>
              {stat.trend && <span className="text-[10px] font-bold text-[var(--petronas-teal)]">{stat.trend}</span>}
            </div>
          </div>
        ))}
      </motion.div>

      {/* 3. Main 3-Pane Grid (Fills Remaining Height) */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        
        {/* Left: Analytics Pane */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="w-1/4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex flex-col shadow-sm">
          <div className="px-4 py-3 shrink-0 border-b border-[var(--border)] bg-[var(--surface-hover)] rounded-t-xl">
            <h2 className="text-[10px] font-bold uppercase tracking-wider display-font text-[var(--ink)]">Live Deflection Volume</h2>
          </div>
          <div className="flex-1 w-full p-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--petronas-teal)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--petronas-teal)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--muted)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--muted)" }} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                  itemStyle={{ color: "var(--petronas-teal)" }}
                />
                <Area type="monotone" dataKey="saved" stroke="var(--petronas-teal)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Center: Simulator Stream Pane */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-2/4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-[var(--border)] bg-[var(--surface-hover)] rounded-t-xl">
            <span className="font-bold text-[10px] uppercase tracking-wider display-font text-[var(--ink)]">Live Simulator Stream</span>
            <span className="text-[9px] font-bold tracking-wider display-font px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--petronas-teal)]">OPENAI GPT-4O</span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ repeat: Infinity, duration: 3 }} className="h-12 w-12 rounded-xl mb-4 flex items-center justify-center bg-[var(--accent-soft)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--petronas-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </motion.div>
                <h3 className="font-bold text-base display-font mb-2 text-[var(--ink)]">Start Simulation</h3>
                <p className="text-xs mb-6 text-[var(--muted)] max-w-[280px]">Test autonomous tool execution directly against the live database.</p>
                <div className="flex flex-col gap-2 w-full max-w-[250px]">
                  {QUICK_ACTIONS.map(action => (
                    <motion.button key={action.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => append({ role: "user", content: action.prompt })} className="w-full text-left px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--ink-soft)] hover:border-[var(--petronas-teal)] hover:text-[var(--petronas-teal)] transition-colors">
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div key={m.id} layout initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
                  {m.role === "assistant" && (
                    <div className="h-7 w-7 rounded flex items-center justify-center text-[9px] font-bold mr-3 shrink-0 display-font bg-[var(--petronas-teal)] text-white shadow-sm mt-0.5">IQ</div>
                  )}
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm" style={{ background: m.role === "user" ? "var(--ink)" : "var(--bg)", color: m.role === "user" ? "var(--bg)" : "var(--ink)", border: m.role === "assistant" ? "1px solid var(--border)" : "none", borderBottomRightRadius: m.role === "user" ? 4 : undefined, borderBottomLeftRadius: m.role === "assistant" ? 4 : undefined }}>
                    {m.content && <div className="leading-relaxed whitespace-pre-wrap text-[13px]">{m.content}</div>}
                    
                    {/* GENERATIVE UI TOOL STREAM */}
                    {m.toolInvocations && m.toolInvocations.map(tool => (
                      <motion.div key={tool.toolCallId} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 pt-2 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border-soft)" }}>
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider display-font text-[var(--petronas-teal)]">
                          {!("result" in tool) ? (
                            <motion.svg animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></motion.svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                          {!("result" in tool) ? `Executing: ${tool.toolName}...` : `Completed: ${tool.toolName}`}
                        </div>
                        {"result" in tool && (
                          <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded p-2 text-[10px] font-mono text-[var(--ink-soft)] overflow-x-auto">
                            {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded flex items-center justify-center text-[9px] font-bold display-font bg-[var(--petronas-teal)] text-white shadow-sm">IQ</div>
                  <div className="flex gap-1">
                    <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                    <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                    <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-1" />
          </div>

          <form onSubmit={handleSubmit} className="p-3 shrink-0 border-t border-[var(--border)] bg-[var(--bg)] rounded-b-xl">
            <div className="flex gap-2">
              <input value={input} onChange={handleInputChange} placeholder="Prompt the agent..." disabled={isLoading} className="flex-1 rounded-lg px-3 py-2 text-[13px] bg-[var(--surface-hover)] border border-transparent text-[var(--ink)] focus:border-[var(--petronas-teal)] focus:bg-[var(--bg)] outline-none shadow-inner transition-colors" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading || !input.trim()} className="btn-primary px-4 h-auto py-2 text-[13px] rounded-lg">Send</motion.button>
            </div>
          </form>
        </motion.div>

        {/* Right: Technical Reasoner Pane */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="w-1/4 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex flex-col shadow-sm">
          <div className="px-4 py-3 shrink-0 border-b border-[var(--border)] bg-[var(--surface-hover)] rounded-t-xl">
            <span className="font-bold text-[10px] uppercase tracking-wider display-font text-[var(--ink)]">Technical Engine</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
            <div className="space-y-2">
              <div className="text-[9px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-1">Architecture Stack</div>
              {[
                { label: "LLM Routing", value: "Vercel AI SDK Core" },
                { label: "Streaming UI", value: "React useChat + Framer" },
                { label: "Database", value: "PostgreSQL (Prisma)" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col py-2 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)]">
                  <span className="font-bold uppercase tracking-wider display-font text-[var(--muted)]" style={{ fontSize: "8px" }}>{item.label}</span>
                  <span className="mono font-medium text-[var(--ink)] text-[11px]">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-1">Live Tool Execution Logs</div>
              <AnimatePresence>
                {activeToolCalls.length === 0 ? (
                  <motion.div exit={{ opacity: 0, height: 0 }} className="text-[11px] text-center py-4 border border-dashed border-[var(--border)] rounded-lg text-[var(--muted)]">No background actions executed.</motion.div>
                ) : (
                  activeToolCalls.map((tool, i) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={i} className="rounded-lg p-2 text-[10px] border border-[var(--border)] bg-[var(--bg)] shadow-sm relative overflow-hidden mb-2">
                      <div className="absolute top-0 left-0 w-0.5 h-full bg-[var(--petronas-teal)]" />
                      <div className="font-bold mono mb-1 text-[var(--ink)] ml-1.5">🔧 {tool.toolName}</div>
                      <div className="ml-1.5"><span className="font-semibold text-[var(--muted)]">Args: </span><span className="mono text-[var(--ink-soft)] break-all">{JSON.stringify(tool.args)}</span></div>
                      {"result" in tool && (
                        <div className="mt-1 pt-1 ml-1.5" style={{ borderTop: "1px solid var(--border-soft)" }}>
                          <span className="font-semibold text-[var(--muted)]">Result: </span><span className="mono text-[var(--petronas-teal)] break-all">{JSON.stringify(tool.result)}</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
