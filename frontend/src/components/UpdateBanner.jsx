import { useState, useEffect } from "react";
import { applyServiceWorkerUpdate } from "@/pwa/registerSW.js";

export default function UpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  if (!visible) return null;

  return (
    <div>
    </div>
  );
}