"use client";

import { useEffect, useState, useRef } from "react";

interface ComponentConfig {
  id: string;
  type: string;
  label: string;
}
interface PageConfig {
  page2: ComponentConfig[];
  page3: ComponentConfig[];
}
interface UserData {
  id: string;
  email: string;
  step: number;
  aboutMe?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  birthdate?: string;
}

const STEPS = ["Account", "Profile", "Details", "Complete"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-12">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const active = current === step;
        const done = current > step;

        return (
          <div key={label} className="flex flex-col items-center flex-1 relative">
            <div
              className={`h-1 w-full absolute top-3 -left-1/2 -z-10 ${i === 0 ? 'hidden' : ''}`}
              style={{ background: done || active ? "var(--ink)" : "var(--border-soft)" }}
            />
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold display-font transition-all duration-300 bg-[var(--bg)]"
              style={{
                border: `2px solid ${active || done ? "var(--ink)" : "var(--border)"}`,
                color: active || done ? "var(--ink)" : "var(--muted)",
              }}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span
              className="mt-3 text-[10px] uppercase tracking-wider font-semibold display-font"
              style={{ color: active ? "var(--ink)" : "var(--muted)" }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DynamicField({ comp, formData, setFormData, logConsole }: { comp: ComponentConfig; formData: Record<string, string>; setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>, logConsole: (m: string) => void }) {
  const inputClass = "w-full rounded px-4 py-3 text-sm transition-colors duration-200 bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)]";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--ink-soft)] display-font";

  const handleChange = (field: string, val: string) => {
    setFormData((p) => ({ ...p, [field]: val }));
    logConsole(`[Client] Update state: ${field} = ${val}`);
  };

  switch (comp.type) {
    case "about_me":
      return (
        <div className="anim-in">
          <label className={labelClass}>{comp.label}</label>
          <textarea
            value={formData.aboutMe || ""}
            onChange={(e) => handleChange("aboutMe", e.target.value)}
            rows={4}
            className={inputClass}
            style={{ resize: "vertical" }}
          />
        </div>
      );
    case "address":
      return (
        <div className="space-y-4 anim-in">
          <label className={labelClass}>{comp.label}</label>
          <input
            value={formData.street || ""}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="Street Address"
            className={inputClass}
          />
          <div className="grid grid-cols-3 gap-4">
            <input value={formData.city || ""} onChange={(e) => handleChange("city", e.target.value)} placeholder="City" className={inputClass} />
            <input value={formData.state || ""} onChange={(e) => handleChange("state", e.target.value)} placeholder="State" className={inputClass} />
            <input value={formData.zip || ""} onChange={(e) => handleChange("zip", e.target.value)} placeholder="ZIP" className={inputClass} />
          </div>
        </div>
      );
    case "birthdate":
      return (
        <div className="anim-in">
          <label className={labelClass}>{comp.label}</label>
          <input
            type="date"
            value={formData.birthdate || ""}
            onChange={(e) => handleChange("birthdate", e.target.value)}
            className={inputClass}
          />
        </div>
      );
    default:
      return null;
  }
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configLoading, setConfigLoading] = useState(true);

  // Live Console State
  const [consoleLogs, setConsoleLogs] = useState<{ id: number, text: string }[]>([
    { id: 0, text: "[System] Initializing Onboarding Application..." },
    { id: 1, text: "[System] Fetching dynamic form configuration..." }
  ]);
  const consoleRef = useRef<HTMLDivElement>(null);
  let logId = 2;

  const logConsole = (text: string) => {
    setConsoleLogs(prev => [...prev, { id: logId++, text }]);
    setTimeout(() => {
      if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }, 50);
  };

  useEffect(() => {
    fetch("/api/config")
      .then((r) => {
        logConsole(`[Network] GET /api/config returned ${r.status}`);
        return r.json();
      })
      .then((d) => {
        logConsole(`[Config] Successfully parsed dynamic page config.`);
        setConfig(d);
      })
      .catch(() => {
        logConsole(`[Error] Failed to fetch config!`);
        setError("Failed to load configuration");
      })
      .finally(() => setConfigLoading(false));
  }, []);

  const handleStep1 = async () => {
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true); setError("");

    logConsole(`[Network] POST /api/users with credentials`);
    try {
      let res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      
      if (res.status === 409) {
        logConsole(`[Network] User exists. Triggering fallback login bypass...`);
        res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, action: "login" }) });
      }
      
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error");
      const user: UserData = await res.json();
      
      logConsole(`[Database] PostgreSQL returned user ID: ${user.id}`);
      logConsole(`[Auth] HttpOnly 'supportiq_session' cookie set.`);
      setUserId(user.id);

      if (user.aboutMe) setFormData((p) => ({ ...p, aboutMe: user.aboutMe! }));
      if (user.street) setFormData((p) => ({ ...p, street: user.street! }));
      if (user.city) setFormData((p) => ({ ...p, city: user.city! }));
      if (user.state) setFormData((p) => ({ ...p, state: user.state! }));
      if (user.zip) setFormData((p) => ({ ...p, zip: user.zip! }));
      if (user.birthdate) setFormData((p) => ({ ...p, birthdate: user.birthdate! }));

      const nextStep = Math.max(2, Math.min(user.step || 2, 4));
      logConsole(`[Router] Advancing to Step ${nextStep}`);
      setStep(nextStep);
    } catch (err: unknown) {
      logConsole(`[Error] Auth failed: ${err instanceof Error ? err.message : "Unknown"}`);
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally { setLoading(false); }
  };

  const handleStepSubmit = async (nextStep: number) => {
    if (!userId) return;
    setLoading(true); setError("");
    
    logConsole(`[Network] PATCH /api/users/${userId}`);
    logConsole(`[Payload] ${JSON.stringify(formData)}`);
    
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, step: nextStep }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error");
      
      logConsole(`[Database] PostgreSQL record successfully updated.`);
      logConsole(`[Router] Advancing to Step ${nextStep}`);
      setStep(nextStep);
    } catch (err: unknown) {
      logConsole(`[Error] Update failed: ${err instanceof Error ? err.message : "Unknown"}`);
      setError(err instanceof Error ? err.message : "Failed to save progress");
    } finally { setLoading(false); }
  };

  const currentComponents = step === 2 ? config?.page2 : step === 3 ? config?.page3 : [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)]">
      
      {/* LEFT SIDE: Onboarding Form */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-lg px-6 py-16">
          <div className="mb-12 text-center anim-in">
            <h1 className="text-3xl font-bold display-font mb-2 text-[var(--ink)]">SupportIQ</h1>
            <p className="text-sm text-[var(--muted)]">Create your account</p>
          </div>

          <StepIndicator current={step} />

          {error && (
            <div className="mb-6 rounded px-4 py-3 text-sm font-medium anim-fade border border-[var(--error)] bg-[var(--error-bg)] text-[var(--error)]">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="glass p-8 anim-in">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--ink-soft)] display-font">Email</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); logConsole(`[Input] email=${e.target.value}`); }} placeholder="you@company.com" className="w-full rounded px-4 py-3 text-sm transition-colors duration-200 bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)]" onKeyDown={(e) => e.key === "Enter" && handleStep1()} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--ink-soft)] display-font">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded px-4 py-3 text-sm transition-colors duration-200 bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)]" onKeyDown={(e) => e.key === "Enter" && handleStep1()} />
                </div>
              </div>
              <button onClick={handleStep1} disabled={loading} className="btn-primary w-full mt-8 h-11 flex justify-center items-center">
                {loading ? "Authenticating..." : "Continue"}
              </button>
            </div>
          )}

          {(step === 2 || step === 3) && (
            <div className="glass p-8 anim-in" key={step}>
              {configLoading ? (
                 <div className="flex justify-center py-12">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/></svg>
                 </div>
              ) : (
                <div className="space-y-6">
                  {currentComponents?.map((comp) => <DynamicField key={comp.id} comp={comp} formData={formData} setFormData={setFormData} logConsole={logConsole} />)}
                  {(!currentComponents || currentComponents.length === 0) && <p className="text-center py-8 text-[var(--muted)] text-sm">No fields configured.</p>}
                </div>
              )}
              <div className="flex gap-4 mt-8">
                <button onClick={() => { setStep(step - 1); logConsole(`[Router] Back to Step ${step - 1}`); }} className="btn-secondary w-1/3">Back</button>
                <button onClick={() => handleStepSubmit(step + 1)} disabled={loading} className="btn-primary flex-1">
                  {loading ? "Saving..." : step === 3 ? "Complete" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="glass p-12 text-center anim-in">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="text-2xl font-bold display-font mb-2 text-[var(--ink)]">Account Ready</h2>
              <p className="text-sm text-[var(--muted)] mb-8">Your profile data has been securely saved to PostgreSQL.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">View Dashboard</button>
                <button onClick={() => window.location.href = '/admin'} className="btn-secondary">View Admin</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Live Technical Console */}
      <div className="w-[400px] border-l border-[var(--border)] bg-[#0A0A0A] flex flex-col hidden lg:flex">
        <div className="flex items-center px-6 py-4 border-b border-[rgba(255,255,255,0.1)] shrink-0">
          <div className="h-2 w-2 rounded-full bg-[var(--petronas-teal)] mr-3 animate-pulse"></div>
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">Live Technical Console</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-[11px]" ref={consoleRef}>
          {consoleLogs.map(log => (
            <div key={log.id} className="text-[#A3A3A3] break-all anim-fade">
              <span className="text-[#525252] mr-2">{'>'}</span>
              {log.text.includes("[Database]") ? (
                <span className="text-[var(--petronas-teal)]">{log.text}</span>
              ) : log.text.includes("[Error]") ? (
                <span className="text-[var(--ferrari-red)]">{log.text}</span>
              ) : log.text.includes("[Auth]") ? (
                <span className="text-yellow-400">{log.text}</span>
              ) : (
                log.text
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
