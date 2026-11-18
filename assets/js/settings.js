/* Settings page: owner of this phone, names/weights/start date, install prompt, backup. */
(function () {
  "use strict";
  const G = GYM, esc = G.esc;
  let data = Store.load();
  const $ = id => document.getElementById(id);

  function renderMe() {
    const me = Store.me();
    $("me").innerHTML = ["a", "b"].map(p => '<button type="button" data-p="' + p + '" aria-pressed="' + (me === p) + '"><span class="dot ' + p + '"></span>' + esc(data.settings.names[p]) + "</button>").join("");
    $("me").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { Store.setMe(b.dataset.p); renderMe(); UI.toast("This phone now logs for " + data.settings.names[b.dataset.p] + "."); }));
  }
  function fill() {
    const s = data.settings;
    $("set-name-a").value = s.names.a; $("set-name-b").value = s.names.b;
    $("set-sw-a").value = s.startWeight.a; $("set-sw-b").value = s.startWeight.b;
    $("set-start").value = s.start;
  }
  $("settings-form").addEventListener("submit", ev => {
    ev.preventDefault();
    const v = id => $(id).value.trim();
    const swa = parseFloat(v("set-sw-a")), swb = parseFloat(v("set-sw-b"));
    const st = $("form-status");
    if (!v("set-name-a") || !v("set-name-b")) { st.textContent = "Both names are needed."; st.classList.add("warn"); return; }
    if (!(swa >= 30 && swa <= 250 && swb >= 30 && swb <= 250)) { st.textContent = "Starting weights must be between 30 and 250 kg."; st.classList.add("warn"); return; }
    if (!G.parseYmd(v("set-start"))) { st.textContent = "Pick a program start date."; st.classList.add("warn"); return; }
    data = Store.load();
    data.settings.names = { a: v("set-name-a").slice(0, 20), b: v("set-name-b").slice(0, 20) };
    data.settings.startWeight = { a: swa, b: swb };
    data.settings.start = v("set-start");
    Store.save(data);
    st.textContent = "Saved."; st.classList.remove("warn");
    renderMe(); UI.fillNames();
  });

  /* install prompt (Android / desktop Chrome) */
  let deferred = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; $("install-btn").hidden = false; });
  $("install-btn").addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch (e) { /* ignore */ }
    deferred = null; $("install-btn").hidden = true;
  });

  /* backup */
  const ds = $("data-status");
  $("export-btn").addEventListener("click", () => {
    const blob = new Blob([Store.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "gym-plan-backup-" + G.ymd(new Date()) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    ds.textContent = "Backup downloaded."; ds.classList.remove("warn");
  });
  $("import-file").addEventListener("change", ev => {
    const f = ev.target.files && ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { data = Store.importJson(String(r.result)); ds.textContent = "Backup imported."; ds.classList.remove("warn"); fill(); renderMe(); UI.fillNames(); }
      catch (e) { ds.textContent = "That file isn't a valid backup. Choose a .json file exported from this app."; ds.classList.add("warn"); }
      ev.target.value = "";
    };
    r.readAsText(f);
  });
  $("reset-btn").addEventListener("click", () => { $("reset-confirm").hidden = false; });
  $("reset-no").addEventListener("click", () => { $("reset-confirm").hidden = true; });
  $("reset-yes").addEventListener("click", () => {
    Store.reset(); data = Store.load(); $("reset-confirm").hidden = true;
    ds.textContent = "All data cleared."; ds.classList.remove("warn"); fill(); renderMe(); UI.fillNames();
  });

  /* personal links: index.html?who=a / ?who=b */
  function renderLinks() {
    const base = location.href.split(/[?#]/)[0].replace(/[^/]*$/, "") + "index.html?who=";
    $("links").innerHTML = ["a", "b"].map(p =>
      '<div class="field"><span class="who"><span class="dot ' + p + '"></span>' + esc(data.settings.names[p]) + '\'s link</span>' +
      '<input class="mono" id="link-' + p + '" readonly value="' + esc(base + p) + '" aria-label="' + esc(data.settings.names[p]) + '\'s personal link">' +
      '<button type="button" class="btn" data-p="' + p + '">Copy link</button></div>').join("");
    $("links").querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      const inp = $("link-" + b.dataset.p);
      const done = () => UI.toast("Link copied. Send it to " + data.settings.names[b.dataset.p] + ".");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(inp.value).then(done, () => { inp.select(); UI.toast("Press Ctrl+C or long-press to copy."); });
      else { inp.select(); UI.toast("Press Ctrl+C or long-press to copy."); }
    }));
    if (/^file:/.test(location.protocol)) $("links").insertAdjacentHTML("beforeend", '<p class="hint">These links will work once the site is on GitHub Pages.</p>');
  }

  fill(); renderMe(); renderLinks();
})();
