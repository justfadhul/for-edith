import type { Session } from "@/content/curriculum";
import type { SessionOverride } from "@/lib/store/study-store";

/** Stable id for a timetable slot (its original day, time and subject). */
export function sessionKey(s: Session) {
  return `d${s.day}|${s.time}|${s.topic ?? s.title}`;
}

/** Only teaching tied to a topic can be moved (lectures, tutorials, skills, bedside). */
export function canReschedule(s: Session) {
  return Boolean(s.topic);
}

export interface EffectiveSession extends Session {
  key: string;
  /** Where it was originally, when it has been moved. */
  movedFrom?: { day: number; time: string };
  note?: string | null;
  /** A placeholder left in the original slot, pointing at the new one. */
  ghostOf?: { day: number; time: string };
}

/** Apply Edith's reschedules: moved sessions appear at their new slot; a ghost stays behind. */
export function effectiveSessions(sessions: Session[], overrides: Record<string, SessionOverride>): EffectiveSession[] {
  const out: EffectiveSession[] = [];
  for (const s of sessions) {
    const key = sessionKey(s);
    const o = overrides[key];
    if (o && !o.cleared && (o.day !== s.day || o.time !== s.time)) {
      out.push({ ...s, key, day: o.day, time: o.time, movedFrom: { day: s.day, time: s.time }, note: o.note });
      out.push({ ...s, key, ghostOf: { day: o.day, time: o.time }, note: o.note });
    } else out.push({ ...s, key });
  }
  return out;
}
