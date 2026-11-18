/* Five O'Clock Gym Plan — app shell: header, desktop nav, phone tab bar + "More" sheet,
   theme toggle, name fill-in, toast, and offline (service worker) registration. */
(function () {
  "use strict";
  const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const ICON = {
    home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    workouts: svg('<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>'),
    log: svg('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="m8.5 12.5 2.5 2.5 4.5-5.5"/>'),
    progress: svg('<path d="M3 20h18"/><path d="m4 15 5-5 4 3 7-7"/><path d="M15 6h5v5"/>'),
    more: svg('<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'),
    schedule: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    cult: svg('<path d="M7 9a5 5 0 0 1 10 0v4a5 5 0 0 1-5 5h-1a4 4 0 0 1-4-4z"/><path d="M7 13h4M8 21h8"/>'),
    diet: svg('<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M12 3c-1.5 2 1.5 3 0 5M8 4c-1 1.5 1 2.5 0 4M16 4c-1 1.5 1 2.5 0 4"/>'),
    guide: svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7M8 11h7"/>'),
    gyms: svg('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    settings: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    play: svg('<path d="M7 4.5v15l12-7.5z"/>')
  };
  ICON.tracker = ICON.log;

  const PAGES = [
    { id: "home", href: "index.html", label: "Today", tab: true, d: "Today's session and this week" },
    { id: "workouts", href: "workouts.html", label: "Workouts", tab: true, d: "Every exercise with photos" },
    { id: "tracker", href: "tracker.html", label: "Log", tab: true, d: "Log sets with the rest timer" },
    { id: "progress", href: "progress.html", label: "Progress", tab: true, d: "Bodyweight, best lifts, streaks" },
    { id: "diet", href: "diet.html", label: "Diet", d: "Calories, protein, meal timing" },
    { id: "schedule", href: "schedule.html", label: "Schedule", d: "The week and the 6-week block" },
    { id: "cult", href: "cult.html", label: "Cult Day", d: "Boxing / HRX rotation and booking" },
    { id: "guide", href: "guide.html", label: "Guide", d: "Progression, back care, recovery" },
    { id: "gyms", href: "gyms.html", label: "Gyms", d: "Addresses, hours, maps" },
    { id: "settings", href: "settings.html", label: "Settings", d: "Names, backup, install the app" }
  ];
  const current = document.body.dataset.page;
  const root = document.documentElement;

  /* personal link: ?who=b (or ?who=momin) sets who uses this phone, then the address is cleaned up */
  (function applyWhoParam() {
    if (!window.Store) return;
    let q; try { q = new URLSearchParams(location.search).get("who"); } catch (e) { return; }
    if (!q) return;
    const names = Store.load().settings.names, v = q.trim().toLowerCase();
    const p = (v === "a" || v === names.a.toLowerCase()) ? "a" : (v === "b" || v === names.b.toLowerCase()) ? "b" : null;
    if (p) Store.setMe(p);
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) { /* ignore */ }
  })();

  /* header */
  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<div class="hdr-row"><a class="brand" href="index.html" aria-label="Five O\'Clock Gym Plan, home">' +
      '<span class="brand-mark" aria-hidden="true">17:00</span><span class="brand-name">Five O\'Clock<br>Gym Plan</span></a>' +
      '<div class="hdr-actions"><button class="icon-btn" id="theme-btn" type="button"></button>' +
      '<a class="icon-btn" href="settings.html" aria-label="Settings">' + ICON.settings + '</a></div></div>' +
      '<nav class="site-nav" aria-label="Main">' +
      PAGES.filter(p => p.id !== "settings").map(p => '<a href="' + p.href + '"' + (p.id === current ? ' aria-current="page"' : "") + ">" + p.label + "</a>").join("") +
      "</nav>";
    const nav = header.querySelector(".site-nav"), active = nav.querySelector('[aria-current="page"]');
    if (active) nav.scrollLeft = Math.max(0, active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2);
  }

  /* phone tab bar */
  const inMore = !PAGES.find(p => p.id === current && p.tab);
  const bar = document.createElement("nav");
  bar.className = "tabbar"; bar.setAttribute("aria-label", "App");
  bar.innerHTML = PAGES.filter(p => p.tab).map(p =>
    '<a href="' + p.href + '"' + (p.id === current ? ' aria-current="page"' : "") + ">" + ICON[p.id] + "<span>" + p.label + "</span></a>").join("") +
    '<button type="button" id="more-btn" aria-haspopup="dialog"' + (inMore ? ' aria-current="page"' : "") + ">" + ICON.more + "<span>More</span></button>";
  document.body.appendChild(bar);

  /* more sheet */
  let sheet = null, backdrop = null;
  function closeSheet() { if (sheet) { sheet.remove(); backdrop.remove(); sheet = backdrop = null; document.getElementById("more-btn").focus(); } }
  function openSheet() {
    backdrop = document.createElement("div"); backdrop.className = "sheet-backdrop"; backdrop.addEventListener("click", closeSheet);
    sheet = document.createElement("div"); sheet.className = "sheet"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "More pages");
    sheet.innerHTML = '<span class="grab" aria-hidden="true"></span>' + PAGES.filter(p => !p.tab).map(p =>
      '<a href="' + p.href + '"' + (p.id === current ? ' aria-current="page"' : "") + ">" + ICON[p.id] + "<span>" + p.label + '<span class="d">' + p.d + "</span></span></a>").join("") +
      '<button type="button" class="row" id="sheet-theme">' + (effective() === "dark" ? ICON.sun : ICON.moon) + "<span>" + (effective() === "dark" ? "Light mode" : "Dark mode") + '<span class="d">Switch the colour theme</span></span></button>';
    document.body.append(backdrop, sheet);
    sheet.querySelector("#sheet-theme").addEventListener("click", () => { toggleTheme(); closeSheet(); });
    const first = sheet.querySelector("a,button"); if (first) first.focus();
  }
  document.getElementById("more-btn").addEventListener("click", () => (sheet ? closeSheet() : openSheet()));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });

  /* footer */
  const footer = document.getElementById("site-footer");
  if (footer) footer.innerHTML = '<div class="wrap foot"><span>Five O\'Clock Gym Plan · Mon–Fri, 5–6 PM · Step Up Vile Parle × 4, Cult Andheri East × 1</span>' +
    "<span>Gym details from cult.fit listings (Nov 2026). Exercise photos: free-exercise-db (public domain). Diet figures are general guidance, not medical advice.</span></div>";

  /* theme */
  function effective() { return root.dataset.theme || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); }
  function paintTheme() {
    const b = document.getElementById("theme-btn"); if (!b) return;
    const dark = effective() === "dark";
    b.innerHTML = dark ? ICON.sun : ICON.moon; b.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  function toggleTheme() {
    const next = effective() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("fogp:theme", next); } catch (e) { /* ignore */ }
    paintTheme();
  }
  const tb = document.getElementById("theme-btn"); if (tb) tb.addEventListener("click", toggleTheme);
  paintTheme();

  /* names in static text; this phone's person goes first and gets a "You" tag */
  function fillNames() {
    if (!window.Store) return;
    const n = Store.load().settings.names, me = Store.me();
    document.querySelectorAll("[data-name]").forEach(e => { e.textContent = n[e.dataset.name]; });
    const mine = document.querySelectorAll('[data-person="' + me + '"]');
    mine.forEach(el => {
      const parent = el.parentElement;
      if (parent && parent.firstElementChild !== el && parent.querySelector('[data-person]:not([data-person="' + me + '"])')) parent.insertBefore(el, parent.firstElementChild);
      const who = el.querySelector(".who");
      if (who && !who.querySelector(".you")) who.insertAdjacentHTML("beforeend", '<span class="chip ok you">You</span>');
    });
    document.querySelectorAll("[data-person] .you").forEach(t => { if (t.closest("[data-person]").dataset.person !== me) t.remove(); });
  }
  fillNames();

  /* first visit on a phone: ask who it belongs to */
  function askWho() {
    const n = Store.load().settings.names;
    const back = document.createElement("div"); back.className = "sheet-backdrop";
    const dlg = document.createElement("div"); dlg.className = "welcome"; dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "welcome-h");
    dlg.innerHTML = '<span class="brand-mark" aria-hidden="true">17:00</span><h2 id="welcome-h">Who\'s using this phone?</h2>' +
      '<p class="hint">Your stats, log and diet targets will show first. You can change this later in Settings.</p>' +
      '<div class="welcome-btns">' + ["a", "b"].map(p => '<button type="button" class="welcome-pick ' + p + '" data-p="' + p + '"><span class="dot ' + p + '"></span>' + escText(n[p]) + "</button>").join("") + "</div>";
    document.body.append(back, dlg);
    dlg.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { Store.setMe(b.dataset.p); location.reload(); }));
    dlg.querySelector("button").focus();
  }
  function escText(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  if (window.Store && !Store.hasMe()) askWho();

  /* toast */
  let toastEl = null, toastT = 0;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

  /* offline support once hosted (service workers need http/https) */
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => { /* offline mode unavailable */ }); });
  }

  window.UI = { ICON, toast, fillNames };
})();
