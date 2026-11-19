/* Reference content shown under Me: plan, diet, gym bag. Kept short on purpose. */
import type { Person } from "./types";

export const TARGETS: Record<Person, { goal: string; kcal: string; protein: string; steps: string; pace: string }> = {
  a: { goal: "Fat loss + muscle + strength", kcal: "2,200–2,400", protein: "140–160 g", steps: "8,000+", pace: "Lose about 0.25 kg a week while lifts go up. Flat for 3 weeks: cut 150 kcal. Lifts dropping: add 150 back." },
  b: { goal: "Fat loss + toning", kcal: "2,200–2,400", protein: "150–170 g", steps: "10,000+", pace: "Lose 0.5–0.75 kg a week, about 500 kcal under maintenance. Keep protein high so the weight lost is fat." }
};

export const MEALS: { t: string; what: string; detail: string }[] = [
  { t: "8 AM", what: "Breakfast · ~30 g protein", detail: "3 eggs, or besan chilla with 50 g paneer, plus fruit." },
  { t: "1 PM", what: "Lunch · ~35–40 g protein", detail: "2 roti, dal, sabzi and 120–150 g chicken, paneer, tofu or soya. Salad and curd." },
  { t: "4 PM", what: "Pre-workout · light", detail: "Banana + whey, or 2 boiled eggs + fruit. Skip the office samosa." },
  { t: "6 PM", what: "Straight after gym", detail: "1 scoop whey or 200 g hung curd before the commute home." },
  { t: "8:30 PM", what: "Dinner · ~35–40 g protein", detail: "Protein first, lots of veg, 1–2 roti or ½ katori rice." }
];

export const PROTEIN: [string, string][] = [
  ["Chicken breast, 100 g cooked", "30 g"], ["Soya chunks, 50 g dry", "26 g"], ["Whey, 1 scoop", "24 g"],
  ["Fish, 100 g cooked", "22 g"], ["Hung curd, 200 g", "18–20 g"], ["Paneer, 100 g", "18 g"],
  ["Eggs, 3 whole", "18 g"], ["Tofu, 100 g", "12–15 g"], ["Roasted chana, 40 g", "8 g"], ["Dal, 1 katori", "7–9 g"]
];

export const RULES: [string, string][] = [
  ["Protein at every meal", "4–5 meals of 25–40 g beats one big dinner."],
  ["Watch liquid calories", "Sugary chai, cold coffee and juice add up fast."],
  ["Weekends count", "One treat meal, not a whole weekend of them."],
  ["Sleep 7+ hours", "It has the biggest effect on fat loss and strength."]
];

export const BLOCK: [string, string][] = [
  ["Week 1", "Find your working weights. Leave 2–3 reps in the tank."],
  ["Week 2", "Add reps within each range."],
  ["Week 3", "Add weight where you hit the top of the range."],
  ["Week 4", "Keep adding. Most sets end 1–2 reps short of failure."],
  ["Week 5", "Hardest week. Beat every logged number."],
  ["Week 6", "Deload: about 60% of the weight and half the sets."]
];

export const PROGRESSION = [
  "Start each lift at a weight you can do for the bottom of its rep range.",
  "Add a rep or two each session.",
  "Hit the top of the range on every set? Add weight next time: +2.5 kg upper body, +5 kg lower body.",
  "Missed a day? Shift the week forward. Never squeeze two sessions into Friday."
];

export const BACK = [
  "Use the swaps shown in your workout. They replace every lift that loads the spine.",
  "Brace before every rep: belly breath, tighten like you're about to be punched.",
  "Skip sit-ups and Russian twists. Dead bugs, planks and Pallof presses build the core safely.",
  "Stop on sharp pain, pain down a leg or numbness. See a physio if it lasts."
];

export const DAY_TIMELINE: [string, string][] = [
  ["4:00", "Pre-workout snack at your desk"],
  ["4:40", "Leave the office"],
  ["5:00", "Warm-up and ramp-up sets"],
  ["5:07", "Main lifts and supersets"],
  ["5:47", "Fat-burn finisher"],
  ["5:56", "Cool-down"],
  ["6:00", "Protein, then head home"]
];

export const BAG = ["Flat indoor shoes", "Towel and 1 L water", "Shaker with a scoop of whey", "Change of clothes", "Wednesday: hand wraps or gloves"];
