import { useGym } from "@/store/data";
import type { Person } from "@/data/types";

/** The person this phone belongs to (always set once the welcome screen is done). */
export function useMe() {
  const me = (useGym(s => s.me) || "a") as Person;
  const names = useGym(s => s.data.settings.names);
  return { me, names, name: names[me] };
}
