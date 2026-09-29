"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useStudy } from "@/lib/store/study-store";
import { weekLabel } from "@/content/curriculum";

interface Group {
  week: number;
  theme: string;
  cases: { id: string; title: string; slug: string; topicTitle: string; steps: number }[];
}

export function CaseList({ groups }: { groups: Group[] }) {
  const { state } = useStudy();
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
