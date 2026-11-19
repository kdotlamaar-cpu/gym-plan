import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, Flame, MapPin, Moon, TrendingDown, TrendingUp } from "lucide-react";
import { CLASSES, PROGRAM } from "@/data/program";
import { DAY_KEYS, DAY_NAMES, DAY_SHORT, addDays, blockWeek, mondayOf, plannedClass, todayKey, weekKey } from "@/lib/dates";
import { getDay, getWeight, useGym } from "@/store/data";
import { useMe } from "@/lib/hooks";
import { img, cn } from "@/lib/utils";
import { Avatar, Card } from "@/components/ui";
import { ClassIcon } from "@/components/icons";
import type { DayKey, GymData, Person } from "@/data/types";

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function className(data: GymData, wk: string, p: Person) {
  const d = getDay(data, wk, p, "wed");
  if (!d.cls || !CLASSES[d.cls]) return "";
  return d.cls === "other" ? d.clsName || "Other class" : CLASSES[d.cls].name;
}
export function sessionsIn(data: GymData, wk: string, p: Person) {
  return DAY_KEYS.filter(k => getDay(data, wk, p, k).done).length;
}
export function streakOf(data: GymData, p: Person) {
  const monday = mondayOf(new Date());
  let s = 0;
  for (let i = 1; i < 104; i++) { if (sessionsIn(data, weekKey(addDays(monday, -7 * i)), p) >= 4) s++; else break; }
  if (sessionsIn(data, weekKey(monday), p) >= 4) s++;
  return s;
}

export default function Today() {
  const { me, name } = useMe();
  const data = useGym(s => s.data);
  const now = new Date(), monday = mondayOf(now), wk = weekKey(now), tk = todayKey();
  const hr = now.getHours();
  const hello = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const mine = sessionsIn(data, wk, me);
  const weights = Object.keys(data.weeks).sort().map(w => getWeight(data, w, me)).filter((v): v is number => v != null);
  const delta = weights.length ? weights[weights.length - 1] - data.settings.startWeight[me] : null;
  const bw = blockWeek(data.settings.start, now);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 pt-5">
        <div>
          <p className="text-sm text-muted">{DOW[now.getDay()]}, {now.getDate()} {now.toLocaleString("en-IN", { month: "long" })}</p>
          <h1 className="mt-0.5 text-[28px] font-bold leading-tight tracking-tight">{hello}, {name}</h1>
        </div>
        <Link to="/me" aria-label="Your profile"><Avatar p={me} name={name} size={42} /></Link>
      </header>

      <Hero tk={tk} wk={wk} />

      {/* week strip */}
      <section aria-label="This week">
        <div className="mb-2.5 flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-semibold">This week</h2>
          <span className="text-[13px] text-muted">{bw ? (bw.inBlock === 6 ? "Deload week · go lighter" : `Week ${bw.inBlock} of 6`) : ""}</span>
        </div>
        <Card className="grid grid-cols-5 gap-1 p-2">
          {DAY_KEYS.map(k => {
            const d = addDays(monday, DAY_KEYS.indexOf(k));
            const done = !!getDay(data, wk, me, k).done;
            const isToday = k === tk;
            return (
              <Link key={k} to={"/train/" + k} className={cn("flex flex-col items-center gap-1.5 rounded-xl py-2.5 transition-colors hover:bg-card-2", isToday && "bg-card-2")}>
                <span className={cn("text-[11px] font-medium uppercase tracking-wide", isToday ? "text-fg" : "text-muted")}>{DAY_SHORT[k]}</span>
                <span className={cn("grid size-9 place-items-center rounded-full text-sm font-semibold tnum transition",
                  done ? "bg-primary text-primary-fg" : isToday ? "ring-2 ring-fg" : "bg-card-2 text-muted")}>
                  {done ? <Check className="size-4" strokeWidth={3} /> : d.getDate()}
                </span>
              </Link>
            );
          })}
        </Card>
      </section>

      {/* stats */}
      <section className="grid grid-cols-3 gap-3">
        <Stat value={`${mine}/5`} label="Sessions" />
        <Stat value={String(streakOf(data, me))} label="Streak" icon={<Flame className="size-3.5 text-accent" />} />
        <Stat value={delta == null ? "—" : (delta > 0 ? "+" : "") + delta.toFixed(1)} label={delta == null ? "Weigh in" : "kg change"}
          icon={delta == null ? null : delta <= 0 ? <TrendingDown className="size-3.5 text-accent" /> : <TrendingUp className="size-3.5 text-muted" />} to="/progress" />
      </section>
    </div>
  );
}

