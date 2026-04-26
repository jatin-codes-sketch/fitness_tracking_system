import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Moon, Sun, Shield, ChevronRight, Smartphone, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { PageHeader } from "@/components/Spinner.jsx";

function SettingRow({ icon: Icon, label, sub, color = "#64748b", onClick, right, danger }) {
  return (
    <button onClick={onClick} style={{
      width:"100%", padding:"14px 16px", display:"flex", alignItems:"center", gap:12,
      background:"none", border:"none", cursor:onClick?"pointer":"default",
      fontFamily:"inherit", textAlign:"left",
      borderBottom:"1px solid var(--vh-border)44",
    }}>
      <div style={{
        width:36, height:36, borderRadius:11, flexShrink:0,
        background: danger ? "#f8717122" : `${color}22`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <Icon size={16} color={danger ? "#f87171" : color}/>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:14, fontWeight:600, color: danger ? "#f87171" : "var(--vh-text)" }}>{label}</p>
        {sub && <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--vh-muted)" }}>{sub}</p>}
      </div>
      {right !== undefined ? right : onClick ? <ChevronRight size={16} color="var(--vh-muted)"/> : null}
    </button>
  );
}

function Toggle({ value, onToggle }) {
  return (
    <div onClick={e => { e.stopPropagation(); onToggle(); }} style={{
      width:44, height:24, borderRadius:99, cursor:"pointer",
      background: value ? "#22d3ee" : "var(--vh-border)",
      position:"relative", transition:"background .2s", flexShrink:0,
    }}>
      <div style={{
        position:"absolute", top:3,
        left: value ? 23 : 3,
        width:18, height:18, borderRadius:"50%",
        background: value ? "var(--vh-bg)" : "var(--vh-muted)",
        transition:"left .2s",
      }}/>
    </div>
  );
}

