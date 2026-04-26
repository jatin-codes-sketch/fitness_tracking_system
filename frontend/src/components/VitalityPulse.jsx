import { useState, useRef, useEffect } from "react";

// Generate 100 data points for a realistic scrolling look
const DATA = Array.from({ length: 100 }, (_, i) => ({
  x: i * 10,
  y: 50 + Math.sin(i * 0.5) * 20 + (Math.random() * 10 - 5),
  bpm: Math.round(70 + Math.sin(i * 0.5) * 15 + (Math.random() * 5)),
}));

const pathData = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${d.x},${d.y}`).join(" ");

export default function VitalityPulse() {
  const [hoveredX, setHoveredX] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const svgRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    setHoveredX(xPos);

    // Find closest data point based on percentage of width
    // The SVG viewbox is 1000px wide. We scale the mouse X to viewbox X.
    const viewBoxX = (xPos / rect.width) * 1000;
    const closest = DATA.reduce((prev, curr) => 
      Math.abs(curr.x - viewBoxX) < Math.abs(prev.x - viewBoxX) ? curr : prev
    );
    setHoveredData(closest);
  };

  return (
    <div className="uiverse-card full-width" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--vh-text)", textTransform: "uppercase", letterSpacing: 1 }}>Live Vitality Pulse</h3>
        
        <div style={{ 
          fontFamily: "'Courier New', Courier, monospace", 
          fontSize: 18, 
          fontWeight: 700, 
          color: "var(--gym-accent)",
          background: "rgba(239,68,68,0.1)",
          padding: "4px 12px",
          borderRadius: 6,
          border: "1px solid rgba(239,68,68,0.3)"
        }}>
          {hoveredData ? `${hoveredData.bpm} BPM` : "--- BPM"}
        </div>
      </div>

      <div 
        ref={svgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredX(null); setHoveredData(null); }}
        style={{ position: "relative", height: 120, cursor: "crosshair" }}
      >
        <div style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderBottom: "1px solid var(--vh-border)"
        }}>
          {/* The scrolling wrapper */}
          <div style={{
            width: "200%", 
            height: "100%",
            animation: "scroll-pulse 10s linear infinite",
            animationPlayState: hoveredX !== null ? "paused" : "running"
          }}>
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ width: "50%", height: "100%", display: "inline-block" }}>
              <polyline points={pathData} fill="none" stroke="var(--gym-accent)" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ width: "50%", height: "100%", display: "inline-block" }}>
              <polyline points={pathData} fill="none" stroke="var(--gym-accent)" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Hover Scanning Line */}
        {hoveredX !== null && (
          <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: hoveredX,
            width: 1,
            background: "var(--vh-text)",
            boxShadow: "0 0 5px var(--vh-text)",
            pointerEvents: "none"
          }} />
        )}
      </div>

      <style>{`
        @keyframes scroll-pulse {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