function Stat({ value, label, icon, to }: { value: string; label: string; icon?: React.ReactNode; to?: string }) {
  const body = (
    <Card className="h-full p-4">
      <div className="text-2xl font-bold tracking-tight tnum">{value}</div>
      <div className="mt-1 flex items-center gap-1 whitespace-nowrap text-[13px] text-muted">{icon}{label}</div>
    </Card>
  );
  return to ? <Link to={to} className="block">{body}</Link> : body;
}

function Hero({ tk, wk }: { tk: DayKey | null; wk: string }) {
  const { me } = useMe();
  const data = useGym(s => s.data);
  if (!tk) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted"><Moon className="size-4" /> Rest day</div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">Recover and walk</h2>
        <p className="mt-1 text-muted">8–10k steps, high protein, early night. Monday is Push day.</p>
        <Link to="/train/mon" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-card-2 px-4 text-[15px] font-medium">Preview Monday <ArrowRight className="size-4" /></Link>
      </Card>
    );
  }
  const p = PROGRAM[tk];
  const dl = getDay(data, wk, me, tk);
  if (p.loc === "cult") {
    const logged = className(data, wk, me), planned = plannedClass(new Date());
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 grid size-40 place-items-center rounded-full bg-accent-soft text-accent opacity-80">
            <ClassIcon id={logged ? dl.cls! : planned} size={64} strokeWidth={1.5} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-sm font-medium text-muted"><MapPin className="size-4" /> Cult Andheri East</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{logged || "Class day"}</h2>
            <p className="mt-1 max-w-[30ch] text-muted">{logged ? "Logged. Nice work." : `Any class counts. The plan suggests ${CLASSES[planned].name}.`}</p>
            <Link to="/train/wed" className={cn("mt-6 flex h-14 items-center justify-center gap-2 rounded-2xl text-base font-semibold transition active:scale-[.98]", logged ? "bg-card-2" : "bg-primary text-primary-fg")}>
              {logged ? <><Check className="size-5" /> Change class</> : <>Log your class <ArrowRight className="size-5" /></>}
            </Link>
          </div>
        </Card>
      </motion.div>
    );
  }
  const total = p.ex.reduce((a, e) => a + e.sets, 0);
  const doneSets = p.ex.reduce((a, e) => a + (dl.sets?.[e.id] || []).filter(s => s.ok).length, 0);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <div className="relative h-44 bg-card-2">
          <img src={img(p.ex[0].img[0], 1)} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">{DAY_NAMES[tk]} · Step Up Fitness</span>
        </div>
        <div className="-mt-10 relative px-5 pb-5">
          <h2 className="text-3xl font-bold tracking-tight">{p.title} day</h2>
          <p className="mt-1 text-muted">{p.focus}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
            <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> 5:00–6:00 PM</span>
            <span>{p.ex.length} exercises · {total} sets</span>
          </div>
          {dl.done ? (
            <Link to={"/train/" + tk} className="mt-5 flex h-14 items-center justify-center gap-2 rounded-2xl bg-card-2 text-base font-semibold"><Check className="size-5 text-accent" /> Done · view workout</Link>
          ) : (
            <Link to={"/train/" + tk} className="mt-5 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-fg transition active:scale-[.98]">
              {doneSets ? `Continue · ${doneSets}/${total} sets` : "Start workout"} <ArrowRight className="size-5" />
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
