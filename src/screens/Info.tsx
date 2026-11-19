/* Reference pages under Me: weekly plan, diet, gyms. */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, Navigation, Clock } from "lucide-react";
import { BACK, BAG, BLOCK, DAY_TIMELINE, MEALS, PROGRESSION, PROTEIN, RULES, TARGETS } from "@/data/content";
import { GYMS } from "@/data/program";
import { DAY_KEYS, DAY_NAMES, blockWeek } from "@/lib/dates";
import { useGym } from "@/store/data";
import { programOf, usualPlan } from "@/lib/plan";
import { useMe } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Card, PageHeader, Segmented } from "@/components/ui";
import type { Person } from "@/data/types";

function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {note && <span className="text-[13px] text-muted">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function Plan() {
  const { names } = useMe();
  const start = useGym(s => s.data.settings.start);
  const usual = usualPlan(useGym(s => s.data));
  const bw = blockWeek(start, new Date());
  return (
    <div className="space-y-7">
      <PageHeader back="/me" title="Weekly plan" subtitle="Mon–Fri, 5:00–6:00 PM. Four lifting days, one class." />

      <Section title="Your usual week" note="Shuffle any week in Train">
        <Card className="divide-y divide-line overflow-hidden">
          {DAY_KEYS.map(k => {
            const p = programOf(usual[k]);
            return (
              <Link key={k} to={"/train/" + k} className="flex items-center gap-3 px-4 py-3 hover:bg-card-2/60">
                <span className="w-10 text-[13px] font-medium text-muted">{DAY_NAMES[k].slice(0, 3)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{!p ? "Rest" : p.loc === "cult" ? "Cult class" : p.title}</span>
                  <span className="block truncate text-[13px] text-muted">{p ? p.focus : "8–10k steps, light mobility"}</span>
                </span>
                {p && <span className="shrink-0 rounded-full bg-card-2 px-2.5 py-1 text-[11px] font-medium">{GYMS[p.loc].short}</span>}
              </Link>
            );
          })}
          <div className="flex items-center gap-3 px-4 py-3 text-muted">
            <span className="w-10 text-[13px] font-medium">Sat</span>
            <span className="text-[15px]">Rest · 8–10k steps, light mobility</span>
          </div>
        </Card>
      </Section>

      <Section title="A gym day">
        <Card className="p-4">
          <ol className="relative space-y-3 border-l border-line pl-5">
            {DAY_TIMELINE.map(([t, w]) => (
              <li key={t} className="relative">
                <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-primary ring-4 ring-card" />
                <span className="text-[13px] font-semibold tnum">{t}</span> <span className="text-[14px] text-muted">{w}</span>
              </li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section title="The 6-week block" note={bw ? `You're in week ${bw.inBlock}` : undefined}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BLOCK.map(([w, t], i) => (
            <Card key={w} className={cn("p-3.5", bw?.inBlock === i + 1 && "border-primary ring-1 ring-primary")}>
              <div className="text-[13px] font-semibold">{w}</div>
              <p className="mt-1 text-[13px] leading-snug text-muted">{t}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="How to progress">
        <Card className="p-4">
          <ul className="space-y-2.5 text-[14px]">
            {PROGRESSION.map((t, i) => <li key={i} className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-card-2 text-[11px] font-semibold">{i + 1}</span><span className="text-muted">{t}</span></li>)}
          </ul>
        </Card>
      </Section>

      <Section title={`Back care for ${names.b}`}>
        <Card className="p-4">
          <ul className="space-y-2.5 text-[14px] text-muted">
            {BACK.map(t => <li key={t} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-pb" />{t}</li>)}
          </ul>
        </Card>
      </Section>
    </div>
  );
}

export function Diet() {
  const { me, names } = useMe();
  const [p, setP] = useState<Person>(me);
  const t = TARGETS[p];
  return (
    <div className="space-y-7">
      <PageHeader back="/me" title="Diet" subtitle="Training builds muscle. Food decides whether fat comes off." />
      <Segmented label="Whose targets" value={p} onChange={setP} options={(["a", "b"] as Person[]).map(x => ({ value: x, label: names[x] }))} />

      <Card className="p-4">
        <div className="text-[13px] text-muted">{t.goal}</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[["kcal / day", t.kcal], ["protein", t.protein], ["steps", t.steps]].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-card-2 p-3">
              <div className="text-[17px] font-bold leading-tight tracking-tight tnum">{v}</div>
              <div className="mt-0.5 text-[12px] text-muted">{l}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{t.pace}</p>
      </Card>

      <Section title="A workday">
        <Card className="divide-y divide-line overflow-hidden">
          {MEALS.map(m => (
            <div key={m.t} className="grid grid-cols-[64px_1fr] gap-3 px-4 py-3">
              <span className="text-[13px] font-semibold tnum">{m.t}</span>
              <span><span className="block text-[14px] font-medium">{m.what}</span><span className="block text-[13px] text-muted">{m.detail}</span></span>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Protein per serving">
        <Card className="divide-y divide-line overflow-hidden">
          {PROTEIN.map(([f, g]) => (
            <div key={f} className="flex justify-between gap-3 px-4 py-2.5 text-[14px]"><span className="text-muted">{f}</span><b className="font-semibold tnum">{g}</b></div>
          ))}
        </Card>
      </Section>

      <Section title="Rules that make it work">
        <div className="grid gap-2 sm:grid-cols-2">
          {RULES.map(([h, d]) => <Card key={h} className="p-3.5"><div className="text-[14px] font-semibold">{h}</div><p className="mt-0.5 text-[13px] text-muted">{d}</p></Card>)}
        </div>
      </Section>
    </div>
  );
}

export function Gyms() {
  return (
    <div className="space-y-7">
      <PageHeader back="/me" title="Gyms" subtitle="Both on your cult.fit membership, near the office." />
      {(["stepup", "cult"] as const).map(id => {
        const g = GYMS[id];
        return (
          <Card key={id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{g.name}</h2>
                <p className="text-[13px] text-muted">{id === "stepup" ? "Mon · Tue · Thu · Fri" : "Wednesday"}</p>
              </div>
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">{id === "stepup" ? "Gym floor" : "Classes"}</span>
            </div>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-muted" /><span>{g.address}</span></li>
              <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-muted" /><span>{g.hours}</span></li>
            </ul>
            <p className="mt-3 text-[13px] text-muted">{g.type}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={g.map} target="_blank" rel="noopener" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-primary-fg"><Navigation className="size-4" /> Directions</a>
              <a href={g.source} target="_blank" rel="noopener" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-card-2 text-[14px] font-medium">cult.fit <ExternalLink className="size-3.5" /></a>
            </div>
          </Card>
        );
      })}
      <Section title="Gym bag">
        <Card className="p-4">
          <ul className="space-y-2 text-[14px]">{BAG.map(b => <li key={b} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{b}</li>)}</ul>
        </Card>
      </Section>
      <p className="px-1 text-xs text-muted">Hours from cult.fit listings (Nov 2026). Check the app for the live timetable.</p>
    </div>
  );
}
