import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Info, Minus, Plus } from "lucide-react";
import type { DayKey, Exercise, Person, SetEntry } from "@/data/types";
import { getDay, useGym } from "@/store/data";
import { useTimer } from "@/store/timer";
import { buzz, cn, img, parseSet, unlockAudio } from "@/lib/utils";
import { findSets } from "@/lib/plan";

interface Props {
  e: Exercise;
  list: Exercise[];
  day: DayKey;
  wk: string;
  prevWk: string;
  p: Person;
  open: boolean;
  onToggle: () => void;
  onComplete: () => void;   // all sets of this exercise ticked
}

export function ExerciseCard({ e, list, day, wk, prevWk, p, open, onToggle, onComplete }: Props) {
  const data = useGym(s => s.data);
  const { setSet, addSet, removeSet } = useGym.getState();
  const startRest = useTimer(s => s.start);
  const [shot, setShot] = useState(0);

  const dl = getDay(data, wk, p, day);
  const saved = dl.sets?.[e.id] || [];
  const sets: SetEntry[] = Array.from({ length: Math.max(e.sets, saved.length) }, (_, i) => saved[i] || { kg: null, reps: null });
  const doneN = sets.filter(s => s.ok).length;
  const complete = doneN === sets.length;
  // last week's numbers, whichever day the session was on
  const prev = findSets(data, prevWk, p, e.id);
  const prevSets = prev.sets;
  const prevBest = parseSet(prev.best);
  const hint = (i: number) => {
    const s = prevSets[i];
    if (s && s.kg != null) return { kg: s.kg, reps: s.reps };
    return prevBest ? { kg: prevBest.kg, reps: prevBest.reps } : { kg: null, reps: null };
  };
  const useSwap = p === "b" && !!e.swap;
  const pic = useSwap && e.swapImg ? e.swapImg : e.img[0];
  const isFirstOfPair = /1$/.test(e.tag);
  const mate = /^[A-Z][12]$/.test(e.tag) ? list.find(x => x.tag === e.tag[0] + (e.tag[1] === "1" ? "2" : "1")) : undefined;

  function commit(i: number, f: "kg" | "reps", raw: string) {
    const v = raw.trim().replace(",", ".");
    const n = v === "" ? null : f === "kg" ? parseFloat(v) : parseInt(v, 10);
    if (v !== "" && !(n != null && n >= 0)) return;
    if (n === sets[i][f]) return;
    setSet(wk, p, day, e.id, i, { [f]: n }, e.sets);
  }

  function tick(i: number) {
    unlockAudio();
    // read fresh: a field may have been committed on blur a moment ago
    const s = getDay(useGym.getState().data, wk, p, day).sets?.[e.id]?.[i] || { kg: null, reps: null };
    const turningOn = !s.ok;
    const h = hint(i);
    const kg = s.kg ?? (turningOn ? h.kg : null);
    const reps = s.reps ?? (turningOn ? h.reps ?? parseInt(e.reps, 10) : null);
    setSet(wk, p, day, e.id, i, { kg: kg ?? null, reps: Number.isFinite(reps as number) ? reps : null, ok: turningOn }, e.sets);
    if (!turningOn) return;
    buzz(15);
    const lastSet = doneN + 1 === sets.length;
    if (e.rest <= 20 && mate) startRest(e.rest, `Go: ${mate.tag} ${mate.n}`);
    else startRest(e.rest, mate ? `Rest, then ${mate.tag} ${mate.n}` : lastSet ? "Rest, then next exercise" : `Rest, then set ${i + 2}`);
    if (lastSet) setTimeout(onComplete, 350);
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-card transition-colors", open ? "border-muted/40" : "border-line")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 p-3 text-left">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-card-2">
          <img src={img(pic, 0)} alt="" loading="lazy" className="size-full object-cover" />
          <span className="absolute left-1 top-1 rounded-md bg-black/65 px-1.5 py-px text-[10px] font-bold text-white">{e.tag}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{useSwap && e.swapImg ? e.swap!.split(/[.,]/)[0] : e.n}</span>
          <span className="mt-0.5 block truncate text-[13px] text-muted">
            {e.sets} × {e.reps}{isFirstOfPair && mate ? ` · superset with ${mate.tag}` : ` · rest ${e.restTxt}`}
          </span>
        </span>
        {complete ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-fg"><Check className="size-4" strokeWidth={3} /></span>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-muted tnum">
            {doneN > 0 && <span>{doneN}/{sets.length}</span>}
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .22, ease: [.3, .7, .4, 1] }}>
            <div className="space-y-4 px-3 pb-3">
              {/* photos */}
              <div className="relative overflow-hidden rounded-xl bg-card-2">
                <img src={img(pic, shot)} alt={`${e.n}, ${shot ? "finish" : "start"} position`} className="aspect-[16/10] w-full object-cover" />
                <div className="absolute bottom-2 left-2 flex rounded-lg bg-black/60 p-0.5 text-xs font-medium text-white backdrop-blur">
                  {["Start", "Finish"].map((t, i) => (
                    <button key={t} type="button" onClick={() => setShot(i)} className={cn("rounded-md px-2.5 py-1", shot === i && "bg-white text-black")}>{t}</button>
                  ))}
                </div>
                {e.drop && <span className="absolute right-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-fg">Drop set on last</span>}
              </div>

              {useSwap ? (
                <p className="flex gap-2 rounded-xl bg-pb/10 p-3 text-[13px] leading-relaxed text-fg"><Info className="mt-0.5 size-4 shrink-0 text-pb" /><span><b className="font-semibold">Your swap:</b> {e.swap}</span></p>
              ) : (
                <p className="text-[13px] leading-relaxed text-muted">{e.tip}</p>
              )}

              {/* sets */}
              <div>
                <div className="grid grid-cols-[32px_1fr_1fr_48px] gap-2 px-1 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                  <span className="text-center">Set</span><span className="text-center">kg</span><span className="text-center">Reps</span><span />
                </div>
                <div className="space-y-1.5">
                  {sets.map((s, i) => {
                    const h = hint(i);
                    return (
                      <motion.div key={i} layout className={cn("grid grid-cols-[32px_1fr_1fr_48px] items-center gap-2 rounded-xl p-1 transition-colors", s.ok && "bg-accent-soft")}>
                        <span className={cn("text-center text-sm font-semibold tnum", s.ok ? "text-accent" : "text-muted")}>{i + 1}</span>
                        <input inputMode="decimal" autoComplete="off" aria-label={`Set ${i + 1} weight in kg`} defaultValue={s.kg ?? ""} key={"kg" + (s.kg ?? "")}
                          placeholder={h.kg != null ? String(h.kg) : "–"} onBlur={ev => commit(i, "kg", ev.target.value)}
                          className="h-11 w-full min-w-0 rounded-xl border border-line bg-bg text-center text-base font-semibold tnum outline-none transition placeholder:font-normal placeholder:text-muted/60 focus:border-accent" />
                        <input inputMode="numeric" autoComplete="off" aria-label={`Set ${i + 1} reps`} defaultValue={s.reps ?? ""} key={"r" + (s.reps ?? "")}
                          placeholder={h.reps != null ? String(h.reps) : e.reps.split(/[–\s/]/)[0]} onBlur={ev => commit(i, "reps", ev.target.value)}
                          className="h-11 w-full min-w-0 rounded-xl border border-line bg-bg text-center text-base font-semibold tnum outline-none transition placeholder:font-normal placeholder:text-muted/60 focus:border-accent" />
                        <button type="button" onPointerDown={() => (document.activeElement as HTMLElement)?.blur()} onClick={() => tick(i)} aria-pressed={!!s.ok} aria-label={`Set ${i + 1} ${s.ok ? "done, tap to undo" : "complete"}`}
                          className={cn("grid h-11 w-12 place-items-center rounded-xl border transition active:scale-95", s.ok ? "border-primary bg-primary text-primary-fg" : "border-line bg-card-2 text-muted hover:text-fg")}>
                          <Check className="size-5" strokeWidth={s.ok ? 3 : 2.2} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-[13px] text-muted">
                <span>{prevBest ? <>Last week best <b className="font-semibold text-fg tnum">{prevBest.kg} kg × {prevBest.reps}</b></> : "No log from last week"}</span>
                <span className="flex gap-1">
                  {sets.length > e.sets && (
                    <button type="button" onClick={() => removeSet(wk, p, day, e.id, e.sets)} className="flex h-8 items-center gap-1 rounded-lg px-2 hover:bg-card-2 hover:text-fg" aria-label="Remove set"><Minus className="size-3.5" /></button>
                  )}
                  <button type="button" onClick={() => addSet(wk, p, day, e.id, e.sets)} className="flex h-8 items-center gap-1 rounded-lg px-2 font-medium hover:bg-card-2 hover:text-fg"><Plus className="size-3.5" /> Set</button>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
