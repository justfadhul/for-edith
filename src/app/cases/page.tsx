import type { Metadata } from "next";
import { TOPICS } from "@/content/curriculum";
import { loadStudy } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import { CaseCount, CaseList } from "@/components/case-list";

export const metadata: Metadata = { title: "Clinical cases" };

export default function CasesPage() {
  // Every rotation's cases; the list shows the active rotation's, by week.
  const cases = TOPICS.flatMap((t) =>
    loadStudy(t.slug).cases.map((c) => ({ id: c.id, title: c.title, slug: t.slug, topicTitle: t.title, steps: c.steps.length })),
  );
  return (
    <>
      <PageHeader eyebrow={<CaseCount cases={cases} />} title="Clinical cases">
        Realistic Ugandan ward scenarios that unfold one decision at a time. Commit to an answer before you reveal it; that&apos;s how
        clinical acumen is built.
      </PageHeader>
      <CaseList cases={cases} />
    </>
  );
}
