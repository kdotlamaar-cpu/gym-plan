import { Dumbbell, Flame, Flower2, Music, Plus, Zap, type LucideProps } from "lucide-react";

/** Boxing glove in the lucide style (lucide has no glove icon). */
function Glove({ size = 24, strokeWidth = 2, className }: LucideProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 9.5a5 5 0 0 1 10 0V13a5 5 0 0 1-5 5h-1a4 4 0 0 1-4-4z" />
      <path d="M7 13.5h4" /><path d="M8.5 21.5h7" /><path d="M9.5 18v3.5M14.5 18v3.5" />
    </svg>
  );
}

const MAP: Record<string, (p: LucideProps) => JSX.Element> = {
  boxing: Glove,
  burn: p => <Flame {...p} />,
  hrx: p => <Zap {...p} />,
  sc: p => <Dumbbell {...p} />,
  dance: p => <Music {...p} />,
  yoga: p => <Flower2 {...p} />,
  other: p => <Plus {...p} />
};

export function ClassIcon({ id, ...p }: { id: string } & LucideProps) {
  const C = MAP[id] || MAP.other;
  return <C {...p} />;
}
