import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Home, LineChart, Minus, Plus, User, X } from "lucide-react";
import { useGym } from "@/store/data";
import { useTimer } from "@/store/timer";
import { beep, buzz, cn, fmtRest } from "@/lib/utils";
import { Avatar, Ring } from "./ui";
import type { Person } from "@/data/types";

const TABS = [
  { to: "/", label: "Today", icon: Home, end: true },
  { to: "/train", label: "Train", icon: Dumbbell, end: false },
  { to: "/progress", label: "Progress", icon: LineChart, end: false },
  { to: "/me", label: "Me", icon: User, end: false }
];

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-fg"><Dumbbell className="size-[18px]" strokeWidth={2.4} /></span>
      <span className="text-[15px] font-semibold tracking-tight">Five O'Clock Gym</span>
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line px-4 py-6 md:flex">
        <Logo className="px-2" />
        <nav className="grid gap-1">
          {TABS.map(t => (
            <NavLink key={t.to} to={t.to} end={t.end}
              className={({ isActive }) => cn("flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors", isActive ? "bg-card-2 text-fg" : "text-muted hover:bg-card-2/60 hover:text-fg")}>
              <t.icon className="size-[18px]" />{t.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs leading-relaxed text-muted">Step Up Fitness · Cult Andheri East<br />Mon–Fri · 5:00–6:00 PM</p>
      </aside>

      <main className="mx-auto w-full max-w-2xl px-4 pb-[calc(110px+env(safe-area-inset-bottom))] pt-safe md:px-8 md:pb-16 md:pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={pathname.split("/").slice(0, 2).join("/")} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: .18, ease: "easeOut" }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <RestTimer />

      {/* phone tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 pb-safe backdrop-blur-xl md:hidden" aria-label="Main">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-4">
          {TABS.map(t => (
            <NavLink key={t.to} to={t.to} end={t.end}
              className={({ isActive }) => cn("relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors", isActive ? "text-fg" : "text-muted")}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="tab-pill" className="absolute top-1.5 h-8 w-14 rounded-full bg-accent-soft" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <t.icon className={cn("relative size-[22px]", isActive && "text-accent")} strokeWidth={isActive ? 2.3 : 1.9} />
                  <span className="relative">{t.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ---------- rest timer: floating pill above the tab bar ---------- */
function RestTimer() {
  const { end, total, label, add, stop } = useTimer();
  const [now, setNow] = useState(Date.now());
  const left = end ? Math.max(0, Math.ceil((end - now) / 1000)) : 0;

  useEffect(() => {
    if (!end) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [end]);

  useEffect(() => {
    if (end && left === 0) {
      buzz([200, 100, 200]); beep();
      const t = setTimeout(() => { if (useTimer.getState().end === end) stop(); }, 4000);
      return () => clearTimeout(t);
    }
  }, [end, left, stop]);

  return (
    <AnimatePresence>
      {end > 0 && (
        <motion.div role="timer" aria-label={"Rest " + fmtRest(left)}
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md md:bottom-6">
          <div className={cn("flex items-center gap-3 rounded-2xl border p-2.5 pr-3 shadow-2xl backdrop-blur-xl", left === 0 ? "border-primary bg-primary text-primary-fg" : "border-line bg-card/95")}>
            <Ring value={total ? 1 - left / total : 1} size={48} stroke={4}>
              <span className="text-[11px] font-semibold tnum">{left === 0 ? "GO" : ""}</span>
            </Ring>
            <div className="min-w-0 flex-1">
              <div className="text-2xl font-bold leading-none tracking-tight tnum">{left === 0 ? "Go!" : fmtRest(left)}</div>
              <div className={cn("mt-1 truncate text-xs", left === 0 ? "text-primary-fg/75" : "text-muted")}>{left === 0 ? "Rest over. Next set." : label}</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => add(-15)} aria-label="15 seconds less" className="grid size-10 place-items-center rounded-xl hover:bg-card-2"><Minus className="size-4" /></button>
              <button onClick={() => add(15)} aria-label="15 seconds more" className="grid size-10 place-items-center rounded-xl hover:bg-card-2"><Plus className="size-4" /></button>
              <button onClick={stop} aria-label="Skip rest" className="grid size-10 place-items-center rounded-xl hover:bg-card-2"><X className="size-4" /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- first visit: who uses this phone ---------- */
export function Welcome() {
  const names = useGym(s => s.data.settings.names);
  const setMe = useGym(s => s.setMe);
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 pt-safe pb-safe">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-10 text-3xl font-bold tracking-tight">Who's using this phone?</h1>
        <p className="mt-2 text-muted">Your workouts, logs and stats open for you. You can change this later in Me.</p>
        <div className="mt-8 grid gap-3">
          {(["a", "b"] as Person[]).map(p => (
            <button key={p} onClick={() => setMe(p)}
              className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 text-left shadow-card transition hover:border-muted/50 active:scale-[.98]">
              <Avatar p={p} name={names[p]} size={48} />
              <span className="flex-1">
                <span className="block text-lg font-semibold">I'm {names[p]}</span>
                <span className="block text-sm text-muted">{p === "a" ? "Starting at 80 kg · recomp" : "Starting at 95 kg · fat loss, back-friendly swaps"}</span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
