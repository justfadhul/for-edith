"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Bookmark, BookOpen, CheckCircle2, ExternalLink, Layers, ListChecks, NotebookPen, Stethoscope, Library, List, CircleDot } from "lucide-react";
import type { ClinicalCase, Heading, Reference } from "@/lib/types";
import { useStudy, type TopicStatus } from "@/lib/store/study-store";
import { FlashcardDeck, type DeckCard } from "@/components/flashcard-deck";
import { QuizRunner, type QuizQuestion } from "@/components/quiz-runner";
import { CaseRunner } from "@/components/case-runner";

const STATUSES: { v: TopicStatus; label: string; icon: React.ReactNode }[] = [
  { v: "not_started", label: "Not started", icon: <CircleDot size={15} /> },
  { v: "in_progress", label: "Studying", icon: <BookOpen size={15} /> },
  { v: "done", label: "Done", icon: <CheckCircle2 size={15} /> },
];

export function TopicActions({ slug }: { slug: string }) {
  const { state, setTopicStatus, toggleBookmark, setConfidence } = useStudy();
  const t = state.topics[slug];
  const status = t?.status ?? "not_started";
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-xl border border-line bg-surface p-1">
        {STATUSES.map((s) => (
          <button
            key={s.v}
            onClick={() => setTopicStatus(slug, s.v)}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              status === s.v
                ? s.v === "done"
                  ? "bg-good text-white"
                  : s.v === "in_progress"
                    ? "bg-warn text-white"
                    : "bg-surface-2"
                : "text-ink-3 hover:text-ink",
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => toggleBookmark(slug)}
        className={clsx("btn btn-outline min-h-0 py-2", t?.bookmarked && "border-brand text-brand")}
        aria-pressed={!!t?.bookmarked}
      >
        <Bookmark size={16} className={clsx(t?.bookmarked && "fill-brand")} /> {t?.bookmarked ? "Saved" : "Save"}
      </button>
      <div className="flex items-center gap-1 text-sm text-ink-3">
        <span className="mr-1">Confidence</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setConfidence(slug, n)}
            aria-label={`Confidence ${n} of 5`}
            className={clsx("h-6 w-6 rounded-full border text-xs font-bold", (t?.confidence ?? 0) >= n ? "border-brand bg-brand text-brand-ink" : "border-line")}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const h2 = headings.filter((h) => h.depth === 2);
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const els = h2.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [h2]);
  if (!h2.length) return null;
  return (
    <ul className="space-y-0.5 text-sm">
      {h2.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={clsx(
              "block rounded-md border-l-2 px-3 py-1.5 leading-snug transition",
              active === h.id ? "border-brand bg-brand-soft/60 font-medium text-brand" : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

type Tab = "notes" | "cards" | "quiz" | "cases" | "mine" | "sources";

export function TopicTabs({
  slug,
  topicTitle,
  cards,
  questions,
  cases,
  references,
  toc,
  children,
}: {
  slug: string;
  topicTitle: string;
  cards: DeckCard[];
  questions: QuizQuestion[];
  cases: ClinicalCase[];
  references: Reference[];
  toc: React.ReactNode;
  children: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("notes");
  const [quizKey, setQuizKey] = useState(0);
  const [caseIdx, setCaseIdx] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const { state } = useStudy();

  useEffect(() => {
    const h = window.location.hash.slice(1) as Tab;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- open the tab named in the URL hash
    if (["cards", "quiz", "cases", "mine", "sources"].includes(h)) setTab(h);
  }, []);

  const select = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", t === "notes" ? window.location.pathname : `#${t}`);
    document.getElementById("topic-tabs")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "notes", label: "Notes", icon: <BookOpen size={16} /> },
    { id: "cards", label: "Flashcards", icon: <Layers size={16} />, count: cards.length },
    { id: "quiz", label: "MCQs", icon: <ListChecks size={16} />, count: questions.length },
    { id: "cases", label: "Cases", icon: <Stethoscope size={16} />, count: cases.length },
    { id: "mine", label: "My notes", icon: <NotebookPen size={16} /> },
    { id: "sources", label: "Sources", icon: <Library size={16} />, count: references.length },
  ];

  return (
    <div id="topic-tabs" className="scroll-mt-16">
      <div className="no-scrollbar sticky top-14 z-20 -mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-line bg-bg/95 px-4 backdrop-blur sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition",
              tab === t.id ? "border-brand text-brand" : "border-transparent text-ink-3 hover:text-ink",
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && <span className="rounded-full bg-surface-2 px-1.5 text-[11px]">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Notes stay mounted so server-rendered markdown isn't lost between tabs */}
      <div className={clsx(tab !== "notes" && "hidden")}>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
          <div className="min-w-0">
            <div className="mb-4 lg:hidden">
              <button className="btn btn-outline w-full justify-between" onClick={() => setTocOpen((o) => !o)}>
                <span className="flex items-center gap-2">
                  <List size={16} /> Jump to section
                </span>
                <span className="text-ink-3">{tocOpen ? "▲" : "▼"}</span>
              </button>
              {tocOpen && (
                <div className="card mt-2 p-2" onClick={() => setTocOpen(false)}>
                  {toc}
                </div>
              )}
            </div>
            {children}
            <div className="card mt-10 flex flex-col items-center gap-3 p-6 text-center">
              <div className="font-semibold">Finished reading? Test yourself.</div>
              <div className="flex flex-wrap justify-center gap-2">
                <button className="btn btn-primary" onClick={() => select("quiz")}>
                  <ListChecks size={16} /> {questions.length} MCQs
                </button>
                <button className="btn btn-outline" onClick={() => select("cards")}>
                  <Layers size={16} /> {cards.length} flashcards
                </button>
                <button className="btn btn-outline" onClick={() => select("cases")}>
                  <Stethoscope size={16} /> {cases.length} cases
                </button>
              </div>
            </div>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto pb-6">
              <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-3">On this page</div>
              {toc}
            </div>
          </aside>
        </div>
      </div>

      {tab === "cards" && (
        <div className="mx-auto max-w-2xl">
          <FlashcardDeck cards={cards} newLimit={cards.length} />
        </div>
      )}

      {tab === "quiz" && (
        <div className="mx-auto max-w-3xl">
          <QuizRunner key={quizKey} questions={questions} mode="practice" onExit={() => setQuizKey((k) => k + 1)} />
        </div>
      )}

      {tab === "cases" && (
        <div className="mx-auto max-w-3xl">
          {cases.length === 0 ? (
            <div className="card p-6 text-center text-ink-3">No cases yet.</div>
          ) : (
            <>
              <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
                {cases.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setCaseIdx(i)}
                    className={clsx(
                      "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium",
                      i === caseIdx ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface",
                    )}
                  >
                    {state.cases[c.id]?.completed && "✓ "}Case {i + 1}
                  </button>
                ))}
              </div>
              <h3 className="mb-3 font-serif text-xl font-semibold">{cases[caseIdx].title}</h3>
              <CaseRunner key={cases[caseIdx].id} c={cases[caseIdx]} topic={slug} />
            </>
          )}
        </div>
      )}

      {tab === "mine" && <PersonalNotes slug={slug} topicTitle={topicTitle} />}

      {tab === "sources" && (
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm text-ink-2">
            These notes were compiled from the sources below. Where Ugandan practice differs from international guidance, follow the
            Uganda Clinical Guidelines and your consultants.
          </p>
          <ol className="space-y-2">
            {references.map((r, i) => (
              <li key={i} className="card flex gap-3 p-4">
                <span className="text-sm font-bold text-ink-3">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium leading-snug">{r.title}</div>
                  <div className="text-sm text-ink-3">{[r.source, r.year].filter(Boolean).join(" · ")}</div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-sm text-brand hover:underline">
                      <ExternalLink size={13} className="shrink-0" /> {r.url.replace(/^https?:\/\//, "").slice(0, 70)}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function PersonalNotes({ slug, topicTitle }: { slug: string; topicTitle: string }) {
  const { state, saveNote, hydrated, sync } = useStudy();
  const saved = state.notes[slug];
  const [body, setBody] = useState<string | null>(null);
  const value = body ?? saved?.body ?? "";
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-3 text-sm text-ink-2">
        Your own notes for <strong>{topicTitle}</strong>: things consultants emphasised, cases you clerked, mnemonics that work for you.
        {sync.status === "synced" ? " Synced to your account." : " Saved on this device (sign in to sync)."}
      </p>
      <textarea
        className="input min-h-[50vh] font-mono text-sm leading-relaxed"
        disabled={!hydrated}
        value={value}
        placeholder={"e.g.\n- Dr Nanzira: always check the bladder before calling it obstructed labour\n- Clerked Mrs A, G4P3, PPH from atony: responded to 2nd dose of oxytocin…"}
        onChange={(e) => {
          setBody(e.target.value);
          saveNote(slug, e.target.value);
        }}
      />
      {saved?.updatedAt && <div className="mt-2 text-xs text-ink-3">Last saved {new Date(saved.updatedAt).toLocaleString("en-GB")}</div>}
    </div>
  );
}
