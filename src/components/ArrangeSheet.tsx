import { motion } from "framer-motion";
import { RotateCcw, Star } from "lucide-react";
import { DAY_KEYS, DAY_SHORT, addDays } from "@/lib/dates";
import { SESSIONS, SESSION_LABEL, isDefaultUsual, isShuffled, planFor, samePlan, usualPlan } from "@/lib/plan";
import { useGym } from "@/store/data";
import { buzz, cn } from "@/lib/utils";
import { Button, Sheet, toast } from "./ui";
import type { DayKey, SessionKey } from "@/data/types";

/** Shuffle which session is on which day. Picking a session that's on another day swaps the two days. */
export function ArrangeSheet({ open, onOpenChange, wk, monday }: { open: boolean; onOpenChange: (o: boolean) => void; wk: string; monday: Date }) {
  const data = useGym(s => s.data);
  const { assignSession, resetWeek, makeUsual, restoreDefault } = useGym.getState();
  const plan = planFor(data, wk);
  const shuffled = isShuffled(data, wk);
  const isUsual = samePlan(plan, usualPlan(data));

  function pick(day: DayKey, s: SessionKey) {
    const cur = plan[day];
    if (cur === s) return;
    const from = s === "rest" ? undefined : DAY_KEYS.find(k => k !== day && plan[k] === s);
    assignSession(wk, day, s);
    buzz(12);
    toast(from ? `Swapped: ${SESSION_LABEL[s]} on ${DAY_SHORT[day]}, ${SESSION_LABEL[cur]} on ${DAY_SHORT[from]}` : `${DAY_SHORT[day]} is now ${SESSION_LABEL[s]}`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Arrange this week" description="Tap a session for each day. If it's already on another day, the two days swap, and so do their logs.">
      <div className="space-y-2">
        {DAY_KEYS.map(k => {
          const d = addDays(monday, DAY_KEYS.indexOf(k));
          return (
            <div key={k} className="rounded-2xl border border-line p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[15px] font-semibold">{DAY_SHORT[k]} <span className="font-normal text-muted tnum">{d.getDate()}</span></span>
                <span className="text-[13px] text-muted">{SESSION_LABEL[plan[k]]}</span>
              </div>
              <div role="radiogroup" aria-label={`Session on ${DAY_SHORT[k]}`} className="grid grid-cols-6 gap-1">
                {SESSIONS.map(s => {
                  const on = plan[k] === s;
                  return (
                    <button key={s} type="button" role="radio" aria-checked={on} onClick={() => pick(k, s)}
                      className={cn("relative h-9 rounded-lg text-[12px] font-semibold transition-colors", on ? "text-primary-fg" : "bg-card-2 text-muted hover:text-fg")}>
                      {on && <motion.span layoutId={"arr-" + k} className="absolute inset-0 rounded-lg bg-primary" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                      <span className="relative">{SESSION_LABEL[s]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2">
        {!isUsual && (
          <Button size="lg" onClick={() => { makeUsual(wk); toast("Saved as your usual week. Future weeks use this order."); }}>
            <Star className="size-4" /> Make this my usual week
          </Button>
        )}
        {shuffled && (
          <Button variant="secondary" size="lg" onClick={() => { resetWeek(wk); toast("This week is back to your usual order."); }}>
            <RotateCcw className="size-4" /> Reset to my usual week
          </Button>
        )}
        {isUsual && !isDefaultUsual(data) && (
          <Button variant="ghost" onClick={() => { restoreDefault(wk); toast("Back to the original plan: Push, Pull, Class, Legs, Upper."); }}>
            Restore the original plan
          </Button>
        )}
        <Button variant="secondary" size="lg" onClick={() => onOpenChange(false)}>Done</Button>
      </div>
    </Sheet>
  );
}