function BioTile({ label, value, unit }) {
  return (
    <div style={{
      background:"var(--vh-depressed)", boxShadow:"var(--neu-inset)",
      borderRadius:14, padding:"12px 14px", flex:"1 1 calc(33% - 8px)",
    }}>
      <p style={{ margin:"0 0 4px", fontSize:10, color:"var(--vh-muted)", fontWeight:600 }}>{label}</p>
      <p style={{ margin:0 }}>
        <span style={{ fontSize:20, fontWeight:700, color:"var(--vh-text)" }}>{value ?? "—"}</span>
        {unit && value && <span style={{ fontSize:10, color:"var(--vh-muted)", marginLeft:3 }}>{unit}</span>}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(() => localStorage.getItem("vh_notif") !== "false");
  const [installAvailable, setInstallAvailable] = useState(!!window.__vh_installPrompt);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Listen for install prompt becoming available
  useEffect(() => {
    const handler = () => setInstallAvailable(true);
    window.addEventListener("vh-install-available", handler);
    return () => window.removeEventListener("vh-install-available", handler);
  }, []);

  const handleNotifToggle = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("vh_notif", String(next));
    if (next && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const handleInstall = async () => {
    const prompt = window.__vh_installPrompt;
    if (!prompt) {
      alert("Open this page in your mobile browser and use 'Add to Home Screen' from the browser menu.");
      return;
    }
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      window.__vh_installPrompt = null;
      setInstallAvailable(false);
    }
  };

  // Compute dynamic biometric stats from stored user data
  const bio = user?.biometrics;
  const bmi = bio ? +(bio.weight_kg / ((bio.height_cm / 100) ** 2)).toFixed(1) : null;
  const bmiLabel = !bmi ? null : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = !bmi ? "#64748b" : bmi < 18.5 ? "#22d3ee" : bmi < 25 ? "#34d399" : bmi < 30 ? "#fb923c" : "#f87171";

  const initials = (user?.email ?? "U").split("@")[0].slice(0, 2).toUpperCase();

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", color:"var(--vh-text)", minHeight:"100vh" }}>
      <PageHeader title="Profile" subtitle="Account & settings"/>

      <div className="page-content" style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {/* Banner */}
        <img 
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80" 
          alt="Profile Banner" 
          className="image-card-banner"
        />

        {/* Avatar card */}
        <div className="uiverse-card" style={{ display:"flex", alignItems:"center", gap:16, padding:20 }}>
          <div style={{
            width:64, height:64, borderRadius:20, flexShrink:0,
            background:"linear-gradient(135deg,#22d3ee33,#a78bfa33)",
            border:"1px solid #22d3ee44",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, fontWeight:700, color:"#22d3ee",
            boxShadow:"var(--neu-raised)",
          }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ margin:0, fontSize:18, fontWeight:700, letterSpacing:-0.3, color:"var(--vh-text)" }}>
              {user?.email?.split("@")[0] ?? "User"}
            </p>
            <p style={{ margin:"3px 0 6px", fontSize:12, color:"var(--vh-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?.email ?? "—"}
            </p>
            <span style={{
              background:"#22d3ee18", border:"1px solid #22d3ee44", borderRadius:99,
              padding:"3px 10px", fontSize:10, color:"#22d3ee", fontWeight:700,
            }}>
              🎯 {user?.caloricGoal?.toLocaleString() ?? "—"} kcal/day
            </span>
          </div>
        </div>

        {/* Biometrics — dynamic from registration */}
        <div className="uiverse-card" style={{ padding:18 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"var(--vh-muted)", letterSpacing:1.5, textTransform:"uppercase", margin:"0 0 12px" }}>Biometrics</p>
          {bio ? (
            <>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:10 }}>
                <BioTile label="Age"    value={bio.age}        unit="yrs" />
                <BioTile label="Weight" value={bio.weight_kg}  unit="kg"  />
                <BioTile label="Height" value={bio.height_cm}  unit="cm"  />
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                <BioTile label="Gender" value={bio.gender?.charAt(0).toUpperCase() + bio.gender?.slice(1)} />
                <BioTile label="Goal"   value={bio.fitness_goal?.charAt(0).toUpperCase() + bio.fitness_goal?.slice(1)} />
                <div style={{
                  background:"var(--vh-depressed)", boxShadow:"var(--neu-inset)",
                  borderRadius:14, padding:"12px 14px", flex:"1 1 calc(33% - 8px)",
                }}>
                  <p style={{ margin:"0 0 4px", fontSize:10, color:"var(--vh-muted)", fontWeight:600 }}>BMI</p>
                  <p style={{ margin:0 }}>
                    <span style={{ fontSize:20, fontWeight:700, color:bmiColor }}>{bmi}</span>
                    <span style={{ fontSize:10, color:bmiColor, marginLeft:5 }}>{bmiLabel}</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color:"var(--vh-muted)", fontSize:13 }}>No biometric data found. Re-register to add your stats.</p>
          )}
        </div>

        {/* Settings */}
        <div className="uiverse-card" style={{ padding: 0, overflow:"hidden" }}>
          <SettingRow icon={Bell} label="Notifications" color="#fb923c"
            sub={notifications ? "Daily reminders enabled" : "Reminders off"}
            right={<Toggle value={notifications} onToggle={handleNotifToggle}/>}
            onClick={handleNotifToggle}
          />
          <SettingRow
            icon={isDark ? Moon : Sun}
            label="Dark Mode"
            color="#a78bfa"
            sub={isDark ? "Switch to light mode" : "Switch to dark mode"}
            right={<Toggle value={isDark} onToggle={toggleTheme}/>}
            onClick={toggleTheme}
          />
          <SettingRow icon={Smartphone} label="Install App" color="#34d399"
            sub={installAvailable ? "Add VitalityHub to your home screen" : "Open in mobile browser to install"}
            onClick={handleInstall}
            right={<Download size={16} color="#34d399"/>}
          />
          <SettingRow icon={Shield} label="Privacy & Data" color="#22d3ee"
            sub="Your health data stays on your device"
            onClick={() => setPrivacyOpen(o => !o)}
          />
        </div>

        {/* Privacy info panel */}
        {privacyOpen && (
          <div style={{
            background:"var(--vh-surface)", boxShadow:"var(--neu-raised)",
            borderRadius:16, padding:"16px 18px", animation:"fadeIn .25s ease",
          }}>
            <p style={{ fontWeight:700, marginBottom:8, fontSize:14 }}>🔒 Your Privacy</p>
            <p style={{ fontSize:13, color:"var(--vh-muted)", lineHeight:1.7, margin:0 }}>
              VitalityHub stores all your health data in your own MongoDB database. No data is sold or shared with third parties.
              Passwords are hashed with bcrypt. API access is protected with JWT tokens that expire after 24 hours.
              You can delete your account and all associated data at any time.
            </p>
          </div>
        )}

        {/* Logout */}
        <div className="uiverse-card" style={{ padding: 0, overflow:"hidden" }}>
          <SettingRow icon={LogOut} label="Sign out" danger sub="You'll need to sign in again"
            onClick={() => { logout(); navigate("/login"); }}
          />
        </div>

        <p style={{ textAlign:"center", fontSize:11, color:"var(--vh-border)", padding:"4px 0 8px" }}>
          VitalityHub v1.0.0 · FastAPI + React
        </p>

      </div>
    </div>
  );
}