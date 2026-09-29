import { topicSummaries, loadStudy } from "@/lib/content";
import { TOPICS, SESSIONS } from "@/content/curriculum";
import { Dashboard } from "@/components/dashboard";
import { DrugFab } from "@/components/drug-fab";

export default function Home() {
  const topics = topicSummaries();
  const cases = TOPICS.flatMap((t) =>
    loadStudy(t.slug).cases.map((c) => ({ id: c.id, title: c.title, slug: t.slug, topicTitle: t.title, steps: c.steps.length })),
  );
  return (
    <>
      <Dashboard topics={topics} sessions={SESSIONS} cases={cases} />
      <DrugFab />
    </>
  );
}
