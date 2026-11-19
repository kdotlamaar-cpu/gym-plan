import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, Flame, Scale, Trophy } from "lucide-react";
import { PROGRAM } from "@/data/program";
import { DAY_KEYS, DAY_SHORT, addDays, fmt, mondayOf, mondayOfKey, weekKey } from "@/lib/dates";
import { getDay, getWeight, useGym } from "@/store/data";
import { useMe } from "@/lib/hooks";
import { cn, parseSet } from "@/lib/utils";
import { Button, Card, PageHeader, toast } from "@/components/ui";
import { streakOf } from "./Today";
import type { LiftDay, Person } from "@/data/types";

export default function Progress() {
  const { me } = useMe();
  return (
    <div className="space-y-6">
      <PageHeader title="Progress" subtitle="Bodyweight, consistency and your best lifts." />
      <WeighIn p={me} />
      <WeightChart p={me} />
      <Consistency p={me} />
      <Bests p={me} />
    </div>
  );
}

function WeighIn({ p }: { p: Person }) {
  const data = useGym(s => s.data);
  const setWeight = useGym(s => s.setWeight);
  const wk = weekKey(new Date());
  const cur = getWeight(data, wk, p);
  const [val, setVal] = useState(cur != null ? String(cur) : "");
  const start = data.settings.startWeight[p];

  function save() {
    const kg = parseFloat(val.replace(",", "."));
    if (!(kg >= 30 && kg <= 250)) { toast("Enter a weight between 30 and 250 kg."); return; }
    setWeight(wk, p, Math.round(kg * 10) / 10);
    const d = kg - start;
    toast(`Saved · ${d > 0 ? "+" : ""}${d.toFixed(1)} kg since start`);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent"><Scale className="size-5" /></span>
        <div className="flex-1">
          <h2 className="text-[15px] font-semibold">This week's weigh-in</h2>
          <p className="text-[13px] text-muted">Monday morning, before breakfast. Started at {start} kg.</p>
        </div>
      </div>
      <form className="mt-4 flex gap-2" onSubmit={ev => { ev.preventDefault(); save(); }}>
        <div className="relative flex-1">
          <input inputMode="decimal" value={val} onChange={ev => setVal(ev.target.value)} placeholder={String(start)} aria-label="Weight in kg"
            className="h-12 w-full rounded-xl border border-line bg-bg pl-4 pr-12 text-lg font-semibold tnum outline-none focus:border-accent" />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
        </div>
        <Button type="submit" className="h-12 px-5">{cur != null ? "Update" : "Save"}</Button>
      </form>
    </Card>
  );
}

