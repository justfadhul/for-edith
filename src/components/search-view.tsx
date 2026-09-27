"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Hash, Layers, Sparkles } from "lucide-react";
import type { SearchEntry } from "@/lib/types";

const KIND_ICON = {
  topic: <BookOpen size={16} />,
  section: <Hash size={16} />,
  fact: <Sparkles size={16} />,
  card: <Layers size={16} />,
};
const KIND_LABEL = { topic: "Topic", section: "Notes", fact: "High-yield", card: "Flashcard" };
const KIND_WEIGHT = { topic: 40, fact: 25, card: 15, section: 10 };

// Treat common synonyms/abbreviations as the same search term.
const SYNONYMS: Record<string, string[]> = {
  magnesium: ["mgso4", "mgso₄"],
  mgso4: ["magnesium"],
  pph: ["postpartum haemorrhage", "postpartum hemorrhage"],
  aph: ["antepartum haemorrhage"],
  hemorrhage: ["haemorrhage"],
  haemorrhage: ["hemorrhage"],
  anemia: ["anaemia"],
  anaemia: ["anemia"],
  cs: ["caesarean"],
  gdm: ["gestational diabetes"],
  pprom: ["preterm prelabour rupture"],
};

function norm(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function snippet(text: string, term: string) {
  const i = norm(text).indexOf(term);
  if (i < 0) return text.slice(0, 160);
  const start = Math.max(0, i - 60);
  return (start ? "…" : "") + text.slice(start, i + 120) + (i + 120 < text.length ? "…" : "");
}

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

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter((w) => w.length > 1);
    if (!index || !words.length) return [];
    const variants = words.map((w) => [w, ...(SYNONYMS[w] ?? [])]);
    const scored: { e: SearchEntry; score: number; hit: string }[] = [];
    for (const e of index) {
      const hay = norm(`${e.title} ${e.heading ?? ""} ${e.text}`);
      if (!variants.every((vs) => vs.some((v) => hay.includes(v)))) continue;
      const first = variants[0].find((v) => hay.includes(v))!;
      let score = KIND_WEIGHT[e.kind] + (e.slug === "quick-reference" ? 12 : 0);
      if (variants.some((vs) => vs.some((v) => norm(e.title).includes(v)))) score += 20;
      if (e.heading && variants.some((vs) => vs.some((v) => norm(e.heading!).includes(v)))) score += 15;
      score += Math.min(10, hay.split(first).length - 1);
      scored.push({ e, score, hit: first });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 60);
  }, [index, q]);

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
      {q.trim().length > 1 && index && (
        <p className="mt-3 text-sm text-ink-3">
          {results.length ? `${results.length}${results.length === 60 ? "+" : ""} results` : `No results for “${q}”.`}
        </p>
      )}
      <ul className="mt-3 space-y-2">
        {results.map(({ e: r, hit }, i) => {
          const href =
            r.slug === "quick-reference"
              ? `/quick-reference#${r.anchor}`
              : r.kind === "section"
                ? `/topics/${r.slug}#${r.anchor}` : r.kind === "card" ? `/topics/${r.slug}#cards` : `/topics/${r.slug}`;
          return (
            <li key={i}>
              <Link href={href} className="card flex gap-3 p-3 hover:border-brand">
                <span className="mt-0.5 text-brand">{KIND_ICON[r.kind]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-ink-3">
                    {r.week ? `${KIND_LABEL[r.kind]} · Week ${r.week} · ${r.title}` : "⚡ Quick reference"}
                  </div>
                  {r.heading && <div className="text-sm font-semibold">{r.heading}</div>}
                  <div className="line-clamp-3 text-sm text-ink-2">{r.kind === "topic" ? r.title : snippet(r.text, hit)}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
