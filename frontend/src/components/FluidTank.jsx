import { useState } from "react";

export default function FluidTank({ consumed, goal }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.min(Math.max((consumed / goal) * 100, 0), 100);

  return (
    <div 
      className="uiverse-card" 
      style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "var(--vh-text)", textTransform: "uppercase", letterSpacing: 1 }}>Caloric Fuel</h3>
      
      <div style={{
        position: "relative",
        width: 80,
        height: 200,
        borderRadius: 40,
        border: "2px solid var(--vh-border)",
        background: "var(--vh-depressed)",
        overflow: "hidden",
        boxShadow: "inset 0 10px 20px rgba(0,0,0,0.5)",
      }}>
        {/* The Liquid */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: `${pct}%`,
          background: "var(--gym-accent)",
          transition: "height 1s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}>
          {/* SVG Wave */}
          <svg 
            viewBox="0 0 100 20" 
            preserveAspectRatio="none" 
            style={{
              position: "absolute",
              top: -19,
              left: 0,
              width: "200%",
              height: 20,
              fill: "var(--gym-accent)",
              animation: `wave-slide ${hovered ? '1s' : '3s'} linear infinite`,
            }}
          >
            <path d="M0,10 C25,-5 25,25 50,10 C75,-5 75,25 100,10 L100,20 L0,20 Z" />
          </svg>
        </div>

        {/* Hover Target Line */}
        {hovered && (
          <div style={{
            position: "absolute",
            bottom: "75%",
            left: 0,
            width: "100%",
            height: 2,
            background: "#fff",
            boxShadow: "0 0 5px #fff",
            zIndex: 10,
          }}>
            <span style={{ position: "absolute", right: -40, top: -8, fontSize: 10, fontWeight: 700, color: "#fff" }}>+300</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: "var(--vh-text)", letterSpacing: -1 }}>{consumed}</span>
        <span style={{ fontSize: 12, color: "var(--vh-muted)", marginLeft: 4 }}>/ {goal}</span>
      </div>

      <style>{`
        @keyframes wave-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
