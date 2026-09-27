// Simplified SM-2 spaced repetition.
export type Grade = 0 | 1 | 2 | 3; // again | hard | good | easy

export interface CardState {
  topic: string;
  ease: number;
  interval: number; // days
  reps: number;
  lapses: number;
  due: string; // ISO
  updatedAt: string;
}

const DAY = 86_400_000;

export function newCard(topic: string): CardState {
  const now = new Date().toISOString();
  return { topic, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, updatedAt: now };
}

export function review(card: CardState, grade: Grade, now = Date.now()): CardState {
  let { ease, interval, reps, lapses } = card;
  if (grade === 0) {
    lapses += 1;
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    return { ...card, ease, interval, reps, lapses, due: new Date(now + 10 * 60_000).toISOString(), updatedAt: new Date(now).toISOString() };
  }
  if (grade === 1) {
    interval = reps === 0 ? 1 : Math.max(1, interval * 1.2);
    ease = Math.max(1.3, ease - 0.15);
  } else {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : interval * ease;
    if (grade === 3) {
      interval *= 1.3;
      ease += 0.15;
    }
  }
  reps += 1;
  interval = Math.min(Math.round(interval * 10) / 10, 180);
  return {
    ...card,
    ease,
    interval,
    reps,
    lapses,
    due: new Date(now + interval * DAY).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };
}

/** Human label for the next interval a grade would give (shown on buttons). */
export function previewInterval(card: CardState, grade: Grade): string {
  if (grade === 0) return "10m";
  const d = review(card, grade).interval;
  if (d < 1) return "<1d";
  if (d < 30) return `${Math.round(d)}d`;
  return `${Math.round(d / 30)}mo`;
}
