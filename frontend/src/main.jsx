import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { registerServiceWorker } from "./pwa/registerSW.js";
import "./index.css";

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__vh_installPrompt = e;
  window.dispatchEvent(new CustomEvent("vh-install-available"));
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

registerServiceWorker();