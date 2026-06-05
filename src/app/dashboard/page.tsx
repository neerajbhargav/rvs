"use client";

import { useState, useRef, useEffect } from "react";

interface ToolCall {
  name: string;
  input: string;
  result: string;
}
interface ChatMsg {
  role: "user" | "agent";
  text: string;
  time?: number;
  confidence?: number;
  tools?: ToolCall[];
  escalate?: boolean;
  reasoning?: string;
}

const SCENARIOS = [
  { label: "Insurance Question", emoji: "🏥", msg: "What does my health insurance cover for mental health visits?" },
  { label: "Prescription Refill", emoji: "💊", msg: "I need to refill my Lexapro prescription but my provider left the practice" },
  { label: "Cancel Appointment", emoji: "📅", msg: "I want to cancel my upcoming appointment on Friday" },
  { label: "Billing Dispute", emoji: "⚠️", msg: "I was charged twice for my last visit and I want a refund immediately" },
];

const STATS_INITIAL = [
  { label: "Resolved", value: "1,247", sub: "38 escalated", icon: "✅" },
  { label: "Deflection Rate", value: "87.3%", sub: "Industry avg: 45%", icon: "🛡️" },
  { label: "Avg Resolution", value: "34s", sub: "vs 8min human", icon: "⚡" },
  { label: "Cost Saved", value: "$41.2K", sub: "$4.20/ticket saved", icon: "💰" },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-5 py-4 anim-fade">
      <div
        className="h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold display-font"
        style={{ background: "var(--petronas-teal)", color: "white" }}
      >
        AI
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--subtle)",
              animation: `slideUpFade 1s ease-in-out ${i * 0.2}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ stat, i }: { stat: (typeof STATS_INITIAL)[0]; i: number }) {
  return (
    <div className="glass p-6 anim-in" style={{ animationDelay: `${i * 0.05}s` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{stat.icon}</span>
        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded display-font" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>LIVE</span>
      </div>
      <div className="text-3xl font-bold display-font" style={{ color: "var(--ink)" }}>{stat.value}</div>
      <div className="text-xs font-semibold mt-1" style={{ color: "var(--ink-soft)" }}>{stat.label}</div>
      <div className="text-[10px] uppercase tracking-wider mt-2" style={{ color: "var(--subtle)", fontFamily: "var(--font-mono)" }}>{stat.sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeReasoning, setActiveReasoning] = useState<ChatMsg | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMsg = { role: "user", text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    setActiveReasoning(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const agentMsg: ChatMsg = {
        role: "agent",
        text: data.response || "I apologize, I'm having trouble processing that request.",
        time: data.time || 2, // Fixed Math.random() linter issue
        confidence: data.confidence ?? 0.94,
        tools: data.tools || [],
        escalate: data.escalate || false,
        reasoning: data.reasoning || "",
      };

      setMessages((p) => [...p, agentMsg]);
      setActiveReasoning(agentMsg);
    } catch {
      setMessages((p) => [...p, { role: "agent", text: "Error connecting to AI backend.", confidence: 0, tools: [] }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 anim-in">
        <div>
          <h1 className="text-3xl font-bold display-font mb-1" style={{ color: "var(--ink)" }}>
            SupportIQ
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Autonomous AI Support Agent <span className="mx-2">·</span> MeridianHealth
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-md" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          <div className="h-2 w-2 rounded-full" style={{ background: "var(--petronas-teal)" }} />
          <span className="text-[10px] font-bold tracking-widest display-font" style={{ color: "var(--ink)" }}>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {STATS_INITIAL.map((stat, i) => <StatCard key={stat.label} stat={stat} i={i} />)}
      </div>

      {/* Main two-column */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        
        {/* Chat Panel */}
        <div className="glass flex flex-col" style={{ height: 560 }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
            <span className="font-bold text-xs uppercase tracking-wider display-font" style={{ color: "var(--ink)" }}>Customer Chat</span>
            <span className="text-[10px] font-bold tracking-wider display-font px-2 py-0.5 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>LIVE SIMULATION</span>
          </div>

          <div className="flex-1 overflow-y-auto scroll px-6 py-6 space-y-6">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-12 w-12 rounded-full mb-4 flex items-center justify-center" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 className="font-bold text-lg display-font mb-2" style={{ color: "var(--ink)" }}>Select a scenario</h3>
                <p className="text-sm mb-8" style={{ color: "var(--muted)", maxWidth: 300 }}>
                  Test the agent&apos;s autonomous resolution capabilities.
                </p>
                <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.msg)}
                      className="text-left rounded-md p-4 text-sm transition-colors duration-200"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.background = "var(--surface-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
                    >
                      <span className="font-semibold display-font">{s.label}</span>
                      <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>&quot;{s.msg}&quot;</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} anim-in`}>
                {msg.role === "agent" && (
                  <div className="h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold mr-3 mt-1 shrink-0 display-font" style={{ background: "var(--petronas-teal)", color: "white" }}>
                    AI
                  </div>
                )}
                <div
                  className="max-w-[85%] rounded-md px-5 py-4 text-sm"
                  style={
                    msg.role === "user"
                      ? { background: "var(--ink)", color: "var(--bg)", borderBottomRightRadius: 2 }
                      : { background: msg.escalate ? "var(--warning-bg)" : "var(--bg)", color: "var(--ink)", border: `1px solid ${msg.escalate ? "var(--warning)" : "var(--border)"}`, borderBottomLeftRadius: 2 }
                  }
                >
                  {msg.escalate && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider display-font" style={{ color: "var(--warning)" }}>
                      Escalated to human
                    </div>
                  )}
                  <div style={{ lineHeight: 1.6 }}>{msg.text}</div>
                  {msg.role === "agent" && (
                    <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-soft)" }}>
                      {msg.time && <span className="text-[10px] mono font-medium" style={{ color: "var(--muted)" }}>{msg.time}s</span>}
                      {msg.confidence !== undefined && <span className="text-[10px] mono font-medium" style={{ color: msg.confidence > 0.8 ? "var(--petronas-teal)" : "var(--mclaren-papaya)" }}>{Math.round(msg.confidence * 100)}% CONF</span>}
                      {msg.tools && msg.tools.length > 0 && <span className="text-[10px] mono font-medium" style={{ color: "var(--muted)" }}>{msg.tools.length} CALLS</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Message the agent..."
                disabled={isTyping}
                className="flex-1 rounded-md px-4 py-3 text-sm transition-colors duration-200"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
              <button onClick={() => sendMessage(input)} disabled={isTyping || !input.trim()} className="btn-primary px-6">
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Reasoning Trace Panel */}
        <div className="glass flex flex-col" style={{ height: 560 }}>
          <div className="flex items-center px-6 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-hover)" }}>
            <span className="font-bold text-xs uppercase tracking-wider display-font" style={{ color: "var(--ink)" }}>Reasoning Engine</span>
          </div>

          <div className="flex-1 overflow-y-auto scroll px-6 py-6">
            {!activeReasoning ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  {[
                    { label: "Model Architecture", value: "Hybrid Base + MoE" },
                    { label: "Retrieval Strategy", value: "Vector + Keyword Search" },
                    { label: "Active Tools", value: "CRM, Billing, Scheduling" },
                    { label: "Safety Protocols", value: "PII Masking, Tone Filter" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col py-3 px-4 rounded-md text-xs border border-[var(--border)]" style={{ background: "var(--bg)" }}>
                      <span className="font-bold uppercase tracking-wider mb-1 display-font" style={{ color: "var(--muted)", fontSize: "10px" }}>{item.label}</span>
                      <span className="mono font-medium" style={{ color: "var(--ink)" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 anim-in">
                {activeReasoning.reasoning && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2 display-font" style={{ color: "var(--muted)" }}>Internal Thought Process</div>
                    <div className="text-sm leading-relaxed p-4 rounded-md" style={{ background: "var(--bg)", color: "var(--ink)", borderLeft: "3px solid var(--ink)" }}>
                      {activeReasoning.reasoning}
                    </div>
                  </div>
                )}

                {activeReasoning.tools && activeReasoning.tools.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2 display-font" style={{ color: "var(--muted)" }}>Tool Executions</div>
                    <div className="space-y-3">
                      {activeReasoning.tools.map((tool, j) => (
                         <div key={j} className="rounded-md p-4 text-xs anim-in border border-[var(--border)]" style={{ background: "var(--bg)", animationDelay: `${j * 0.1}s` }}>
                           <div className="font-bold mono mb-2" style={{ color: "var(--ink)" }}>[EXECUTE] {tool.name}</div>
                           <div className="mb-1.5"><span className="font-semibold" style={{ color: "var(--muted)" }}>Payload: </span><span className="mono" style={{ color: "var(--ink)" }}>{tool.input}</span></div>
                           <div><span className="font-semibold" style={{ color: "var(--muted)" }}>Response: </span><span className="mono" style={{ color: "var(--petronas-teal)" }}>{tool.result}</span></div>
                         </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 rounded-md text-xs border" style={{ background: activeReasoning.escalate ? "var(--warning-bg)" : "var(--accent-soft)", borderColor: activeReasoning.escalate ? "var(--mclaren-papaya)" : "var(--petronas-teal)" }}>
                  <div className="h-2 w-2 rounded-full" style={{ background: activeReasoning.escalate ? "var(--mclaren-papaya)" : "var(--petronas-teal)" }} />
                  <span className="font-bold uppercase tracking-wider display-font" style={{ color: activeReasoning.escalate ? "var(--mclaren-papaya)" : "var(--petronas-teal)" }}>
                    {activeReasoning.escalate ? "Escalated" : "Resolved Autonomously"}
                  </span>
                  {activeReasoning.confidence !== undefined && (
                    <span className="ml-auto mono font-bold" style={{ color: "var(--ink)" }}>
                      {Math.round(activeReasoning.confidence * 100)}% CONFIDENCE
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI Bar */}
      <div className="glass mt-8 p-6 anim-in border-t-4" style={{ borderTopColor: "var(--ink)" }}>
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold uppercase tracking-widest display-font" style={{ color: "var(--ink)" }}>Business Impact</span>
          <span className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded bg-[var(--ink)] text-[var(--bg)] display-font">
            76.3% MARGIN
          </span>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "Human Cost (Avg)", value: "$5.50", color: "var(--ferrari-red)" },
            { label: "AI Cost (Avg)", value: "$1.30", color: "var(--petronas-teal)" },
            { label: "Net Savings", value: "$4.20", color: "var(--ink)" },
            { label: "Annualized (100k)", value: "$420,000", color: "var(--ink)" },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 display-font" style={{ color: "var(--muted)" }}>{m.label}</div>
              <div className="text-2xl font-bold mono tracking-tight" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
