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

export function rotationInfo(startISO: string | null | undefined, today = startOfToday()): RotationInfo {
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

export function formatDay(d: Date, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return d.toLocaleDateString("en-GB", opts);
}
