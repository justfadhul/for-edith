import { TOPICS } from "@/content/curriculum";
import { loadStudy } from "@/lib/content";

export const dynamic = "force-static";

export async function GET() {
  const cards = TOPICS.flatMap((t) =>
    loadStudy(t.slug).flashcards.map((f) => ({ ...f, topic: t.slug, topicTitle: t.title, week: t.week })),
  );
  return Response.json(cards);
}
