"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { WEEK_GROUPS, REFERENCE_WEEK } from "@/content/curriculum";
import { FlashcardDeck, type DeckCard } from "@/components/flashcard-deck";
import { useStudy } from "@/lib/store/study-store";
import { useNow } from "@/lib/use-now";

type Card = DeckCard & { week: number };

export function FlashcardsHub() {
  const { state } = useStudy();
  const now = useNow();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [week, setWeek] = useState<number | "all">("all");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/flashcards")
      .then((r) => r.json())
      .then(setCards)
      .catch(() => setError(true));
  }, []);

  const filtered = useMemo(() => (cards ?? []).filter((c) => week === "all" || c.week === week), [cards, week]);
  const dueFor = (w: number | "all") => {
    return (cards ?? []).filter(
      (c) => (w === "all" || c.week === w) && (!state.cards[c.id] || new Date(state.cards[c.id].due).getTime() <= now),
    ).length;
  };

  if (error) return <div className="card p-6 text-center text-bad">Couldn&apos;t load flashcards. Check your connection.</div>;
  if (!cards) return <div className="card h-72 animate-pulse" />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {(["all", ...WEEK_GROUPS] as const).map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className={clsx(
              "shrink-0 rounded-lg border px-2.5 py-1 text-[13px] font-medium",
              week === w ? "border-brand-line bg-brand-soft text-brand" : "border-line bg-surface text-ink-2",
            )}
          >
            {w === "all" ? "All weeks" : w === REFERENCE_WEEK ? "Drugs" : `Week ${w}`}
            <span className="ml-1.5 opacity-70">{dueFor(w)}</span>
          </button>
        ))}
      </div>
      <FlashcardDeck key={String(week)} cards={filtered} newLimit={25} emptyHint="No flashcards for this week yet." />
      <p className="mt-6 text-center text-xs text-ink-3">
        Shortcuts: <kbd>Space</kbd> flip · <kbd>1</kbd>–<kbd>4</kbd> Again / Hard / Good / Easy. Up to 25 new cards per session.
      </p>
    </div>
  );
}
