import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { ErrorBanner } from "@/components/Spinner.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import "./auth.css";

/* ── Owl Mascot ────────────────────────────────────────────────── */
function OwlMascot({ eyesCovered, peeking }) {
  const handY = eyesCovered ? (peeking ? 10 : 0) : 38;
  return (
    <div className="owl-wrap">
      <svg viewBox="0 0 120 110" width="88" height="80">
        {/* Ear tufts */}
        <polygon points="38,26 31,6 46,20" fill="#141418" stroke="rgba(0,238,255,0.35)" strokeWidth="1.5"/>
        <polygon points="82,26 89,6 74,20" fill="#141418" stroke="rgba(0,238,255,0.35)" strokeWidth="1.5"/>
        {/* Head */}
        <ellipse cx="60" cy="60" rx="40" ry="38" fill="#141418" stroke="rgba(0,238,255,0.2)" strokeWidth="1.5"/>
        {/* Eye sockets */}
        <circle cx="43" cy="56" r="14" fill="#0a0a0c" stroke="rgba(0,238,255,0.15)" strokeWidth="1"/>
        <circle cx="77" cy="56" r="14" fill="#0a0a0c" stroke="rgba(0,238,255,0.15)" strokeWidth="1"/>
        {/* Eyeballs */}
        <circle cx="43" cy="56" r="9" fill="#fff"/>
        <circle cx="45" cy="54" r="5" fill="#0ef"/>
        <circle cx="46" cy="53" r="2.2" fill="#07070a"/>
        <circle cx="77" cy="56" r="9" fill="#fff"/>
        <circle cx="79" cy="54" r="5" fill="#0ef"/>
        <circle cx="80" cy="53" r="2.2" fill="#07070a"/>
        {/* Beak */}
        <polygon points="60,65 53,75 67,75" fill="#f97316"/>
        {/* LEFT hand */}
        <g style={{ transform:`translateY(${handY}px)`, transition:"transform 0.45s cubic-bezier(.4,0,.2,1)" }}>
          <ellipse cx="28" cy="58" rx="22" ry="13" fill="#1c1c22" stroke="rgba(0,238,255,0.3)" strokeWidth="1.5"/>
          <line x1="14" y1="51" x2="10" y2="39" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="21" y1="47" x2="19" y2="35" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="29" y1="45" x2="29" y2="33" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="37" y1="47" x2="39" y2="35" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
        </g>
        {/* RIGHT hand */}
        <g style={{ transform:`translateY(${handY}px)`, transition:"transform 0.45s cubic-bezier(.4,0,.2,1)" }}>
          <ellipse cx="92" cy="58" rx="22" ry="13" fill="#1c1c22" stroke="rgba(0,238,255,0.3)" strokeWidth="1.5"/>
          <line x1="106" y1="51" x2="110" y2="39" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="99" y1="47" x2="101" y2="35" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="91" y1="45" x2="91" y2="33" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="83" y1="47" x2="81" y2="35" stroke="#0ef" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
        </g>
      </svg>
      <p className="owl-label">
        {eyesCovered ? (peeking ? "👀 Peeking!" : "🙈 I won't look…") : "🦉 Hey there!"}
      </p>
    </div>
  );
}

