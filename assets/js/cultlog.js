/* Cult class logger, shared by the Cult Day page and the Log page.
   Tapping a class logs it for that week's Wednesday and marks the day done.
   Day entry fields: cls (class id), clsName (only for "other"), effort (1–4), done, note. */
(function () {
  "use strict";
  const G = GYM, esc = G.esc;

  function icon(c, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + c.icon + "</svg>";
  }
  function bars(lvl) {
    if (!lvl) return '<span class="lvl" aria-hidden="true"></span>';
    return '<span class="lvl" aria-hidden="true">' + [1, 2, 3].map(i => "<i" + (i <= lvl ? ' class="on"' : "") + "></i>").join("") + "</span>";
  }
  const CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /**
   * Render the picker into o.el.
   * o: { el, monday (Date), p ("a"|"b"), onChange() }
   */
  function render(o) {
    const data = Store.load(), names = data.settings.names, wk = G.weekKey(o.monday);
    const p = o.p, other = p === "a" ? "b" : "a";
    const dl = Store.getDay(data, wk, p, "wed"), od = Store.getDay(data, wk, other, "wed");
    const planned = G.cultFormat(o.monday), cur = G.CLASSES[dl.cls] ? dl.cls : null;
    const date = G.addDays(o.monday, 2);
    const today0 = new Date(); today0.setHours(0, 0, 0, 0);
    const ask = date <= today0 ? "What did you do?" : "Which class is it?";
    const you = p === Store.me() ? "you" : names[p];

    let h = '<div class="cl' + (cur ? " has" : "") + '">';
    h += '<div class="cl-head"><div class="cl-date" aria-label="Wednesday ' + G.fmt(date) + '"><span>Wed</span><b>' + date.getDate() + "</b><span>" + G.fmt(date).split(" ")[1] + "</span></div>" +
      '<div class="cl-title"><h2>' + (cur ? esc(G.className(dl)) : ask) + '</h2><span class="hint">' +
      (cur ? "Logged for " + esc(you) + (dl.effort ? " · " + G.EFFORT[dl.effort - 1] : "") : "Cult Andheri East · plan says " + G.CLASSES[planned].name + ", but any class counts") + "</span></div>" +
      (dl.done ? '<span class="done-badge">' + CHECK + "Done</span>" : "") + "</div>";

    h += '<div class="cl-grid" role="radiogroup" aria-label="Class ' + esc(names[p]) + ' did">' + G.CLASS_IDS.map(id => {
      const c = G.CLASSES[id], on = id === cur;
      return '<button type="button" class="cl-tile" role="radio" aria-checked="' + on + '" data-c="' + id + '">' +
        '<span class="ic">' + icon(c, 26) + "</span>" +
        '<span class="nm">' + c.name + "</span>" +
        '<span class="sb">' + c.sub + "</span>" + bars(c.lvl) +
        (id === planned && !cur ? '<span class="pl">Plan</span>' : "") +
        (on ? '<span class="tk">' + CHECK + "</span>" : "") + "</button>";
    }).join("") + "</div>";

    if (cur === "other") {
      h += '<label class="field"><span>Class name</span><input id="cl-name" maxlength="30" autocomplete="off" placeholder="e.g. Kickboxing, Strength+, Pilates" value="' + esc(dl.clsName || "") + '"></label>';
    }

    if (cur) {
      const c = G.CLASSES[cur];
      h += '<div class="cl-detail">' +
        '<div class="cl-dhead"><span class="ic">' + icon(c, 22) + "</span><p>" + c.why + "</p></div>" +
        ((c.focus.length || c.kcal) ? '<div class="ex-meta">' + c.focus.map(f => '<span class="chip">' + f + "</span>").join("") +
          (c.kcal ? '<span class="chip cult">≈ ' + c.kcal + " kcal</span>" : "") + "</div>" : "") +
        (p === "b" && c.back ? '<span class="swap">Your back: ' + c.back + "</span>" : "") + "</div>";

      h += '<div class="cl-effort"><span class="hint">How hard was it?</span><div class="seg-ctl" role="radiogroup" aria-label="Effort">' +
        G.EFFORT.map((e, i) => '<button type="button" role="radio" data-e="' + (i + 1) + '" aria-checked="' + (dl.effort === i + 1) + '"><i class="ef ef' + (i + 1) + '"></i>' + e + "</button>").join("") + "</div></div>";
    } else if (dl.done) {
      h += '<p class="hint">Marked done without a class. Tap the class you did to save it.</p>';
    }

    const oc = G.className(od);
    h += '<div class="cl-foot"><span class="who"><span class="dot ' + other + '"></span>' + esc(names[other]) + ": " +
      (oc ? esc(oc) + (od.effort ? " · " + G.EFFORT[od.effort - 1] : "") + " ✓" : od.done ? "done ✓" : "not logged yet") + "</span>" +
      (cur || dl.done ? '<button type="button" class="linkbtn" id="cl-clear">Clear this log</button>' : "") + "</div>";
    h += "</div>";
    o.el.innerHTML = h;

    const write = fn => {
      const d = Store.load(); fn(Store.day(d, wk, p, "wed"));
      if (!Store.save(d)) UI.toast("Storage is blocked in this browser. Logs won't be kept.");
    };
    const rerender = popId => {
      render(o);
      if (popId) { const t = o.el.querySelector('.cl-tile[data-c="' + popId + '"]'); if (t) { t.classList.add("pop"); t.focus({ preventScroll: true }); } }
      if (o.onChange) o.onChange();
    };

    o.el.querySelectorAll(".cl-tile").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.c;
      if (id === cur) return;
      write(x => { x.cls = id; x.done = true; if (id !== "other") delete x.clsName; });
      rerender(id);
      if (id === "other") { const n = document.getElementById("cl-name"); if (n && !n.value) n.focus(); }
      else UI.toast(G.CLASSES[id].name + " logged for " + names[p] + ". Nice work.");
    }));
    /* arrow keys move through the tiles like a radio group */
    const tiles = Array.from(o.el.querySelectorAll(".cl-tile"));
    tiles.forEach((b, i) => b.addEventListener("keydown", ev => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
      if (!step) return; ev.preventDefault();
      tiles[(i + step + tiles.length) % tiles.length].focus();
    }));
    const nm = document.getElementById("cl-name");
    if (nm) nm.addEventListener("change", () => {
      write(x => { x.clsName = nm.value.trim().slice(0, 30); });
      rerender();
      if (nm.value.trim()) UI.toast(nm.value.trim() + " logged for " + names[p] + ".");
    });
    o.el.querySelectorAll(".cl-effort button").forEach(b => b.addEventListener("click", () => {
      const e = +b.dataset.e;
      write(x => { x.effort = x.effort === e ? undefined : e; });
      rerender();
    }));
    const clr = document.getElementById("cl-clear");
    if (clr) clr.addEventListener("click", () => {
      write(x => { delete x.cls; delete x.clsName; delete x.effort; x.done = false; });
      rerender(); UI.toast("Wednesday log cleared.");
    });
  }

  window.CultLog = { render, icon, bars };
})();
