import type { Metadata } from "next";
import { topicSummaries } from "@/lib/content";
import { TopicBrowser } from "@/components/topic-browser";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Topics" };

export default function TopicsPage() {
  const topics = topicSummaries();
  return (
    <>
      <PageHeader eyebrow="34 topics · 6 weeks" title="Topics">
        Every lecture, tutorial and skills session from your timetable. Each topic has in-depth notes that focus on
        management and clinical reasoning, plus flashcards, MCQs and cases.
      </PageHeader>
      <TopicBrowser topics={topics} />
    </>
  );
}
