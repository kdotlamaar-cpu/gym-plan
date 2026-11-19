export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";
export type Person = "a" | "b";
export type SessionType = "push" | "pull" | "legs" | "upper" | "class";
export type Steps = [string, string][];

export interface Exercise {
  id: string;
  tag: string;          // A, B, D1, D2… (D1 + D2 = superset)
  n: string;            // name
  sets: number;
  reps: string;
  rest: number;         // seconds, drives the rest timer
  restTxt: string;
  img: string[];        // photo slugs
  tip: string;
  swap?: string;        // back-friendly alternative for Momin
  swapImg?: string;
  drop?: boolean;       // last set is a drop set
}

export interface Finisher { label: string; detail: string; alt?: string; img?: string }

export interface LiftDay {
  loc: "stepup";
  type: Exclude<SessionType, "class">;
  title: string;
  focus: string;
  tag: string;
  finisher: Finisher;
  ex: Exercise[];
}
export interface ClassDay { loc: "cult"; type: "class"; title: string; focus: string; tag: string }
export type Program = { mon: LiftDay; tue: LiftDay; wed: ClassDay; thu: LiftDay; fri: LiftDay };

export interface GymInfo {
  name: string; short: string; area: string; address: string; hours: string; type: string;
  days: DayKey[]; map: string; source: string;
}

export interface ClassInfo {
  name: string; sub: string; lvl: number; intensity: string; kcal: string;
  why: string; focus: string[]; bring: string[]; tips: string[]; back: string;
}

/* ---------- logs ---------- */
export interface SetEntry { kg: number | null; reps: number | null; ok?: boolean }
export interface DayLog {
  done?: boolean;
  note?: string;
  sets?: Record<string, SetEntry[]>;
  ex?: Record<string, string>;   // best set per exercise, e.g. "60x6"
  cls?: string;                  // Cult class id
  clsName?: string;              // name when cls === "other"
  effort?: number;
}
export interface PersonWeek { weight?: number; days: Partial<Record<DayKey, DayLog>> }
export interface Settings { names: Record<Person, string>; startWeight: Record<Person, number>; start: string }
export interface GymData { version: number; settings: Settings; weeks: Record<string, Partial<Record<Person, PersonWeek>>> }
