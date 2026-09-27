import type { StudyState } from "@/lib/store/study-store";

export interface TopicCounts {
  flashcards: number;
  mcqs: number;
  cases: number;
}

/** How far Edith has got with a topic, derived from her stored study state. */
export function topicPrep(state: StudyState, slug: string, counts: TopicCounts) {
  const status = state.topics[slug]?.status ?? "not_started";
  const cardsSeen = Object.values(state.cards).filter((c) => c.topic === slug).length;
  const cardsLearnt = Object.values(state.cards).filter((c) => c.topic === slug && c.interval >= 3).length;
  const qs = Object.values(state.questions).filter((q) => q.topic === slug);
  const answered = qs.length;
  const correct = qs.filter((q) => q.lastCorrect).length;
  const casesDone = Object.values(state.cases).filter((c) => c.topic === slug && c.completed).length;
  const steps = [
    { key: "notes", done: status !== "not_started" },
    { key: "cards", done: counts.flashcards > 0 && cardsSeen >= counts.flashcards },
    { key: "mcqs", done: counts.mcqs > 0 && answered >= counts.mcqs },
    { key: "cases", done: counts.cases > 0 && casesDone >= counts.cases },
  ];
  return {
    status,
    cardsSeen: Math.min(cardsSeen, counts.flashcards),
    cardsLearnt: Math.min(cardsLearnt, counts.flashcards),
    answered: Math.min(answered, counts.mcqs),
    correct,
    casesDone: Math.min(casesDone, counts.cases),
    stepsDone: steps.filter((s) => s.done).length,
    steps,
  };
}

/** Parse "14:00–16:00" (or "8:00-10:00") into decimal hours. */
export function parseTimeRange(time: string): { start: number; end: number } {
  const m = time.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!m) return { start: 8, end: 9 };
  return { start: +m[1] + +m[2] / 60, end: +m[3] + +m[4] / 60 };
}

export function fmtHour(h: number) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
