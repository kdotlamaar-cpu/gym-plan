/* All logs live on this phone (localStorage). Export / import in Me moves them between phones.
   v1 (the old multi-page site) stored the same shape under "fogp:v1"; it is migrated on first run. */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayKey, DayLog, GymData, Person, PersonWeek, SessionKey, SetEntry, Settings, WeekPlan } from "@/data/types";
import { bestOf } from "@/lib/utils";
import { DAY_KEYS, mondayOf, parseYmd, ymd } from "@/lib/dates";
import { DEFAULT_PLAN, SESSIONS, assign, planFor, resetTo } from "@/lib/plan";

const validPlan = (v: unknown): v is WeekPlan =>
  !!v && typeof v === "object" && DAY_KEYS.every(k => SESSIONS.includes((v as Record<string, SessionKey>)[k]));

export type Theme = "system" | "light" | "dark";

const defaults = (): GymData => ({
  version: 2,
  settings: { names: { a: "Vikas", b: "Momin" }, startWeight: { a: 80, b: 95 }, start: ymd(mondayOf(new Date())) },
  weeks: {}
});

export function normalize(raw: unknown): GymData {
  const base = defaults();
  if (!raw || typeof raw !== "object") return base;
  const d = raw as Partial<GymData>;
  const s = (d.settings || {}) as Partial<Settings>;
  const num = (v: unknown, f: number) => (typeof v === "number" && isFinite(v) ? v : f);
  return {
    version: 2,
    settings: {
      names: {
        a: s.names?.a && s.names.a !== "Rabale" ? String(s.names.a).slice(0, 20) : base.settings.names.a,
        b: s.names?.b && s.names.b !== "Bandra" ? String(s.names.b).slice(0, 20) : base.settings.names.b
      },
      startWeight: { a: num(s.startWeight?.a, 80), b: num(s.startWeight?.b, 95) },
      start: s.start && parseYmd(s.start) ? s.start : base.settings.start,
      ...(validPlan(s.order) ? { order: s.order } : {})
    },
    weeks: d.weeks && typeof d.weeks === "object" ? d.weeks : {},
    plans: Object.fromEntries(Object.entries(d.plans || {}).filter(([, v]) => validPlan(v)))
  };
}

function legacy(): { data: GymData; me: Person | null } {
  try {
    const raw = localStorage.getItem("fogp:v1");
    const me = localStorage.getItem("fogp:me");
    return { data: raw ? normalize(JSON.parse(raw)) : defaults(), me: me === "a" || me === "b" ? me : null };
  } catch {
    return { data: defaults(), me: null };
  }
}

interface State {
  data: GymData;
  me: Person | null;
  theme: Theme;
  setMe: (p: Person) => void;
  setTheme: (t: Theme) => void;
  updateSettings: (s: Settings) => void;
  setSet: (wk: string, p: Person, day: DayKey, exId: string, i: number, patch: Partial<SetEntry>, minSets: number) => void;
  addSet: (wk: string, p: Person, day: DayKey, exId: string, minSets: number) => void;
  removeSet: (wk: string, p: Person, day: DayKey, exId: string, minSets: number) => void;
  setDone: (wk: string, p: Person, day: DayKey, done: boolean) => void;
  setClass: (wk: string, p: Person, day: DayKey, cls: string | null, clsName?: string) => void;
  assignSession: (wk: string, day: DayKey, s: SessionKey) => void;
  resetWeek: (wk: string) => void;
  makeUsual: (wk: string) => void;
  restoreDefault: (wk: string) => void;
  setNote: (wk: string, p: Person, day: DayKey, note: string) => void;
  setWeight: (wk: string, p: Person, kg: number | null) => void;
  importData: (json: string) => void;
  reset: () => void;
}

/* immutable helpers */
function withWeek(data: GymData, wk: string, p: Person, fn: (pw: PersonWeek) => PersonWeek): GymData {
  const w = data.weeks[wk] || {};
  const pw: PersonWeek = w[p] ? { ...w[p]!, days: { ...(w[p]!.days || {}) } } : { days: {} };
  return { ...data, weeks: { ...data.weeks, [wk]: { ...w, [p]: fn(pw) } } };
}
function withDay(data: GymData, wk: string, p: Person, day: DayKey, fn: (d: DayLog) => DayLog): GymData {
  return withWeek(data, wk, p, pw => ({ ...pw, days: { ...pw.days, [day]: fn({ ...(pw.days[day] || {}) }) } }));
}
function withSets(d: DayLog, exId: string, minSets: number, fn: (arr: SetEntry[]) => void): DayLog {
  const arr = (d.sets?.[exId] || []).map(s => ({ ...s }));
  while (arr.length < minSets) arr.push({ kg: null, reps: null });
  fn(arr);
  const best = bestOf(arr.filter(s => s.ok)) || bestOf(arr);
  return { ...d, sets: { ...(d.sets || {}), [exId]: arr }, ex: { ...(d.ex || {}), [exId]: best } };
}

