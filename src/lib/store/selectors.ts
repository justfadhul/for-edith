import type { StudyState } from "./study-store";

export function cardsDue(state: StudyState, now = Date.now()) {
  return Object.values(state.cards).filter((c) => new Date(c.due).getTime() <= now).length;
}

export function quizAccuracy(state: StudyState) {
  let a = 0;
  let c = 0;
  for (const q of Object.values(state.questions)) {
    a += q.attempts;
    c += q.correct;
  }
  return a ? c / a : null;
}

/** Consecutive days (ending today or yesterday) with any study activity. */
export function studyStreak(state: StudyState) {
  const days = new Set<string>();
  const add = (iso?: string) => iso && days.add(iso.slice(0, 10));
  Object.values(state.cards).forEach((x) => add(x.updatedAt));
  Object.values(state.questions).forEach((x) => add(x.updatedAt));
  Object.values(state.topics).forEach((x) => add(x.updatedAt));
  Object.values(state.cases).forEach((x) => add(x.updatedAt));
  state.sessions.forEach((x) => add(x.createdAt));
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const d = new Date();
  if (!days.has(key(d))) d.setUTCDate(d.getUTCDate() - 1);
  let streak = 0;
  while (days.has(key(d))) {
    streak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return streak;
}

export function topicMastery(state: StudyState, slug: string, questionIds: string[]) {
  const qs = questionIds.map((id) => state.questions[id]).filter(Boolean);
  if (!qs.length) return null;
  return qs.filter((q) => q.lastCorrect).length / questionIds.length;
}