function WeightChart({ p }: { p: Person }) {
  const { names } = useMe();
  const data = useGym(s => s.data);
  const rows = useMemo(() => {
    const keys = Object.keys(data.weeks).filter(w => getWeight(data, w, "a") != null || getWeight(data, w, "b") != null).sort();
    const startRow = { label: "Start", a: 0, b: 0 } as Record<string, number | string | null>;
    return [startRow, ...keys.map(w => {
      const m = mondayOfKey(w)!;
      const wa = getWeight(data, w, "a"), wb = getWeight(data, w, "b");
      return {
        label: fmt(m),
        a: wa != null ? +(wa - data.settings.startWeight.a).toFixed(1) : null,
        b: wb != null ? +(wb - data.settings.startWeight.b).toFixed(1) : null
      };
    })];
  }, [data]);
  const hasB = rows.some((r, i) => i > 0 && r.b != null);
  const hasA = rows.some((r, i) => i > 0 && r.a != null);
  const series: Person[] = (["a", "b"] as Person[]).filter(x => (x === "a" ? hasA : hasB) || x === p);
  const last = (x: Person) => { for (let i = rows.length - 1; i > 0; i--) if (rows[i][x] != null) return rows[i][x] as number; return null; };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Weight change</h2>
          <p className="text-[13px] text-muted">kg since your starting weight</p>
        </div>
        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-[13px]">
          {series.map(x => (
            <span key={x} className="flex items-center gap-1.5">
              <span className={cn("h-0.5 w-3 rounded-full", x === "a" ? "bg-pa" : "bg-pb")} />
              {names[x]} <b className="font-semibold tnum">{last(x) == null ? "—" : `${last(x)! > 0 ? "+" : ""}${last(x)}`}</b>
            </span>
          ))}
        </div>
      </div>
      {rows.length < 2 ? (
        <div className="mt-4 grid h-40 place-items-center rounded-xl border border-dashed border-line text-center text-[13px] text-muted">
          Your line appears after the first weigh-in.
        </div>
      ) : (
        <div className="mt-4 h-48" role="img" aria-label={"Weight change chart. " + series.map(x => `${names[x]}: ${last(x) ?? "no data"} kg`).join(", ")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} width={44} allowDecimals />
              <Tooltip cursor={{ stroke: "var(--muted)", strokeWidth: 1 }}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 13, color: "var(--fg)" }}
                formatter={(v: number, k: string) => [`${v > 0 ? "+" : ""}${v} kg`, names[k as Person]]} />
              {series.map(x => (
                <Line key={x} isAnimationActive={false} type="monotone" dataKey={x} stroke={x === "a" ? "var(--pa)" : "var(--pb)"} strokeWidth={2.5} connectNulls
                  dot={{ r: 3.5, strokeWidth: 2, stroke: "var(--card)", fill: x === "a" ? "var(--pa)" : "var(--pb)" }} activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function Consistency({ p }: { p: Person }) {
  const data = useGym(s => s.data);
  const monday = mondayOf(new Date());
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(monday, -7 * (7 - i)));
  let total = 0;
  Object.keys(data.weeks).forEach(w => DAY_KEYS.forEach(k => { if (getDay(data, w, p, k).done) total++; }));
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-semibold">Consistency</h2>
          <p className="text-[13px] text-muted">Last 8 weeks</p>
        </div>
        <div className="flex gap-4 text-right">
          <div><div className="text-xl font-bold tnum">{total}</div><div className="text-[11px] text-muted">sessions</div></div>
          <div><div className="flex items-center justify-end gap-1 text-xl font-bold tnum"><Flame className="size-4 text-accent" />{streakOf(data, p)}</div><div className="text-[11px] text-muted">week streak</div></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[48px_repeat(5,1fr)] gap-1.5 text-[11px] text-muted">
        <span />
        {DAY_KEYS.map(k => <span key={k} className="text-center font-medium">{DAY_SHORT[k]}</span>)}
        {weeks.map(m => {
          const wk = weekKey(m);
          return [
            <span key={wk} className="self-center tnum">{fmt(m)}</span>,
            ...DAY_KEYS.map(k => {
              const done = !!getDay(data, wk, p, k).done;
              const future = addDays(m, DAY_KEYS.indexOf(k)) > new Date();
              return (
                <span key={wk + k} title={`${DAY_SHORT[k]} ${fmt(addDays(m, DAY_KEYS.indexOf(k)))}${done ? ": done" : ""}`}
                  className={cn("grid h-7 place-items-center rounded-md", done ? "bg-primary text-primary-fg" : future ? "border border-dashed border-line" : "bg-card-2")}>
                  {done && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              );
            })
          ];
        })}
      </div>
    </Card>
  );
}

function Bests({ p }: { p: Person }) {
  const data = useGym(s => s.data);
  const lifts = (["mon", "tue", "thu", "fri"] as const).flatMap(k => (PROGRAM[k] as LiftDay).ex.map(e => ({ e, k })));
  const thisWk = weekKey(new Date()), lastWk = weekKey(addDays(new Date(), -7));
  const rows = lifts.map(({ e, k }) => {
    let best: { kg: number; reps: number } | null = null;
    Object.keys(data.weeks).forEach(w => {
      const s = parseSet(getDay(data, w, p, k).ex?.[e.id]);
      if (s && (!best || s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps))) best = s;
    });
    const now = parseSet(getDay(data, thisWk, p, k).ex?.[e.id]), prev = parseSet(getDay(data, lastWk, p, k).ex?.[e.id]);
    return { e, best: best as { kg: number; reps: number } | null, up: now && prev ? now.kg - prev.kg : null };
  }).filter(r => r.best);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Trophy className="size-4 text-accent" />
        <h2 className="text-[15px] font-semibold">Best lifts</h2>
      </div>
      {rows.length ? (
        <ul className="mt-3 divide-y divide-line">
          {rows.map(({ e, best, up }) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0 truncate text-[14px]">{e.n}</span>
              <span className="flex shrink-0 items-center gap-2">
                {up != null && up > 0 && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent tnum">+{up} kg</span>}
                <b className="text-[14px] font-semibold tnum">{best!.kg} kg × {best!.reps}</b>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-muted">Log your first workout and your top sets show up here.</p>
      )}
    </Card>
  );
}