/** Before the usual order changes, pin every other logged week to the order it was trained in. */
function freezeOthers(data: GymData, exceptWk: string): Record<string, WeekPlan> {
  const plans = { ...(data.plans || {}) };
  const usual = data.settings.order || DEFAULT_PLAN;
  Object.keys(data.weeks).forEach(w => { if (w !== exceptWk && !plans[w]) plans[w] = usual; });
  return plans;
}

const init = legacy();

export const useGym = create<State>()(
  persist(
    set => ({
      data: init.data,
      me: init.me,
      theme: "system",
      setMe: me => set({ me }),
      setTheme: theme => { try { localStorage.setItem("fogp:theme", theme); } catch { /* ignore */ } set({ theme }); },
      updateSettings: settings => set(s => ({ data: { ...s.data, settings } })),
      setSet: (wk, p, day, exId, i, patch, minSets) =>
        set(s => ({ data: withDay(s.data, wk, p, day, d => withSets(d, exId, minSets, arr => { arr[i] = { ...arr[i], ...patch }; })) })),
      addSet: (wk, p, day, exId, minSets) =>
        set(s => ({ data: withDay(s.data, wk, p, day, d => withSets(d, exId, minSets, arr => { arr.push({ kg: null, reps: null }); })) })),
      removeSet: (wk, p, day, exId, minSets) =>
        set(s => ({ data: withDay(s.data, wk, p, day, d => withSets(d, exId, minSets, arr => { if (arr.length > minSets) arr.pop(); })) })),
      setDone: (wk, p, day, done) => set(s => ({ data: withDay(s.data, wk, p, day, d => ({ ...d, done })) })),
      setClass: (wk, p, day, cls, clsName) =>
        set(s => ({
          data: withDay(s.data, wk, p, day, d => {
            if (!cls) { const { cls: _c, clsName: _n, effort: _e, ...rest } = d; return { ...rest, done: false }; }
            return { ...d, cls, clsName: cls === "other" ? (clsName ?? d.clsName ?? "") : undefined, done: true };
          })
        })),
      assignSession: (wk, day, ses) => set(s => ({ data: assign(s.data, wk, day, ses) })),
      resetWeek: wk => set(s => ({ data: resetTo(s.data, wk, s.data.settings.order || DEFAULT_PLAN) })),
      makeUsual: wk => set(s => {
        const order = planFor(s.data, wk);
        const plans = freezeOthers(s.data, wk);
        delete plans[wk];
        return { data: { ...s.data, settings: { ...s.data.settings, order }, plans } };
      }),
      restoreDefault: wk => set(s => {
        const { order: _o, ...settings } = s.data.settings;
        void _o;
        // pin this week to the order it's in now, so resetTo can swap its logs back
        const plans = { ...freezeOthers(s.data, wk), [wk]: planFor(s.data, wk) };
        return { data: resetTo({ ...s.data, settings, plans }, wk, DEFAULT_PLAN) };
      }),
      setNote: (wk, p, day, note) => set(s => ({ data: withDay(s.data, wk, p, day, d => ({ ...d, note: note.slice(0, 400) })) })),
      setWeight: (wk, p, kg) => set(s => ({ data: withWeek(s.data, wk, p, pw => { const n = { ...pw }; if (kg == null) delete n.weight; else n.weight = kg; return n; }) })),
      importData: json => set({ data: normalize(JSON.parse(json)) }),
      reset: () => set({ data: defaults() })
    }),
    {
      name: "fogp:v2",
      version: 2,
      partialize: s => ({ data: s.data, me: s.me, theme: s.theme })
    }
  )
);

/* selectors */
export const getDay = (data: GymData, wk: string, p: Person, day: DayKey): DayLog => data.weeks[wk]?.[p]?.days?.[day] || {};
export const getWeight = (data: GymData, wk: string, p: Person): number | null => {
  const w = data.weeks[wk]?.[p]?.weight;
  return typeof w === "number" ? w : null;
};
export const other = (p: Person): Person => (p === "a" ? "b" : "a");