/* ── Fingerprint Scanner Button ────────────────────────────────── */
function FingerprintButton({ onScan, isLoading }) {
  const [scanning, setScanning] = useState(false);

  const handleClick = async () => {
    if (scanning || isLoading) return;
    setScanning(true);
    await new Promise(r => setTimeout(r, 1500));
    setScanning(false);
    onScan();
  };

  return (
    <button type="button" className={`fp-btn${scanning ? " fp-scanning" : ""}`} onClick={handleClick} disabled={isLoading}>
      <div className="fp-icon">
        <svg viewBox="0 0 60 60" width="48" height="48">
          <path d="M30 8 C18 8 8 18 8 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M30 8 C42 8 52 18 52 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 24 C16 16 22 12 30 12 C38 12 44 16 44 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 32 C20 26 24 22 30 22 C36 22 40 26 40 32 C40 38 36 44 30 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 30 C24 27 27 24 30 24 C33 24 36 27 36 30 C36 36 30 44 30 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 34 C16 40 18 46 22 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M44 34 C44 42 40 48 34 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {scanning && <div className="fp-laser" />}
      </div>
      <span className="fp-label-text">
        {isLoading ? "AUTHENTICATING…" : scanning ? "SCANNING…" : "TAP TO AUTHENTICATE"}
      </span>
    </button>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0); // 0=email, 1=password
  const [pwFocused, setPwFocused] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: -999, y: -999 });
  const pageRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!pageRef.current) return;
    const r = pageRef.current.getBoundingClientRect();
    setSpotlight({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const goToPassword = () => {
    if (!email) return setError("Please enter your email.");
    setError(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) return setError("Please fill in all fields.");
    const res = await login({ email, password });
    if (res.ok) navigate("/");
    else setError(res.error);
  };

  return (
    <div ref={pageRef} className="auth-page" onMouseMove={handleMouseMove}>
      {/* Cursor spotlight */}
      <div className="auth-spotlight" style={{
        background: `radial-gradient(circle 380px at ${spotlight.x}px ${spotlight.y}px, rgba(0,238,255,0.055) 0%, transparent 70%)`
      }} />

      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-logo">
          <div className="auth-logo-icon">💪</div>
          <span className="auth-logo-name">VitalityHub</span>
        </div>
        <div className="auth-hero">
          <div className="auth-hero-tag">
            <span className="auth-hero-tag-dot" />
            Secure Access
          </div>
          <h1 className="auth-hero-headline">Welcome<br />back, <em>Elite.</em></h1>
          <p className="auth-hero-sub">Your performance data is waiting. Sign in and continue your high-performance journey.</p>
        </div>
        <div className="auth-stats">
          <div><div className="auth-stat-value">98%</div><div className="auth-stat-label">Uptime</div></div>
          <div><div className="auth-stat-value">2M+</div><div className="auth-stat-label">Workouts</div></div>
          <div><div className="auth-stat-value">SSL</div><div className="auth-stat-label">Encrypted</div></div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-panel">
        <div className="auth-card">
          {/* Owl mascot */}
          <OwlMascot eyesCovered={pwFocused && !showPassword} peeking={pwFocused && showPassword} />

          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          <AnimatePresence mode="wait">
            {step === 0 ? (
              /* STEP 0 — Email */
              <motion.div key="email-step"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.3 }}>
                <h2 className="auth-card-title">Sign In</h2>
                <p className="auth-card-sub">Enter your email to get started.</p>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input" type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && goToPassword()}
                      placeholder="you@example.com" autoComplete="email" autoFocus
                    />
                  </div>
                </div>
                <button type="button" className="auth-btn" onClick={goToPassword}>
                  NEXT <ChevronRight size={16} />
                </button>
                <div className="auth-footer">
                  No account? <Link to="/register">Join the Elite</Link>
                </div>
              </motion.div>
            ) : (
              /* STEP 1 — Password + Fingerprint */
              <motion.div key="pw-step"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.3 }}>
                <h2 className="auth-card-title">Authentication</h2>
                {/* Email chip */}
                <div className="auth-email-chip">
                  <span>{email}</span>
                  <button type="button" onClick={() => setStep(0)} className="auth-chip-change">change</button>
                </div>
                <div className="auth-field" style={{ marginTop: 16 }}>
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input" type={showPassword ? "text" : "password"}
                      value={password} onChange={e => setPassword(e.target.value)}
                      onFocus={() => setPwFocused(true)} onBlur={() => setPwFocused(false)}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      placeholder="••••••••" autoComplete="current-password" autoFocus
                    />
                    <button type="button" className="auth-eye"
                      onClick={() => setShowPassword(s => !s)}>
                      {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
                    </button>
                  </div>
                </div>
                <FingerprintButton onScan={handleSubmit} isLoading={isLoading} />
                <div className="auth-footer">
                  No account? <Link to="/register">Join the Elite</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}