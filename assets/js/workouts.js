/* Workouts page: one day at a time (#mon / #tue / #thu / #fri), exercise cards with photos. */
(function () {
  "use strict";
  const G = GYM, names = Store.load().settings.names, esc = G.esc;
  const swapLbl = Store.me() === "b" ? "Your swap: " : esc(names.b) + "'s swap: ";
  const finLbl = Store.me() === "b" ? "Your version: " : esc(names.b) + "'s version: ";
  const LIFT_DAYS = ["mon", "tue", "thu", "fri"];

  function pick() {
    const h = location.hash.replace("#", "");
    if (LIFT_DAYS.indexOf(h) >= 0) return h;
    const t = G.todayKey();
    return t && LIFT_DAYS.indexOf(t) >= 0 ? t : "mon";
  }

  function media(e) {
    if (e.img.length > 1) {
      return '<div class="ex-media">' + e.img.map((s, i) =>
        '<figure><img src="' + G.img(s, 1) + '" alt="' + esc(e.n.replace("Superset: ", "").split(" + ")[i] || e.n) + ', finish position" loading="lazy" width="480" height="320"><figcaption>' + (i ? "B" : "A") + "</figcaption></figure>").join("") + "</div>";
    }
    return '<div class="ex-media">' + [0, 1].map(n =>
      '<figure><img src="' + G.img(e.img[0], n) + '" alt="' + esc(e.n) + (n ? ", finish position" : ", start position") + '" loading="lazy" width="480" height="320"><figcaption>' + (n ? "Finish" : "Start") + "</figcaption></figure>").join("") + "</div>";
  }

  function render() {
    const k = pick(), p = G.PROGRAM[k], tk = G.todayKey();
    document.getElementById("tabs").innerHTML = G.DAY_KEYS.map(d => {
      const q = G.PROGRAM[d];
      const href = q.loc === "cult" ? "cult.html" : "#" + d;
      return '<a class="daypill' + (q.loc === "cult" ? " cult" : "") + '" href="' + href + '"' + (d === k ? ' aria-current="true"' : "") + "><b>" + G.DAY_SHORT[d] + "</b><span>" + (q.loc === "cult" ? "Cult" : q.title) + (d === tk ? " · today" : "") + "</span></a>";
    }).join("");

    const wu = G.WARMUP[p.type], cd = G.COOLDOWN[p.type];
    let html = '<section class="sec">' +
      '<div class="sec-head"><div style="display:grid;gap:6px"><h2>' + G.DAY_NAMES[k] + " · " + p.title + '</h2><span class="hint">' + p.focus + ' · Step Up Fitness, Vile Parle East</span></div>' +
      '<a class="btn primary" href="tracker.html#' + k + '">' + UI.ICON.play + 'Start &amp; log</a></div>' +
      '<p class="lede">' + p.tag + '</p>' +
      '<div class="timeline" style="--cols:4">' +
        '<div class="seg"><span class="t">5:00–5:07</span><span class="w">Warm-up</span></div>' +
        '<div class="seg main"><span class="t">5:07–5:47</span><span class="w">Main work · ' + p.ex.reduce((a, e) => a + e.sets, 0) + ' sets</span></div>' +
        '<div class="seg"><span class="t">5:47–5:56</span><span class="w">Fat-burn finisher</span></div>' +
        '<div class="seg"><span class="t">5:56–6:00</span><span class="w">Cool-down</span></div>' +
      '</div>' +
      '<p class="hint"><b>Supersets</b> (D1 + D2): do one set of each back to back, then rest. <b>Drop set</b>: on the last set, finish your reps, cut the weight by about 25% and go again until you can\'t do another clean rep.</p></section>';

    html += '<section class="sec"><div class="sec-head"><h3>1 · Warm-up</h3><span class="hint">7 minutes</span></div><ol class="steps">' +
      wu.map(w => '<li><span class="q">' + w[0] + '</span><span>' + w[1] + '</span></li>').join("") + '</ol></section>';

    const pairNote = e => {
      const m = /^([A-Z])([12])$/.exec(e.tag); if (!m) return "";
      const mate = p.ex.find(x => x.tag === m[1] + (m[2] === "1" ? "2" : "1"));
      return mate ? (m[2] === "1" ? " · superset: go straight to " + mate.tag + " " + mate.n.toLowerCase() : " · superset: straight after " + mate.tag + ", then rest") : "";
    };
    html += '<section class="sec"><div class="sec-head"><h3>2 · Main work</h3><span class="hint">About 40 minutes, in order</span></div><div class="ex-list">' +
      p.ex.map(e => '<article class="ex-card">' + media(e) +
        '<div class="ex-body"><span class="ex-num">' + e.tag + pairNote(e) + '</span><h3>' + e.n + '</h3>' +
        '<div class="ex-meta"><span class="chip">' + e.sets + ' sets</span><span class="chip">' + e.reps + ' reps</span><span class="chip">' + (e.rest <= 20 ? "no rest " + e.restTxt : "rest " + e.restTxt) + '</span>' + (e.drop ? '<span class="chip ok">last set: drop set</span>' : '') + '</div>' +
        '<p>' + e.tip + '</p>' +
        (e.swap ? '<div class="swap-box' + (e.swapImg ? "" : " noimg") + '">' + (e.swapImg ? '<img src="' + G.img(e.swapImg, 0) + '" alt="" loading="lazy" width="64" height="48">' : "") +
          '<span class="swap" style="padding:0">' + swapLbl + e.swap + '</span></div>' : '') +
        '</div></article>').join("") + '</div></section>';

    html += '<section class="sec"><div class="sec-head"><h3>3 · Fat-burn finisher</h3><span class="hint">8–9 minutes</span></div>' +
      '<div class="ex-card' + (p.finisher.img ? '' : ' noimg') + '">' + (p.finisher.img ? '<div class="ex-media">' + [0, 1].map(n => '<figure><img src="' + G.img(p.finisher.img, n) + '" alt="' + esc(p.finisher.detail) + '" loading="lazy" width="480" height="320"></figure>').join("") + '</div>' : '') +
      '<div class="ex-body"><h3>' + p.finisher.detail + '</h3>' +
      '<p class="hint">Hard means hard: you shouldn\'t be able to talk. Easy means slow enough to get your breath back.</p>' +
      (p.finisher.alt ? '<div class="swap-box noimg"><span class="swap" style="padding:0">' + finLbl + p.finisher.alt + '</span></div>' : '') +
      '</div></div></section>';

    html += '<section class="sec"><div class="sec-head"><h3>4 · Cool-down</h3><span class="hint">5 minutes</span></div><ul class="steps">' +
      cd.map(c => '<li><span class="q">' + c[0] + '</span><span>' + c[1] + '</span></li>').join("") + '</ul></section>';

    document.getElementById("workout").innerHTML = html;
  }

  window.addEventListener("hashchange", () => { render(); window.scrollTo({ top: 0 }); });
  render();
})();
