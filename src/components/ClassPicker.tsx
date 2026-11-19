import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flame, RotateCcw } from "lucide-react";
import { CLASSES } from "@/data/program";
import { getDay, useGym } from "@/store/data";
import { plannedClass } from "@/lib/dates";
import { buzz, cn } from "@/lib/utils";
import { ClassIcon } from "./icons";
import { toast } from "./ui";
import type { DayKey, Person } from "@/data/types";

const IDS = Object.keys(CLASSES);

/** Wednesday: tap the class you did. One tap logs it and marks the day done. */
export function ClassPicker({ wk, day, monday, p }: { wk: string; day: DayKey; monday: Date; p: Person }) {
  const data = useGym(s => s.data);
  const setClass = useGym(s => s.setClass);
  const dl = getDay(data, wk, p, day);
  const cur = dl.cls && CLASSES[dl.cls] ? dl.cls : null;
  const planned = plannedClass(monday);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (cur === "other" && !dl.clsName) nameRef.current?.focus(); }, [cur, dl.clsName]);

  function pick(id: string) {
    if (id === cur) return;
    setClass(wk, p, day, id);
    buzz(20);
    if (id !== "other") toast(`${CLASSES[id].name} logged. Nice work.`);
  }

  const info = cur ? CLASSES[cur] : null;

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Class you did" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {IDS.map(id => {
          const c = CLASSES[id], on = id === cur;
          return (
            <motion.button key={id} type="button" role="radio" aria-checked={on} onClick={() => pick(id)} whileTap={{ scale: .96 }}
              className={cn("relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                id === "other" && "col-span-2 flex-row items-center sm:col-span-3",
                on ? "border-primary bg-accent-soft" : "border-line bg-card hover:border-muted/50")}>
              <span className={cn("grid size-11 place-items-center rounded-xl transition-colors", on ? "bg-primary text-primary-fg" : "bg-card-2 text-fg")}>
                <ClassIcon id={id} size={22} />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold">{c.name}</span>
                <span className="block text-[13px] text-muted">{c.sub}</span>
              </span>
              {on ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 22 }}
                  className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-primary text-primary-fg"><Check className="size-3.5" strokeWidth={3} /></motion.span>
              ) : id === planned && !cur ? (
                <span className="absolute right-3 top-3 rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">Plan</span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {cur === "other" && (
          <motion.label initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="block overflow-hidden">
            <span className="mb-1.5 block text-[13px] font-medium text-muted">Class name</span>
            <input ref={nameRef} defaultValue={dl.clsName || ""} maxLength={30} placeholder="e.g. Kickboxing, Pilates"
              onBlur={ev => { const v = ev.target.value.trim(); setClass(wk, p, day, "other", v); if (v) toast(`${v} logged.`); }}
              onKeyDown={ev => { if (ev.key === "Enter") (ev.target as HTMLInputElement).blur(); }}
              className="h-12 w-full rounded-xl border border-line bg-card px-4 text-base outline-none focus:border-accent" />
          </motion.label>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {info && cur !== "other" && (
          <motion.div key={cur} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-line bg-card p-4">
            <p className="text-[14px] leading-relaxed text-muted">{info.why}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {info.focus.map(f => <span key={f} className="rounded-full bg-card-2 px-2.5 py-1 text-xs font-medium">{f}</span>)}
              <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"><Flame className="size-3" /> ≈ {info.kcal} kcal</span>
            </div>
            {p === "b" && info.back && <p className="mt-3 rounded-xl bg-pb/10 p-3 text-[13px] leading-relaxed"><b className="font-semibold">Your back:</b> {info.back}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {cur && (
        <button type="button" onClick={() => { setClass(wk, p, day, null); toast("Class log cleared."); }} className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-fg">
          <RotateCcw className="size-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
