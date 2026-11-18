/* Log page: set-by-set logging for the person on this phone, rest timer, session complete. */
(function () {
  "use strict";
  const G = GYM, esc = G.esc, ICON = UI.ICON;
  const thisMonday = G.mondayOf(new Date());
  let data = Store.load();
  const S = {
    me: Store.me(),
    monday: thisMonday,
    day: G.DAY_KEYS.indexOf(location.hash.slice(1)) >= 0 ? location.hash.slice(1) : (G.todayKey() || "mon")
  };
  const wk = () => G.weekKey(S.monday);
  const prevWk = () => G.weekKey(G.addDays(S.monday, -7));
  const names = () => data.settings.names;
  const other = () => (S.me === "a" ? "b" : "a");

  function commit(mutator) {
    mutator(data);
    if (!Store.save(data)) UI.toast("Storage is blocked in this browser. Logs won't be kept.");
  }

  /* ---------- who's logging ---------- */
  function renderWho() {
    document.getElementById("who").innerHTML = ["a", "b"].map(p =>
      '<button type="button" data-p="' + p + '" aria-pressed="' + (S.me === p) + '"><span class="dot ' + p + '"></span>' + esc(names()[p]) + "</button>").join("");
    document.querySelectorAll("#who button").forEach(b => b.addEventListener("click", () => {
      S.me = b.dataset.p; Store.setMe(S.me); renderAll();
    }));
  }

  /* ---------- week + days ---------- */
  function renderDays() {
    const isThis = S.monday.getTime() === thisMonday.getTime(), tk = G.todayKey();
    document.getElementById("wk-label").textContent = G.fmt(S.monday) + " – " + G.fmt(G.addDays(S.monday, 4));
    document.getElementById("days").innerHTML = G.DAY_KEYS.map((k, i) => {
      const p = G.PROGRAM[k];
      const da = !!Store.getDay(data, wk(), "a", k).done, db = !!Store.getDay(data, wk(), "b", k).done;
      const label = p.loc === "cult" ? "Cult" : p.title;
      return '<button type="button" class="daypill' + (p.loc === "cult" ? " cult" : "") + '" data-day="' + k + '" aria-pressed="' + (S.day === k) + '">' +
        "<b>" + G.DAY_SHORT[k] + "</b><span>" + (isThis && k === tk ? "Today" : label) + "</span>" +
        '<span class="pdots" aria-label="' + esc(names().a) + (da ? " done" : "") + ", " + esc(names().b) + (db ? " done" : "") + '"><i class="a' + (da ? " on" : "") + '"></i><i class="b' + (db ? " on" : "") + '"></i></span></button>';
    }).join("");
    document.querySelectorAll("#days .daypill").forEach(b => b.addEventListener("click", () => {
      S.day = b.dataset.day; history.replaceState(null, "", "#" + S.day); renderDays(); renderSession();
    }));
  }

  /* ---------- sets ---------- */
  function setsFor(p, wkKey, k, e) {
    const dl = Store.getDay(data, wkKey, p, k);
    const arr = (dl.sets && dl.sets[e.id]) || [];
    const out = [];
    for (let i = 0; i < Math.max(e.sets, arr.length); i++) out.push(arr[i] || {});
    return out;
  }
  function lastWeekHint(e, i) {
    const prev = setsFor(S.me, prevWk(), S.day, e);
    if (prev[i] && prev[i].kg != null) return prev[i];
    const best = Store.parseSet((Store.getDay(data, prevWk(), S.me, S.day).ex || {})[e.id]);
    return best ? { kg: best.kg, reps: best.reps } : {};
  }
  function writeSets(e, mutate) {
    commit(d => {
      const dl = Store.day(d, wk(), S.me, S.day);
      dl.sets = dl.sets || {}; dl.ex = dl.ex || {};
      const arr = (dl.sets[e.id] || []).slice();
      while (arr.length < e.sets) arr.push({});
      mutate(arr);
      dl.sets[e.id] = arr;
      dl.ex[e.id] = Store.bestOf(arr.filter(s => s.ok)) || Store.bestOf(arr);
    });
  }

  function progressOf(p) {
    let total = 0, done = 0;
    p.ex.forEach(e => { const s = setsFor(S.me, wk(), S.day, e); total += s.length; done += s.filter(x => x.ok).length; });
    return { total, done };
  }

  /* ---------- session ---------- */
  function renderSession() {
    const k = S.day, p = G.PROGRAM[k], el = document.getElementById("session");
    const dl = Store.getDay(data, wk(), S.me, k), od = Store.getDay(data, wk(), other(), k);
    const date = G.addDays(S.monday, G.DAY_KEYS.indexOf(k));
    const partner = '<span class="who" style="font-weight:500"><span class="dot ' + other() + '"></span>' + esc(names()[other()]) + ": " + (od.done ? "done ✓" : "not logged yet") + "</span>";
    let html = "";

    if (p.loc === "cult") {
      const c = G.CULT[G.cultFormat(S.monday)];
      html += '<div class="session-card"><div class="top"><div style="display:grid;gap:4px"><h2>' + c.name + ' class</h2><span class="hint">' + G.DAY_NAMES[k] + " " + G.fmt(date) + ' · Cult Andheri East · ' + c.intensity + '</span></div>' +
        (dl.done ? '<span class="done-badge">' + ICON.check.replace("<svg", '<svg width="16" height="16"') + 'Done</span>' : '') + '</div>' +
        '<p>' + c.why + '</p>' + partner +
        '<button type="button" class="btn ' + (dl.done ? "" : "go") + ' block" id="finish">' + (dl.done ? "Mark as not done" : ICON.check + "Mark class done") + '</button>' +
        '<p class="hint">Booking, rotation and what to bring are on the <a href="cult.html">Cult Day page</a>.</p></div>';
    } else {
      const pr = progressOf(p);
      html += '<div class="session-card"><div class="top"><div style="display:grid;gap:4px"><h2>' + p.title + " · " + p.focus + '</h2><span class="hint">' + G.DAY_NAMES[k] + " " + G.fmt(date) + ' · Step Up Fitness</span></div>' +
        (dl.done ? '<span class="done-badge">' + ICON.check.replace("<svg", '<svg width="16" height="16"') + 'Done</span>' : '') + '</div>' +
        '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + pr.total + '" aria-valuenow="' + pr.done + '"><i style="width:' + (pr.total ? (pr.done / pr.total) * 100 : 0) + '%"></i></div>' +
        '<div class="progress-label"><span><b class="mono">' + pr.done + "/" + pr.total + "</b> sets</span>" + partner + "</div>" +
        '<a class="hint" href="workouts.html#' + k + '">Warm-up, photos and technique tips →</a></div>';

      html += p.ex.map((e, ei) => {
        const sets = setsFor(S.me, wk(), k, e);
        const useSwap = S.me === "b" && e.swap;
        const thumb = useSwap && e.swapImg ? e.swapImg : e.img[0];
        const lastBest = (Store.getDay(data, prevWk(), S.me, k).ex || {})[e.id] || "";
        return '<article class="lift" data-ex="' + e.id + '">' +
          '<div class="lift-head"><img src="' + G.img(thumb, 0) + '" alt="" loading="lazy" width="72" height="54">' +
          '<div><h3>' + e.tag + ". " + e.n + '</h3><div class="meta mono">' + e.sets + " × " + e.reps + " · " + (e.rest <= 20 ? "superset " + e.restTxt : "rest " + e.restTxt) + (e.drop ? " · drop set on last" : "") + "</div></div></div>" +
          (useSwap ? '<span class="swap">Your swap: ' + e.swap + "</span>" : "") +
          '<div class="sets"><div class="set-row head"><span style="text-align:center">Set</span><span style="text-align:center">kg</span><span style="text-align:center">Reps</span><span></span></div>' +
          sets.map((s, i) => {
            const h = lastWeekHint(e, i);
            return '<div class="set-row' + (s.ok ? " done" : "") + '" data-i="' + i + '"><span class="n">' + (i + 1) + "</span>" +
              '<input id="kg-' + e.id + "-" + i + '" inputmode="decimal" autocomplete="off" aria-label="Set ' + (i + 1) + ' weight in kg" value="' + (s.kg != null ? s.kg : "") + '" placeholder="' + (h.kg != null ? h.kg : "kg") + '" data-f="kg">' +
              '<input id="reps-' + e.id + "-" + i + '" inputmode="numeric" autocomplete="off" aria-label="Set ' + (i + 1) + ' reps" value="' + (s.reps != null ? s.reps : "") + '" placeholder="' + (h.reps != null ? h.reps : e.reps.split(/[–\s/]/)[0]) + '" data-f="reps">' +
              '<button type="button" class="set-ok" aria-pressed="' + !!s.ok + '" aria-label="Set ' + (i + 1) + (s.ok ? " done, tap to undo" : " complete") + '">' + ICON.check + "</button></div>";
          }).join("") + "</div>" +
          '<div class="lift-foot"><span>' + (lastBest ? "Last week best: " + esc(lastBest.replace("x", " kg × ")) : "No log from last week") + '</span>' +
          '<span><button type="button" data-act="add">+ Set</button>' + (sets.length > e.sets ? ' · <button type="button" data-act="remove">− Set</button>' : "") + "</span></div></article>";
      }).join("");

      html += '<div class="session-card"><h3>' + p.finisher.label + '</h3><p>' + p.finisher.detail + '</p>' +
        (S.me === "b" && p.finisher.alt ? '<span class="swap">Your version: ' + p.finisher.alt + '</span>' : '') + '</div>';
      html += '<button type="button" class="btn ' + (dl.done ? "" : "go") + ' block" id="finish">' + (dl.done ? "Mark as not done" : ICON.check + "Finish workout") + "</button>";
    }

    html += '<label class="field"><span>Notes for ' + esc(names()[S.me]) + '</span><textarea id="note" maxlength="400" placeholder="' + (p.loc === "cult" ? "e.g. 5:15 Boxing, 6 rounds, felt strong" : "e.g. squat felt heavy, slept badly") + '">' + esc(dl.note || "") + "</textarea></label>";
    el.innerHTML = html;
    bindSession();
  }

  function bindSession() {
    const p = G.PROGRAM[S.day], el = document.getElementById("session");
    const fin = document.getElementById("finish");
    fin.addEventListener("click", () => {
      let summary = "";
      commit(d => { const dl = Store.day(d, wk(), S.me, S.day); dl.done = !dl.done; });
      const nowDone = Store.getDay(data, wk(), S.me, S.day).done;
      if (nowDone && p.ex) {
        let vol = 0, n = 0;
        p.ex.forEach(e => setsFor(S.me, wk(), S.day, e).forEach(s => { if (s.ok && s.kg > 0 && s.reps > 0) { vol += s.kg * s.reps; n++; } }));
        summary = n ? " " + n + " sets · " + Math.round(vol).toLocaleString("en-IN") + " kg lifted." : "";
        stopRest();
      }
      UI.toast(nowDone ? "Session complete." + summary : "Marked as not done.");
      renderDays(); renderSession();
    });
    const note = document.getElementById("note");
    note.addEventListener("change", () => commit(d => { Store.day(d, wk(), S.me, S.day).note = note.value.trim().slice(0, 400); }));
    if (!p.ex) return;

    el.querySelectorAll(".lift").forEach(card => {
      const e = p.ex.find(x => x.id === card.dataset.ex);
      card.querySelectorAll(".set-row[data-i]").forEach(row => {
        const i = +row.dataset.i;
        row.querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => {
          const v = inp.value.trim().replace(",", ".");
          const n = v === "" ? null : (inp.dataset.f === "kg" ? parseFloat(v) : parseInt(v, 10));
          if (v !== "" && !(n >= 0)) { inp.value = ""; UI.toast("Enter a number."); return; }
          writeSets(e, arr => { arr[i] = Object.assign({}, arr[i], { [inp.dataset.f]: n }); });
        }));
        row.querySelector(".set-ok").addEventListener("click", () => {
          const kgIn = row.querySelector('[data-f="kg"]'), rpIn = row.querySelector('[data-f="reps"]');
          const cur = setsFor(S.me, wk(), S.day, e)[i];
          const turningOn = !cur.ok;
          const kg = parseFloat((kgIn.value || (turningOn ? kgIn.placeholder : "")).replace(",", "."));
          const reps = parseInt(rpIn.value || (turningOn ? rpIn.placeholder : ""), 10);
          writeSets(e, arr => { arr[i] = { kg: isFinite(kg) ? kg : null, reps: isFinite(reps) ? reps : null, ok: turningOn }; });
          if (turningOn) {
            const all = p.ex.every(x => setsFor(S.me, wk(), S.day, x).every(s => s.ok));
            if (all) { stopRest(); UI.toast("All sets done. Tap Finish workout."); }
            else {
              const nx = G.nextEx(S.day, e);
              const mate = /2$/.test(e.tag) ? p.ex.find(x => x.tag === e.tag.replace(/2$/, "1")) : null;
              startRest(e.rest, e.rest <= 20 && nx ? "Go: " + nx.tag + " " + nx.n : "Rest · then " + (mate ? mate.tag + " " + mate.n : e.n));
            }
            keepAwake();
          }
          const y = window.scrollY; renderSession(); renderDays(); window.scrollTo(0, y);
        });
      });
      card.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
        writeSets(e, arr => { if (b.dataset.act === "add") arr.push({}); else if (arr.length > e.sets) arr.pop(); });
        const y = window.scrollY; renderSession(); window.scrollTo(0, y);
      }));
    });
  }

  /* ---------- rest timer ---------- */
  const R = { end: 0, total: 0, t: 0, label: "" };
  const bar = document.getElementById("rest");
  let audio = null;
  function beep() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25].forEach(off => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
        g.gain.setValueAtTime(0.0001, audio.currentTime + off);
        g.gain.exponentialRampToValueAtTime(0.3, audio.currentTime + off + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + off + 0.18);
        o.start(audio.currentTime + off); o.stop(audio.currentTime + off + 0.2);
      });
    } catch (e) { /* no audio */ }
  }
  function startRest(sec, label) {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume(); } catch (e) { /* ignore */ }
    R.total = sec; R.end = Date.now() + sec * 1000; R.label = label;
    bar.hidden = false; bar.classList.remove("done");
    clearInterval(R.t); R.t = setInterval(tick, 250); tick();
  }
  function stopRest() { clearInterval(R.t); bar.hidden = true; R.end = 0; }
  function tick() {
    const left = Math.max(0, Math.round((R.end - Date.now()) / 1000));
    document.getElementById("rest-clock").textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
    document.getElementById("rest-lbl").textContent = left ? R.label : "Rest over. Next set!";
    document.getElementById("rest-track").style.width = (R.total ? (1 - left / R.total) * 100 : 100) + "%";
    if (!left) {
      clearInterval(R.t); bar.classList.add("done");
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      beep();
      setTimeout(() => { if (!R.end || Date.now() >= R.end) stopRest(); }, 5000);
    }
  }
  document.getElementById("rest-minus").addEventListener("click", () => { R.end -= 15000; R.total = Math.max(15, R.total - 15); tick(); });
  document.getElementById("rest-plus").addEventListener("click", () => {
    if (bar.classList.contains("done")) { startRest(15, R.label); return; }
    R.end += 15000; R.total += 15; tick();
  });
  document.getElementById("rest-skip").addEventListener("click", stopRest);

  /* keep the screen on during a workout where the browser allows it */
  let lock = null;
  async function keepAwake() {
    try { if ("wakeLock" in navigator && !lock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); } } catch (e) { lock = null; }
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && R.end) { keepAwake(); tick(); } });

  /* ---------- week nav ---------- */
  function go(m) { S.monday = m; renderDays(); renderSession(); }
  document.getElementById("wk-prev").addEventListener("click", () => go(G.addDays(S.monday, -7)));
  document.getElementById("wk-next").addEventListener("click", () => go(G.addDays(S.monday, 7)));
  document.getElementById("wk-now").addEventListener("click", () => { S.day = G.todayKey() || "mon"; history.replaceState(null, "", "#" + S.day); go(thisMonday); });
  window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (G.DAY_KEYS.indexOf(h) >= 0) { S.day = h; renderDays(); renderSession(); } });
  window.addEventListener("storage", e => { if (e.key === "fogp:v1") { data = Store.load(); renderAll(); } });

  function renderAll() { renderWho(); renderDays(); renderSession(); }
  renderAll();
})();
