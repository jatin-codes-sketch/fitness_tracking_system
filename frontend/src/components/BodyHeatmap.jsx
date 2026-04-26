import { useState } from "react";

const MUSCLES = [
  { id: "chest", label: "Chest", cx: 50, cy: 35, r: 12, path: "M40,30 Q50,40 60,30 Q50,45 40,30", active: true, fatigue: 80, days: 1 },
  { id: "abs", label: "Core", cx: 50, cy: 55, r: 10, path: "M42,45 h16 v20 h-16 z", active: false, fatigue: 30, days: 4 },
  { id: "arms", label: "Arms", cx: 25, cy: 45, r: 8, path: "M35,30 Q25,45 20,60 Q30,45 38,35", active: true, fatigue: 60, days: 2 },
  { id: "arms-r", label: "Arms", cx: 75, cy: 45, r: 8, path: "M65,30 Q75,45 80,60 Q70,45 62,35", active: true, fatigue: 60, days: 2 },
  { id: "legs", label: "Legs", cx: 35, cy: 80, r: 10, path: "M42,65 Q35,85 30,110 Q45,85 48,65", active: false, fatigue: 10, days: 6 },
  { id: "legs-r", label: "Legs", cx: 65, cy: 80, r: 10, path: "M58,65 Q65,85 70,110 Q55,85 52,65", active: false, fatigue: 10, days: 6 }
];

export default function BodyHeatmap() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="uiverse-card" style={{ flex: "1 1 200px", padding: 24, display: "flex", flexDirection: "column" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "var(--vh-text)", textTransform: "uppercase", letterSpacing: 1 }}>Architecture of Effort</h3>
      
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 100 120" style={{ width: "100%", maxWidth: 180, height: "auto", overflow: "visible" }}>
          {/* Head */}
          <circle cx="50" cy="15" r="8" fill="var(--vh-depressed)" stroke="var(--vh-border)" strokeWidth="2" style={{ transition: "opacity 0.3s", opacity: hovered ? 0.3 : 1 }}/>
          
          {/* Muscles */}
          {MUSCLES.map((m) => {
            const isHovered = hovered === m.label;
            const isDimmed = hovered && hovered !== m.label;
            
            return (
              <g 
                key={m.id}
                onMouseEnter={() => setHovered(m.label)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              >
                <path 
                  d={m.path} 
                  fill={m.active ? "var(--gym-accent)" : "var(--vh-depressed)"}
                  stroke={m.active ? "var(--gym-accent)" : "var(--vh-border)"}
                  strokeWidth="2"
                  style={{
                    opacity: isDimmed ? 0.2 : (m.active ? 0.8 : 0.5),
                    transition: "all 0.3s ease",
                    transformOrigin: `${m.cx}px ${m.cy}px`,
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (() => {
          const muscle = MUSCLES.find(m => m.label === hovered);
          return (
            <div style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "var(--vh-surface)",
              border: "1px solid var(--vh-border)",
              padding: "8px 12px",
              borderRadius: 8,
              boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
              zIndex: 10,
              pointerEvents: "none"
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--vh-text)", textTransform: "uppercase" }}>{muscle.label}</div>
              <div style={{ fontSize: 10, color: "var(--vh-muted)", marginTop: 4 }}>Fatigue: <span style={{ color: "var(--gym-accent)" }}>{muscle.fatigue}%</span></div>
              <div style={{ fontSize: 10, color: "var(--vh-muted)" }}>Last: {muscle.days} days ago</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
