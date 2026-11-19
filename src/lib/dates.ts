import type { DayKey } from "@/data/types";

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];
export const DAY_NAMES: Record<DayKey, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" };
export const DAY_SHORT: Record<DayKey, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri" };
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

export function mondayOf(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
export function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const w = Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return { y, w };
}
export const weekKey = (d: Date) => { const { y, w } = isoWeek(d); return y + "-W" + pad(w); };
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const fmt = (d: Date) => d.getDate() + " " + MON[d.getMonth()];
export const ymd = (d: Date) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export function parseYmd(s?: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
export function mondayOfKey(key: string): Date | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(key || "");
  if (!m) return null;
  return addDays(mondayOf(new Date(+m[1], 0, 4)), (+m[2] - 1) * 7);
}
/** Suggested class for a week: Boxing in odd ISO weeks, HRX in even ones. */
export const plannedClass = (d: Date) => (isoWeek(d).w % 2 === 1 ? "boxing" : "hrx");
export function blockWeek(startYmd: string, d: Date) {
  const s = parseYmd(startYmd);
  if (!s) return null;
  const weeks = Math.round((mondayOf(d).getTime() - mondayOf(s).getTime()) / (7 * 864e5));
  if (weeks < 0) return null;
  return { total: weeks + 1, inBlock: (weeks % 6) + 1, block: Math.floor(weeks / 6) + 1 };
}
/** Today's day key, or null on weekends. */
export const todayKey = (): DayKey | null => { const i = (new Date().getDay() + 6) % 7; return i < 5 ? DAY_KEYS[i] : null; };
export const dateOf = (monday: Date, k: DayKey) => addDays(monday, DAY_KEYS.indexOf(k));
