import type { Metadata } from "next";
import { TOPICS, WEEKS, WEEK_THEMES } from "@/content/curriculum";
import { loadStudy } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import { CaseList } from "@/components/case-list";

export const metadata: Metadata = { title: "Clinical cases" };

export default function CasesPage() {
  const groups = WEEKS.map((w) => ({
    week: w,
    theme: WEEK_THEMES[w],
    cases: TOPICS.filter((t) => t.week === w).flatMap((t) =>
      loadStudy(t.slug).cases.map((c) => ({ id: c.id, title: c.title, slug: t.slug, topicTitle: t.title, steps: c.steps.length })),
    ),
  }));
  const total = groups.reduce((n, g) => n + g.cases.length, 0);
  return (
    <>
      <PageHeader eyebrow={`${total} cases`} title="Clinical cases">
        Realistic Ugandan ward scenarios that unfold one decision at a time. Commit to an answer before you reveal it; that&apos;s how
        clinical acumen is built.
      </PageHeader>
      <CaseList groups={groups} />
    </>
  );
}
