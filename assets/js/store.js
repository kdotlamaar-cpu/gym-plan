/* Five O'Clock Gym Plan — tracker storage.
   Everything is saved in this browser's localStorage (GitHub Pages has no server).
   Export / Import in Settings backs up or moves data between phones.

   Shape:
   { version, settings:{names,startWeight,start},
     weeks:{ "2026-W47": { a:{ weight, days:{ mon:{ done, note, sets:{ exId:[{kg,reps,ok}] }, ex:{ exId:"60x6" } } } }, b:{…} } } }
   `ex` holds each exercise's best set as text; it is derived from `sets` whenever a set changes. */
(function () {
  "use strict";
  const KEY = "fogp:v1", ME_KEY = "fogp:me";
  const DEFAULTS = () => ({
    version: 2,
    settings: { names: { a: "Vikas", b: "Momin" }, startWeight: { a: 80, b: 95 }, start: GYM.ymd(GYM.mondayOf(new Date())) },
    weeks: {}
  });
  let memory = null;

  const num = (v, f) => (typeof v === "number" && isFinite(v) ? v : f);
  function normalize(d) {
    const base = DEFAULTS();
    if (!d || typeof d !== "object") return base;
    const s = d.settings || {};
    return {
      version: 2,
      settings: {
        /* the first version used home areas as names; switch those to the real names */
        names: {
          a: (s.names && s.names.a && s.names.a !== "Rabale") ? s.names.a : base.settings.names.a,
          b: (s.names && s.names.b && s.names.b !== "Bandra") ? s.names.b : base.settings.names.b
        },
        startWeight: { a: num(s.startWeight && s.startWeight.a, 80), b: num(s.startWeight && s.startWeight.b, 95) },
        start: (s.start && GYM.parseYmd(s.start)) ? s.start : base.settings.start
      },
      weeks: (d.weeks && typeof d.weeks === "object") ? d.weeks : {}
    };
  }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
    if (!raw) return memory || (memory = DEFAULTS());
    try { return normalize(JSON.parse(raw)); } catch (e) { return memory || (memory = DEFAULTS()); }
  }
  function save(d) { memory = d; try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }

  function week(d, wk) { return (d.weeks[wk] = d.weeks[wk] || { a: { days: {} }, b: { days: {} } }); }
  function person(d, wk, p) { const w = week(d, wk); return (w[p] = w[p] || { days: {} }); }
  function day(d, wk, p, k) { const pp = person(d, wk, p); pp.days = pp.days || {}; return (pp.days[k] = pp.days[k] || {}); }
  function getDay(d, wk, p, k) { const w = d.weeks[wk]; return (w && w[p] && w[p].days && w[p].days[k]) || {}; }
  function getWeight(d, wk, p) { const w = d.weeks[wk]; return w && w[p] && typeof w[p].weight === "number" ? w[p].weight : null; }

  /** Best set of a list → "60x6" (heaviest kg, then most reps), or "" when nothing has weight and reps. */
  function bestOf(list) {
    let best = null;
    (list || []).forEach(s => {
      if (!s || !(s.kg >= 0) || !(s.reps > 0)) return;
      if (!best || s.kg > best.kg || (s.kg === best.kg && s.reps > best.reps)) best = s;
    });
    return best ? best.kg + "x" + best.reps : "";
  }
  /** Parse "60x6" / "60 x 6" / "60kg×6" → {kg, reps}. */
  function parseSet(v) {
    const m = /^\s*(\d+(?:\.\d+)?)\s*(?:kg)?\s*[x×*]\s*(\d+)\s*$/i.exec(v || "");
    return m ? { kg: parseFloat(m[1]), reps: parseInt(m[2], 10) } : null;
  }

  /* which person uses this phone — kept per device, never exported */
  function me() { try { const v = localStorage.getItem(ME_KEY); return v === "b" ? "b" : "a"; } catch (e) { return "a"; } }
  function setMe(p) { try { localStorage.setItem(ME_KEY, p === "b" ? "b" : "a"); } catch (e) { /* ignore */ } }
  /** True once this phone has said who it belongs to. Blocked storage counts as answered, so the question never loops. */
  function hasMe() { try { return localStorage.getItem(ME_KEY) != null; } catch (e) { return true; } }
  /** People in display order: this phone's person first. */
  function order() { return me() === "b" ? ["b", "a"] : ["a", "b"]; }

  function exportJson() { return JSON.stringify(load(), null, 2); }
  function importJson(text) { const d = normalize(JSON.parse(text)); save(d); return d; }
  function reset() { memory = null; try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }

  window.Store = { load, save, week, person, day, getDay, getWeight, bestOf, parseSet, me, setMe, hasMe, order, exportJson, importJson, reset };
})();
