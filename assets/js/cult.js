/* Cult Day page: log this week's class, class mix per person, last 8 Wednesdays, class guide. */
(function () {
  "use strict";
  const G = GYM, esc = G.esc, $ = id => document.getElementById(id);
  const thisMonday = G.mondayOf(new Date());
  const S = { p: Store.me(), monday: thisMonday };
  const names = () => Store.load().settings.names;
  const wedOf = (data, monday, p) => Store.getDay(data, G.weekKey(monday), p, "wed");

  /* ---------- who + week ---------- */
  function renderWho() {
    const n = names();
    $("who").innerHTML = Store.order().map(p =>
      '<button type="button" data-p="' + p + '" aria-pressed="' + (S.p === p) + '"><span class="dot ' + p + '"></span>' + esc(n[p]) + "</button>").join("");
    $("who").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { S.p = b.dataset.p; renderAll(); }));
  }
  function renderWeek() {
    const isThis = S.monday.getTime() === thisMonday.getTime();
    $("wk-label").textContent = isThis ? "This week" : "Week of " + G.fmt(S.monday);
    $("wk-now").hidden = isThis;
    $("wk-next").disabled = S.monday >= G.addDays(thisMonday, 7);
  }
  function go(m) { S.monday = m; renderAll(); }
  $("wk-prev").addEventListener("click", () => go(G.addDays(S.monday, -7)));
  $("wk-next").addEventListener("click", () => go(G.addDays(S.monday, 7)));
  $("wk-now").addEventListener("click", () => go(thisMonday));

  /* ---------- log + note ---------- */
  function renderLog() {
    CultLog.render({ el: $("log"), monday: S.monday, p: S.p, onChange: () => { renderMix(); renderHist(); } });
    const dl = wedOf(Store.load(), S.monday, S.p);
    $("note").value = dl.note || "";
    $("note-lbl").textContent = "Notes for " + names()[S.p];
  }
  $("note").addEventListener("change", () => {
    const d = Store.load(); Store.day(d, G.weekKey(S.monday), S.p, "wed").note = $("note").value.trim().slice(0, 400); Store.save(d);
    UI.toast("Note saved.");
  });

  /* ---------- class mix ---------- */
  function renderMix() {
    const data = Store.load(), n = data.settings.names;
    $("mix").innerHTML = Store.order().map(p => {
      const count = {}; let total = 0;
      Object.keys(data.weeks).forEach(wk => {
        const dl = Store.getDay(data, wk, p, "wed");
        if (G.CLASSES[dl.cls]) { const key = dl.cls === "other" ? "other:" + (dl.clsName || "Other class") : dl.cls; count[key] = (count[key] || 0) + 1; total++; }
      });
      const rows = Object.keys(count).sort((x, y) => count[y] - count[x]);
      const max = rows.length ? count[rows[0]] : 1;
      return '<div class="card mix"><div class="mix-head"><span class="who"><span class="dot ' + p + '"></span>' + esc(n[p]) + '</span><span class="hint"><b class="mono">' + total + "</b> " + (total === 1 ? "class" : "classes") + "</span></div>" +
        (rows.length ? '<ul class="mix-list">' + rows.map(k => {
          const id = k.split(":")[0], c = G.CLASSES[id], label = id === "other" ? k.slice(6) : c.name;
          return '<li><span class="ic">' + CultLog.icon(c, 18) + '</span><span class="nm">' + esc(label) + '</span><span class="bar"><i style="width:' + Math.max(8, (count[k] / max) * 100) + "%;background:var(--s" + p + ')"></i></span><b class="mono">' + count[k] + "</b></li>";
        }).join("") + "</ul>" : '<p class="hint">No classes logged yet. Tap a class above after your first Wednesday.</p>') + "</div>";
    }).join("");
  }

  /* ---------- last 8 Wednesdays ---------- */
  function renderHist() {
    const data = Store.load(), n = data.settings.names, order = Store.order();
    let h = '<div class="hrow head" aria-hidden="true"><span>Date</span>' + order.map(p => '<span class="who"><span class="dot ' + p + '"></span>' + esc(n[p]) + "</span>").join("") + "</div>";
    for (let i = 0; i < 8; i++) {
      const m = G.addDays(thisMonday, -7 * i), wed = G.addDays(m, 2);
      const cells = order.map(p => {
        const dl = wedOf(data, m, p), nm = G.className(dl);
        if (nm) return '<span class="hcell on"><span class="ic">' + CultLog.icon(G.CLASSES[dl.cls], 16) + "</span><span>" + esc(nm) + (dl.effort ? '<small>' + G.EFFORT[dl.effort - 1] + "</small>" : "") + "</span></span>";
        if (dl.done) return '<span class="hcell on"><span>Done</span></span>';
        return '<span class="hcell">—</span>';
      }).join("");
      const sel = m.getTime() === S.monday.getTime();
      h += '<button type="button" class="hrow"' + (sel ? ' aria-current="true"' : "") + ' data-i="' + i + '" aria-label="Wednesday ' + G.fmt(wed) + ', edit">' +
        '<span class="hdate"><b class="mono">' + G.fmt(wed) + "</b><small>" + (i === 0 ? "This week" : i === 1 ? "Last week" : i + " weeks ago") + "</small></span>" + cells + "</button>";
    }
    $("hist").innerHTML = h;
    $("hist").querySelectorAll("button.hrow").forEach(b => b.addEventListener("click", () => {
      go(G.addDays(thisMonday, -7 * +b.dataset.i));
      $("log-sec").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  /* ---------- guide ---------- */
  function renderGuide() {
    const planned = G.cultFormat(thisMonday), nb = names().b;
    $("guide").innerHTML = G.CLASS_IDS.filter(id => id !== "other").map(id => {
      const c = G.CLASSES[id];
      return '<article class="card guide">' +
        '<div class="g-head"><span class="ic">' + CultLog.icon(c, 26) + '</span><div><h3>' + c.name + '</h3><span class="g-sub">' + CultLog.bars(c.lvl) + c.intensity + " · ≈ " + c.kcal + " kcal</span></div>" +
        (id === planned ? '<span class="chip cult">Plan this week</span>' : "") + "</div>" +
        "<p>" + c.why + "</p>" +
        '<div class="ex-meta">' + c.focus.map(f => '<span class="chip">' + f + "</span>").join("") + "</div>" +
        "<details><summary>What to bring &amp; technique</summary>" +
        "<h4>Bring</h4><ul>" + c.bring.map(b => "<li>" + b + "</li>").join("") + "</ul>" +
        "<h4>Technique</h4><ul>" + c.tips.map(b => "<li>" + b + "</li>").join("") + "</ul></details>" +
        '<span class="swap">' + esc(nb) + ": " + c.back + "</span></article>";
    }).join("");
  }

  function renderAll() { renderWho(); renderWeek(); renderLog(); renderMix(); renderHist(); }
  window.addEventListener("storage", e => { if (e.key === "fogp:v1") renderAll(); });
  renderAll(); renderGuide();
})();
