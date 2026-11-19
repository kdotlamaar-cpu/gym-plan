import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Flame, Footprints, Info, MapPin, NotebookPen, Trophy } from "lucide-react";
import { COOLDOWN, WARMUP } from "@/data/program";
import { DAY_KEYS, DAY_NAMES, DAY_SHORT, addDays, mondayOf, mondayOfKey, todayKey, weekKey } from "@/lib/dates";
import { getDay, useGym } from "@/store/data";
import { useTimer } from "@/store/timer";
import { useMe } from "@/lib/hooks";
import { buzz, cn } from "@/lib/utils";
import { Button, Card, Ring, Sheet, toast } from "@/components/ui";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ClassPicker } from "@/components/ClassPicker";
import { ArrangeSheet } from "@/components/ArrangeSheet";
import { SESSION_LABEL, isShuffled, programOf, sessionOf } from "@/lib/plan";
import type { DayKey, LiftDay, SessionKey } from "@/data/types";

export default function Train() {
  const { day } = useParams();
  const [sp, setSp] = useSearchParams();
  const thisMonday = mondayOf(new Date());
  const monday = (sp.get("w") && mondayOfKey(sp.get("w")!)) || thisMonday;
  const isThisWeek = monday.getTime() === thisMonday.getTime();
  const nav = useNavigate();
  const data = useGym(s => s.data);
  const [arrange, setArrange] = useState(false);

  if (!day || !DAY_KEYS.includes(day as DayKey)) return <Navigate to={"/train/" + (todayKey() || "mon")} replace />;
  const k = day as DayKey;
  const wk = weekKey(monday);
  const tk = todayKey();
  const goWeek = (n: number) => {
    const m = addDays(monday, 7 * n);
    if (m.getTime() === thisMonday.getTime()) sp.delete("w"); else sp.set("w", weekKey(m));
    setSp(sp, { replace: true });
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3 pt-5">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Train</h1>
        <div className="flex items-center gap-1 rounded-xl bg-card-2 p-1 text-[13px] font-medium">
          <button onClick={() => goWeek(-1)} aria-label="Previous week" className="grid size-8 place-items-center rounded-lg hover:bg-card"><ChevronLeft className="size-4" /></button>
          <span className="min-w-[88px] text-center tnum">{isThisWeek ? "This week" : `Week of ${monday.getDate()} ${monday.toLocaleString("en-IN", { month: "short" })}`}</span>
          <button onClick={() => goWeek(1)} disabled={monday >= thisMonday} aria-label="Next week" className="grid size-8 place-items-center rounded-lg hover:bg-card disabled:opacity-30"><ChevronRight className="size-4" /></button>
        </div>
      </header>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted">{isShuffled(data, wk) ? "Shuffled this week" : "Your usual week"}</p>
        <button type="button" onClick={() => setArrange(true)} className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-accent hover:bg-card-2">
          <ArrowLeftRight className="size-3.5" /> Arrange week
        </button>
      </div>

      <DayTabs k={k} monday={monday} wk={wk} isThisWeek={isThisWeek} tk={tk} onPick={d => nav({ pathname: "/train/" + d, search: sp.toString() }, { replace: true })} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={k + wk} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: .16 }} className="space-y-5">
          <Session s={sessionOf(data, wk, k)} k={k} wk={wk} monday={monday} onArrange={() => setArrange(true)} />
          <Note k={k} wk={wk} />
        </motion.div>
      </AnimatePresence>
      <ArrangeSheet open={arrange} onOpenChange={setArrange} wk={wk} monday={monday} />
    </div>
  );
}

function Session({ s, k, wk, monday, onArrange }: { s: SessionKey; k: DayKey; wk: string; monday: Date; onArrange: () => void }) {
  if (s === "rest") return <RestDay onArrange={onArrange} />;
  if (s === "class") return <ClassDay k={k} wk={wk} monday={monday} />;
  return <LiftSession k={k} p={programOf(s) as LiftDay} wk={wk} prevWk={weekKey(addDays(monday, -7))} />;
}

