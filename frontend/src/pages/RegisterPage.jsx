import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { ErrorBanner } from "@/components/Spinner.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ChevronRight, ArrowLeft, Target, Activity, User } from "lucide-react";
import "./auth.css";

const GOALS = [
  { value: "loss",     label: "🔥 Lose Weight",  desc: "Caloric deficit · Fat burn" },
  { value: "maintain", label: "⚖️  Maintain",     desc: "Balanced calories · Steady" },
  { value: "gain",     label: "💪 Gain Muscle",   desc: "Caloric surplus · Hypertrophy" },
];
const GENDERS = [
  { value: "male",   label: "♂ Male"   },
  { value: "female", label: "♀ Female" },
  { value: "other",  label: "⊕ Other"  },
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [creds, setCreds] = useState({ email: "", password: "", confirm: "" });
  const [bio, setBio] = useState({ age: "", weight_kg: "", height_cm: "", gender: "male", fitness_goal: "maintain" });
  const [spotlight, setSpotlight] = useState({ x: -999, y: -999 });
  const pageRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!pageRef.current) return;
    const r = pageRef.current.getBoundingClientRect();
    setSpotlight({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const setCred = k => e => setCreds(f => ({ ...f, [k]: e.target.value }));
  const setBioF = k => e => setBio(f => ({ ...f, [k]: e.target.value }));

  const nextStep = () => {
    setError(null);
    if (!creds.email || !creds.password) return setError("Fill in all fields.");
    if (creds.password.length < 8) return setError("Password must be 8+ characters.");
    if (creds.password !== creds.confirm) return setError("Passwords don't match.");
    setStep(2);
  };

  const handleSubmit = async e => {
    e?.preventDefault();
    setError(null);
    if (!bio.age || !bio.weight_kg || !bio.height_cm) return setError("Fill in all biometric fields.");
    const res = await register({
      email: creds.email, password: creds.password,
      biometrics: {
        age: parseInt(bio.age), weight_kg: parseFloat(bio.weight_kg),
        height_cm: parseFloat(bio.height_cm), gender: bio.gender, fitness_goal: bio.fitness_goal,
      },
    });
    if (res.ok) navigate("/");
    else setError(res.error);
  };

  return (
    <div ref={pageRef} className="auth-page" onMouseMove={handleMouseMove}>
      {/* Cursor spotlight */}
      <div className="auth-spotlight" style={{
        background: `radial-gradient(circle 380px at ${spotlight.x}px ${spotlight.y}px, rgba(139,92,246,0.055) 0%, transparent 70%)`
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
            System Ready
          </div>
          <h1 className="auth-hero-headline">Define Your<br /><em>Physical Edge.</em></h1>
          <p className="auth-hero-sub">Precision tracking built for modern athletes. Set your biometrics once and let VitalityHub do the heavy lifting.</p>
        </div>
        <div className="auth-stats">
          <div><div className="auth-stat-value">50+</div><div className="auth-stat-label">Exercises</div></div>
          <div><div className="auth-stat-value">AI</div><div className="auth-stat-label">Calorie Engine</div></div>
          <div><div className="auth-stat-value">PWA</div><div className="auth-stat-label">Mobile Ready</div></div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-panel">
        <div className="auth-card">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            {step === 1 ? <User size={20} color="#818cf8"/> : <Activity size={20} color="#818cf8"/>}
            <h2 className="auth-card-title" style={{ margin:0 }}>
              {step === 1 ? "Create Identity" : "Biometrics"}
            </h2>
          </div>
          <p className="auth-card-sub">
            {step === 1 ? "Step 1 of 2 — Set up your credentials." : "Step 2 of 2 — Your body stats and goal."}
          </p>

          {/* Step progress */}
          <div className="auth-progress">
            <div className="auth-progress-fill" style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>

          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1"
                initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-30 }} transition={{ duration:0.3 }}>
                <form onSubmit={e => { e.preventDefault(); nextStep(); }}>
                  <div className="auth-field">
                    <label className="auth-label">Email Address</label>
                    <div className="auth-input-wrap">
                      <input className="auth-input" type="email" value={creds.email}
                        onChange={setCred("email")} placeholder="you@example.com" autoComplete="email" required />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-wrap">
                      <input className="auth-input" type={showPassword ? "text" : "password"}
                        value={creds.password} onChange={setCred("password")}
                        placeholder="Min. 8 characters" autoComplete="new-password" required />
                      <button type="button" className="auth-eye" onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
                      </button>
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Confirm Password</label>
                    <div className="auth-input-wrap">
                      <input className="auth-input" type="password" value={creds.confirm}
                        onChange={setCred("confirm")} placeholder="Re-enter password" autoComplete="new-password" required />
                    </div>
                  </div>
                  <button type="submit" className="auth-btn">CONTINUE <ChevronRight size={16}/></button>
                  <div className="auth-footer">Already a member? <Link to="/login">Sign In</Link></div>
                </form>
              </motion.div>
            ) : (
              <motion.div key="s2"
                initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-30 }} transition={{ duration:0.3 }}>
                <form onSubmit={handleSubmit}>
                  {/* Bio stats */}
                  <div style={{ marginBottom:4 }}><label className="auth-label">Body Stats</label></div>
                  <div className="auth-bio-row">
                    {[
                      { k:"age",       ph:"25",  unit:"YRS", lbl:"Age"    },
                      { k:"weight_kg", ph:"75",  unit:"KG",  lbl:"Weight" },
                      { k:"height_cm", ph:"175", unit:"CM",  lbl:"Height" },
                    ].map(({ k, ph, unit, lbl }) => (
                      <div key={k} className="auth-bio-col">
                        <label className="auth-label" style={{ marginBottom:4 }}>{lbl}</label>
                        <div className="auth-input-wrap">
                          <input className="auth-input" type="number" value={bio[k]}
                            onChange={setBioF(k)} placeholder={ph} required />
                          <span className="auth-bio-unit">{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gender */}
                  <label className="auth-label" style={{ display:"block", marginBottom:6 }}>Gender</label>
                  <div className="auth-chips">
                    {GENDERS.map(g => (
                      <button key={g.value} type="button"
                        className={`auth-chip${bio.gender === g.value ? " active" : ""}`}
                        onClick={() => setBio(b => ({ ...b, gender: g.value }))}>
                        {g.label}
                      </button>
                    ))}
                  </div>

                  {/* Fitness goal */}
                  <label className="auth-label" style={{ display:"block", marginBottom:8 }}>Fitness Goal</label>
                  <div className="auth-goals">
                    {GOALS.map(g => (
                      <button key={g.value} type="button"
                        className={`auth-goal${bio.fitness_goal === g.value ? " active" : ""}`}
                        onClick={() => setBio(b => ({ ...b, fitness_goal: g.value }))}>
                        <div>
                          <span className="auth-goal-name">{g.label}</span>
                          <span className="auth-goal-desc">{g.desc}</span>
                        </div>
                        {bio.fitness_goal === g.value && <Target size={14} color="#818cf8"/>}
                      </button>
                    ))}
                  </div>

                  <div className="auth-btn-row">
                    <button type="button" className="auth-btn-back" onClick={() => setStep(1)}>
                      <ArrowLeft size={18}/>
                    </button>
                    <button type="submit" className="auth-btn" disabled={isLoading} style={{ flex:1, marginTop:0 }}>
                      {isLoading ? "PROCESSING…" : "COMPLETE SETUP"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}