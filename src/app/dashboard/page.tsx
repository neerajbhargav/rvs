"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CHART_DATA = [
  { time: "08:00", saved: 120, baseline: 550 },
  { time: "10:00", saved: 350, baseline: 550 },
  { time: "12:00", saved: 680, baseline: 550 },
  { time: "14:00", saved: 520, baseline: 550 },
  { time: "16:00", saved: 890, baseline: 550 },
  { time: "18:00", saved: 710, baseline: 550 },
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
      <div className="flex flex-col w-[35%] gap-6 h-full">
        {/* Header */}
        <div className="glass p-6 shrink-0 anim-in">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold display-font tracking-tight text-[var(--ink)]">SupportIQ</h1>
            <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-[var(--petronas-teal)] text-white display-font">LIVE</span>
          </div>
          <p className="text-sm font-medium text-[var(--muted)]">Autonomous AI Support Infrastructure</p>
        </div>

        {/* Live Graph */}
        <div className="glass p-6 flex-1 flex flex-col min-h-[250px] anim-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xs font-bold uppercase tracking-wider display-font text-[var(--ink)] mb-4">Live Ticket Deflection & Savings</h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--petronas-teal)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--petronas-teal)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                  itemStyle={{ color: "var(--ink)" }}
                />
                <Area type="monotone" dataKey="saved" stroke="var(--petronas-teal)" strokeWidth={3} fillOpacity={1} fill="url(#colorSaved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 shrink-0 anim-in" style={{ animationDelay: "0.2s" }}>
          <div className="glass p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[var(--muted)] display-font">Deflection Rate</div>
            <div className="text-2xl font-bold text-[var(--ink)] display-font">87.3%</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--petronas-teal)] mt-1">+12% this week</div>
          </div>
          <div className="glass p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[var(--muted)] display-font">Cost Saved</div>
            <div className="text-2xl font-bold text-[var(--ink)] display-font">$41.2K</div>
            <div className="text-[10px] uppercase font-semibold text-[var(--muted)] mt-1">$4.20 per ticket</div>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Chat Interface */}
      <div className="glass flex flex-col w-[40%] h-full anim-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
          <span className="font-bold text-xs uppercase tracking-wider display-font text-[var(--ink)]">Customer Session</span>
          <span className="text-[10px] font-bold tracking-wider display-font px-2 py-0.5 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>OPENAI GPT-4O</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-12 w-12 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="font-bold text-lg display-font mb-2 text-[var(--ink)]">Start a simulation</h3>
              <p className="text-sm mb-6 text-[var(--muted)] max-w-[280px]">
                Test the real streaming LLM. Try asking about a billing dispute to see it trigger a tool call.
              </p>
              <button 
                onClick={() => append({ role: "user", content: "I was double charged $150 and want a refund." })}
                className="btn-secondary text-xs px-4 py-2"
              >
                "I was double charged $150..."
              </button>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} anim-in`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold mr-3 mt-1 shrink-0 display-font bg-[var(--petronas-teal)] text-white">AI</div>
              )}
              <div
                className="max-w-[85%] rounded-md px-5 py-3.5 text-sm"
                style={{
                  background: m.role === "user" ? "var(--ink)" : "var(--bg)",
                  color: m.role === "user" ? "var(--bg)" : "var(--ink)",
                  border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                  borderBottomRightRadius: m.role === "user" ? 2 : undefined,
                  borderBottomLeftRadius: m.role === "assistant" ? 2 : undefined,
                }}
              >
                <div className="leading-relaxed">{m.content}</div>
                {m.toolInvocations && m.toolInvocations.map(tool => (
                  <div key={tool.toolCallId} className="mt-3 pt-3 flex flex-col gap-1.5" style={{ borderTop: "1px solid var(--border-soft)" }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider display-font text-[var(--muted)]">
                      ⚙️ Executed: {tool.toolName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 anim-fade">
              <div className="h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold display-font bg-[var(--petronas-teal)] text-white">AI</div>
              <div className="text-xs font-semibold text-[var(--muted)]">Processing...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex gap-3">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Message the agent..."
              disabled={isLoading}
              className="flex-1 rounded-md px-4 py-3 text-sm bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] transition-colors focus:border-[var(--ink)] outline-none"
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="btn-primary px-6">
              Send
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Tool Executions & Architecture Panel */}
      <div className="glass flex flex-col w-[25%] h-full anim-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center px-6 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
          <span className="font-bold text-xs uppercase tracking-wider display-font text-[var(--ink)]">Technical Engine</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-2">Architecture Stack</div>
            {[
              { label: "LLM Routing", value: "Vercel AI SDK Core" },
              { label: "Streaming", value: "React useChat Hook" },
              { label: "Database", value: "PostgreSQL (Supabase)" },
              { label: "Auth", value: "Secure HttpOnly Cookie" },
              { label: "Styling", value: "Tailwind CSS v4" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col py-2.5 px-3 rounded text-xs border border-[var(--border)] bg-[var(--bg)]">
                <span className="font-bold uppercase tracking-wider mb-1 display-font text-[var(--muted)]" style={{ fontSize: "9px" }}>{item.label}</span>
                <span className="mono font-medium text-[var(--ink)]">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest display-font text-[var(--muted)] mb-2 mt-6">Live Tool Executions</div>
            {activeToolCalls.length === 0 ? (
              <div className="text-xs text-center py-6 border border-dashed border-[var(--border)] rounded text-[var(--muted)]">
                No tools called in this session yet.
              </div>
            ) : (
              activeToolCalls.map((tool, i) => (
                <div key={i} className="rounded p-3 text-xs border border-[var(--border)] bg-[var(--bg)] anim-in">
                  <div className="font-bold mono mb-2 text-[var(--ink)]">🔧 {tool.toolName}</div>
                  <div className="mb-1"><span className="font-semibold text-[var(--muted)]">Args: </span><span className="mono text-[var(--ink-soft)]">{JSON.stringify(tool.args)}</span></div>
                  {"result" in tool && (
                    <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border-soft)" }}>
                      <span className="font-semibold text-[var(--muted)]">Result: </span><span className="mono text-[var(--petronas-teal)]">{JSON.stringify(tool.result)}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
