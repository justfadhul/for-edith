import type { Metadata } from "next";
import { topicSummaries } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import { QuizBuilder } from "@/components/quiz-builder";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  const topics = topicSummaries().map((t) => ({ slug: t.slug, title: t.title, week: t.week, mcqs: t.counts.mcqs }));
  return (
    <>
      <PageHeader eyebrow="Single best answer" title="Quiz & mock exams">
        Clinical-vignette questions in the style of the progressive written test. Every answer has an explanation that covers why
        the other options are wrong.
      </PageHeader>
      <QuizBuilder topics={topics} />
    </>
  );
}
