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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getMaxDOB = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
};

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
          <label className={labelClass}>{comp.label} <span className="text-gray-400 font-normal normal-case tracking-normal">(Optional)</span></label>
          <textarea
            value={formData.aboutMe || ""}
            onChange={(e) => setFormData((p) => ({ ...p, aboutMe: e.target.value }))}
            rows={4}
            className={inputClass}
            style={{ resize: "vertical" }}
            placeholder="Tell us a bit about yourself..."
          />
        </div>
      );
    case "address":
      const handleAutofill = async () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await res.json();
            if (data && data.address) {
              setFormData((p) => ({
                ...p,
                street: `${data.address.house_number || ""} ${data.address.road || ""}`.trim() || data.address.suburb || "",
                city: data.address.city || data.address.town || data.address.village || "",
                state: data.address.state || "",
                zip: data.address.postcode || "",
              }));
            }
          } catch (e) {
            console.error("Geocoding failed", e);
          }
        });
      };

      return (
        <div className="space-y-4 anim-in">
          <div className="flex items-center justify-between">
            <label className={labelClass} style={{ marginBottom: 0 }}>{comp.label}</label>
            <button 
              onClick={handleAutofill} 
              className="text-[10px] font-bold text-[var(--petronas-teal)] uppercase tracking-wider flex items-center gap-1 hover:text-[var(--ink)] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Auto-fill from Location
            </button>
          </div>
          <input
            value={formData.street || ""}
            onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))}
            placeholder="123 Innovation Drive"
            className={inputClass}
          />
          <div className="grid grid-cols-3 gap-4">
            <input value={formData.city || ""} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} placeholder="City" className={inputClass} />
            <input value={formData.state || ""} onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))} placeholder="State" className={inputClass} />
            <input value={formData.zip || ""} onChange={(e) => setFormData((p) => ({ ...p, zip: e.target.value }))} placeholder="ZIP Code" className={inputClass} />
          </div>
        </div>
      );
    case "birthdate":
      return (
        <div className="anim-in">
          <label className={labelClass}>{comp.label} <span className="text-gray-400 font-normal normal-case tracking-normal">(Must be 18+)</span></label>
          <input
            type="date"
            max={getMaxDOB()}
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
    // Load config
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setError("Failed to load configuration"))
      .finally(() => setConfigLoading(false));

    // Auto-resume session if exists
    fetch("/api/users/me")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("No session");
      })
      .then((user: UserData) => {
        setUserId(user.id);
        setEmail(user.email);
        setPassword("********"); // dummy mask since they are logged in
        if (user.aboutMe) setFormData((p) => ({ ...p, aboutMe: user.aboutMe! }));
        if (user.street) setFormData((p) => ({ ...p, street: user.street! }));
        if (user.city) setFormData((p) => ({ ...p, city: user.city! }));
        if (user.state) setFormData((p) => ({ ...p, state: user.state! }));
        if (user.zip) setFormData((p) => ({ ...p, zip: user.zip! }));
        if (user.birthdate) setFormData((p) => ({ ...p, birthdate: user.birthdate! }));
        
        handleSetStep(Math.max(2, Math.min(user.step || 2, 4)));
      })
      .catch(() => {
        // Normal behavior, user not logged in
      });
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
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    if (!EMAIL_REGEX.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8 && password !== "********") { setError("Password must be at least 8 characters."); return; }

    setLoading(true);

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
                    <p className="text-sm text-[var(--muted)] mb-6 font-medium">Your profile data has been securely saved to PostgreSQL.</p>
                    
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-left mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar shadow-inner text-sm">
                      <h3 className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] mb-3 border-b border-[var(--border)] pb-2">Profile Receipt</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[var(--muted)] font-medium">Email</span>
                          <span className="font-bold text-[var(--ink)] truncate ml-4">{email}</span>
                        </div>
                        {formData.aboutMe && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted)] font-medium">About Me</span>
                            <span className="font-semibold text-[var(--ink)] text-xs bg-[var(--bg)] p-2 rounded border border-[var(--border)]">{formData.aboutMe}</span>
                          </div>
                        )}
                        {formData.street && (
                          <div className="flex justify-between">
                            <span className="text-[var(--muted)] font-medium">Address</span>
                            <span className="font-bold text-[var(--ink)] text-right">
                              {formData.street}<br/>
                              {formData.city}, {formData.state} {formData.zip}
                            </span>
                          </div>
                        )}
                        {formData.birthdate && (
                          <div className="flex justify-between">
                            <span className="text-[var(--muted)] font-medium">Birthdate</span>
                            <span className="font-bold text-[var(--ink)]">{formData.birthdate}</span>
                          </div>
                        )}
                      </div>
                    </div>

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
