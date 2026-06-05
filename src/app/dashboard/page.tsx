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
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden p-6 gap-6 mx-auto max-w-[1400px]">
      
      {/* LEFT COLUMN: Analytics & Graphs */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col w-[35%] gap-6 h-full"
      >
        <div className="glass p-6 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold display-font tracking-tight text-[var(--ink)]">SupportIQ</h1>
            <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-[var(--accent)] text-white display-font">LIVE</span>
          </div>
          <p className="text-sm font-medium text-[var(--muted)]">Autonomous AI Support Infrastructure</p>
        </div>

        <div className="glass p-6 flex-1 flex flex-col min-h-[250px] glass-hover">
          <h2 className="text-xs font-bold uppercase tracking-wider display-font text-[var(--ink)] mb-4">Live Ticket Deflection & Savings</h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                  itemStyle={{ color: "var(--accent)" }}
                />
                <Area type="monotone" dataKey="saved" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <motion.div whileHover={{ y: -2 }} className="glass p-5 glass-hover">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[var(--muted)] display-font">Deflection Rate</div>
            <div className="text-2xl font-bold text-[var(--ink)] display-font">87.3%</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--accent)] mt-1">+12% this week</div>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} className="glass p-5 glass-hover">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[var(--muted)] display-font">Cost Saved</div>
            <div className="text-2xl font-bold text-[var(--ink)] display-font">$41.2K</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--muted)] mt-1">$4.20 per ticket</div>
          </motion.div>
        </div>
      </motion.div>

      {/* CENTER COLUMN: Chat Interface */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="glass flex flex-col w-[40%] h-full relative"
      >
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
          <span className="font-bold text-xs uppercase tracking-wider display-font text-[var(--ink)]">Customer Session</span>
          <span className="text-[10px] font-bold tracking-wider display-font px-2 py-0.5 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>OPENAI GPT-4O</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div 
                animate={{ scale: [0.95, 1.05, 0.95] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="h-16 w-16 rounded-2xl mb-6 flex items-center justify-center bg-[var(--accent-soft)]"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </motion.div>
              <h3 className="font-bold text-xl display-font mb-2 text-[var(--ink)]">How can I help you today?</h3>
              <p className="text-sm mb-8 text-[var(--muted)] max-w-[280px]">
                SupportIQ is ready. Select a quick action below to test autonomous tool execution.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-[250px]">
                {QUICK_ACTIONS.map(action => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => append({ role: "user", content: action.prompt })}
                    className="w-full text-left px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-xs font-semibold text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div 
                key={m.id} 
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-6`}
              >
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold mr-3 mt-1 shrink-0 display-font bg-[var(--gradient-accent)] text-white shadow-sm">IQ</div>
                )}
                <div
                  className="max-w-[85%] rounded-2xl px-5 py-3.5 text-[14px]"
                  style={{
                    background: m.role === "user" ? "var(--ink)" : "var(--bg)",
                    color: m.role === "user" ? "var(--bg)" : "var(--ink)",
                    border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                    borderBottomRightRadius: m.role === "user" ? 4 : undefined,
                    borderBottomLeftRadius: m.role === "assistant" ? 4 : undefined,
                    boxShadow: m.role === "assistant" ? "0 4px 15px rgba(0,0,0,0.02)" : "0 4px 15px rgba(0,0,0,0.1)",
                  }}
                >
                  {m.content && <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>}
                  
                  {/* GENERATIVE UI: Tool Execution Cards */}
                  {m.toolInvocations && m.toolInvocations.map(tool => (
                    <motion.div 
                      key={tool.toolCallId} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 flex flex-col gap-2" 
                      style={{ borderTop: "1px solid var(--border-soft)" }}
                    >
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider display-font text-[var(--accent)]">
                        {!("result" in tool) ? (
                          <motion.svg animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></motion.svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                        {!("result" in tool) ? `Executing: ${tool.toolName}...` : `Completed: ${tool.toolName}`}
                      </div>
                      
                      {"result" in tool && (
                        <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-md p-2 text-xs font-mono text-[var(--ink-soft)] overflow-x-auto">
                          {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
            
            {/* Thinking Indicator */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold display-font bg-[var(--gradient-accent)] text-white shadow-sm">IQ</div>
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
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask SupportIQ anything..."
              disabled={isLoading}
              className="flex-1 rounded-xl px-4 py-3.5 text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] transition-colors focus:border-[var(--accent)] outline-none shadow-sm"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="btn-primary px-6 h-auto"
            >
              Send
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* RIGHT COLUMN: Tool Executions & Architecture Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="glass flex flex-col w-[25%] h-full"
      >
        <div className="flex items-center px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
          <span className="font-bold text-xs uppercase tracking-wider display-font text-[var(--ink)]">Technical Engine</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-2">Architecture Stack</div>
            {[
              { label: "LLM Routing", value: "Vercel AI SDK Core" },
              { label: "Streaming UI", value: "React useChat Hook" },
              { label: "Database", value: "PostgreSQL (Prisma)" },
              { label: "Animations", value: "Framer Motion" },
            ].map((item) => (
              <motion.div whileHover={{ x: 2 }} key={item.label} className="flex flex-col py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] transition-colors hover:border-[var(--accent-soft)]">
                <span className="font-bold uppercase tracking-wider mb-1 display-font text-[var(--muted)]" style={{ fontSize: "9px" }}>{item.label}</span>
                <span className="mono font-medium text-[var(--ink)]">{item.value}</span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-2 mt-6">Live Tool Executions</div>
            <AnimatePresence>
              {activeToolCalls.length === 0 ? (
                <motion.div exit={{ opacity: 0, height: 0 }} className="text-xs text-center py-6 border border-dashed border-[var(--border)] rounded-xl text-[var(--muted)]">
                  No tools called in this session yet.
                </motion.div>
              ) : (
                activeToolCalls.map((tool, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={i} 
                    className="rounded-xl p-3 text-xs border border-[var(--accent-soft)] bg-[var(--bg)] shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gradient-accent)]" />
                    <div className="font-bold mono mb-2 text-[var(--ink)] ml-2">🔧 {tool.toolName}</div>
                    <div className="mb-1 ml-2"><span className="font-semibold text-[var(--muted)]">Args: </span><span className="mono text-[var(--ink-soft)]">{JSON.stringify(tool.args)}</span></div>
                    {"result" in tool && (
                      <div className="mt-2 pt-2 ml-2" style={{ borderTop: "1px solid var(--border-soft)" }}>
                        <span className="font-semibold text-[var(--muted)]">Result: </span><span className="mono text-[var(--accent)]">{JSON.stringify(tool.result)}</span>
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
  );
}
