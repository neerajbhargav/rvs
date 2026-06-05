"use client";

import { useState, useRef, useEffect } from "react";

/* ── Types ── */
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

/* ── Constants ── */
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

/* ── Typing Indicator ── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
      >
        AI
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full"
            style={{
              background: "var(--accent)",
              animation: `typing-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ stat, i }: { stat: (typeof STATS_INITIAL)[0]; i: number }) {
  return (
    <div
      className="glass glass-hover p-5 anim-in"
      style={{ animationDelay: `${i * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{stat.icon}</span>
        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>LIVE</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{stat.value}</div>
      <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{stat.sub}</div>
      <div className="text-xs font-medium mt-1" style={{ color: "var(--subtle)" }}>{stat.label}</div>
    </div>
  );
}

/* ── Main Dashboard ── */
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
        time: data.time || Math.floor(Math.random() * 3 + 1),
        confidence: data.confidence ?? 0.94,
        tools: data.tools || [],
        escalate: data.escalate || false,
        reasoning: data.reasoning || "",
      };

      setMessages((p) => [...p, agentMsg]);
      setActiveReasoning(agentMsg);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "agent",
          text: "Sorry, I encountered an error. Please try again.",
          confidence: 0,
          tools: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 anim-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
            <span className="gradient-text">SupportIQ</span> Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Live AI customer support agent · <span className="font-medium" style={{ color: "var(--ink-soft)" }}>MeridianHealth</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)" }}>
          <div className="h-2.5 w-2.5 rounded-full pulse-dot" style={{ background: "var(--accent)" }} />
          <span className="text-xs font-bold tracking-wider" style={{ color: "var(--accent)" }}>AGENT ONLINE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATS_INITIAL.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} i={i} />
        ))}
      </div>

      {/* Main two-column */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "3fr 2fr" }}>
        {/* Chat Panel */}
        <div className="glass flex flex-col" style={{ height: 520 }}>
          {/* Chat Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Customer Conversation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-[10px] font-bold tracking-wider" style={{ color: "var(--accent)" }}>LIVE</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scroll px-5 py-4 space-y-4">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>Try a customer scenario</h3>
                <p className="text-xs mb-6" style={{ color: "var(--muted)", maxWidth: 300 }}>
                  Click a scenario below to see the AI agent in action with real reasoning and tool calls.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.msg)}
                      className="text-left rounded-lg p-3 text-xs transition-all duration-200"
                      style={{
                        background: "var(--surface-hover)",
                        border: "1px solid var(--border)",
                        color: "var(--ink-soft)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.background = "var(--accent-soft)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--surface-hover)";
                      }}
                    >
                      <span className="text-lg block mb-1">{s.emoji}</span>
                      <span className="font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} anim-in`}>
                {msg.role === "agent" && (
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-1 shrink-0"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    AI
                  </div>
                )}
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                  style={
                    msg.role === "user"
                      ? {
                          background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                          color: "white",
                          borderBottomRightRadius: 4,
                        }
                      : {
                          background: msg.escalate ? "var(--warning-bg)" : "var(--surface-hover)",
                          color: "var(--ink)",
                          border: `1px solid ${msg.escalate ? "var(--warning)" : "var(--border)"}`,
                          borderBottomLeftRadius: 4,
                        }
                  }
                >
                  {msg.escalate && (
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color: "var(--warning)" }}>
                      ⚠️ Escalated to human agent
                    </div>
                  )}
                  <div style={{ lineHeight: 1.6 }}>{msg.text}</div>
                  {msg.role === "agent" && (
                    <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: "1px solid var(--border-soft)" }}>
                      {msg.time && (
                        <span className="text-[10px] mono" style={{ color: "var(--subtle)" }}>
                          {msg.time}s
                        </span>
                      )}
                      {msg.confidence !== undefined && (
                        <span className="text-[10px] mono" style={{ color: msg.confidence > 0.8 ? "var(--accent)" : "var(--warning)" }}>
                          {Math.round(msg.confidence * 100)}% conf
                        </span>
                      )}
                      {msg.tools && msg.tools.length > 0 && (
                        <span className="text-[10px] mono" style={{ color: "var(--subtle)" }}>
                          {msg.tools.length} tool{msg.tools.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Type a customer message..."
                disabled={isTyping}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm"
                style={{
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isTyping || !input.trim()}
                className="btn-primary px-4 py-2.5 flex items-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Reasoning Trace Panel */}
        <div className="glass flex flex-col" style={{ height: 520 }}>
          <div
            className="flex items-center gap-2 px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="text-sm">🧠</span>
            <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Agent Reasoning Trace</span>
          </div>

          <div className="flex-1 overflow-y-auto scroll px-5 py-4">
            {!activeReasoning ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">🤖</div>
                  <p className="text-xs font-medium mb-6" style={{ color: "var(--muted)" }}>
                    Send a message to see the agent&apos;s reasoning process
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Model", value: "Claude Sonnet 4" },
                    { label: "Retrieval", value: "Hybrid BM25 + Dense" },
                    { label: "Tools", value: "Policy Lookup, Eligibility, Scheduling" },
                    { label: "Guardrails", value: "PII Filter, Escalation Rules" },
                    { label: "Latency Target", value: "< 3 seconds p95" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center py-2 px-3 rounded-lg text-xs"
                      style={{ background: "var(--surface-hover)" }}
                    >
                      <span className="font-medium" style={{ color: "var(--muted)" }}>{item.label}</span>
                      <span className="mono font-medium" style={{ color: "var(--ink-soft)" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 anim-in">
                {/* Reasoning */}
                {activeReasoning.reasoning && (
                  <div>
                    <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "var(--subtle)" }}>
                      REASONING
                    </div>
                    <div
                      className="text-xs leading-relaxed p-3 rounded-lg"
                      style={{
                        background: "var(--surface-hover)",
                        color: "var(--ink-soft)",
                        borderLeft: "3px solid var(--accent)",
                      }}
                    >
                      {activeReasoning.reasoning}
                    </div>
                  </div>
                )}

                {/* Tool Calls */}
                {activeReasoning.tools && activeReasoning.tools.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: "var(--subtle)" }}>
                      TOOL CALLS ({activeReasoning.tools.length})
                    </div>
                    <div className="space-y-2">
                      {activeReasoning.tools.map((tool, j) => (
                        <div
                          key={j}
                          className="rounded-lg p-3 text-xs anim-in"
                          style={{
                            background: "var(--surface-hover)",
                            borderLeft: "3px solid var(--gradient-end)",
                            animationDelay: `${j * 0.1}s`,
                          }}
                        >
                          <div className="font-bold mono mb-1.5" style={{ color: "var(--ink)" }}>
                            🔧 {tool.name}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold" style={{ color: "var(--muted)" }}>Input: </span>
                            <span className="mono" style={{ color: "var(--ink-soft)" }}>{tool.input}</span>
                          </div>
                          <div>
                            <span className="font-semibold" style={{ color: "var(--muted)" }}>Result: </span>
                            <span className="mono" style={{ color: "var(--accent)" }}>{tool.result}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion */}
                <div
                  className="flex items-center gap-2 p-3 rounded-lg text-xs"
                  style={{
                    background: activeReasoning.escalate ? "var(--warning-bg)" : "var(--accent-soft)",
                    border: `1px solid ${activeReasoning.escalate ? "var(--warning)" : "var(--accent)"}`,
                  }}
                >
                  <span>{activeReasoning.escalate ? "⚠️" : "✅"}</span>
                  <span className="font-semibold" style={{ color: activeReasoning.escalate ? "var(--warning)" : "var(--accent)" }}>
                    {activeReasoning.escalate ? "Escalated to human agent" : "Resolved autonomously"}
                  </span>
                  {activeReasoning.confidence !== undefined && (
                    <span className="ml-auto mono font-bold" style={{ color: activeReasoning.confidence > 0.8 ? "var(--accent)" : "var(--warning)" }}>
                      {Math.round(activeReasoning.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI Bar */}
      <div className="glass mt-6 p-6 anim-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>Business Case</span>
              <span className="text-xs" style={{ color: "var(--subtle)" }}>· The math.</span>
            </div>
          </div>
          <span
            className="text-xs font-bold tracking-wider px-3 py-1.5 rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
              color: "white",
            }}
          >
            76% MARGIN
          </span>
        </div>
        <div className="grid grid-cols-4 gap-6 mt-4">
          {[
            { label: "Human ticket cost", value: "$5.50", color: "var(--error)" },
            { label: "SupportIQ cost", value: "$1.30", color: "var(--accent)" },
            { label: "Savings per ticket", value: "$4.20", color: "var(--ink)" },
            { label: "100K tickets/yr", value: "$420K saved", color: "var(--accent)" },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{m.label}</div>
              <div className="text-lg font-bold mono" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 mb-4">
        <p className="text-[10px] tracking-[0.2em] font-semibold" style={{ color: "var(--subtle)" }}>
          PROTOTYPE · BUILT BY NEERAJ BHARGAV · FOR REVOLUTION VENTURE STUDIOS
        </p>
      </div>
    </div>
  );
}
