"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Bookmark, Clock, Layers, ListChecks, Stethoscope } from "lucide-react";
import { WEEK_THEMES, WEEKS, type TopicKind } from "@/content/curriculum";
import type { TopicSummary } from "@/lib/types";
import { useStudy, type TopicStatus } from "@/lib/store/study-store";
import { KindChip, StatusDot } from "@/components/ui";

type StatusFilter = "all" | TopicStatus | "saved";

export function TopicBrowser({ topics }: { topics: TopicSummary[] }) {
  const { state } = useStudy();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<TopicKind | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return topics.filter((t) => {
      const st = state.topics[t.slug];
      if (kind !== "all" && t.kind !== kind) return false;
      if (status === "saved" && !st?.bookmarked) return false;
      if (status !== "all" && status !== "saved" && (st?.status ?? "not_started") !== status) return false;
      if (needle && !`${t.title} ${t.summary} ${t.blurb} ${t.faculty.join(" ")}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [topics, q, kind, status, state.topics]);

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 space-y-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-3">
        <input className="input" placeholder="Filter topics…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(["all", "lecture", "tutorial", "skill"] as const).map((k) => (
            <Pill key={k} active={kind === k} onClick={() => setKind(k)}>
              {k === "all" ? "All types" : k === "skill" ? "Skills" : k[0].toUpperCase() + k.slice(1) + "s"}
            </Pill>
          ))}
          <span className="mx-1 w-px shrink-0 bg-line" />
          {(
            [
              ["all", "Any status"],
              ["not_started", "Not started"],
              ["in_progress", "In progress"],
              ["done", "Done"],
              ["saved", "★ Saved"],
            ] as const
          ).map(([k, label]) => (
            <Pill key={k} active={status === k} onClick={() => setStatus(k)}>
              {label}
            </Pill>
          ))}
        </div>
      </div>

      {WEEKS.map((w) => {
        const wt = filtered.filter((t) => t.week === w);
        if (!wt.length) return null;
        return (
          <section key={w} className="mt-8">
            <h2 className="mb-3 font-serif text-xl font-semibold">
              <span className="text-brand">Week {w}</span> · {WEEK_THEMES[w]}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {wt.map((t) => (
                <TopicCard key={t.slug} t={t} status={state.topics[t.slug]?.status} saved={!!state.topics[t.slug]?.bookmarked} />
              ))}
            </div>
          </section>
        );
      })}
      {!filtered.length && <p className="mt-10 text-center text-ink-3">No topics match those filters.</p>}
    </div>
  );
}

function TopicCard({ t, status, saved }: { t: TopicSummary; status?: TopicStatus; saved: boolean }) {
  return (
    <Link href={`/topics/${t.slug}`} className="card group flex flex-col p-4 transition hover:border-brand">
      <div className="flex items-center gap-2">
        <StatusDot status={status} />
        <KindChip kind={t.kind} />
        <span className="text-xs text-ink-3 capitalize">{t.discipline}</span>
        {saved && <Bookmark size={14} className="ml-auto fill-brand text-brand" />}
      </div>
      <h3 className="mt-2 font-semibold leading-snug group-hover:text-brand">{t.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-ink-2">{t.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
        {t.hasNotes ? (
          <span className="flex items-center gap-1">
            <Clock size={13} /> {t.readMinutes} min read
          </span>
        ) : (
          <span className="text-warn">Notes coming soon</span>
        )}
        <span className="flex items-center gap-1">
          <Layers size={13} /> {t.counts.flashcards}
        </span>
        <span className="flex items-center gap-1">
          <ListChecks size={13} /> {t.counts.mcqs}
        </span>
        <span className="flex items-center gap-1">
          <Stethoscope size={13} /> {t.counts.cases}
        </span>
        <span className="ml-auto truncate">{t.faculty.join(", ")}</span>
      </div>
    </Link>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition",
        active ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface text-ink-2 hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}
