import { useEffect, useRef, useState } from "react";
import { CalendarDays, Copy, Download, MapPin, Monitor, Moon, Share2, Smartphone, Sun, Trash2, Upload, UserRound, Utensils } from "lucide-react";
import { useGym, type Theme } from "@/store/data";
import { useMe } from "@/lib/hooks";
import { parseYmd, ymd } from "@/lib/dates";
import { Avatar, Button, Card, ListGroup, ListItem, Segmented, Sheet, toast } from "@/components/ui";
import type { Person } from "@/data/types";

type BIPEvent = Event & { prompt: () => void; userChoice: Promise<unknown> };

export default function Me() {
  const { me, names, name } = useMe();
  const setMe = useGym(s => s.setMe);
  const theme = useGym(s => s.theme);
  const setTheme = useGym(s => s.setTheme);
  const data = useGym(s => s.data);
  const [sheet, setSheet] = useState<null | "profile" | "share" | "install" | "reset">(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [bip, setBip] = useState<BIPEvent | null>(null);

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setBip(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  function exportData() {
    const blob = new Blob([JSON.stringify(useGym.getState().data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gym-backup-${ymd(new Date())}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Backup downloaded.");
  }
  function importData(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { useGym.getState().importData(String(r.result)); toast("Backup restored."); }
      catch { toast("That file isn't a backup from this app."); }
    };
    r.readAsText(f);
  }

  return (
    <div className="space-y-6">
      <header className="pt-5">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Me</h1>
      </header>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Avatar p={me} name={name} size={56} />
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold">{name}</div>
            <div className="text-[13px] text-muted">Started at {data.settings.startWeight[me]} kg · {me === "b" ? "back-friendly swaps on" : "full program"}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 text-[13px] font-medium text-muted">This phone belongs to</div>
          <Segmented label="This phone belongs to" value={me} onChange={(v: Person) => { setMe(v); toast(`Switched to ${names[v]}.`); }}
            options={(["a", "b"] as Person[]).map(p => ({ value: p, label: names[p] }))} />
        </div>
      </Card>

      <ListGroup title="Plan">
        <ListItem to="/me/plan" icon={<CalendarDays className="size-[18px]" />} title="Weekly plan" detail="Schedule, 6-week block, how to progress" />
        <ListItem to="/me/diet" icon={<Utensils className="size-[18px]" />} title="Diet" detail="Calories, protein and a workday meal plan" />
        <ListItem to="/me/gyms" icon={<MapPin className="size-[18px]" />} title="Gyms" detail="Step Up Fitness · Cult Andheri East" />
      </ListGroup>

      <ListGroup title="App">
        <ListItem onClick={() => setSheet("profile")} icon={<UserRound className="size-[18px]" />} title="Names & starting weights" detail={`${names.a} ${data.settings.startWeight.a} kg · ${names.b} ${data.settings.startWeight.b} kg`} />
        <ListItem onClick={() => setSheet("share")} icon={<Share2 className="size-[18px]" />} title="Share the app" detail={`Send ${names[me === "a" ? "b" : "a"]} their personal link`} />
        <ListItem onClick={() => (bip ? (bip.prompt(), setBip(null)) : setSheet("install"))} icon={<Smartphone className="size-[18px]" />} title="Install on your phone" detail="Home-screen icon, works offline" />
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card-2"><Moon className="size-[18px]" /></span>
          <span className="flex-1 text-[15px] font-medium">Theme</span>
          <Segmented label="Theme" value={theme} onChange={(t: Theme) => setTheme(t)} className="w-[150px]"
            options={[{ value: "system", label: <Monitor className="size-4" aria-label="System" /> }, { value: "light", label: <Sun className="size-4" aria-label="Light" /> }, { value: "dark", label: <Moon className="size-4" aria-label="Dark" /> }]} />
        </div>
      </ListGroup>

      <ListGroup title="Your data · saved on this phone only">
        <ListItem onClick={exportData} icon={<Download className="size-[18px]" />} title="Export backup" detail="Download a file with all your logs" />
        <ListItem onClick={() => fileRef.current?.click()} icon={<Upload className="size-[18px]" />} title="Restore backup" detail="Replaces everything on this phone" />
        <ListItem onClick={() => setSheet("reset")} icon={<Trash2 className="size-[18px] text-danger" />} title={<span className="text-danger">Clear all data</span>} />
      </ListGroup>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={e => { importData(e.target.files?.[0]); e.target.value = ""; }} />

      <p className="px-1 pb-4 text-center text-xs leading-relaxed text-muted">
        Exercise photos: free-exercise-db (public domain). Diet figures are general guidance, not medical advice.
      </p>

      <ProfileSheet open={sheet === "profile"} onClose={() => setSheet(null)} />
      <ShareSheet open={sheet === "share"} onClose={() => setSheet(null)} />
      <Sheet open={sheet === "install"} onOpenChange={o => !o && setSheet(null)} title="Install on your phone" description="Opens full screen and works offline at the gym.">
        <div className="space-y-4 text-[14px]">
          <div><h4 className="font-semibold">Android · Chrome</h4><p className="mt-1 text-muted">Tap <b className="text-fg">⋮</b> → <b className="text-fg">Install app</b> (or Add to Home screen).</p></div>
          <div><h4 className="font-semibold">iPhone · Safari</h4><p className="mt-1 text-muted">Tap <b className="text-fg">Share</b> → <b className="text-fg">Add to Home Screen</b>.</p></div>
        </div>
      </Sheet>
      <Sheet open={sheet === "reset"} onOpenChange={o => !o && setSheet(null)} title="Clear all data?" description="Every log, weigh-in and class on this phone is deleted. Export a backup first if you might need it.">
        <div className="grid gap-2">
          <Button variant="danger" size="lg" onClick={() => { useGym.getState().reset(); setSheet(null); toast("All data cleared."); }}>Yes, clear everything</Button>
          <Button variant="secondary" size="lg" onClick={() => setSheet(null)}>Cancel</Button>
        </div>
      </Sheet>
    </div>
  );
}

function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useGym(s => s.data.settings);
  const update = useGym(s => s.updateSettings);
  const [f, setF] = useState(settings);
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setF(settings); setErr(""); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const input = "h-12 w-full rounded-xl border border-line bg-bg px-4 text-base outline-none focus:border-accent";

  function save() {
    if (!f.names.a.trim() || !f.names.b.trim()) return setErr("Both names are needed.");
    if (![f.startWeight.a, f.startWeight.b].every(w => w >= 30 && w <= 250)) return setErr("Starting weights must be between 30 and 250 kg.");
    if (!parseYmd(f.start)) return setErr("Pick a program start date.");
    update({ ...f, names: { a: f.names.a.trim().slice(0, 20), b: f.names.b.trim().slice(0, 20) } });
    toast("Saved."); onClose();
  }

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()} title="Names & starting weights">
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); save(); }}>
        {(["a", "b"] as Person[]).map(p => (
          <div key={p} className="grid grid-cols-[1fr_110px] gap-2">
            <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-muted">{p === "a" ? "Person 1" : "Person 2 · back-friendly swaps"}</span>
              <input className={input} value={f.names[p]} maxLength={20} onChange={e => setF({ ...f, names: { ...f.names, [p]: e.target.value } })} /></label>
            <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-muted">Start kg</span>
              <input className={input + " tnum"} inputMode="decimal" value={f.startWeight[p]} onChange={e => setF({ ...f, startWeight: { ...f.startWeight, [p]: parseFloat(e.target.value) || 0 } })} /></label>
          </div>
        ))}
        <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-muted">Program start date (counts the 6-week blocks)</span>
          <input type="date" className={input} value={f.start} onChange={e => setF({ ...f, start: e.target.value })} /></label>
        {err && <p className="text-[13px] text-danger">{err}</p>}
        <Button type="submit" size="lg" className="w-full">Save</Button>
      </form>
    </Sheet>
  );
}

function ShareSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { names } = useMe();
  const base = location.origin + location.pathname.replace(/[^/]*$/, "");
  const copy = (p: Person) => {
    const url = `${base}?who=${p}`;
    navigator.clipboard?.writeText(url).then(() => toast(`Link copied. Send it to ${names[p]}.`), () => toast(url));
  };
  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()} title="Personal links" description="Opening a link sets that phone up for the person straight away.">
      <div className="space-y-2">
        {(["a", "b"] as Person[]).map(p => (
          <div key={p} className="flex items-center gap-3 rounded-xl border border-line p-3">
            <Avatar p={p} name={names[p]} size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-medium">{names[p]}</div>
              <div className="truncate text-xs text-muted">{base}?who={p}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => copy(p)}><Copy className="size-4" /> Copy</Button>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