function RestDay({ onArrange }: { onArrange: () => void }) {
  return (
    <Card className="p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-card-2"><Footprints className="size-6" /></span>
      <h2 className="mt-3 text-xl font-bold tracking-tight">Rest day</h2>
      <p className="mx-auto mt-1 max-w-[32ch] text-[14px] text-muted">Walk 8–10k steps and keep protein high. Want to train today instead?</p>
      <Button variant="secondary" className="mt-5" onClick={onArrange}><ArrowLeftRight className="size-4" /> Put a session here</Button>
    </Card>
  );
}

function DayTabs({ k, monday, wk, isThisWeek, tk, onPick }: { k: DayKey; monday: Date; wk: string; isThisWeek: boolean; tk: DayKey | null; onPick: (d: DayKey) => void }) {
  const { me } = useMe();
  const data = useGym(s => s.data);
  return (
    <div role="tablist" aria-label="Day" className="grid grid-cols-5 gap-1.5">
      {DAY_KEYS.map(d => {
        const on = d === k, done = !!getDay(data, wk, me, d).done;
        const label = SESSION_LABEL[sessionOf(data, wk, d)];
        return (
          <button key={d} role="tab" aria-selected={on} onClick={() => onPick(d)}
            className={cn("relative flex flex-col items-center gap-0.5 rounded-xl border py-2.5 transition-colors", on ? "border-fg bg-fg text-bg" : "border-line bg-card text-fg hover:border-muted/50")}>
            <span className={cn("text-[11px] font-medium uppercase tracking-wide", on ? "text-bg/70" : "text-muted")}>{isThisWeek && d === tk ? "Today" : DAY_SHORT[d]}</span>
            <span className="text-[13px] font-semibold">{label}</span>
            {done && <span className={cn("absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-primary-fg ring-2", on ? "ring-bg" : "ring-bg")}><Check className="size-2.5" strokeWidth={4} /></span>}
            <span className="sr-only">{addDays(monday, DAY_KEYS.indexOf(d)).toDateString()}{done ? ", done" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

function LiftSession({ k, p, wk, prevWk }: { k: DayKey; p: LiftDay; wk: string; prevWk: string }) {
  const { me } = useMe();
  const data = useGym(s => s.data);
  const setDone = useGym(s => s.setDone);
  const stopRest = useTimer(s => s.stop);
  const dl = getDay(data, wk, me, k);
  const [info, setInfo] = useState(false);

  const counts = useMemo(() => p.ex.map(e => {
    const s = dl.sets?.[e.id] || [];
    return { total: Math.max(e.sets, s.length), done: s.filter(x => x.ok).length };
  }), [dl.sets, p.ex]);
  const total = counts.reduce((a, c) => a + c.total, 0), doneSets = counts.reduce((a, c) => a + c.done, 0);
  const firstOpen = counts.findIndex(c => c.done < c.total);
  const [open, setOpen] = useState<number>(firstOpen === -1 ? -1 : firstOpen);
  useEffect(() => { setOpen(firstOpen === -1 ? -1 : firstOpen); /* reset when the day or its session changes */ }, [k, wk, p.type]); // eslint-disable-line react-hooks/exhaustive-deps

  const volume = p.ex.reduce((a, e) => a + (dl.sets?.[e.id] || []).reduce((v, s) => v + (s.ok && s.kg && s.reps ? s.kg * s.reps : 0), 0), 0);

  function finish() {
    const next = !dl.done;
    setDone(wk, me, k, next);
    if (next) {
      stopRest(); buzz([30, 60, 30]);
      toast(`Workout complete · ${doneSets} sets · ${Math.round(volume).toLocaleString("en-IN")} kg lifted`);
    }
  }

  return (
    <>
      <Card className="flex items-center gap-4 p-4">
        <Ring value={total ? doneSets / total : 0} size={64} stroke={6}>
          <span className="text-sm font-bold tnum">{Math.round(total ? (doneSets / total) * 100 : 0)}%</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight">{p.title} day</h2>
          <p className="truncate text-[13px] text-muted">{p.focus}</p>
          <p className="mt-1 text-[13px] font-medium tnum">{doneSets}/{total} sets{volume ? ` · ${Math.round(volume).toLocaleString("en-IN")} kg` : ""}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setInfo(true)} aria-label="Warm-up, finisher and cool-down"><Info className="size-4" /> Guide</Button>
      </Card>

      <div className="space-y-2.5">
        {p.ex.map((e, i) => (
          <ExerciseCard key={e.id} e={e} list={p.ex} day={k} wk={wk} prevWk={prevWk} p={me}
            open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}
            onComplete={() => { const n = counts.findIndex((c, j) => j > i && c.done < c.total); setOpen(n); }} />
        ))}
      </div>

      <Card className="flex items-start gap-3 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent"><Flame className="size-5" /></span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold">Finisher · 8 min</h3>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{me === "b" && p.finisher.alt ? p.finisher.alt : p.finisher.detail}</p>
        </div>
      </Card>

      <Button size="lg" className={cn("w-full", dl.done && "bg-card-2 text-fg")} variant={dl.done ? "secondary" : "primary"} onClick={finish}>
        {dl.done ? <><Trophy className="size-5 text-accent" /> Completed · tap to undo</> : <><Check className="size-5" /> Finish workout</>}
      </Button>

      <Sheet open={info} onOpenChange={setInfo} title={`${p.title} day guide`} description="Step Up Fitness · 5:00–6:00 PM">
        <div className="space-y-5 text-[14px]">
          <Steps title="Warm-up · 7 min" steps={WARMUP[p.type]} />
          <div>
            <h4 className="mb-2 font-semibold">How it works</h4>
            <ul className="space-y-1.5 text-muted">
              <li><b className="text-fg">Supersets</b> (D1 + D2): one set of each back to back, then rest.</li>
              <li><b className="text-fg">Drop set</b>: on the last set, finish your reps, cut the weight ~25% and go again.</li>
              <li><b className="text-fg">Grey numbers</b> are last week's. Tap ✓ on an empty set to reuse them.</li>
            </ul>
          </div>
          <Steps title="Cool-down · 4 min" steps={COOLDOWN[p.type]} />
        </div>
      </Sheet>
    </>
  );
}

function Steps({ title, steps }: { title: string; steps: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-2 font-semibold">{title}</h4>
      <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {steps.map(([q, w]) => (
          <li key={w} className="grid grid-cols-[84px_1fr] gap-3 px-3 py-2.5"><span className="text-muted tnum">{q}</span><span>{w}</span></li>
        ))}
      </ol>
    </div>
  );
}

function ClassDay({ k, wk, monday }: { k: DayKey; wk: string; monday: Date }) {
  const { me } = useMe();
  const data = useGym(s => s.data);
  const done = !!getDay(data, wk, me, k).cls;
  return (
    <>
      <div>
        <div className="flex items-center gap-1.5 text-[13px] text-muted"><MapPin className="size-3.5" /> Cult Andheri East · {DAY_NAMES[k]} {addDays(monday, DAY_KEYS.indexOf(k)).getDate()}</div>
        <h2 className="mt-1 text-xl font-bold tracking-tight">{done ? "Your class" : "Which class did you do?"}</h2>
      </div>
      <ClassPicker wk={wk} day={k} monday={monday} p={me} />
    </>
  );
}

function Note({ k, wk }: { k: DayKey; wk: string }) {
  const { me } = useMe();
  const note = useGym(s => getDay(s.data, wk, me, k).note || "");
  const setNote = useGym(s => s.setNote);
  const [open, setOpen] = useState(!!note);
  useEffect(() => setOpen(!!note), [k, wk]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 text-[13px] font-medium text-muted hover:text-fg">
        <NotebookPen className="size-4" /> Add a note
      </button>
    );
  }
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-muted"><NotebookPen className="size-4" /> Note</span>
      <textarea defaultValue={note} key={k + wk} maxLength={400} rows={2} autoFocus={!note} placeholder="How did it feel?"
        onBlur={ev => setNote(wk, me, k, ev.target.value.trim())}
        className="w-full resize-none rounded-xl border border-line bg-card px-4 py-3 text-[15px] outline-none focus:border-accent" />
    </label>
  );
}
