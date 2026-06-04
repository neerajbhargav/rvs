"use client";

import { useState, useRef, useEffect } from "react";

interface ToolCall { name: string; input: string; result: string; }
interface Message { role: "user" | "assistant"; content: string; meta?: { time: string; confidence: number; tools: ToolCall[]; escalated: boolean; }; }

const SCENARIOS = [
  { label: "Insurance", emoji: "🏥", q: "Will my Aetna PPO cover a therapy session? What's the copay?" },
  { label: "Refill", emoji: "💊", q: "I need to refill my Lisinopril prescription. How long will it take?" },
  { label: "Cancel", emoji: "📅", q: "I need to cancel my appointment that's in 3 hours. Will I be charged?" },
  { label: "Dispute", emoji: "⚠️", q: "I want to dispute a $250 charge from last month." },
];

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mono mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{label}</div>
      <div className="text-2xl font-semibold" style={{ color: accent ? "var(--accent)" : "var(--ink)", fontFamily: "Georgia, serif" }}>{value}</div>
      <div className="mono mt-1 text-[10px] text-[var(--subtle)]">{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<{ reasoning: string; tools: ToolCall[] } | null>(null);
  const [stats, setStats] = useState({ resolved: 0, escalated: 0, totalTime: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    setTrace(null);

    const start = Date.now();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      setTrace({ reasoning: data.reasoning, tools: data.tools || [] });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        meta: { time: elapsed, confidence: data.confidence, tools: data.tools || [], escalated: data.escalate },
      }]);
      setStats(prev => ({
        resolved: prev.resolved + 1,
        escalated: prev.escalated + (data.escalate ? 1 : 0),
        totalTime: prev.totalTime + parseFloat(elapsed),
      }));
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue — in production this triggers automatic human failover." }]);
    }
    setLoading(false);
  }

  const avgTime = stats.resolved ? (stats.totalTime / stats.resolved).toFixed(1) : "—";
  const deflection = stats.resolved ? Math.round(((stats.resolved - stats.escalated) / stats.resolved) * 100) : 100;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">
            Support<span className="text-[var(--accent)]">IQ</span> Dashboard
          </h1>
          <p className="text-sm text-[var(--muted)]">Live AI customer support agent · MeridianHealth</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-3 py-1.5">
          <div className="pulse-dot h-2 w-2 rounded-full bg-[var(--accent)]" />
          <span className="mono text-[10px] font-semibold text-[var(--accent)]">AGENT ONLINE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard label="Resolved" value={`${stats.resolved}`} sub={`${stats.escalated} escalated`} />
        <StatCard label="Deflection Rate" value={stats.resolved ? `${deflection}%` : "—"} sub="Industry avg: 70%" accent />
        <StatCard label="Avg Resolution" value={`${avgTime}`} sub={stats.resolved ? "seconds" : "awaiting first query"} />
        <StatCard label="Cost Saved" value={stats.resolved ? `$${(stats.resolved * 4.2).toFixed(2)}` : "—"} sub="$4.20 per ticket" accent />
      </div>

      {/* Main Grid: Chat + Trace */}
      <div className="grid grid-cols-[1fr_380px] gap-5">
        {/* Chat */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]" style={{ height: "560px" }}>
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-5 py-3 rounded-t-xl">
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Customer Conversation</span>
            <span className="mono text-[10px] font-bold text-[var(--accent)]">● LIVE</span>
          </div>

          <div className="scroll flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="py-8 text-center">
                <h2 className="mb-2 text-lg font-semibold text-[var(--ink)]" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                  Try a customer scenario
                </h2>
                <p className="mb-5 text-sm text-[var(--muted)]">Each query runs through retrieval, policy lookup, and grounded generation.</p>
                <div className="grid grid-cols-2 gap-3 mx-auto max-w-md">
                  {SCENARIOS.map((s, i) => (
                    <button key={i} onClick={() => send(s.q)}
                      className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 text-left transition hover:border-[var(--accent)] hover:shadow-sm">
                      <span className="mb-2 block text-lg">{s.emoji}</span>
                      <span className="text-xs font-medium text-[var(--ink)]">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className="anim-in mb-4" style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div className="max-w-[80%] rounded-xl px-4 py-3" style={{
                  background: m.role === "user" ? "var(--ink)" : "var(--accent-soft)",
                  color: m.role === "user" ? "white" : "var(--ink)",
                  border: m.role === "user" ? "none" : "1px solid var(--accent)",
                  borderColor: m.role === "user" ? undefined : "rgba(29,77,62,0.2)",
                }}>
                  <div className="mono mb-1 text-[9px] font-bold uppercase tracking-wider" style={{ opacity: 0.6 }}>
                    {m.role === "user" ? "Customer" : "SupportIQ Agent"}
                  </div>
                  <div className="text-sm leading-relaxed">{m.content}</div>
                  {m.meta && (
                    <div className="mt-2 flex flex-wrap gap-2 border-t pt-2 text-[9px]" style={{ borderColor: m.role === "user" ? "rgba(255,255,255,0.1)" : "rgba(29,77,62,0.15)" }}>
                      <span className="mono" style={{ color: "var(--accent)" }}>{m.meta.time}s</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span className="mono">{m.meta.tools.length} tool{m.meta.tools.length !== 1 ? "s" : ""}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span className="mono font-bold" style={{ color: m.meta.confidence > 90 ? "var(--accent)" : "var(--warning)" }}>
                        {m.meta.confidence}% conf
                      </span>
                      {m.meta.escalated && (
                        <>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span className="mono font-bold" style={{ color: "var(--warning)" }}>⚠ ESCALATED</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-1.5 px-4 py-3">
                <div className="pulse-dot h-2 w-2 rounded-full bg-[var(--accent)]" />
                <div className="pulse-dot h-2 w-2 rounded-full bg-[var(--accent)]" style={{ animationDelay: "0.2s" }} />
                <div className="pulse-dot h-2 w-2 rounded-full bg-[var(--accent)]" style={{ animationDelay: "0.4s" }} />
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div className="flex gap-2 border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 rounded-b-xl">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Type a customer query..." disabled={loading}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10" />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-40">
              Send
            </button>
          </div>
        </div>

        {/* Agent Trace Panel */}
        <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]" style={{ height: "560px" }}>
          <div className="border-b border-[var(--border)] bg-[var(--bg)] px-5 py-3 rounded-t-xl">
            <span className="mono text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">🧠 Agent Reasoning Trace</span>
            <p className="mt-1 text-[11px] text-[var(--muted)]">Real-time view of every decision step.</p>
          </div>

          <div className="scroll flex-1 overflow-y-auto p-4">
            {!trace && messages.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-xs italic text-[var(--subtle)]">Awaiting first query...</p>
                <div className="mt-6 space-y-3">
                  <div className="mono text-[9px] font-bold uppercase tracking-wider text-[var(--subtle)]">Architecture</div>
                  {[
                    ["Model", "Claude Sonnet 4"],
                    ["Retrieval", "Hybrid (BM25 + Dense)"],
                    ["Vector DB", "Pinecone / pgvector"],
                    ["Eval", "RAGAS + LangSmith"],
                    ["Pricing", "Per-resolution ($0.99)"],
                    ["Compliance", "HIPAA · SOC 2"],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="text-[var(--muted)]">{k}</span>
                      <span className="mono font-semibold text-[var(--accent)]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trace && (
              <div className="anim-in space-y-3">
                {/* Reasoning */}
                <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg)] p-3">
                  <div className="mono mb-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">💭 Reasoning</div>
                  <p className="text-xs italic text-[var(--ink-soft)]">{trace.reasoning}</p>
                </div>

                {/* Tool calls */}
                {trace.tools.map((t, i) => (
                  <div key={i}>
                    <div className="rounded-lg border-l-[3px] border-[var(--accent)] bg-[var(--bg)] p-3">
                      <div className="mono mb-1 text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">⚡ Tool Call</div>
                      <div className="mono text-xs font-semibold text-[var(--ink)]">{t.name}()</div>
                      <div className="mono mt-1 text-[10px] text-[var(--muted)]">
                        input: <span className="text-[var(--gold)]">&quot;{t.input}&quot;</span>
                      </div>
                    </div>
                    <div className="ml-4 mt-1 rounded-lg border-l-[3px] border-[var(--accent-hover)] bg-[var(--accent-soft)] p-3">
                      <div className="mono mb-1 text-[9px] font-bold text-[var(--accent)]">✓ RESULT</div>
                      <div className="mono text-[10px] text-[var(--accent-hover)]">{t.result}</div>
                    </div>
                  </div>
                ))}

                {/* Completion */}
                <div className="rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-3">
                  <div className="mono text-[10px] font-bold text-[var(--accent)]">✓ Response synthesized and delivered</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI Bar */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div>
          <div className="mono text-[9px] font-bold uppercase tracking-widest text-[var(--accent)]">Business Case</div>
          <div className="text-lg font-semibold text-[var(--ink)]" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>The math.</div>
        </div>
        <div className="flex gap-8">
          {[
            { label: "Human ticket cost", value: "$5.50" },
            { label: "SupportIQ cost", value: "$1.30" },
            { label: "Savings/ticket", value: "$4.20", accent: true },
            { label: "100K tickets/yr", value: "$420K saved", accent: true },
          ].map((m, i) => (
            <div key={i} className="text-right">
              <div className="mono text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">{m.label}</div>
              <div className="text-lg font-semibold" style={{ color: m.accent ? "var(--accent)" : "var(--ink)" }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-4 py-2">
          <span className="mono text-xs font-bold text-[var(--accent)]">76% MARGIN</span>
        </div>
      </div>

      <div className="mono mt-4 text-center text-[10px] text-[var(--subtle)]">
        PROTOTYPE · BUILT BY NEERAJ BHARGAV · FOR REVOLUTION VENTURE STUDIOS
      </div>
    </div>
  );
}
