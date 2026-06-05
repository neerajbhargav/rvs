"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

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

function CoffeeBrewing() {
  return (
    <div className="absolute -top-10 -right-4 opacity-50">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <motion.line x1="6" y1="1" x2="6" y2="4" animate={{ y: [0, -3, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
        <motion.line x1="10" y1="1" x2="10" y2="4" animate={{ y: [0, -4, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.2, delay: 0.2 }} />
        <motion.line x1="14" y1="1" x2="14" y2="4" animate={{ y: [0, -3, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.8, delay: 0.4 }} />
      </svg>
    </div>
  );
}

function CameraClicking() {
  return (
    <div className="absolute -top-10 -right-4 opacity-50">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
        <motion.circle cx="19" cy="10" r="1" animate={{ fill: ["var(--bg)", "var(--ink)", "var(--bg)"], r: [1, 3, 1], opacity: [1, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }} />
      </svg>
    </div>
  );
}

function FlowersBlooming() {
  return (
    <div className="absolute -top-10 -right-4 opacity-50">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22v-8" />
        <motion.path d="M12 18c-2-2-4-2-4 0s2 2 4 0z" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} style={{ transformOrigin: "12px 18px" }} />
        <motion.path d="M12 16c2-2 4-2 4 0s-2 2-4 0z" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} style={{ transformOrigin: "12px 16px" }} />
        <motion.path d="M12 14c-1-2-3-2-3 0s2 2 3 0z" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} style={{ transformOrigin: "12px 14px" }} />
        <motion.path d="M12 14c1-2 3-2 3 0s-2 2-3 0z" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} style={{ transformOrigin: "12px 14px" }} />
        <motion.circle cx="12" cy="12" r="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} style={{ transformOrigin: "12px 12px" }} />
      </svg>
    </div>
  );
}

function CarProgress({ step }: { step: number }) {
  const progress = (step - 1) * 33.33;
  return (
    <div className="w-full h-8 relative mt-4 mb-8 border-b-2 border-dashed border-[var(--border-soft)]">
      <motion.div
        animate={{ left: `${progress}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
        className="absolute bottom-0 -ml-4"
      >
        <svg width="32" height="16" viewBox="0 0 32 16" fill="var(--ink)">
          <path d="M4 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm18 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM27.5 5H22V3c0-1.1-.9-2-2-2H10C8.9 1 8 1.9 8 3v2H4.5C3.1 5 2 6.1 2 7.5V10h1.1A3.99 3.99 0 0 1 11 10h8.1A3.99 3.99 0 0 1 27 10h3V7.5c0-1.4-1.1-2.5-2.5-2.5z" />
          <motion.path d="M1 9h2" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" animate={{ x: [-5, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} />
          <motion.path d="M1 7h3" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" animate={{ x: [-8, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
        </svg>
      </motion.div>
    </div>
  );
}

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
              className={`h-1 w-full absolute top-3 -left-1/2 -z-10 ${i === 0 ? 'hidden' : ''} transition-colors duration-500`}
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
              className="mt-3 text-[10px] uppercase tracking-wider font-semibold display-font transition-colors duration-300"
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
        <div className="anim-in">
          <label className={labelClass}>{comp.label}</label>
          <input
            type="date"
            value={formData.birthdate || ""}
            onChange={(e) => setFormData((p) => ({ ...p, birthdate: e.target.value }))}
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
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const [configLoading, setConfigLoading] = useState(true);

  // Track the previous step to determine sliding direction
  const [prevStep, setPrevStep] = useState(1);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setError("Failed to load configuration"))
      .finally(() => setConfigLoading(false));
  }, []);

  const handleSetStep = (newStep: number) => {
    setPrevStep(step);
    setStep(newStep);
  };

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
      handleSetStep(Math.max(2, Math.min(user.step || 2, 4)));
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
      handleSetStep(nextStep);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save progress");
    } finally { 
      setLoading(false); 
      setStreamText("");
    }
  };

  const currentComponents = step === 2 ? config?.page2 : step === 3 ? config?.page3 : [];
  
  const getTint = () => {
    if (step === 1) return "rgba(0,0,0,0)";
    if (step === 2) return "rgba(0, 161, 155, 0.03)"; 
    if (step === 3) return "rgba(255, 128, 0, 0.03)"; 
    return "rgba(239, 26, 45, 0.03)"; 
  };

  const getBorderTop = () => {
    if (step === 1) return "3px solid transparent";
    if (step === 2) return "3px solid var(--petronas-teal)";
    if (step === 3) return "3px solid var(--mclaren-papaya)";
    return "3px solid var(--ferrari-red)";
  };

  // Determine direction for graceful sliding animation
  const slideDirection = step > prevStep ? 1 : -1;
  const slideVariants = {
    hidden: { opacity: 0, x: slideDirection * 40 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: slideDirection * -40 }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16 flex flex-col min-h-screen justify-center overflow-x-hidden relative">
      {step === 4 && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 1000} height={typeof window !== 'undefined' ? window.innerHeight : 1000} recycle={false} numberOfPieces={600} colors={['#00A19B', '#FF8000', '#EF1A2D', '#001A30']} gravity={0.15} />}
      
      {/* Checkered Flag Sweeping Animation */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] pointer-events-none flex opacity-30"
          >
            <div className="w-[100vw] h-[100vh]" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik00MCA0MGg0MHY0MEg0MHoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')", backgroundSize: "80px 80px", transform: "skewX(-15deg)" }} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mb-12 text-center anim-in">
        <h1 className="text-3xl font-bold display-font mb-2 text-[var(--ink)] tracking-tight">SupportIQ</h1>
        <p className="text-sm text-[var(--muted)] font-medium">Configure your workspace</p>
      </div>

      <StepIndicator current={step} setStep={handleSetStep} />
      <CarProgress step={step} />

      {error && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm font-medium anim-fade border border-[var(--error)] bg-[var(--error-bg)] text-[var(--error)] shadow-sm">
          {error}
        </div>
      )}

      {/* Elegant Swooping Form Container */}
      <motion.div 
        layout
        animate={{ backgroundColor: getTint(), borderTop: getBorderTop() }}
        transition={{ duration: 0.8, ease: "easeOut", layout: { duration: 0.4, ease: "easeInOut" } }}
        className="glass p-8 shadow-sm overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={step}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
          >
            {configLoading && step < 4 ? (
               <div className="flex justify-center py-12">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/></svg>
               </div>
            ) : (
              <>
                {/* STEP 1: Email/Password Baseline */}
                {step === 1 && (
                  <div className="space-y-6">
                    <CoffeeBrewing />
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--ink-soft)] display-font">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full rounded-xl px-4 py-3.5 text-sm bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)] outline-none shadow-sm transition-colors duration-200" onKeyDown={(e) => e.key === "Enter" && handleStep1()} disabled={loading} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[var(--ink-soft)] display-font">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl px-4 py-3.5 text-sm bg-[var(--bg)] border border-[var(--border)] focus:border-[var(--ink)] focus:bg-[var(--surface)] outline-none shadow-sm transition-colors duration-200" onKeyDown={(e) => e.key === "Enter" && handleStep1()} disabled={loading} />
                    </div>

                    <button onClick={handleStep1} disabled={loading} className="btn-primary w-full mt-4 h-12 flex justify-center items-center shadow-sm">
                      {loading ? <div className="h-5 w-5 rounded-full border-[3px] border-white border-t-transparent animate-spin"></div> : "Continue"}
                    </button>
                  </div>
                )}

                {/* STEP 2 & 3: Dynamic Fields */}
                {(step === 2 || step === 3) && (
                  <div className="space-y-6">
                    {step === 2 && <CameraClicking />}
                    {step === 3 && <FlowersBlooming />}
                    {currentComponents?.map((comp) => <DynamicField key={comp.id} comp={comp} formData={formData} setFormData={setFormData} />)}
                    {(!currentComponents || currentComponents.length === 0) && <p className="text-center py-8 text-[var(--muted)] text-sm font-medium">No fields configured for this step.</p>}
                    
                    <div className="flex gap-4 mt-8">
                      <button onClick={() => handleSetStep(step - 1)} disabled={loading} className="btn-secondary w-1/3 shadow-sm">Back</button>
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
      
    </div>
  );
}
