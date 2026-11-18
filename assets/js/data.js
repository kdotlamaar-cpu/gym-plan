/* Five O'Clock Gym Plan — program data and date helpers (shared by every page).
   Exercise photos: assets/img/ex/<slug>-0.jpg (start) and -1.jpg (finish),
   from free-exercise-db (github.com/yuhonas/free-exercise-db), public domain (Unlicense). */
(function () {
  "use strict";

  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];
  const DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" };
  const DAY_SHORT = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri" };

  const GYMS = {
    stepup: {
      name: "Step Up Fitness", short: "Step Up", area: "Vile Parle East",
      address: "501 E Square, Subhash Road, Vile Parle East, Mumbai 400057",
      hours: "6:00 AM – 10:00 PM",
      type: "Full gym: free weights, machines, cables, cardio, steam and showers",
      days: ["mon", "tue", "thu", "fri"],
      map: "https://www.google.com/maps/search/?api=1&query=Step+Up+Fitness+E+Square+Subhash+Road+Vile+Parle+East+Mumbai",
      source: "https://www.cult.fit/cult/center/vile-parle/step-up-fitness-vile-parle-east/865"
    },
    cult: {
      name: "Cult Andheri East", short: "Cult Andheri", area: "Andheri East",
      address: "T-11/12, 3rd Floor, B-Wing, Pinnacle Business Park, Mahakali Caves Road, Andheri East, Mumbai 400093",
      hours: "Classes 6:00 AM – 12:00 PM and 4:00 PM – 10:00 PM",
      type: "Group classes: Boxing, HRX, S&C, Dance Fitness, Yoga (book in the cult.fit app)",
      days: ["wed"],
      map: "https://www.google.com/maps/search/?api=1&query=Cult+Pinnacle+Business+Park+Mahakali+Caves+Road+Andheri+East",
      source: "https://www.cure.fit/cult/center/andheri-east/cult-andheri-east-/277"
    }
  };

  /* 7-minute warm-ups, matched to the session */
  const WARMUP = {
    push: [["4 min", "Bike or rower at an easy pace"], ["×15", "Band pull-aparts"], ["×10", "Scap push-ups"], ["×10 / side", "Thoracic open-books"], ["2–3 sets", "Ramp-up sets on bench: empty bar × 10, 60% × 5, 80% × 2"]],
    pull: [["4 min", "Rower at an easy pace"], ["×10", "Cat–cow"], ["×10", "Hip-hinge drill with a dowel"], ["2 × 20 s", "Dead hang from the pull-up bar"], ["2–3 sets", "Ramp-up RDL sets: bar × 10, 60% × 5"]],
    legs: [["4 min", "Bike at an easy pace"], ["×5 / side", "World's greatest stretch"], ["×15", "Bodyweight squats"], ["×15", "Glute bridges"], ["2–3 sets", "Ramp-up squat sets: bar × 10, 60% × 5, 80% × 2"]],
    upper: [["4 min", "Rower or bike at an easy pace"], ["×15", "Band pull-aparts"], ["×10", "Scap push-ups"], ["×15", "Light lateral raises"], ["2 sets", "Ramp-up sets on incline press: 50% × 10, 75% × 4"]]
  };
  const COOLDOWN = {
    push: [["30 s / side", "Doorway chest stretch"], ["30 s / side", "Overhead triceps stretch"], ["45 s", "Child's pose"]],
    pull: [["30 s / side", "Lat stretch on a rack"], ["30 s / side", "Lying hamstring stretch"], ["45 s", "Child's pose"]],
    legs: [["30 s / side", "Kneeling hip-flexor stretch"], ["30 s / side", "Standing quad stretch"], ["30 s / side", "Figure-4 glute stretch"], ["30 s", "Calf stretch on a step"]],
    upper: [["30 s / side", "Doorway chest stretch"], ["30 s / side", "Lat stretch on a rack"], ["30 s / side", "Cross-body shoulder stretch"]]
  };

  /* Each exercise:
     tag    — order in the session; D1 + D2 are a superset (do D1, go straight to D2, then rest)
     sets / reps / rest (seconds, drives the rest timer) / restTxt (shown)
     img    — photo slugs (one = start/finish pair, two = superset)
     drop   — last set is a drop set: finish the set, cut the weight ~25%, go again to failure
     swap / swapImg — back-friendly alternative for person B */
  const PROGRAM = {
    mon: {
      loc: "stepup", type: "push", title: "Push", focus: "Chest · shoulders · triceps",
      tag: "Heavy press first, then volume. Supersets keep it inside the hour.",
      finisher: { label: "Fat-burn finisher", detail: "8 min incline walk: 12% incline, 5.5 km/h. Hands off the rails.", alt: "Same, but stay on for 12–15 min if you have time." },
      ex: [
        { id: "pu-bench", tag: "A", n: "Barbell bench press", sets: 4, reps: "6–8", rest: 150, restTxt: "2–3 min", img: ["barbell-bench-press-medium-grip"], tip: "Shoulder blades pinned back, feet driving into the floor, bar to the lower chest. Leave 1–2 reps in the tank.", swap: "Keep a moderate arch with your glutes on the bench, or use DB bench if your back tightens." },
        { id: "pu-incline", tag: "B", n: "Incline DB press", sets: 3, reps: "8–10", rest: 90, restTxt: "90 s", img: ["incline-dumbbell-press"], tip: "Bench at 30°. Take 3 seconds on the way down and stretch at the bottom." },
        { id: "pu-ohp", tag: "C", n: "Seated DB shoulder press", sets: 3, reps: "8–10", rest: 90, restTxt: "90 s", img: ["seated-dumbbell-press"], tip: "Bench upright, back flat on the pad. Press up and slightly in.", swap: "Back pressed into the pad the whole time. No standing presses." },
        { id: "pu-fly", tag: "D1", n: "Cable crossover", sets: 3, reps: "12–15", rest: 20, restTxt: "→ D2", img: ["cable-crossover"], tip: "Pulleys high, slight bend in the elbows, hands meet at belly height. Squeeze for 1 second.", drop: true },
        { id: "pu-lat", tag: "D2", n: "Cable lateral raise", sets: 3, reps: "12–15", rest: 60, restTxt: "60 s", img: ["cable-seated-lateral-raise"], tip: "One arm at a time from a low pulley. Lead with the elbow and stop at shoulder height." },
        { id: "pu-push", tag: "E1", n: "Rope pushdown", sets: 3, reps: "10–12", rest: 20, restTxt: "→ E2", img: ["triceps-pushdown-rope-attachment"], tip: "Elbows pinned to your sides. Spread the rope apart at the bottom.", drop: true },
        { id: "pu-ohe", tag: "E2", n: "Overhead rope triceps extension", sets: 3, reps: "10–12", rest: 60, restTxt: "60 s", img: ["cable-rope-overhead-triceps-extension"], tip: "Face away from the cable in a split stance. Get a deep stretch behind your head.", swap: "Do machine dips instead of overhead work if arching your back to get the stretch.", swapImg: "dip-machine" }
      ]
    },
    tue: {
      loc: "stepup", type: "pull", title: "Pull", focus: "Back · biceps · rear delts · hamstrings",
      tag: "Hinge and pull heavy, then pump the upper back and arms.",
      finisher: { label: "Fat-burn finisher", detail: "Rower intervals: 8 rounds of 30 s hard / 30 s easy.", alt: "Use the bike instead of the rower. It's kinder on the lower back.", img: "rowing-stationary" },
      ex: [
        { id: "pl-rdl", tag: "A", n: "Romanian deadlift", sets: 3, reps: "6–8", rest: 150, restTxt: "2–3 min", img: ["romanian-deadlift"], tip: "Soft knees, hips straight back, bar dragging down your thighs. Stop when the hamstrings are fully stretched.", swap: "45° back extension 3 × 12–15. Hold a plate once bodyweight is easy.", swapImg: "hyperextensions-back-extensions" },
        { id: "pl-pullup", tag: "B", n: "Pull-up (weighted or assisted)", sets: 4, reps: "6–10", rest: 120, restTxt: "2 min", img: ["pullups"], tip: "Start from a full hang and drive your elbows to your back pockets. Once you can do 10 clean reps, add weight with a belt or a dumbbell between your feet." },
        { id: "pl-tbar", tag: "C", n: "Chest-supported T-bar row", sets: 3, reps: "8–10", rest: 90, restTxt: "90 s", img: ["lying-t-bar-row"], tip: "Chest stays on the pad. Pull to your stomach and pause 1 second." },
        { id: "pl-crow", tag: "D1", n: "Seated cable row (close grip)", sets: 3, reps: "10–12", rest: 20, restTxt: "→ D2", img: ["seated-cable-rows"], tip: "Let the shoulders stretch forward, then row back with a tall chest. Don't swing your torso.", swap: "Sit tall and don't rock. Use a chest-supported row machine if one is free." },
        { id: "pl-face", tag: "D2", n: "Face pull", sets: 3, reps: "15", rest: 60, restTxt: "60 s", img: ["face-pull"], tip: "Rope at forehead height. Pull to your eyes, thumbs pointing back. Good for posture and shoulder health." },
        { id: "pl-icurl", tag: "E1", n: "Incline DB curl", sets: 3, reps: "10–12", rest: 20, restTxt: "→ E2", img: ["incline-dumbbell-curl"], tip: "Bench at 45°, arms hanging straight down. Keep the upper arm still.", drop: true },
        { id: "pl-hammer", tag: "E2", n: "Hammer curl", sets: 3, reps: "10–12", rest: 60, restTxt: "60 s", img: ["hammer-curls"], tip: "Thumbs up. Curl across your body for extra forearm work." }
      ]
    },
    wed: { loc: "cult", type: "class", title: "Cult class", focus: "Any class · Boxing, Burn, HRX…", tag: "Conditioning day. Pick any class; the plan suggests Boxing and HRX on alternate weeks." },
    thu: {
      loc: "stepup", type: "legs", title: "Legs", focus: "Quads · glutes · hamstrings · calves · abs",
      tag: "The biggest calorie-burning day. Brace hard, then push the volume.",
      finisher: { label: "Fat-burn finisher", detail: "Bike sprints: 8 rounds of 20 s all-out / 40 s easy.", alt: "Same. Keep the resistance moderate and sit tall.", img: "bicycling-stationary" },
      ex: [
        { id: "lg-squat", tag: "A", n: "Barbell back squat", sets: 4, reps: "6–8", rest: 150, restTxt: "2–3 min", img: ["barbell-squat"], tip: "Big breath, brace, sit between your hips. Hit at least parallel and drive up through mid-foot.", swap: "Hack squat with your back flat on the pad, or goblet squat 4 × 10. No bar on the spine.", swapImg: "hack-squat" },
        { id: "lg-press", tag: "B", n: "Leg press", sets: 3, reps: "10–15", rest: 90, restTxt: "90 s", img: ["leg-press"], tip: "Feet shoulder-width, mid-platform. Go deep, but stop before your lower back peels off the pad.", swap: "Slightly shorter range: stop before your hips tuck under." },
        { id: "lg-lunge", tag: "C", n: "DB walking lunge", sets: 3, reps: "10 / leg", rest: 90, restTxt: "90 s", img: ["dumbbell-lunges"], tip: "Long steps, torso tall, back knee kisses the floor. Your glutes will feel this." },
        { id: "lg-curl", tag: "D1", n: "Lying leg curl", sets: 3, reps: "10–12", rest: 20, restTxt: "→ D2", img: ["lying-leg-curls"], tip: "Hips pressed into the pad. Take 3 seconds on the way down.", drop: true },
        { id: "lg-ext", tag: "D2", n: "Leg extension", sets: 3, reps: "12–15", rest: 60, restTxt: "60 s", img: ["leg-extensions"], tip: "Pause 1 second at the top and squeeze the quads.", drop: true },
        { id: "lg-calf", tag: "E1", n: "Standing calf raise", sets: 4, reps: "10–15", rest: 20, restTxt: "→ E2", img: ["standing-calf-raises"], tip: "Full stretch at the bottom with a 2-second pause, then all the way up." },
        { id: "lg-abs", tag: "E2", n: "Cable crunch", sets: 3, reps: "12–15", rest: 45, restTxt: "45 s", img: ["cable-crunch"], tip: "Kneel and crunch your ribs toward your hips. Don't sit back onto your heels.", swap: "Dead bug 3 × 10 / side. Abs without spinal flexion.", swapImg: "dead-bug" }
      ]
    },
    fri: {
      loc: "stepup", type: "upper", title: "Upper", focus: "Upper-body pump · arms · conditioning",
      tag: "Moderate weights, short rests, lots of pump. End the week with a sweat.",
      finisher: { label: "Fat-burn finisher", detail: "8 min EMOM: odd minutes 15 kettlebell swings, even minutes 30 s battle ropes.", alt: "Swap the swings for 30 s bike sprints and keep the battle ropes.", img: "one-arm-kettlebell-swings" },
      ex: [
        { id: "up-incline", tag: "A", n: "Incline barbell press", sets: 3, reps: "8–10", rest: 120, restTxt: "2 min", img: ["barbell-incline-bench-press-medium-grip"], tip: "Bench at 30°. Bar to the upper chest, elbows slightly tucked. The Smith machine works too." },
        { id: "up-pulldown", tag: "B", n: "Wide-grip lat pulldown", sets: 3, reps: "10–12", rest: 90, restTxt: "90 s", img: ["wide-grip-lat-pulldown"], tip: "Lean back slightly and pull to the upper chest. Control the bar all the way up." },
        { id: "up-mpress", tag: "C1", n: "Machine chest press", sets: 3, reps: "10–12", rest: 20, restTxt: "→ C2", img: ["leverage-chest-press"], tip: "Handles at mid-chest. Keep constant tension: don't lock out hard.", drop: true },
        { id: "up-dbrow", tag: "C2", n: "Single-arm DB row", sets: 3, reps: "10–12 / arm", rest: 60, restTxt: "60 s", img: ["one-arm-dumbbell-row"], tip: "Knee and hand on the bench, back flat. Row to your hip, not your chest.", swap: "Chest-supported row machine or T-bar row. No bent-over position.", swapImg: "lying-t-bar-row" },
        { id: "up-lat", tag: "D1", n: "DB lateral raise", sets: 3, reps: "12–15", rest: 20, restTxt: "→ D2", img: ["side-lateral-raise"], tip: "Light weight, slow tempo, lead with the elbows. Finish with partial reps when you can't do full ones.", drop: true },
        { id: "up-rdelt", tag: "D2", n: "Reverse pec deck", sets: 3, reps: "15", rest: 60, restTxt: "60 s", img: ["reverse-machine-flyes"], tip: "Arms long, sweep wide. Rear delts and upper back, not traps." },
        { id: "up-curl", tag: "E1", n: "EZ-bar curl", sets: 3, reps: "10–12", rest: 20, restTxt: "→ E2", img: ["ez-bar-curl"], tip: "Elbows still, full squeeze at the top, 2 seconds down." },
        { id: "up-dip", tag: "E2", n: "Machine or assisted dips", sets: 3, reps: "10–12", rest: 60, restTxt: "60 s", img: ["dip-machine"], tip: "Torso upright for triceps. Go down until your elbows reach 90°.", drop: true }
      ]
    }
  };

  /* Cult classes you can log on Wednesday. `lvl` = intensity 1–3. kcal is a rough range for a 50-minute class. */
  const CLASSES = {
    boxing: {
      name: "Boxing", sub: "Bag & pads", lvl: 3, intensity: "High intensity", kcal: "500–700",
      icon: '<path d="M7 9a5 5 0 0 1 10 0v4a5 5 0 0 1-5 5h-1a4 4 0 0 1-4-4z"/><path d="M7 13h4M8 21h8"/>',
      why: "Cardio-heavy rounds of combos, footwork and pad or bag work, with core finishers. Builds stamina and core strength and burns a lot of calories.",
      focus: ["Cardio", "Core", "Shoulders", "Coordination"],
      bring: ["Hand wraps or gloves (check whether the centre lends them)", "Towel and water", "Light, flat shoes"],
      tips: ["Keep your guard up between combos", "Turn your hips and back foot into each punch. Don't punch with just the arms.", "Breathe out sharply on every punch"],
      back: "Rotate through the feet and hips, not the lower back. Keep the core braced on hooks."
    },
    burn: {
      name: "Burn", sub: "HIIT cardio", lvl: 3, intensity: "High intensity", kcal: "450–650",
      icon: '<path d="M12 3c.6 3.2 5 5.4 5 10.2A5 5 0 0 1 7 13.5c0-2.4 1.3-3.9 2.4-4.9.2 1.6.9 2.6 2 3.2-.3-3.1.2-6 .6-8.8z"/>',
      why: "Short, all-out intervals of cardio and bodyweight moves with brief rests. Built to spike your heart rate, so it's one of the best fat-loss classes.",
      focus: ["HIIT", "Fat loss", "Legs", "Stamina"],
      bring: ["Towel and plenty of water", "Cushioned trainers for the jumps"],
      tips: ["Go hard in the work intervals and recover fully in the rests", "Land softly through the whole foot", "Take the low-impact option the trainer shows as soon as your form slips"],
      back: "Pick the low-impact versions of jumps and burpees. Keep the core braced on mountain climbers and planks."
    },
    hrx: {
      name: "HRX Workout", sub: "Functional", lvl: 3, intensity: "Medium–high intensity", kcal: "400–600",
      icon: '<path d="M9 9V7.5a3 3 0 0 1 6 0V9"/><circle cx="12" cy="15" r="6"/>',
      why: "Trainer-led full-body circuits with bodyweight, dumbbells and kettlebells. Mixes strength and conditioning in one session.",
      focus: ["Full body", "Strength", "Conditioning"],
      bring: ["Towel and water", "Cross-trainers or flat shoes", "Arrive 10 minutes early to set up your station"],
      tips: ["Use weights you can control for every rep", "On jumps, land softly or step them out", "Keep moving during the work intervals and slow down if your form breaks"],
      back: "Tell the trainer before class. Swap heavy floor pickups and fast twisting for slower, braced versions."
    },
    sc: {
      name: "S&C", sub: "Weights circuit", lvl: 2, intensity: "Medium intensity", kcal: "350–500",
      icon: '<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>',
      why: "Strength & Conditioning: squats, presses, rows and carries at a steadier pace. The closest class to a gym session.",
      focus: ["Strength", "Muscle", "Core"],
      bring: ["Towel and water", "Flat, stable shoes"],
      tips: ["Pick a weight that lets you finish every rep cleanly", "Brace before each lift", "Treat it as a lighter lifting day so your legs are fresh for Thursday"],
      back: "Ask for lighter loads on floor pickups and hinge with a flat back."
    },
    dance: {
      name: "Dance Fitness", sub: "Cardio to music", lvl: 2, intensity: "Medium intensity", kcal: "350–500",
      icon: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
      why: "Choreographed cardio to Bollywood and pop. Steady effort and a lot of fun, which makes it good active recovery between lifting days.",
      focus: ["Cardio", "Coordination", "Recovery"],
      bring: ["Towel and water", "Light shoes with some grip"],
      tips: ["Follow the lower-intensity version for the first few songs", "Keep moving even when you miss steps"],
      back: "Skip fast twists and deep back bends. Smaller steps are fine."
    },
    yoga: {
      name: "Yoga", sub: "Mobility", lvl: 1, intensity: "Low intensity", kcal: "150–250",
      icon: '<circle cx="12" cy="4.5" r="2"/><path d="M12 8v6M4.5 11l7.5 3 7.5-3M7 20l5-6 5 6"/>',
      why: "Mobility, balance and breathing. The lowest intensity, and the right pick when you're sore or need recovery mid-week.",
      focus: ["Mobility", "Recovery", "Breathing"],
      bring: ["Towel and water", "Fitted clothes"],
      tips: ["Go to the edge of the stretch, never into pain", "Match each movement to a breath"],
      back: "Go easy on deep forward folds and twists. Bend your knees and use blocks."
    },
    other: {
      name: "Other", sub: "Name it", lvl: 0, intensity: "", kcal: "",
      icon: '<path d="M12 5v14M5 12h14"/>',
      why: "Did a different class? Type its name and it's logged the same way.",
      focus: [], bring: [], tips: [], back: ""
    }
  };
  const CLASS_IDS = Object.keys(CLASSES);
  const EFFORT = ["Easy", "Solid", "Hard", "All out"];
  /** Name of the class logged in a day entry ("Burn"), or "" when none is set. */
  function className(dl) {
    if (!dl || !dl.cls || !CLASSES[dl.cls]) return "";
    return dl.cls === "other" ? (dl.clsName || "Other class") : CLASSES[dl.cls].name;
  }

  const img = (slug, n) => "assets/img/ex/" + slug + "-" + (n || 0) + ".jpg";
  /** Exercise that follows `e` in its day, or null. */
  function nextEx(day, e) { const list = PROGRAM[day].ex || []; return list[list.indexOf(e) + 1] || null; }

  /* ---------- date helpers ---------- */
  const pad = n => String(n).padStart(2, "0");
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    const y = t.getUTCFullYear(); const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
    return { y, w };
  }
  const weekKey = d => { const { y, w } = isoWeek(d); return y + "-W" + pad(w); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fmt = d => d.getDate() + " " + MON[d.getMonth()];
  const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseYmd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  function mondayOfKey(key) {
    const m = /^(\d{4})-W(\d{2})$/.exec(key || ""); if (!m) return null;
    return addDays(mondayOf(new Date(+m[1], 0, 4)), (+m[2] - 1) * 7);
  }
  const cultFormat = d => (isoWeek(d).w % 2 === 1 ? "boxing" : "hrx");
  function blockWeek(startYmd, d) {
    const s = parseYmd(startYmd); if (!s) return null;
    const weeks = Math.round((mondayOf(d) - mondayOf(s)) / (7 * 864e5));
    if (weeks < 0) return null;
    return { total: weeks + 1, inBlock: (weeks % 6) + 1, block: Math.floor(weeks / 6) + 1 };
  }
  const todayKey = () => { const i = (new Date().getDay() + 6) % 7; return i < 5 ? DAY_KEYS[i] : null; };
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  window.GYM = {
    DAY_KEYS, DAY_NAMES, DAY_SHORT, GYMS, WARMUP, COOLDOWN, PROGRAM, CLASSES, CLASS_IDS, EFFORT, className, img, nextEx,
    mondayOf, mondayOfKey, isoWeek, weekKey, addDays, fmt, ymd, parseYmd, cultFormat, blockWeek, todayKey, esc
  };
})();
