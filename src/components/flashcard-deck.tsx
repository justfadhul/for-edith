"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { RotateCcw, PartyPopper } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { useStudy } from "@/lib/store/study-store";
import { newCard, previewInterval, type Grade } from "@/lib/store/srs";
import { Markdown } from "@/components/markdown";
import { nowMs, useNow } from "@/lib/use-now";

export type DeckCard = Flashcard & { topic: string; topicTitle?: string };

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: 0, label: "Again", cls: "bg-bad-soft text-bad" },
  { g: 1, label: "Hard", cls: "bg-warn-soft text-warn" },
  { g: 2, label: "Good", cls: "bg-good-soft text-good" },
  { g: 3, label: "Easy", cls: "bg-accent-soft text-accent" },
];

/**
 * Spaced-repetition review. Builds a queue of due cards plus up to `newLimit`
 * unseen cards; "Again" re-queues the card at the end of this session.
 */
export function FlashcardDeck({ cards, newLimit = 20, emptyHint }: { cards: DeckCard[]; newLimit?: number; emptyHint?: React.ReactNode }) {
  const { state, hydrated, gradeCard } = useStudy();
  const clock = useNow();
  const [queue, setQueue] = useState<DeckCard[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [cram, setCram] = useState(false);

  const build = useCallback(
    (all: boolean) => {
      const now = nowMs();
      const due = cards.filter((c) => state.cards[c.id] && new Date(state.cards[c.id].due).getTime() <= now);
      const fresh = cards.filter((c) => !state.cards[c.id]).slice(0, newLimit);
      const q = all ? [...cards] : [...due, ...fresh];
      // Shuffle lightly so topics interleave.
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [q[i], q[j]] = [q[j], q[i]];
      }
      return q;
    },
    [cards, state.cards, newLimit],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- build the queue once stored progress has loaded
    if (hydrated && queue === null) setQueue(build(false));
  }, [hydrated, queue, build]);

  const current = queue?.[0];
  const cardState = current ? (state.cards[current.id] ?? newCard(current.topic)) : null;

  const grade = useCallback(
    (g: Grade) => {
      if (!current) return;
      gradeCard(current.id, current.topic, g);
      setReviewed((n) => n + 1);
      setFlipped(false);
      setQueue((q) => {
        if (!q) return q;
        const [head, ...rest] = q;
        return g === 0 ? [...rest, head] : rest;
      });
    },
    [current, gradeCard],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) grade((Number(e.key) - 1) as Grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, grade]);

  const stats = useMemo(() => {
    const now = clock;
    const seen = cards.filter((c) => state.cards[c.id]);
    return {
      total: cards.length,
      seen: seen.length,
      due: seen.filter((c) => new Date(state.cards[c.id].due).getTime() <= now).length,
      mastered: seen.filter((c) => state.cards[c.id].interval >= 21).length,
    };
  }, [cards, state.cards, clock]);

  if (!cards.length) return <div className="card p-6 text-center text-ink-3">{emptyHint ?? "No flashcards yet."}</div>;
  if (!queue) return <div className="card h-72 animate-pulse" />;

  if (!current)
    return (
      <div className="card p-8 text-center">
        <PartyPopper className="mx-auto text-brand" size={36} />
        <h3 className="mt-3 font-serif text-xl font-semibold">{reviewed ? "Session complete!" : "All caught up"}</h3>
        <p className="mt-1 text-ink-2">
          {reviewed ? `You reviewed ${reviewed} card${reviewed === 1 ? "" : "s"}. ` : ""}
          {stats.mastered}/{stats.total} cards mastered (interval ≥ 3 weeks).
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              setCram(true);
              setQueue(build(true));
            }}
          >
            <RotateCcw size={16} /> Review all {stats.total} anyway
          </button>
          <Link href="/quiz" className="btn btn-outline">
            Try some MCQs
          </Link>
        </div>
      </div>
    );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-ink-3">
        <span>
          {queue.length} left {cram && "· cram mode"}
        </span>
        <span>
          {stats.seen}/{stats.total} seen · {stats.mastered} mastered
        </span>
      </div>
      <button
        className={clsx("flip block w-full text-left", flipped && "flipped")}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <div className="flip-inner">
          <div className="card flex min-h-64 flex-col p-6">
            {current.topicTitle && <div className="text-xs font-semibold uppercase tracking-wider text-brand">{current.topicTitle}</div>}
            <div className="flex flex-1 items-center justify-center py-4 text-center">
              <Markdown className="prose-compact text-lg font-medium">{current.front}</Markdown>
            </div>
            <div className="text-center text-xs text-ink-3">Tap to reveal · Space</div>
          </div>
          <div className="flip-back card flex min-h-64 flex-col border-brand p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-3">Answer</div>
            <div className="mt-2 flex-1 overflow-auto">
              <Markdown className="prose-compact">{current.back}</Markdown>
            </div>
          </div>
        </div>
      </button>
      <div className={clsx("mt-4 grid grid-cols-4 gap-2 transition", !flipped && "pointer-events-none opacity-40")}>
        {GRADES.map(({ g, label, cls }) => (
          <button key={g} className={clsx("btn flex-col gap-0 py-2", cls)} onClick={() => grade(g)} disabled={!flipped}>
            <span>{label}</span>
            <span className="text-[11px] font-normal opacity-80">{cardState && previewInterval(cardState, g)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
