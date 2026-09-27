import { DEFAULT_START } from "@/content/curriculum";

const DAY = 86_400_000;

/** Parse a YYYY-MM-DD string as a local-time date (avoids UTC off-by-one). */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export interface RotationInfo {
  start: Date;
  /** Day offset of today from the start (can be negative or > 41). */
  dayIndex: number;
  phase: "before" | "during" | "after";
  /** 1–6 while the rotation is running */
  week: number | null;
  daysToTest: number;
}

/**
 * Rotation position. Pass `now` from useNow(): while it is 0 (server render and
 * hydration) the result is pinned to the rotation's first day so markup matches.
 */
export function rotationInfo(startISO: string | null | undefined, now?: number): RotationInfo {
  const today = now === undefined ? startOfToday() : now ? startOfDay(new Date(now)) : parseDate(startISO || DEFAULT_START);
  const start = parseDate(startISO || DEFAULT_START);
  const dayIndex = Math.round((today.getTime() - start.getTime()) / DAY);
  const phase = dayIndex < 0 ? "before" : dayIndex > 39 ? "after" : "during";
  return {
    start,
    dayIndex,
    phase,
    week: phase === "during" ? Math.floor(dayIndex / 7) + 1 : null,
    daysToTest: 39 - dayIndex,
  };
}

const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MO = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * en-GB style date without Intl: Node's and browsers' ICU disagree ("Sept" vs "Sep"),
 * which breaks hydration. Supports the option subset the app uses.
 */
export function formatDay(d: Date, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  const parts: string[] = [];
  if (opts.weekday) {
    const w = WD[d.getDay()];
    parts.push(opts.weekday === "long" ? w : opts.weekday === "narrow" ? w[0] : w.slice(0, 3));
  }
  if (opts.day) parts.push(String(d.getDate()));
  if (opts.month) {
    const m = MO[d.getMonth()];
    parts.push(opts.month === "long" ? m : m.slice(0, 3));
  }
  if (opts.year) parts.push(String(d.getFullYear()));
  return parts.join(" ");
}
