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

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10 space-y-8 min-h-screen">
      
      {/* 1. Header & High-Level Stats */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold display-font text-[var(--ink)] tracking-tight">SupportIQ Dashboard</h1>
          <p className="text-[var(--muted)] font-medium mt-1">Real-time autonomous AI support operations.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary text-xs">Export Report</button>
          <button className="btn-primary text-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            System Live
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Active Sessions", value: "1,204", trend: "+12%" },
          { label: "Avg Resolution Time", value: "4s", trend: "-85%" },
          { label: "Deflection Rate", value: "87.3%", trend: "+5%" },
          { label: "Escalation Rate", value: "12.7%", trend: "-5%" },
        ].map((stat, i) => (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={stat.label} className="glass p-6 glass-hover">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] display-font mb-2">{stat.label}</div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold display-font text-[var(--ink)]">{stat.value}</span>
              <span className="text-xs font-bold text-[var(--petronas-teal)] mb-1">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. Main 3-Column Display */}
      <div className="grid grid-cols-12 gap-6 h-[600px]">
        
        {/* Left: Analytics */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="col-span-3 glass flex flex-col p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider display-font text-[var(--ink)] mb-6">Live Deflection Volume</h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--petronas-teal)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--petronas-teal)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                  itemStyle={{ color: "var(--petronas-teal)" }}
                />
                <Area type="monotone" dataKey="saved" stroke="var(--petronas-teal)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Center: Framer Motion Chat Simulator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-5 glass flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
            <span className="font-bold text-xs uppercase tracking-wider display-font text-[var(--ink)]">Live Simulator Stream</span>
            <span className="text-[10px] font-bold tracking-wider display-font px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--petronas-teal)]">OPENAI GPT-4O</span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div animate={{ scale: [0.95, 1.05, 0.95] }} transition={{ repeat: Infinity, duration: 3 }} className="h-16 w-16 rounded-2xl mb-6 flex items-center justify-center bg-[var(--accent-soft)]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--petronas-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </motion.div>
                <h3 className="font-bold text-lg display-font mb-2 text-[var(--ink)]">Start Simulation</h3>
                <p className="text-sm mb-6 text-[var(--muted)] max-w-[280px]">Test autonomous tool execution directly against the live database.</p>
                <div className="flex flex-col gap-3 w-full max-w-[250px]">
                  {QUICK_ACTIONS.map(action => (
                    <motion.button key={action.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => append({ role: "user", content: action.prompt })} className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--ink-soft)] hover:border-[var(--petronas-teal)] hover:text-[var(--petronas-teal)] transition-colors">
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div key={m.id} layout initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-6`}>
                  {m.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold mr-3 mt-1 shrink-0 display-font bg-[var(--petronas-teal)] text-white shadow-sm">IQ</div>
                  )}
                  <div className="max-w-[85%] rounded-2xl px-5 py-3.5 text-sm" style={{ background: m.role === "user" ? "var(--ink)" : "var(--bg)", color: m.role === "user" ? "var(--bg)" : "var(--ink)", border: m.role === "assistant" ? "1px solid var(--border)" : "none", borderBottomRightRadius: m.role === "user" ? 4 : undefined, borderBottomLeftRadius: m.role === "assistant" ? 4 : undefined, boxShadow: m.role === "assistant" ? "0 4px 15px rgba(0,0,0,0.02)" : "0 4px 15px rgba(0,0,0,0.1)" }}>
                    {m.content && <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>}
                    
                    {/* GENERATIVE UI TOOL STREAM */}
                    {m.toolInvocations && m.toolInvocations.map(tool => (
                      <motion.div key={tool.toolCallId} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border-soft)" }}>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider display-font text-[var(--petronas-teal)]">
                          {!("result" in tool) ? (
                            <motion.svg animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></motion.svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          )}
                          {!("result" in tool) ? `Executing: ${tool.toolName}...` : `Completed: ${tool.toolName}`}
                        </div>
                        {"result" in tool && (
                          <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-md p-2 text-[11px] font-mono text-[var(--ink-soft)] overflow-x-auto">
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
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold display-font bg-[var(--petronas-teal)] text-white shadow-sm">IQ</div>
                  <div className="flex gap-1">
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-1" />
          </div>

          <form onSubmit={handleSubmit} className="p-4 shrink-0 bg-[var(--surface-hover)]" style={{ borderTop: "1px solid var(--border)", backdropFilter: "blur(20px)" }}>
            <div className="flex gap-3">
              <input value={input} onChange={handleInputChange} placeholder="Prompt the agent..." disabled={isLoading} className="flex-1 rounded-xl px-4 py-3.5 text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] focus:border-[var(--petronas-teal)] outline-none shadow-sm transition-colors" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading || !input.trim()} className="btn-primary px-6 h-auto">Send</motion.button>
            </div>
          </form>
        </motion.div>

        {/* Right: Technical Reasoner Log */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="col-span-4 glass flex flex-col">
          <div className="flex items-center px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
            <span className="font-bold text-xs uppercase tracking-wider display-font text-[var(--ink)]">Technical Engine</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-2">Architecture Stack</div>
              {[
                { label: "LLM Routing", value: "Vercel AI SDK Core" },
                { label: "Streaming UI", value: "React useChat + Framer" },
                { label: "Database", value: "PostgreSQL (Prisma)" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <span className="font-bold uppercase tracking-wider mb-1 display-font text-[var(--muted)]" style={{ fontSize: "9px" }}>{item.label}</span>
                  <span className="mono font-medium text-[var(--ink)] text-xs">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mt-6">
              <div className="text-[10px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-2">Live Tool Execution Logs</div>
              <AnimatePresence>
                {activeToolCalls.length === 0 ? (
                  <motion.div exit={{ opacity: 0, height: 0 }} className="text-xs text-center py-6 border border-dashed border-[var(--border)] rounded-xl text-[var(--muted)]">No background actions executed.</motion.div>
                ) : (
                  activeToolCalls.map((tool, i) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={i} className="rounded-xl p-3 text-xs border border-[var(--border)] bg-[var(--bg)] shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--petronas-teal)]" />
                      <div className="font-bold mono mb-2 text-[var(--ink)] ml-2">🔧 {tool.toolName}</div>
                      <div className="mb-1 ml-2"><span className="font-semibold text-[var(--muted)]">Args: </span><span className="mono text-[var(--ink-soft)]">{JSON.stringify(tool.args)}</span></div>
                      {"result" in tool && (
                        <div className="mt-2 pt-2 ml-2" style={{ borderTop: "1px solid var(--border-soft)" }}>
                          <span className="font-semibold text-[var(--muted)]">Result: </span><span className="mono text-[var(--petronas-teal)]">{JSON.stringify(tool.result)}</span>
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

      {/* 3. Business ROI Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 border-t-4 border-[var(--ink)]">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold uppercase tracking-widest display-font text-[var(--ink)]">Business Impact (ROI)</span>
          <span className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded bg-[var(--ink)] text-[var(--bg)] display-font">76.3% MARGIN</span>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "Human Cost (Avg)", value: "$5.50", color: "var(--mclaren-papaya)" },
            { label: "AI Cost (Avg)", value: "$1.30", color: "var(--petronas-teal)" },
            { label: "Net Savings", value: "$4.20", color: "var(--ink)" },
            { label: "Annualized (100k vol)", value: "$420,000", color: "var(--ink)" },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 display-font text-[var(--muted)]">{m.label}</div>
              <div className="text-2xl font-bold mono tracking-tight" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
