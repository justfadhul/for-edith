"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { BookOpen, Hash, Layers, Sparkles } from "lucide-react";
import type { SearchEntry } from "@/lib/types";

const KIND_ICON = {
  topic: <BookOpen size={16} />,
  section: <Hash size={16} />,
  fact: <Sparkles size={16} />,
  card: <Layers size={16} />,
};
const KIND_LABEL = { topic: "Topic", section: "Section", fact: "High-yield", card: "Flashcard" };

export function SearchView() {
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetch("/data/search")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  }, []);

  const fuse = useMemo(
    () =>
      index &&
      new Fuse(index, {
        keys: [
          { name: "title", weight: 0.35 },
          { name: "text", weight: 0.65 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [index],
  );

  const results = useMemo(() => (fuse && q.trim().length > 1 ? fuse.search(q.trim(), { limit: 40 }).map((r) => r.item) : []), [fuse, q]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-serif text-3xl font-semibold">Search</h1>
      <input
        ref={inputRef}
        className="input text-lg"
        placeholder="Try 'magnesium', 'Bishop score', 'ectopic', 'TLD'…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
      />
      {!index && <p className="mt-4 text-sm text-ink-3">Loading index…</p>}
      {q.trim().length > 1 && index && results.length === 0 && <p className="mt-6 text-center text-ink-3">No results for “{q}”.</p>}
      <ul className="mt-4 space-y-2">
        {results.map((r, i) => {
          const href = r.kind === "section" ? `/topics/${r.slug}#${r.anchor}` : r.kind === "card" ? `/topics/${r.slug}#cards` : `/topics/${r.slug}`;
          return (
            <li key={i}>
              <Link href={href} className="card flex gap-3 p-3 hover:border-brand">
                <span className="mt-0.5 text-brand">{KIND_ICON[r.kind]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-ink-3">
                    {KIND_LABEL[r.kind]} · Week {r.week} · {r.title}
                  </div>
                  <div className="line-clamp-2 text-sm">{r.kind === "topic" ? r.title : r.text}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
