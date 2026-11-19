import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { useGym } from "@/store/data";
import App from "./App";
import "./index.css";

/* Personal links: ?who=a|b|<name> sets up this phone for that person, then the param is removed. */
(function applyWho() {
  const q = new URLSearchParams(location.search).get("who");
  if (!q) return;
  const v = q.toLowerCase(), names = useGym.getState().data.settings.names;
  const p = v === "a" || v === names.a.toLowerCase() ? "a" : v === "b" || v === names.b.toLowerCase() ? "b" : null;
  if (p) useGym.getState().setMe(p);
  history.replaceState(null, "", location.pathname + location.hash);
})();

/* The old multi-page site used its own service-worker caches ("fogp-v*"); drop them. */
if ("caches" in window) caches.keys().then(ks => ks.filter(k => k.startsWith("fogp-")).forEach(k => caches.delete(k))).catch(() => {});
if (location.protocol.startsWith("http") && location.hostname !== "localhost") registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
