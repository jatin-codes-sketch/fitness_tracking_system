import { useState } from "react";

const INITIAL_PILLS = [
  { id: 1, name: "Omega 3", taken: false },
  { id: 2, name: "Vitamin D", taken: true },
  { id: 3, name: "Zinc", taken: false },
  { id: 4, name: "Creatine", taken: true },
  { id: 5, name: "Whey", taken: false },
];

export default function PillTracker() {
  const [pills, setPills] = useState(INITIAL_PILLS);
  const [hoverId, setHoverId] = useState(null);
  const [rippleId, setRippleId] = useState(null);

  const togglePill = (id) => {
    setPills(prev => prev.map(p => p.id === id ? { ...p, taken: !p.taken } : p));
    if (!pills.find(p => p.id === id).taken) {
      setRippleId(id);
      setTimeout(() => setRippleId(null), 600);
    }
  };

  return (
    <div className="uiverse-card" style={{ padding: "20px" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "var(--vh-text)", textTransform: "uppercase", letterSpacing: 1 }}>Supplements</h3>
      
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {pills.map(pill => (
          <div 
            key={pill.id}
            onClick={() => togglePill(pill.id)}
            onMouseEnter={() => setHoverId(pill.id)}
            onMouseLeave={() => setHoverId(null)}
            style={{ position: "relative", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: pill.taken ? "none" : "2px dashed var(--vh-border)",
              background: pill.taken ? "var(--gym-accent)" : (hoverId === pill.id ? "rgba(239,68,68,0.1)" : "transparent"),
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: pill.taken ? "scale(0.9)" : (hoverId === pill.id ? "scale(1.05)" : "scale(1)"),
              boxShadow: pill.taken ? "0 4px 10px rgba(239, 68, 68, 0.3)" : "none",
            }}>
              {/* Ghost icon on hover for untaken */}
              {!pill.taken && hoverId === pill.id && (
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--gym-accent)", opacity: 0.3 }} />
              )}
            </div>

            {/* Ripple Effect */}
            {rippleId === pill.id && (
              <div style={{
                position: "absolute", top: 0, left: 0, width: 36, height: 36,
                borderRadius: "50%", border: "2px solid var(--gym-accent)",
                animation: "pill-ripple 0.6s ease-out forwards",
                pointerEvents: "none",
              }} />
            )}

            <span style={{ fontSize: 10, color: pill.taken ? "var(--vh-text)" : "var(--vh-muted)", fontWeight: 600 }}>{pill.name}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pill-ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
