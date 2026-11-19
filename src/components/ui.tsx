import { forwardRef, useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Drawer } from "vaul";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Person } from "@/data/types";

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:brightness-95 active:brightness-90 font-semibold",
  secondary: "bg-card-2 text-fg border border-line hover:border-muted/50",
  ghost: "text-muted hover:text-fg hover:bg-card-2",
  danger: "bg-danger/10 text-danger hover:bg-danger/15"
};
const sizes: Record<Size, string> = { sm: "h-9 px-3 text-sm rounded-lg", md: "h-11 px-4 text-[15px] rounded-xl", lg: "h-14 px-6 text-base rounded-2xl" };

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }>(
  ({ className, variant = "primary", size = "md", ...p }, ref) => (
    <button
      ref={ref}
      className={cn("inline-flex items-center justify-center gap-2 font-medium transition active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none select-none", variants[variant], sizes[size], className)}
      {...p}
    />
  )
);
Button.displayName = "Button";

/* ---------- Card ---------- */
export function Card({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-card shadow-card", className)} {...p}>{children}</div>;
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string>({ value, onChange, options, className, label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string; label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("relative grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-card-2 p-1", className)}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
            className={cn("relative z-10 flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors", on ? "text-fg" : "text-muted hover:text-fg")}>
            {on && <motion.span layoutId={"seg-" + label} className="absolute inset-0 -z-10 rounded-lg bg-card shadow-sm ring-1 ring-line" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Avatar / person dot ---------- */
export function Avatar({ p, name, size = 36, className }: { p: Person; name: string; size?: number; className?: string }) {
  return (
    <span className={cn("inline-grid shrink-0 place-items-center rounded-full font-semibold text-white", p === "a" ? "bg-pa" : "bg-pb", className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
export const Dot = ({ p, className }: { p: Person; className?: string }) =>
  <span className={cn("inline-block size-2.5 shrink-0 rounded-full", p === "a" ? "bg-pa" : "bg-pb", className)} aria-hidden="true" />;

/* ---------- Progress ring ---------- */
export function Ring({ value, size = 56, stroke = 6, children, className }: { value: number; size?: number; stroke?: number; children?: ReactNode; className?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - v) }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({ title, subtitle, back, right }: { title: string; subtitle?: ReactNode; back?: string; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="flex items-end justify-between gap-3 pb-5 pt-4">
      <div className="min-w-0">
        {back && (
          <button onClick={() => (window.history.length > 1 ? nav(-1) : nav(back))} className="-ml-1.5 mb-2 flex items-center gap-0.5 text-sm font-medium text-muted hover:text-fg">
            <ChevronLeft className="size-4" /> Back
          </button>
        )}
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

/* ---------- Grouped list (settings style) ---------- */
export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      {title && <h2 className="px-1 text-[13px] font-medium text-muted">{title}</h2>}
      <Card className="divide-y divide-line overflow-hidden">{children}</Card>
    </section>
  );
}
export function ListItem({ icon, title, detail, to, onClick, right }: { icon?: ReactNode; title: ReactNode; detail?: ReactNode; to?: string; onClick?: () => void; right?: ReactNode }) {
  const inner = (
    <>
      {icon && <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card-2 text-fg">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{title}</span>
        {detail && <span className="block truncate text-[13px] text-muted">{detail}</span>}
      </span>
      {right ?? ((to || onClick) && <ChevronRight className="size-4 shrink-0 text-muted" />)}
    </>
  );
  const cls = "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-card-2/60";
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

/* ---------- Bottom sheet ---------- */
export function Sheet({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-lg flex-col rounded-t-3xl border border-line bg-card outline-none">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line" />
          <div className="px-5 pb-2 pt-4">
            <Drawer.Title className="text-lg font-semibold tracking-tight">{title}</Drawer.Title>
            {description ? <Drawer.Description className="mt-0.5 text-sm text-muted">{description}</Drawer.Description> : <Drawer.Description className="sr-only">{title}</Drawer.Description>}
          </div>
          <div className="overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ---------- Toast ---------- */
const useToastStore = create<{ msg: string; id: number; show: (m: string) => void }>(set => ({
  msg: "", id: 0,
  show: msg => set(s => ({ msg, id: s.id + 1 }))
}));
export const toast = (m: string) => useToastStore.getState().show(m);
export function Toaster() {
  const { msg, id } = useToastStore();
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => useToastStore.setState({ msg: "" }), 2600);
    return () => clearTimeout(t);
  }, [id, msg]);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(12px+env(safe-area-inset-top))] z-[60] flex justify-center px-4" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {msg && (
          <motion.div key={id}
            initial={{ opacity: 0, y: -16, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: .96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto max-w-sm rounded-2xl border border-line bg-card px-4 py-3 text-sm font-medium shadow-card">
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
