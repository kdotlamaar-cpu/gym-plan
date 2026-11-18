/* Progress page: weigh-in entry, bodyweight-change chart (+ table view), consistency grid, best lifts. */
(function () {
  "use strict";
  const G = GYM, esc = G.esc, P = Store.order();
  const now = new Date(), wk = G.weekKey(now), monday = G.mondayOf(now);
  let data = Store.load();
  const names = () => data.settings.names;
  const sign = n => (n > 0 ? "+" : n < 0 ? "−" : "±") + Math.abs(n).toFixed(1);

  /* ---------- weigh-in ---------- */
  function renderWeighIn() {
    document.getElementById("wi-week").textContent = "Week of " + G.fmt(monday);
    const el = document.getElementById("weighin");
    el.innerHTML = P.map(p => {
      const cur = Store.getWeight(data, wk, p), start = data.settings.startWeight[p];
      const all = Object.keys(data.weeks).sort().map(w => Store.getWeight(data, w, p)).filter(v => v != null);
      const latest = all.length ? all[all.length - 1] : null;
      return '<div class="card"><span class="who"><span class="dot ' + p + '"></span>' + esc(names()[p]) + "</span>" +
        '<div class="kv" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b class="mono">' + start + '</b><span>start kg</span></div><div><b class="mono">' + (latest != null ? latest.toFixed(1) : "—") + '</b><span>latest kg</span></div><div><b class="mono">' + (latest != null ? sign(latest - start) : "—") + "</b><span>change</span></div></div>" +
        '<label class="field"><span>Weight this week (kg)</span><input id="wi-' + p + '" data-p="' + p + '" type="number" inputmode="decimal" step="0.1" min="30" max="250" value="' + (cur != null ? cur : "") + '" placeholder="e.g. ' + (latest != null ? latest.toFixed(1) : start) + '"></label></div>';
    }).join("");
    el.querySelectorAll("input[data-p]").forEach(inp => inp.addEventListener("change", () => {
      const p = inp.dataset.p, v = parseFloat(inp.value);
      if (inp.value === "") { data = Store.load(); delete Store.person(data, wk, p).weight; Store.save(data); }
      else if (isFinite(v) && v >= 30 && v <= 250) { data = Store.load(); Store.person(data, wk, p).weight = Math.round(v * 10) / 10; Store.save(data); UI.toast("Weight saved for " + names()[p] + "."); }
      else { UI.toast("Enter a weight between 30 and 250 kg."); return; }
      renderWeighIn(); renderChart();
    }));
  }

  /* ---------- bodyweight change chart ---------- */
  function series() {
    const weeks = Object.keys(data.weeks).filter(w => P.some(p => Store.getWeight(data, w, p) != null)).sort().slice(-12);
    return { weeks, pts: P.map(p => weeks.map(w => { const v = Store.getWeight(data, w, p); return v == null ? null : v - data.settings.startWeight[p]; })) };
  }
  function renderChart() {
    const { weeks, pts } = series();
    const chart = document.getElementById("bw-chart"), legend = document.getElementById("bw-legend"), tip = document.getElementById("bw-tip");
    legend.innerHTML = P.map(p => '<span><i style="background:var(--s' + p + ')"></i>' + esc(names()[p]) + "</span>").join("");
    renderTable(weeks, pts);
    if (!weeks.length) {
      chart.innerHTML = '<div class="empty"><b>No weigh-ins yet</b><span>Enter this week\'s weight above. The chart shows each person\'s change from their starting weight.</span></div>';
      return;
    }
    const W = 640, H = 260, m = { l: 40, r: 76, t: 14, b: 30 };
    const vals = pts.flat().filter(v => v != null).concat([0]);
    let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    lo = Math.floor(Math.min(lo, -1)); hi = Math.ceil(Math.max(hi, 1));
    const step = (hi - lo) > 8 ? 2 : 1;
    lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    const x = i => m.l + (weeks.length === 1 ? (W - m.l - m.r) / 2 : i * (W - m.l - m.r) / (weeks.length - 1));
    const y = v => m.t + (hi - v) * (H - m.t - m.b) / (hi - lo);
    let s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Bodyweight change from start in kg, by week">';
    s += '<g class="grid axis">';
    for (let v = lo; v <= hi; v += step) {
      s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"' + (v === 0 ? ' class="zero"' : "") + "/>";
      s += '<text x="' + (m.l - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v > 0 ? "+" : "") + v + "</text>";
    }
    const every = Math.ceil(weeks.length / 6);
    weeks.forEach((w, i) => { if (i % every === 0 || i === weeks.length - 1) s += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + G.fmt(G.mondayOfKey(w)) + "</text>"; });
    s += "</g>";
    const labels = [];
    P.forEach((p, si) => {
      const line = pts[si].map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
      if (!line.length) return;
      s += '<path class="line-' + p + '" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" d="' + line.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("") + '"/>';
      line.forEach(q => { s += '<circle class="pt pt-' + p + '" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4.5"/>'; });
      const lastI = pts[si].reduce((a, v, i) => (v != null ? i : a), -1);
      labels.push({ p, x: x(lastI) + 10, y: y(pts[si][lastI]) + 4, t: names()[p] + " " + sign(pts[si][lastI]) });
    });
    if (labels.length === 2 && Math.abs(labels[0].y - labels[1].y) < 14) { const mid = (labels[0].y + labels[1].y) / 2; labels[0].y = mid - 8; labels[1].y = mid + 8; }
    labels.forEach(l => { s += '<text class="dlabel" x="' + l.x + '" y="' + l.y + '">' + esc(l.t) + "</text>"; });
    s += '<line class="xhair" id="bw-x" x1="0" x2="0" y1="' + m.t + '" y2="' + (H - m.b) + '" visibility="hidden"/>';
    const colW = weeks.length > 1 ? (W - m.l - m.r) / (weeks.length - 1) : (W - m.l - m.r);
    weeks.forEach((w, i) => { s += '<rect class="hit" data-i="' + i + '" x="' + (x(i) - colW / 2) + '" y="' + m.t + '" width="' + colW + '" height="' + (H - m.t - m.b) + '"/>'; });
    s += "</svg>";
    chart.innerHTML = s;

    const svgEl = chart.querySelector("svg"), xl = chart.querySelector("#bw-x"), card = document.getElementById("bw-card");
    function show(i) {
      xl.setAttribute("x1", x(i)); xl.setAttribute("x2", x(i)); xl.setAttribute("visibility", "visible");
      tip.innerHTML = "Week of " + G.fmt(G.mondayOfKey(weeks[i])) + "<br>" + P.map((p, si) => {
        const raw = Store.getWeight(data, weeks[i], p);
        return '<span class="dot ' + p + '" style="width:8px;height:8px"></span> ' + esc(names()[p]) + ": <b>" + (raw == null ? "—" : raw.toFixed(1) + " kg (" + sign(pts[si][i]) + ")") + "</b>";
      }).join("<br>");
      tip.hidden = false;
      const r = svgEl.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const px = r.left - cr.left + x(i) * r.width / W;
      tip.style.top = (r.top - cr.top + 8) + "px";
      tip.style.left = Math.min(Math.max(8, px + 12), cr.width - tip.offsetWidth - 8) + "px";
    }
    function hide() { xl.setAttribute("visibility", "hidden"); tip.hidden = true; }
    chart.querySelectorAll(".hit").forEach(h => {
      h.addEventListener("pointerenter", () => show(+h.dataset.i));
      h.addEventListener("pointerdown", () => show(+h.dataset.i));
    });
    svgEl.addEventListener("pointerleave", hide);
  }
  function renderTable(weeks, pts) {
    document.getElementById("bw-table").innerHTML = '<table class="data"><thead><tr><th>Week of</th>' + P.map(p => "<th>" + esc(names()[p]) + "</th>").join("") + "</tr></thead><tbody>" +
      (weeks.length ? weeks.slice().reverse().map(w => "<tr><td class=\"mono\">" + G.fmt(G.mondayOfKey(w)) + "</td>" + P.map((p, si) => {
        const raw = Store.getWeight(data, w, p), i = weeks.indexOf(w);
        return '<td class="mono">' + (raw == null ? "—" : raw.toFixed(1) + " kg <span class=\"muted\">" + sign(pts[si][i]) + "</span>") + "</td>";
      }).join("") + "</tr>").join("") : '<tr><td colspan="3" class="muted">No weigh-ins yet.</td></tr>') + "</tbody></table>";
  }
  const tgl = document.getElementById("bw-toggle");
  tgl.addEventListener("click", () => {
    const table = tgl.getAttribute("aria-pressed") !== "true";
    tgl.setAttribute("aria-pressed", String(table)); tgl.textContent = table ? "Show as chart" : "Show as table";
    document.getElementById("bw-card").hidden = table; document.getElementById("bw-table").hidden = !table;
  });

  /* ---------- consistency ---------- */
  function renderHeat() {
    const weeks = []; for (let i = 7; i >= 0; i--) weeks.push(G.addDays(monday, -7 * i));
    document.getElementById("heat").innerHTML = P.map(p => {
      let total = 0;
      const rows = weeks.map(m => {
        const key = G.weekKey(m);
        const cells = G.DAY_KEYS.map(k => { const d = !!Store.getDay(data, key, p, k).done; if (d) total++; return '<span class="cell' + (d ? " " + p : "") + (G.PROGRAM[k].loc === "cult" && !d ? " cult" : "") + '" title="' + G.DAY_SHORT[k] + " " + G.fmt(G.addDays(m, G.DAY_KEYS.indexOf(k))) + (d ? ": done" : ": not done") + '"></span>'; }).join("");
        const n = G.DAY_KEYS.filter(k => Store.getDay(data, key, p, k).done).length;
        return '<div class="row"><span>' + G.fmt(m) + "</span>" + cells + '<span style="text-align:right">' + n + "/5</span></div>";
      }).join("");
      return '<div class="card"><div class="sec-head"><span class="who"><span class="dot ' + p + '"></span>' + esc(names()[p]) + '</span><span class="hint mono">' + total + "/40 sessions</span></div>" +
        '<div class="heat" role="img" aria-label="' + esc(names()[p]) + " completed " + total + ' of 40 sessions in the last 8 weeks"><div class="row head"><span></span>' + G.DAY_KEYS.map(k => "<span>" + G.DAY_SHORT[k].charAt(0) + "</span>").join("") + "<span></span></div>" + rows + "</div></div>";
    }).join("");
  }

  /* ---------- best lifts ---------- */
  function renderBests() {
    const best = {};
    Object.keys(data.weeks).forEach(w => P.forEach(p => {
      const days = (data.weeks[w][p] && data.weeks[w][p].days) || {};
      Object.keys(days).forEach(k => {
        const sets = days[k].sets || {};
        const candidates = Object.keys(sets).length
          ? Object.entries(sets).flatMap(([id, arr]) => (arr || []).filter(s => s && s.ok && s.kg > 0 && s.reps > 0).map(s => [id, s]))
          : Object.entries(days[k].ex || {}).map(([id, v]) => [id, Store.parseSet(v)]).filter(x => x[1]);
        candidates.forEach(([id, s]) => {
          const key = id + "|" + p, b = best[key];
          if (!b || s.kg > b.kg || (s.kg === b.kg && s.reps > b.reps)) best[key] = { kg: s.kg, reps: s.reps, w };
        });
      });
    }));
    const rows = [];
    ["mon", "tue", "thu", "fri"].forEach(k => G.PROGRAM[k].ex.forEach(e => {
      if (!best[e.id + "|a"] && !best[e.id + "|b"]) return;
      rows.push('<tr><td class="n">' + e.n + "<small>" + G.PROGRAM[k].title + "</small></td>" + P.map(p => {
        const b = best[e.id + "|" + p];
        return '<td class="mono">' + (b ? b.kg + " kg × " + b.reps + '<small class="muted" style="display:block">' + G.fmt(G.mondayOfKey(b.w)) + "</small>" : '<span class="muted">—</span>') + "</td>";
      }).join("") + "</tr>");
    }));
    document.getElementById("bests").innerHTML = "<thead><tr><th>Exercise</th>" + P.map(p => '<th><span class="who"><span class="dot ' + p + '"></span>' + esc(names()[p]) + "</span></th>").join("") + "</tr></thead><tbody>" +
      (rows.length ? rows.join("") : '<tr><td colspan="3" class="muted">Nothing logged yet. Once you tick sets on the Log page, each person\'s best set per exercise shows here.</td></tr>') + "</tbody>";
  }

  window.addEventListener("resize", () => { document.getElementById("bw-tip").hidden = true; });
  renderWeighIn(); renderChart(); renderHeat(); renderBests();
})();
