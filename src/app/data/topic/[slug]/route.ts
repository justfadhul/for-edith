import { TOPICS, TOPIC_BY_SLUG } from "@/content/curriculum";
import { loadStudy } from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function GET(_req: Request, ctx: RouteContext<"/data/topic/[slug]">) {
  const { slug } = await ctx.params;
  const topic = TOPIC_BY_SLUG[slug];
  if (!topic) return new Response("Not found", { status: 404 });
  return Response.json({ ...loadStudy(slug), title: topic.title, week: topic.week });
}
