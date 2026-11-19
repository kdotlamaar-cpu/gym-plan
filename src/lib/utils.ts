import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...v: ClassValue[]) => twMerge(clsx(v));
export const img = (slug: string, n = 0) => `${import.meta.env.BASE_URL}ex/${slug}-${n}.jpg`;

export function buzz(pattern: number | number[] = 12) {
  try { navigator.vibrate?.(pattern); } catch { /* not supported */ }
}

let ctx: AudioContext | null = null;
/** Unlock audio on a user gesture so the rest-timer beep can play later. */
export function unlockAudio() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch { /* no audio */ }
}
export function beep() {
  try {
    unlockAudio();
    if (!ctx) return;
    const c = ctx;
    [0, 0.22].forEach(off => {
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(c.destination);
      const t = c.currentTime + off;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.start(t); o.stop(t + 0.2);
    });
  } catch { /* no audio */ }
}

/** "60x6" → { kg, reps } */
export function parseSet(v?: string) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*(?:kg)?\s*[x×*]\s*(\d+)\s*$/i.exec(v || "");
  return m ? { kg: parseFloat(m[1]), reps: parseInt(m[2], 10) } : null;
}
/** Best set of a list → "60x6" (heaviest, then most reps), or "". */
export function bestOf(list: { kg: number | null; reps: number | null }[] = []) {
  let best: { kg: number; reps: number } | null = null;
  for (const s of list) {
    if (!s || s.kg == null || !(s.kg >= 0) || !s.reps || s.reps <= 0) continue;
    if (!best || s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps)) best = { kg: s.kg, reps: s.reps };
  }
  return best ? best.kg + "x" + best.reps : "";
}
export const fmtRest = (s: number) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
