"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useStudy } from "@/lib/store/study-store";
import { WEEK_GROUPS, weekLabel } from "@/content/curriculum";
import { useRotation } from "@/lib/use-rotation";

interface CaseItem {
  id: string;
  title: string;
  slug: string;
  topicTitle: string;
  steps: number;
}

/** "12 cases" in the active rotation, for the page header. */
export function CaseCount({ cases }: { cases: CaseItem[] }) {
  const { rotation, slugs } = useRotation();
  const n = cases.filter((c) => slugs.has(c.slug)).length;
  return (
    <span data-rot-scoped>
      {rotation.name} · {n} {n === 1 ? "case" : "cases"}
    </span>
  );
}

/** The active rotation's cases, grouped by the week of their topic. */
export function CaseList({ cases }: { cases: CaseItem[] }) {
  const { state } = useStudy();
  const { rotation } = useRotation();
  const weekOf = Object.fromEntries(rotation.topics.map((t) => [t.slug, t.week]));
  const groups = WEEK_GROUPS.map((w) => ({ week: w, theme: rotation.weekThemes[w], cases: cases.filter((c) => weekOf[c.slug] === w) }));
  if (!groups.some((g) => g.cases.length))
    return (
      <div className="card p-8 text-center text-ink-3">
        Cases for {rotation.name} are being written. Check back soon, or try the flashcards and questions.
      </div>
    );
  return (
    <div className="space-y-8">
      {groups.map((g) =>
        g.cases.length ? (
          <section key={g.week}>
            <h2 className="mb-3 h-section">
              <span className="text-brand">{weekLabel(g.week)}</span> · {g.theme}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {g.cases.map((c) => {
                const done = state.cases[c.id]?.completed;
                return (
                  <Link key={c.id} href={`/cases/${c.id}`} className="card flex items-center gap-3 p-4 hover:border-brand">
                    {done ? <CheckCircle2 className="shrink-0 text-good" size={22} /> : <span className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-line" />}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold leading-snug">{c.title}</div>
                      <div className="text-xs text-ink-3">
                        {c.topicTitle} · {c.steps} steps
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-ink-3" />
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
