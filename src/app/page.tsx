"use client";

import { useEffect, useState } from "react";

/* ── Types ── */
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

/* ── Step indicator ── */
const STEPS = ["Account", "Profile", "Details", "Complete"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = current > step;
        const active = current === step;
        return (
          <div key={label} className="flex items-center">
            {/* circle */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300"
                style={{
                  background: done
                    ? "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))"
                    : active
                    ? "var(--accent-soft)"
                    : "var(--surface-hover)",
                  border: active ? "2px solid var(--accent)" : done ? "none" : "2px solid var(--border)",
                  color: done ? "white" : active ? "var(--accent)" : "var(--subtle)",
                  boxShadow: active ? "0 0 0 4px var(--accent-glow)" : "none",
                }}
              >
                {done ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className="mt-2 text-xs font-medium"
                style={{ color: active ? "var(--accent)" : done ? "var(--ink-soft)" : "var(--subtle)" }}
              >
                {label}
              </span>
            </div>
            {/* connector */}
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 transition-all duration-500 mx-2"
                style={{
                  width: 64,
                  background: current > step + 1
                    ? "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))"
                    : current > step
                    ? "var(--accent)"
                    : "var(--border)",
                  marginBottom: 24,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Spinner ── */
function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Dynamic Form Fields ── */
function DynamicField({
  comp,
  formData,
  setFormData,
}: {
  comp: ComponentConfig;
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    color: "var(--ink)",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "var(--ink-soft)",
    marginBottom: 6,
  };

  switch (comp.type) {
    case "about_me":
      return (
        <div className="anim-in">
          <label style={labelStyle}>✍️ {comp.label}</label>
          <textarea
            value={formData.aboutMe || ""}
            onChange={(e) => setFormData((p) => ({ ...p, aboutMe: e.target.value }))}
            rows={4}
            placeholder="Tell us about yourself..."
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
        </div>
      );
    case "address":
      return (
        <div className="space-y-3 anim-in">
          <label style={labelStyle}>📍 {comp.label}</label>
          <input
            value={formData.street || ""}
            onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))}
            placeholder="Street Address"
            style={inputStyle}
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              value={formData.city || ""}
              onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
              placeholder="City"
              style={inputStyle}
            />
            <input
              value={formData.state || ""}
              onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
              placeholder="State"
              style={inputStyle}
            />
            <input
              value={formData.zip || ""}
              onChange={(e) => setFormData((p) => ({ ...p, zip: e.target.value }))}
              placeholder="ZIP Code"
              style={inputStyle}
            />
          </div>
        </div>
      );
    case "birthdate":
      return (
        <div className="anim-in">
          <label style={labelStyle}>📅 {comp.label}</label>
          <input
            type="date"
            value={formData.birthdate || ""}
            onChange={(e) => setFormData((p) => ({ ...p, birthdate: e.target.value }))}
            style={inputStyle}
          />
        </div>
      );
    default:
      return null;
  }
}

/* ── Main Component ── */
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

  // Load config on mount
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setError("Failed to load configuration"))
      .finally(() => setConfigLoading(false));
  }, []);

  const handleStep1 = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Try to create user
      let res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 409) {
        // User exists — try login
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, action: "login" }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Something went wrong");
      }

      const user: UserData = await res.json();
      setUserId(user.id);

      // Resume: load existing data into form
      if (user.aboutMe) setFormData((p) => ({ ...p, aboutMe: user.aboutMe! }));
      if (user.street) setFormData((p) => ({ ...p, street: user.street! }));
      if (user.city) setFormData((p) => ({ ...p, city: user.city! }));
      if (user.state) setFormData((p) => ({ ...p, state: user.state! }));
      if (user.zip) setFormData((p) => ({ ...p, zip: user.zip! }));
      if (user.birthdate) setFormData((p) => ({ ...p, birthdate: user.birthdate! }));

      // Jump to saved step (minimum step 2)
      const nextStep = Math.max(2, Math.min(user.step || 2, 4));
      setStep(nextStep);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleStepSubmit = async (nextStep: number) => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, step: nextStep }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }

      setStep(nextStep);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save progress");
    } finally {
      setLoading(false);
    }
  };

  const currentComponents =
    step === 2 ? config?.page2 : step === 3 ? config?.page3 : [];

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      {/* Header */}
      <div className="text-center mb-2 anim-in">
        <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
          Get Started with <span className="gradient-text">SupportIQ</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Set up your account in a few quick steps
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} />

      {/* Error */}
      {error && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm font-medium anim-scale"
          style={{ background: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error)" }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Step 1: Account */}
      {step === 1 && (
        <div className="glass p-8 anim-in">
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--ink)" }}>
            Create your account
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Already have an account? We&apos;ll pick up where you left off.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--ink-soft)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm"
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  color: "var(--ink)",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStep1()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--ink-soft)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 text-sm"
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  color: "var(--ink)",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStep1()}
              />
            </div>
          </div>

          <button
            onClick={handleStep1}
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size={18} /> : null}
            {loading ? "Creating account..." : "Get Started →"}
          </button>
        </div>
      )}

      {/* Step 2 & 3: Dynamic forms */}
      {(step === 2 || step === 3) && (
        <div className="glass p-8 anim-in" key={step}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--ink)" }}>
            {step === 2 ? "Tell us about yourself" : "A few more details"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Step {step} of {STEPS.length - 1} — {step === 2 ? "We'd love to know more" : "Almost there!"}
          </p>

          {configLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size={28} />
            </div>
          ) : (
            <div className="space-y-5">
              {currentComponents?.map((comp) => (
                <DynamicField key={comp.id} comp={comp} formData={formData} setFormData={setFormData} />
              ))}
              {(!currentComponents || currentComponents.length === 0) && (
                <p className="text-center py-8" style={{ color: "var(--muted)" }}>
                  No fields configured for this step.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
              ← Back
            </button>
            <button
              onClick={() => handleStepSubmit(step + 1)}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size={18} /> : null}
              {step === 3 ? "Complete →" : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="glass p-10 text-center anim-scale">
          {/* Animated checkmark */}
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
              boxShadow: "0 8px 32px var(--accent-glow)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 24, animation: "checkmark 0.5s ease-out 0.2s both" }} />
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            You&apos;re all set! 🎉
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
            Your account has been created successfully. Explore what SupportIQ can do.
          </p>

          <div className="flex gap-3 justify-center">
            <a href="/dashboard" className="btn-primary inline-flex items-center gap-2">
              🚀 View Dashboard
            </a>
            <a href="/data" className="btn-secondary inline-flex items-center gap-2">
              📊 View Data
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
