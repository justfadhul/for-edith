// Obstetric dating maths (Naegele's rule and gestational age from the LNMP).
import { addDays, parseDate, startOfDay, toISODate } from "@/lib/dates";

const DAY = 86_400_000;
export const TERM_DAYS = 280; // 40 weeks from the LNMP

export function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
}

/** EDD = LNMP + 280 days, shifted by (cycle length − 28) for regular non-28-day cycles. */
export function eddFromLnmp(lnmp: Date, cycle = 28) {
  return addDays(lnmp, TERM_DAYS + (cycle - 28));
}

/** The "corrected" LNMP a 28-day cycle would have, so GA stays consistent with the EDD. */
export function lnmpFromEdd(edd: Date) {
  return addDays(edd, -TERM_DAYS);
}

/** LNMP implied by a gestational age measured on a given date (e.g. a dating scan). */
export function lnmpFromGa(onDate: Date, weeks: number, days: number) {
  return addDays(onDate, -(weeks * 7 + days));
}

export interface Ga {
  totalDays: number;
  weeks: number;
  days: number;
}

export function gaOn(lnmp: Date, on: Date): Ga {
  const totalDays = daysBetween(lnmp, on);
  return { totalDays, weeks: Math.floor(totalDays / 7), days: ((totalDays % 7) + 7) % 7 };
}

export function fmtGa(ga: Ga) {
  return `${ga.weeks}+${ga.days}`;
}

export function trimester(weeks: number) {
  if (weeks < 14) return "First trimester";
  if (weeks < 28) return "Second trimester";
  return "Third trimester";
}

/** Plain-language status of a pregnancy at a given gestation. */
export function gaStatus(ga: Ga) {
  const w = ga.totalDays / 7;
  if (ga.totalDays < 0) return { label: "Date is before the LNMP", tone: "bad" as const };
  if (w < 28) return { label: `${trimester(ga.weeks)} · pre-viable in Uganda (<28 weeks)`, tone: "neutral" as const };
  if (w < 37) return { label: "Preterm (28–36+6 weeks)", tone: "warn" as const };
  if (w < 42) return { label: "Term (37–41+6 weeks)", tone: "good" as const };
  return { label: "Post-term (≥42 weeks): plan delivery", tone: "bad" as const };
}

/** Clinically useful dates, as gestations from the LNMP. */
export const MILESTONES: { at: number; label: string; note: string }[] = [
  { at: 12 * 7, label: "Dating scan window closes", note: "CRL most accurate before 14 weeks" },
  { at: 13 * 7, label: "IPTp-SP can start", note: "From 13 weeks, doses ≥1 month apart" },
  { at: 20 * 7, label: "Anomaly scan", note: "Around 18–22 weeks" },
  { at: 24 * 7, label: "Fundus at the umbilicus", note: "SFH ≈ weeks from 24 weeks" },
  { at: 28 * 7, label: "Viability (Uganda)", note: "Anti-D at 28 weeks if Rh-negative" },
  { at: 34 * 7, label: "Late preterm", note: "Antenatal steroids usually up to 34 weeks" },
  { at: 37 * 7, label: "Term", note: "37+0 weeks" },
  { at: 40 * 7, label: "EDD", note: "40+0 weeks" },
  { at: 41 * 7, label: "Offer induction", note: "Around 41 weeks" },
  { at: 42 * 7, label: "Post-term", note: "42+0 weeks" },
];

export function dateInput(d: Date) {
  return toISODate(d);
}

export function fromInput(v: string) {
  return v ? parseDate(v) : null;
}
