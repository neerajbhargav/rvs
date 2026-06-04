"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string; email: string; step: number;
  aboutMe: string | null; street: string | null; city: string | null;
  state: string | null; zip: string | null; birthdate: string | null;
}
interface PageConfig { aboutMe: number; address: number; birthdate: number; }
type ComponentName = "aboutMe" | "address" | "birthdate";

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Account", "Profile", "Details", "Complete"];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {labels.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300"
              style={{
                background: i + 1 <= current ? "var(--accent)" : "var(--border)",
                color: i + 1 <= current ? "white" : "var(--muted)",
              }}
            >
              {i + 1 < current ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="text-xs font-medium" style={{ color: i + 1 <= current ? "var(--accent)" : "var(--muted)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: total - 1 }, (_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ background: i < current - 1 ? "var(--accent)" : "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}

function AboutMeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--ink)]">About Me</label>
      <p className="text-xs text-[var(--muted)]">Tell us a bit about yourself and your role.</p>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="I'm a customer support manager at a growing SaaS company..."
        rows={5}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10"
      />
    </div>
  );
}

function AddressFields({ street, city, state, zip, onChange }: {
  street: string; city: string; state: string; zip: string;
  onChange: (f: string, v: string) => void;
}) {
  const input = (label: string, field: string, value: string, ph: string, span?: string) => (
    <div className={`space-y-1 ${span || ""}`}>
      <label className="block text-xs font-medium text-[var(--muted)]">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(field, e.target.value)} placeholder={ph}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10" />
    </div>
  );
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--ink)]">Address</label>
      {input("Street Address", "street", street, "123 Main St")}
      <div className="grid grid-cols-3 gap-3">
        {input("City", "city", city, "New York")}
        {input("State", "state", state, "NY")}
        {input("Zip Code", "zip", zip, "10001")}
      </div>
    </div>
  );
}

function BirthdateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--ink)]">Date of Birth</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10" />
    </div>
  );
}

export default function OnboardingPage() {
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [birthdate, setBirthdate] = useState("");

  useEffect(() => { fetch("/api/config").then(r => r.json()).then(setConfig); }, []);

  const populateFields = useCallback((u: User) => {
    if (u.aboutMe) setAboutMe(u.aboutMe);
    if (u.street) setStreet(u.street);
    if (u.city) setCity(u.city);
    if (u.state) setState(u.state);
    if (u.zip) setZip(u.zip);
    if (u.birthdate) setBirthdate(u.birthdate);
  }, []);

  function getComponentsForStep(pageNum: number): ComponentName[] {
    if (!config) return [];
    const c: ComponentName[] = [];
    if (config.aboutMe === pageNum) c.push("aboutMe");
    if (config.address === pageNum) c.push("address");
    if (config.birthdate === pageNum) c.push("birthdate");
    return c;
  }

  async function handleStep1() {
    setError(""); setLoading(true);
    try {
      let res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      let data = await res.json();
      if (res.status === 409) {
        res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, action: "login" }) });
        data = await res.json();
        if (!res.ok) { setError("Email already registered with a different password."); setLoading(false); return; }
      }
      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }
      setUser(data); populateFields(data); setStep(Math.max(data.step, 2));
    } catch { setError("Network error. Please try again."); }
    setLoading(false);
  }

  async function handleDynamicStep() {
    if (!user) return;
    setError(""); setLoading(true);
    const update: Record<string, unknown> = { step: step + 1 };
    for (const comp of getComponentsForStep(step)) {
      if (comp === "aboutMe") update.aboutMe = aboutMe;
      if (comp === "address") { update.street = street; update.city = city; update.state = state; update.zip = zip; }
      if (comp === "birthdate") update.birthdate = birthdate;
    }
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
      const data = await res.json();
      setUser(data); setStep(step + 1);
    } catch { setError("Failed to save."); }
    setLoading(false);
  }

  function renderComponent(name: ComponentName) {
    switch (name) {
      case "aboutMe": return <AboutMeField key="aboutMe" value={aboutMe} onChange={setAboutMe} />;
      case "address": return <AddressFields key="address" street={street} city={city} state={state} zip={zip} onChange={(f, v) => { if (f==="street") setStreet(v); if (f==="city") setCity(v); if (f==="state") setState(v); if (f==="zip") setZip(v); }} />;
      case "birthdate": return <BirthdateField key="birthdate" value={birthdate} onChange={setBirthdate} />;
    }
  }

  if (!config) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-[var(--ink)]">
          Welcome to Support<span className="text-[var(--accent)]">IQ</span>
        </h1>
        <p className="text-sm text-[var(--muted)]">Set up your account to get started with AI-powered customer support.</p>
      </div>

      <div className="mx-auto max-w-lg">
        <StepIndicator current={step} total={4} />

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-[var(--ink)]">
            {step === 1 && "Create your account"}
            {step === 2 && "Tell us more about you"}
            {step === 3 && "Almost there"}
            {step === 4 && "You're all set!"}
          </h2>
          <p className="mb-6 text-sm text-[var(--muted)]">
            {step === 1 && "Enter your credentials to get started. Already have an account? We'll pick up where you left off."}
            {step === 2 && "Complete your profile with the information below."}
            {step === 3 && "Just one more step to finish setting up."}
            {step === 4 && "Your account is ready. Explore your SupportIQ dashboard."}
          </p>

          {error && <div className="mb-4 rounded-lg bg-[var(--warning-bg)] px-4 py-3 text-sm text-[var(--warning)]">{error}</div>}

          {step === 1 && (
            <form onSubmit={e => { e.preventDefault(); handleStep1(); }} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--muted)]">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--muted)]">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50">
                {loading ? "Processing..." : "Get Started →"}
              </button>
            </form>
          )}

          {(step === 2 || step === 3) && (
            <form onSubmit={e => { e.preventDefault(); handleDynamicStep(); }} className="space-y-5">
              {getComponentsForStep(step).map(renderComponent)}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(step - 1 < 2 ? 1 : step - 1)}
                  className="rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--bg)]">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50">
                  {loading ? "Saving..." : step === 3 ? "Complete Setup ✓" : "Continue →"}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                <svg className="h-8 w-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mb-4 text-sm text-[var(--muted)]">Your account is fully set up and ready to go.</p>
              <div className="flex gap-3 justify-center">
                <a href="/dashboard" className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]">
                  Open Dashboard →
                </a>
                <a href="/data" className="rounded-lg border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--bg)]">
                  View Data
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
