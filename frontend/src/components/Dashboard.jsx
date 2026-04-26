import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, Droplets, TrendingUp, Zap, Wind, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle.jsx";
import FluidTank from "@/components/FluidTank.jsx";
import BodyHeatmap from "@/components/BodyHeatmap.jsx";

const MOCK_CHART = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86_400_000)
    .toLocaleDateString("en", { month:"short", day:"numeric" }),
  heartRate:  60 + Math.round(Math.random() * 30),
  bloodSugar: +(4.5 + Math.random() * 2.5).toFixed(1),
}));

function greeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}

function CalorieRing({ consumed, goal }) {
  const pct  = Math.min((consumed / goal) * 100, 100);
  const r    = 56, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  const color = pct >= 100 ? "#f87171" : pct >= 80 ? "#fb923c" : "#34d399";
  return (
    <div style={{ position:"relative", width:160, height:160, margin:"0 auto" }}>
      <svg width={160} height={160} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={80} cy={80} r={r} fill="none" stroke="var(--vh-depressed)" strokeWidth={14}/>
        <circle cx={80} cy={80} r={r} fill="none" stroke={color} strokeWidth={14}
          strokeDasharray={`${dash.toFixed(1)} ${(circ-dash).toFixed(1)}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:26, fontWeight:700, color:"var(--vh-text)", letterSpacing:-1 }}>{consumed.toLocaleString()}</span>
        <span style={{ fontSize:11, color:"var(--vh-muted)", marginTop:2 }}>/ {goal.toLocaleString()} kcal</span>
        <span style={{ fontSize:11, color, marginTop:4, fontWeight:600 }}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}

function WaterCup({ totalMl, goalMl = 2500 }) {
  const pct = Math.min((totalMl / goalMl) * 100, 100);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div style={{ position:"relative", width:50, height:70, border:"2px solid #22d3ee", borderTop:"none", borderRadius:"0 0 12px 12px", overflow:"hidden", background:"var(--vh-depressed)" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${pct}%`, background:"linear-gradient(180deg,#22d3ee88,#22d3ee)", transition:"height 0.6s cubic-bezier(.4,0,.2,1)" }}/>
      </div>
      <span style={{ fontSize:12, color:"#22d3ee", fontWeight:600 }}>{totalMl}ml</span>
      <span style={{ fontSize:10, color:"var(--vh-muted)" }}>of {goalMl}ml</span>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, unit, color, sub }) {
  const display = value ?? "—";
  return (
    <div className="uiverse-card" style={{ padding:"16px 14px", flex:"1 1 140px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:`${color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={16} color={color}/>
        </div>
        <span style={{ fontSize:11, color:"var(--vh-muted)", fontWeight:500 }}>{label}</span>
      </div>
      <div>
        <span style={{ fontSize:24, fontWeight:700, color:"var(--vh-text)", letterSpacing:-1 }}>{display}</span>
        {unit && display !== "—" && <span style={{ fontSize:12, color:"var(--vh-muted)", marginLeft:4 }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize:11, color:"var(--vh-muted)" }}>{sub}</span>}
    </div>
  );
}

function MacroBar({ label, grams, totalG, color }) {
  const pct = totalG > 0 ? (grams / totalG) * 100 : 0;
  return (
    <div style={{ flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:11, color:"var(--vh-muted)" }}>{label}</span>
        <span style={{ fontSize:11, color:"var(--vh-text)", fontWeight:600 }}>{grams}g</span>
      </div>
      <div style={{ background:"var(--vh-depressed)", boxShadow:"var(--neu-inset)", height:8, borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:99, width:`${pct}%`, background:color, transition:"width .6s ease" }}/>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--vh-surface)", borderRadius:12, padding:"10px 14px", border:"1px solid var(--vh-border)", boxShadow:"0 8px 24px rgba(0,0,0,0.3)" }}>
      <p style={{ color:"var(--vh-muted)", fontSize:11, marginBottom:6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:p.color, fontSize:13, fontWeight:600 }}>
          {p.name === "heartRate" ? "❤️ " : "🩸 "}{p.value} {p.name === "heartRate" ? "bpm" : "mmol/L"}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard({
  user       = { name:"Alex", caloricGoal:2400 },
  vitals     = { heartRate:null, bpSys:null, bpDia:null, bloodSugar:null, spo2:null },
  diet       = { totalCalories:0, totalWaterMl:0, totalProteinG:0, totalCarbsG:0, totalFatG:0 },
  chartData  = MOCK_CHART,
  onAddWater = () => {},
}) {
  const totalMacroG = diet.totalProteinG + diet.totalCarbsG + diet.totalFatG;
  const greet = useMemo(() => greeting(), []);
  const bpDisplay = vitals.bpSys && vitals.bpDia ? `${vitals.bpSys}/${vitals.bpDia}` : null;
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", color:"var(--vh-text)", minHeight:"100vh" }}>
      {/* Heroic Gym Header */}
      <div style={{
        position: "relative",
        padding: "40px 20px 24px",
        marginBottom: "20px",
        borderRadius: "0 0 24px 24px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}>
        {/* Background Image */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0
        }} />
        {/* Dark Gradient Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%)",
          zIndex: 1
        }} />
        
        {/* Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <span style={{ 
              background:"var(--gym-accent)", color:"#fff", 
              padding:"4px 12px", borderRadius:99, fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1 
            }}>
              {new Date().toLocaleDateString("en", { weekday:"long", month:"short", day:"numeric" })}
            </span>
            <ThemeToggle />
          </div>
          
          <div style={{ marginTop: 30 }}>
            <p style={{ color:"#e5e7eb", fontSize:14, margin:0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>
              {greet},
            </p>
            <h1 style={{ margin:"4px 0 16px", fontSize:32, fontWeight:900, letterSpacing:-1, color:"#ffffff", textTransform:"uppercase" }}>
              {user.name}
            </h1>
            <button onClick={() => navigate("/log")} style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "var(--gym-accent)", color: "#ffffff",
              padding: "12px 24px", borderRadius: 12, fontWeight: 800, textDecoration: "none",
              textTransform: "uppercase", fontSize: 13, letterSpacing: 1,
              boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)", border: "none", cursor: "pointer", fontFamily: "inherit"
            }}>
              Log Workout
            </button>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ display:"flex", flexDirection:"column", gap:16, paddingTop:8 }}>
        <div className="dashboard-grid">

          {/* Advanced Fluid Dynamics & Architecture of Effort */}
          <div className="full-width" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <FluidTank consumed={diet.totalCalories} goal={user.caloricGoal} />
            </div>
            <BodyHeatmap />
          </div>

          {/* Vitals */}
          <div>
            <h2 style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"var(--vh-muted)", letterSpacing:1.5, textTransform:"uppercase" }}>Vital Signs</h2>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              <VitalCard icon={Heart}    label="Heart Rate"     value={vitals.heartRate}  unit="bpm"    color="#f87171" sub="Resting"/>
              <VitalCard icon={Activity} label="Blood Sugar"    value={vitals.bloodSugar} unit="mmol/L" color="#fb923c" sub="Fasting"/>
              <VitalCard icon={Zap}      label="Blood Pressure" value={bpDisplay}         unit="mmHg"   color="#a78bfa" sub={bpDisplay ? "Sys/Dia" : "Not logged yet"}/>
              <VitalCard icon={Wind}     label="SpO₂"           value={vitals.spo2}       unit="%"      color="#34d399" sub="Blood O₂"/>
            </div>
          </div>

          {/* Hydration */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="uiverse-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div>
                  <h2 style={{ margin:0, fontSize:14, fontWeight:700, color:"var(--vh-text)" }}>Hydration</h2>
                  <p style={{ margin:"2px 0 0", fontSize:12, color:"var(--vh-muted)" }}>Goal: 2,500 ml/day</p>
                </div>
                <WaterCup totalMl={diet.totalWaterMl} goalMl={2500}/>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {[250,500].map(ml => (
                  <button key={ml} type="button" onClick={(e) => { e.preventDefault(); onAddWater(ml); }} style={{
                    flex:1, padding:"12px 0", background:"var(--vh-depressed)",
                    boxShadow:"var(--neu-inset)", borderRadius:14, border:"none",
                    color:"var(--gym-accent)", fontWeight:700, fontSize:14, cursor:"pointer",
                    fontFamily:"inherit", display:"flex", alignItems:"center",
                    justifyContent:"center", gap:6,
                  }}>
                    <Droplets size={16} color="var(--gym-accent)"/> +{ml}ml
                  </button>
                ))}
              </div>
            </div>
          </div>


          {/* Enhanced Charts */}
          <div className="full-width uiverse-card" style={{ padding: 24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <TrendingUp size={16} color="var(--gym-accent)"/>
              <h2 style={{ margin:0, fontSize:14, fontWeight:700, color:"var(--vh-text)", textTransform: "uppercase", letterSpacing: 1 }}>14-Day Heart Rate</h2>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top:10, right:4, bottom:4, left:-20 }}>
                <CartesianGrid stroke="var(--vh-border)" strokeDasharray="3 3" vertical={false} opacity={0.5}/>
                <XAxis dataKey="date" tick={{ fill:"var(--vh-muted)", fontSize:10 }} tickLine={false} axisLine={false} interval={2}/>
                <YAxis tick={{ fill:"var(--vh-muted)", fontSize:10 }} tickLine={false} axisLine={false} domain={["auto","auto"]}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Line type="monotone" dataKey="heartRate" stroke="var(--gym-accent)" strokeWidth={4} dot={{ r: 4, fill: "var(--vh-surface)", stroke: "var(--gym-accent)", strokeWidth: 2 }} activeDot={{ r: 7, fill: "var(--gym-accent)", stroke: "var(--vh-surface)", strokeWidth: 2 }} style={{ filter: "drop-shadow(0px 8px 10px rgba(239,68,68,0.4))" }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}