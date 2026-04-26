/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vh: {
          bg:       "#0f172a",
          surface:  "#1e293b",
          raised:   "#1e2d45",
          depressed:"#080f1c",
          border:   "#334155",
          accent:   "#22d3ee",
          violet:   "#a78bfa",
          emerald:  "#34d399",
          amber:    "#fb923c",
          danger:   "#f87171",
          muted:    "#64748b",
          text:     "#e2e8f0",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neu-raised":   "5px 5px 12px #040810, -3px -3px 8px #1e3350",
        "neu-inset":    "inset 3px 3px 8px #040810, inset -2px -2px 6px #1a2d48",
        "neu-btn":      "4px 4px 10px #040810, -3px -3px 8px #1a2d48",
      },
      borderRadius: {
        "2xl":  "18px",
        "3xl":  "24px",
      },
      animation: {
        "fill-up":    "fillUp 0.8s cubic-bezier(.4,0,.2,1) forwards",
        "fade-in":    "fadeIn 0.3s ease forwards",
        "slide-up":   "slideUp 0.4s cubic-bezier(.4,0,.2,1) forwards",
        "pulse-ring": "pulseRing 1.4s ease-in-out infinite",
      },
      keyframes: {
        fillUp:    { from:{height:"0%"}, to:{height:"var(--fill-h)"} },
        fadeIn:    { from:{opacity:0}, to:{opacity:1} },
        slideUp:   { from:{opacity:0,transform:"translateY(16px)"}, to:{opacity:1,transform:"none"} },
        pulseRing: { "0%,100%":{opacity:1}, "50%":{opacity:0.4} },
      },
    },
  },
  plugins: [],
};