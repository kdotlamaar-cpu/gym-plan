/* Which session is on which weekday. Each week can be shuffled; "usual" is the default order. */
import { PROGRAM } from "@/data/program";
import type { ClassDay, DayKey, DayLog, GymData, LiftDay, Person, SessionKey, WeekPlan } from "@/data/types";
import { DAY_KEYS } from "./dates";

export const DEFAULT_PLAN: WeekPlan = { mon: "push", tue: "pull", wed: "class", thu: "legs", fri: "upper" };
export const SESSIONS: SessionKey[] = ["push", "pull", "legs", "upper", "class", "rest"];
export const SESSION_LABEL: Record<SessionKey, string> = { push: "Push", pull: "Pull", legs: "Legs", upper: "Upper", class: "Class", rest: "Rest" };
/** PROGRAM is keyed by the original weekday of each session. */
const SESSION_DAY: Record<Exclude<SessionKey, "rest">, DayKey> = { push: "mon", pull: "tue", class: "wed", legs: "thu", upper: "fri" };

export const usualPlan = (data: GymData): WeekPlan => data.settings.order || DEFAULT_PLAN;
export const planFor = (data: GymData, wk: string): WeekPlan => data.plans?.[wk] || usualPlan(data);
export const sessionOf = (data: GymData, wk: string, day: DayKey): SessionKey => planFor(data, wk)[day];
export const programOf = (s: SessionKey): LiftDay | ClassDay | null => (s === "rest" ? null : PROGRAM[SESSION_DAY[s]]);
export const samePlan = (a: WeekPlan, b: WeekPlan) => DAY_KEYS.every(k => a[k] === b[k]);
export const isShuffled = (data: GymData, wk: string) => !!data.plans?.[wk] && !samePlan(data.plans[wk], usualPlan(data));
export const isDefaultUsual = (data: GymData) => samePlan(usualPlan(data), DEFAULT_PLAN);

/** Day of the week holding the Cult class, or null if it was taken out. */
export const classDayOf = (data: GymData, wk: string): DayKey | null => DAY_KEYS.find(k => sessionOf(data, wk, k) === "class") || null;

/** Sets logged for an exercise in a week, whichever day it was done on. */
export function findSets(data: GymData, wk: string, p: Person, exId: string) {
  for (const k of DAY_KEYS) {
    const d = data.weeks[wk]?.[p]?.days?.[k];
    if (d?.sets?.[exId] || d?.ex?.[exId]) return { sets: d.sets?.[exId] || [], best: d.ex?.[exId] || "" };
  }
  return { sets: [], best: "" };
}

/**
 * Put session `s` on `day` for week `wk`. If `s` is already on another day the two days swap,
 * and their logs swap with them (for both people), so logs always stay with the session done.
 */
export function assign(data: GymData, wk: string, day: DayKey, s: SessionKey): GymData {
  const plan = { ...planFor(data, wk) };
  const prev = plan[day];
  if (prev === s) return data;
  const from = s === "rest" ? undefined : DAY_KEYS.find(k => k !== day && plan[k] === s);
  plan[day] = s;
  let weeks = data.weeks;
  if (from) {
    plan[from] = prev;
    const w = { ...(weeks[wk] || {}) };
    (["a", "b"] as Person[]).forEach(p => {
      const pw = w[p];
      if (!pw?.days) return;
      const days: Partial<Record<DayKey, DayLog>> = { ...pw.days };
      const x = days[day], y = days[from];
      if (y) days[day] = y; else delete days[day];
      if (x) days[from] = x; else delete days[from];
      w[p] = { ...pw, days };
    });
    weeks = { ...weeks, [wk]: w };
  }
  const plans = { ...(data.plans || {}) };
  if (samePlan(plan, usualPlan(data))) delete plans[wk]; else plans[wk] = plan;
  return { ...data, weeks, plans };
}

/** Move a week back to `target`, swapping logs along the way. */
export function resetTo(data: GymData, wk: string, target: WeekPlan): GymData {
  let d = data;
  for (const k of DAY_KEYS) if (planFor(d, wk)[k] !== target[k]) d = assign(d, wk, k, target[k]);
  const plans = { ...(d.plans || {}) };
  delete plans[wk];
  return { ...d, plans };
}
