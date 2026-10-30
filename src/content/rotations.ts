// The two rotations Edith studies for. Every list in the app follows the active one.
import {
  DEFAULT_START,
  OBGYN_TOPICS,
  REFERENCE_WEEK,
  SESSIONS,
  TOPICS,
  WEEK_NOTES,
  WEEK_THEMES,
  type RotationId,
  type Session,
  type Topic,
} from "./curriculum.ts";
import { PAEDS_DEFAULT_START, PAEDS_SESSIONS, PAEDS_TOPICS, PAEDS_WEEK_NOTES, PAEDS_WEEK_THEMES } from "./paeds-curriculum.ts";

export type { RotationId };

export interface RotationConfig {
  id: RotationId;
  name: string;
  /** For tight spaces (the phone top bar). */
  short: string;
  /** Full clerkship name, e.g. for PDF covers and the calendar. */
  longName: string;
  /** The rotation's own topics plus those shared into it (at the Reference week). */
  topics: Topic[];
  sessions: Session[];
  weekThemes: Record<number, string>;
  weekNotes: Record<number, string>;
  /** Monday of week 1, unless Edith sets her own. */
  defaultStart: string;
  /** The drug handbook (a reference topic). */
  handbookSlug: string;
  /** Teaching days in a week (Mon–Fri = 5, Mon–Sat = 6). */
  daysPerWeek: number;
  /** Day offset of the last day of the rotation. */
  lastDay: number;
  /** Day offset of the end-of-rotation written test, if there is one. */
  testDay: number | null;
}

export const ROTATIONS: Record<RotationId, RotationConfig> = {
  obgyn: {
    id: "obgyn",
    name: "Obs & Gyn",
    short: "O&G",
    longName: "Obstetrics & Gynaecology",
    topics: forRotation(TOPICS, "obgyn"),
    sessions: SESSIONS,
    weekThemes: WEEK_THEMES,
    weekNotes: WEEK_NOTES,
    defaultStart: DEFAULT_START,
    handbookSlug: "obs-gyn-pharmacology",
    daysPerWeek: 5,
    lastDay: 39,
    testDay: 39,
  },
  paeds: {
    id: "paeds",
    name: "Paediatrics",
    short: "Paeds",
    longName: "Paediatrics & Child Health",
    topics: forRotation(TOPICS, "paeds"),
    sessions: PAEDS_SESSIONS,
    weekThemes: PAEDS_WEEK_THEMES,
    weekNotes: PAEDS_WEEK_NOTES,
    defaultStart: PAEDS_DEFAULT_START,
    handbookSlug: "paediatric-pharmacology",
    daysPerWeek: 6,
    lastDay: 40,
    testDay: null,
  },
};

export const ROTATION_IDS = Object.keys(ROTATIONS) as RotationId[];
export const DEFAULT_ROTATION: RotationId = "obgyn";

export const isRotationId = (v: unknown): v is RotationId => typeof v === "string" && v in ROTATIONS;

/** Is this topic listed in the rotation (its own, or shared into it)? */
export function topicInRotation(t: Pick<Topic, "rotation" | "sharedWith">, id: RotationId) {
  return t.rotation === id || Boolean(t.sharedWith?.includes(id));
}

/** Filters any topic-like list to a rotation: its own topics, then shared ones moved to the Reference week. */
export function forRotation<T extends Pick<Topic, "rotation" | "sharedWith" | "week">>(list: T[], id: RotationId): T[] {
  const own = list.filter((t) => t.rotation === id);
  const shared = list.filter((t) => t.rotation !== id && t.sharedWith?.includes(id)).map((t) => ({ ...t, week: REFERENCE_WEEK }));
  return [...own, ...shared];
}

/** The week theme for a topic in its own rotation. */
export const topicWeekTheme = (t: Pick<Topic, "rotation" | "week">) => ROTATIONS[t.rotation].weekThemes[t.week] ?? "";

/** Neighbouring topics within the topic's own rotation (for prev/next links). */
export function rotationNeighbours(slug: string) {
  const t = TOPICS.find((x) => x.slug === slug);
  if (!t) return { prev: undefined, next: undefined };
  const own = t.rotation === "obgyn" ? OBGYN_TOPICS : PAEDS_TOPICS;
  const i = own.findIndex((x) => x.slug === slug);
  return { prev: own[i - 1], next: own[i + 1] };
}
