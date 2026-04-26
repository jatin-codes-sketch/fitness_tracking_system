import { useState } from "react";

// Generate 28 days of mock data
const MOCK_DAYS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  date: new Date(Date.now() - (27 - i) * 86_400_000).toLocaleDateString("en", { month: "short", day: "numeric" }),
  success: Math.random() > 0.3,
  metric: `Steps: ${8000 + Math.round(Math.random() * 6000)}`,
}));

export default function ConsistencyGrid() {
  const [hoveredTile, setHoveredTile] = useState(null);

  return (
    <div className="uiverse-card full-width" style={{ padding: "24px" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "var(--vh-text)", textTransform: "uppercase", letterSpacing: 1 }}>Consistency (28 Days)</h3>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "6px",
        perspective: "1000px", // Enables 3D flipping effects
      }}>
        {MOCK_DAYS.map((day) => {
          const isHovered = hoveredTile === day.id;
          return (
            <div
              key={day.id}
              onMouseEnter={() => setHoveredTile(day.id)}
              onMouseLeave={() => setHoveredTile(null)}
              style={{
                aspectRatio: "1",
                background: day.success ? "var(--gym-accent)" : "var(--vh-depressed)",
                borderRadius: 8,
                position: "relative",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transformStyle: "preserve-3d",
                transform: isHovered ? "translateZ(10px) translateY(-4px) rotateX(10deg)" : "translateZ(0) translateY(0) rotateX(0deg)",
                boxShadow: isHovered 
                  ? (day.success ? "0 10px 15px rgba(239, 68, 68, 0.4)" : "0 10px 15px rgba(0,0,0,0.5)") 
                  : "none",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              {isHovered && (
                <div style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  background: "var(--vh-surface)",
                  border: "1px solid var(--vh-border)",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--vh-text)",
                  whiteSpace: "nowrap",
                  zIndex: 20,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  pointerEvents: "none"
                }}>
                  {day.date} • {day.metric}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
