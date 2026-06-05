"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Calendar, Car, Coffee, Sprout, Camera, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComponentConfig {
  id: string;
  type: string;
  label: string;
}
interface PageConfig {
  page1: ComponentConfig[];
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

function StepIndicator({ current, setStep }: { current: number, setStep: (s: number) => void }) {
  return (
    <div className="flex items-center justify-between mb-12">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const active = current === step;
        const done = current > step;
        const isClickable = done || active;

        return (
          <div key={label} className="flex flex-col items-center flex-1 relative">
            <div
              className={`h-1 w-full absolute top-3 -left-1/2 -z-10 ${i === 0 ? 'hidden' : ''}`}
              style={{ background: done || active ? "var(--ink)" : "var(--border-soft)" }}
            />
            <button
              onClick={() => isClickable && setStep(step)}
              disabled={!isClickable}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold display-font transition-all duration-300 bg-[var(--bg)] ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
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
            </button>
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

function AnimatedJourney({ step }: { step: number }) {
  const points = [
    { s: 1, Icon: Coffee, color: "var(--ink)" },
    { s: 2, Icon: Sprout, color: "var(--petronas-teal)" },
    { s: 3, Icon: Camera, color: "var(--mclaren-papaya)" },
    { s: 4, Icon: Flag, color: "var(--ferrari-red)" }
  ];

  const currentPercent = ((step - 1) / 3) * 100;

  return (
    <div className="mt-16 relative w-full pt-8 pb-4">
      {/* Background Track Line */}
      <div className="absolute bottom-6 left-0 right-0 h-0.5 bg-[var(--border)] rounded-full" />
      {/* Active Track Fill */}
      <motion.div 
        className="absolute bottom-6 left-0 h-0.5 rounded-full"
        style={{ background: "var(--ink)", width: `${currentPercent}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${currentPercent}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      />

      {/* The Car driving on the track */}
      <motion.div 
        className="absolute bottom-4 -ml-4 z-20"
        initial={{ left: "0%" }}
        animate={{ left: `${currentPercent}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
      >
        <Car className="w-8 h-8 text-[var(--ink)] drop-shadow-md" />
      </motion.div>

      {/* The Effect Stops */}
      <div className="flex justify-between relative z-10 px-1">
        {points.map((pt) => {
          const isActive = step === pt.s;
          const isPast = step > pt.s;
          const Icon = pt.Icon;
          
          return (
            <div key={pt.s} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.4 : 1,
                  y: isActive ? -12 : 0,
                  opacity: isActive || isPast ? 1 : 0.3,
                  color: isActive ? pt.color : isPast ? "var(--ink)" : "var(--muted)"
                }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mb-6"
              >
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5" />
              </motion.div>
              {/* Point on the track */}
              <div 
                className="w-2.5 h-2.5 rounded-full z-10 transition-colors duration-500" 
                style={{ background: isActive || isPast ? "var(--ink)" : "var(--border)", border: "2px solid var(--bg)", marginTop: 10 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DynamicField({ comp, formData, setFormData }: { comp: ComponentConfig; formData: Record<string, string>; setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>> }) {
  const inputClass = "w-full rounded-xl px-4 py-3.5 text-sm transition-colors duration-200 bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)] outline-none shadow-sm";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--ink-soft)] display-font";

  switch (comp.type) {
    case "about_me":
      return (
        <div className="anim-in">
          <label className={labelClass}>{comp.label}</label>
          <textarea
            value={formData.aboutMe || ""}
            onChange={(e) => setFormData((p) => ({ ...p, aboutMe: e.target.value }))}
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
            onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))}
            placeholder="Street Address"
            className={inputClass}
          />
          <div className="grid grid-cols-3 gap-4">
            <input value={formData.city || ""} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} placeholder="City" className={inputClass} />
            <input value={formData.state || ""} onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))} placeholder="State" className={inputClass} />
            <input value={formData.zip || ""} onChange={(e) => setFormData((p) => ({ ...p, zip: e.target.value }))} placeholder="ZIP" className={inputClass} />
          </div>
        </div>
      );
    case "birthdate":
      return (
        <div className="anim-in relative">
          <label className={labelClass}>{comp.label}</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
            <input
              type="date"
              value={formData.birthdate || ""}
              onChange={(e) => setFormData((p) => ({ ...p, birthdate: e.target.value }))}
              className={`${inputClass} pl-10`}
            />
          </div>
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
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setError("Failed to load configuration"))
      .finally(() => setConfigLoading(false));
  }, []);

  const simulateStream = async (messages: string[]) => {
    for (const msg of messages) {
      setStreamText(msg);
      await new Promise(r => setTimeout(r, 600)); 
    }
  };

  const handleStep1 = async () => {
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true); setError("");

    try {
      const streamPromise = simulateStream([
        "Connecting to secure database cluster...",
        "Validating credentials...",
        "Persisting secure HTTP-Only session...",
        "Routing complete."
      ]);

      let res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (res.status === 409) {
        res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, action: "login" }) });
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error");
      const user: UserData = await res.json();
      
      setUserId(user.id);
      if (user.aboutMe) setFormData((p) => ({ ...p, aboutMe: user.aboutMe! }));
      if (user.street) setFormData((p) => ({ ...p, street: user.street! }));
      if (user.city) setFormData((p) => ({ ...p, city: user.city! }));
      if (user.state) setFormData((p) => ({ ...p, state: user.state! }));
      if (user.zip) setFormData((p) => ({ ...p, zip: user.zip! }));
      if (user.birthdate) setFormData((p) => ({ ...p, birthdate: user.birthdate! }));

      await streamPromise; 
      setStep(Math.max(2, Math.min(user.step || 2, 4)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally { 
      setLoading(false); 
      setStreamText("");
    }
  };

  const handleStepSubmit = async (nextStep: number) => {
    if (!userId) return;
    setLoading(true); setError("");
    
    try {
      const streamPromise = simulateStream([
        "Connecting to PostgreSQL database...",
        `Executing PATCH /api/users/${userId}...`,
        "Updating dynamic schema records...",
        "Success."
      ]);

      const res = await fetch(`/api/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, step: nextStep }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error");
      
      await streamPromise;
      setStep(nextStep);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save progress");
    } finally { 
      setLoading(false); 
      setStreamText("");
    }
  };

  const currentComponents = step === 1 ? config?.page1 : step === 2 ? config?.page2 : step === 3 ? config?.page3 : [];
  
  // Background Tint Logic
  const getTint = () => {
    if (step === 1) return "rgba(0,0,0,0)";
    if (step === 2) return "rgba(0, 161, 155, 0.03)"; // Petronas Teal Tint
    if (step === 3) return "rgba(255, 128, 0, 0.03)"; // Papaya Tint
    return "rgba(239, 26, 45, 0.03)"; // Ferrari Red Tint
  };

  const getBorderTop = () => {
    if (step === 1) return "3px solid transparent";
    if (step === 2) return "3px solid var(--petronas-teal)";
    if (step === 3) return "3px solid var(--mclaren-papaya)";
    return "3px solid var(--ferrari-red)";
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16 flex flex-col min-h-screen justify-center">
      {step === 4 && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={600} colors={['#00A19B', '#FF8000', '#EF1A2D', '#001A30']} gravity={0.15} />}
      
      <div className="mb-12 text-center anim-in">
        <h1 className="text-3xl font-bold display-font mb-2 text-[var(--ink)] tracking-tight">SupportIQ</h1>
        <p className="text-sm text-[var(--muted)] font-medium">Configure your workspace</p>
      </div>

      <StepIndicator current={step} setStep={setStep} />

      {error && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm font-medium anim-fade border border-[var(--error)] bg-[var(--error-bg)] text-[var(--error)] shadow-sm">
          {error}
        </div>
      )}

      {/* Dynamic Background Tint and Border */}
      <motion.div 
        animate={{ backgroundColor: getTint(), borderTop: getBorderTop() }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass p-8 anim-in shadow-sm"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={step} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.3 }}
          >
            {configLoading && step < 4 ? (
               <div className="flex justify-center py-12">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/></svg>
               </div>
            ) : (
              <>
                {/* STEP 1: Email/Password + Optional Dynamic Page 1 Fields */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--ink-soft)] display-font">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full rounded-xl px-4 py-3.5 text-sm bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)] outline-none shadow-sm transition-colors duration-200" onKeyDown={(e) => e.key === "Enter" && handleStep1()} disabled={loading} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--ink-soft)] display-font">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl px-4 py-3.5 text-sm bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)] outline-none shadow-sm transition-colors duration-200" onKeyDown={(e) => e.key === "Enter" && handleStep1()} disabled={loading} />
                    </div>
                    
                    {/* Render Page 1 Configured Fields */}
                    {currentComponents?.map((comp) => <DynamicField key={comp.id} comp={comp} formData={formData} setFormData={setFormData} />)}

                    <button onClick={handleStep1} disabled={loading} className="btn-primary w-full mt-4 h-12 flex justify-center items-center shadow-sm">
                      {loading ? <div className="h-5 w-5 rounded-full border-[3px] border-white border-t-transparent animate-spin"></div> : "Continue"}
                    </button>
                  </div>
                )}

                {/* STEP 2 & 3: Dynamic Fields */}
                {(step === 2 || step === 3) && (
                  <div className="space-y-6">
                    {currentComponents?.map((comp) => <DynamicField key={comp.id} comp={comp} formData={formData} setFormData={setFormData} />)}
                    {(!currentComponents || currentComponents.length === 0) && <p className="text-center py-8 text-[var(--muted)] text-sm font-medium">No fields configured for this step.</p>}
                    
                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setStep(step - 1)} disabled={loading} className="btn-secondary w-1/3 shadow-sm">Back</button>
                      <button onClick={() => handleStepSubmit(step + 1)} disabled={loading} className="btn-primary flex-1 flex justify-center items-center shadow-sm">
                        {loading ? <div className="h-5 w-5 rounded-full border-[3px] border-white border-t-transparent animate-spin"></div> : step === 3 ? "Complete" : "Continue"}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Completion */}
                {step === 4 && (
                  <div className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)] shadow-md">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold display-font mb-2 text-[var(--ink)]">Setup Complete!</h2>
                    <p className="text-sm text-[var(--muted)] mb-8 font-medium">Your profile data has been securely saved to PostgreSQL.</p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => window.location.href = '/dashboard'} className="btn-primary shadow-sm hover:-translate-y-0.5 transition-transform">View Dashboard</button>
                      <button onClick={() => window.location.href = '/admin'} className="btn-secondary shadow-sm hover:-translate-y-0.5 transition-transform">View Admin</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Live Processing Stream */}
        <div className="h-8 mt-4 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {loading && streamText && (
              <motion.div 
                key={streamText}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--petronas-teal)] animate-pulse shadow-[0_0_8px_var(--petronas-teal)]" />
                <span className="text-[11px] font-mono font-bold text-[var(--muted)] uppercase tracking-wider">{streamText}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* The Animated Car Journey Tracker */}
      <AnimatedJourney step={step} />
      
    </div>
  );
}
