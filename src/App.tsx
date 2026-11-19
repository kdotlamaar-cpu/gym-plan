import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useGym } from "@/store/data";
import { Shell, Welcome } from "@/components/shell";
import { Toaster } from "@/components/ui";
import Today from "@/screens/Today";
import Train from "@/screens/Train";
import Me from "@/screens/Me";
import { Diet, Gyms, Plan } from "@/screens/Info";

const Progress = lazy(() => import("@/screens/Progress"));

function useTheme() {
  const theme = useGym(s => s.theme);
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0a0a0b" : "#f4f4f5");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}

export default function App() {
  useTheme();
  const me = useGym(s => s.me);
  return (
    <MotionConfig reducedMotion="user">
      <Toaster />
      {!me ? <Welcome /> : (
        <HashRouter>
          <Shell>
            <Routes>
              <Route path="/" element={<Today />} />
              <Route path="/train" element={<Train />} />
              <Route path="/train/:day" element={<Train />} />
              <Route path="/progress" element={<Suspense fallback={<div className="h-dvh" />}><Progress /></Suspense>} />
              <Route path="/me" element={<Me />} />
              <Route path="/me/plan" element={<Plan />} />
              <Route path="/me/diet" element={<Diet />} />
              <Route path="/me/gyms" element={<Gyms />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        </HashRouter>
      )}
    </MotionConfig>
  );
}
