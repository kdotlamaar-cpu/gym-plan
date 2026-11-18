/* Today page: greeting, today's session, quick stats, this week's board. */
(function () {
  "use strict";
  const G = GYM, data = Store.load(), names = data.settings.names, me = Store.me(), esc = G.esc;
  const now = new Date(), monday = G.mondayOf(now), wk = G.weekKey(now), tk = G.todayKey();
  const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const hr = now.getHours();
  document.getElementById("hello").textContent = (hr < 12 ? "Morning" : hr < 17 ? "Hey" : "Evening") + ", " + names[me];
  document.getElementById("hello-sub").textContent = DOW[now.getDay()] + " " + G.fmt(now) + ". " +
    (tk ? "Gym at 5:00 PM. Leave the office by 4:40." : "Weekend: rest, walk, eat well.");

  /* today */
  const today = document.getElementById("today");
  const doneToday = tk && Store.getDay(data, wk, me, tk).done;
  if (!tk) {
    today.innerHTML = '<span class="big">Rest</span><div><div class="l1">No gym today</div><div class="l2">Walk 8–10k steps and keep protein high. Monday is Push day at Step Up.</div></div><a class="btn" href="workouts.html#mon">Preview Monday</a>';
  } else {
    const p = G.PROGRAM[tk];
    const logged = G.className(Store.getDay(data, wk, me, tk));
    const title = p.loc === "cult" ? (logged ? logged + " class · logged" : "Cult class · plan: " + G.CLASSES[G.cultFormat(now)].name) : p.title + " · " + p.focus;
    const where = p.loc === "cult" ? "Cult Andheri East · book the class closest to 5 PM" : "Step Up Fitness, Vile Parle East · 5:00–6:00 PM";
    today.innerHTML = '<span class="big">' + G.DAY_SHORT[tk] + '</span><div><div class="l1">' + title + '</div><div class="l2">' + where + '</div></div>' +
      '<a class="btn" href="' + (p.loc === "cult" ? "cult.html" : "tracker.html#" + tk) + '">' + (doneToday ? UI.ICON.check + "Done · view log" : UI.ICON.play + (p.loc === "cult" ? "Pick your class" : "Start workout")) + '</a>';
  }

  /* stats for the person on this phone */
  const cnt = (w, p) => G.DAY_KEYS.filter(k => Store.getDay(data, w, p, k).done).length;
  let streak = 0;
  for (let i = 1; i < 52; i++) { if (cnt(G.weekKey(G.addDays(monday, -7 * i)), me) >= 4) streak++; else break; }
  if (cnt(wk, me) >= 4) streak++;
  const weights = Object.keys(data.weeks).sort().map(w => Store.getWeight(data, w, me)).filter(v => v != null);
  const delta = weights.length ? weights[weights.length - 1] - data.settings.startWeight[me] : null;
  const bw = G.blockWeek(data.settings.start, now);
  document.getElementById("stats").innerHTML = [
    [cnt(wk, me) + "/5", "sessions this week"],
    [String(streak), streak === 1 ? "week streak (4+ sessions)" : "weeks streak (4+ sessions)"],
    [delta == null ? "—" : (delta > 0 ? "+" : "") + delta.toFixed(1), delta == null ? "kg change · weigh in on Progress" : "kg since start"],
    [bw ? bw.inBlock + "/6" : "—", bw ? (bw.inBlock === 6 ? "deload week: go lighter" : "week of block " + bw.block) : "block starts " + data.settings.start]
  ].map(s => '<div class="stat"><b class="mono">' + s[0] + "</b><span>" + s[1] + "</span></div>").join("");

  /* week board */
  document.getElementById("week-lbl").textContent = G.fmt(monday) + " – " + G.fmt(G.addDays(monday, 4));
  document.getElementById("board").innerHTML = G.DAY_KEYS.map((k, i) => {
    const p = G.PROGRAM[k];
    const myCls = p.loc === "cult" ? G.className(Store.getDay(data, wk, me, k)) : "";
    const focus = p.loc === "cult" ? (myCls || "Cult class") : p.title;
    const sub = p.loc === "cult" ? (myCls ? "Your class this week" : "Plan: " + G.CLASSES[G.cultFormat(now)].name + " · any class counts") : p.focus;
    const da = !!Store.getDay(data, wk, "a", k).done, db = !!Store.getDay(data, wk, "b", k).done;
    return '<a class="day-card' + (k === tk ? " is-today" : "") + '" href="' + (p.loc === "cult" ? "cult.html" : "tracker.html#" + k) + '">' +
      '<div class="dn"><b>' + G.DAY_SHORT[k] + '</b><span class="date">' + G.fmt(G.addDays(monday, i)) + '</span></div>' +
      '<div style="display:grid;gap:4px"><span class="chip ' + p.loc + '">' + G.GYMS[p.loc].short + '</span><span class="focus">' + focus + '</span><span class="tiny">' + sub + '</span></div>' +
      '<div class="ticks" role="img" aria-label="' + esc(names.a) + (da ? " done" : " not done") + ", " + esc(names.b) + (db ? " done" : " not done") + '"><span class="tick a' + (da ? " on" : "") + '"></span><span class="tick b' + (db ? " on" : "") + '"></span></div></a>';
  }).join("");
  document.getElementById("legend").innerHTML = ["a", "b"].map(p => '<span><i style="background:var(--s' + p + ')"></i>' + esc(names[p]) + " · " + cnt(wk, p) + "/5 done</span>").join("");
})();
