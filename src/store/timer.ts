/* Rest timer: one global timer so it keeps running when you switch tabs. Not persisted. */
import { create } from "zustand";

interface Timer {
  end: number;      // epoch ms, 0 = idle
  total: number;    // seconds
  label: string;
  start: (sec: number, label: string) => void;
  add: (sec: number) => void;
  stop: () => void;
}

export const useTimer = create<Timer>(set => ({
  end: 0,
  total: 0,
  label: "",
  start: (sec, label) => set({ end: Date.now() + sec * 1000, total: sec, label }),
  add: sec => set(s => {
    const left = Math.max(0, s.end - Date.now());
    const end = Date.now() + Math.max(0, left + sec * 1000);
    return { end, total: Math.max(1, s.total + sec) };
  }),
  stop: () => set({ end: 0, total: 0, label: "" })
}));
