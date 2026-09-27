import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { cache } from "react";
import { TOPICS, TOPIC_BY_SLUG, type Topic } from "@/content/curriculum";
import { frontmatterSchema, studySchema } from "@/lib/content-schema.mjs";
import type { StudyData, TopicContent, TopicSummary, Heading } from "@/lib/types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const TOPICS_DIR = path.join(CONTENT_DIR, "topics");

const EMPTY_STUDY = (slug: string): StudyData => ({
  slug,
  flashcards: [],
  mcqs: [],
  cases: [],
  references: [],
});

export function extractHeadings(markdown: string): Heading[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  // Same slugger rehype-slug uses, so ids match the rendered headings.
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  for (const m of withoutCode.matchAll(/^(#{1,6}) (.+)$/gm)) {
    const text = m[2].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim();
    const id = slugger.slug(text);
    if (m[1].length === 2 || m[1].length === 3) headings.push({ depth: m[1].length, text, id });
  }
  return headings;
}

export const loadStudy = cache((slug: string): StudyData => {
  const file = path.join(TOPICS_DIR, slug, "study.json");
  if (!fs.existsSync(file)) return EMPTY_STUDY(slug);
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.warn(`[content] study.json for ${slug} is not valid JSON`);
    return EMPTY_STUDY(slug);
  }
  const parsed = studySchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[content] invalid study.json for ${slug}`, parsed.error.issues.slice(0, 3));
    return EMPTY_STUDY(slug);
  }
  return parsed.data as StudyData;
});

export const loadTopic = cache((slug: string): TopicContent | null => {
  const topic = TOPIC_BY_SLUG[slug];
  if (!topic) return null;
  const file = path.join(TOPICS_DIR, slug, "notes.md");
  let body = "";
  let summary = topic.blurb;
  let highYield: string[] = [];
  if (fs.existsSync(file)) {
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    const fm = frontmatterSchema.safeParse(data);
    if (fm.success) {
      summary = fm.data.summary;
      highYield = fm.data.highYield;
    }
    body = content;
  }
  return {
    topic,
    summary,
    highYield,
    body,
    headings: extractHeadings(body),
    wordCount: body.split(/\s+/).filter(Boolean).length,
    study: loadStudy(slug),
  };
});

export const topicSummaries = cache((): TopicSummary[] =>
  TOPICS.map((t: Topic) => {
    const c = loadTopic(t.slug)!;
    return {
      ...t,
      summary: c.summary,
      highYield: c.highYield,
      hasNotes: c.body.length > 0,
      readMinutes: Math.max(1, Math.round(c.wordCount / 200)),
      counts: {
        flashcards: c.study.flashcards.length,
        mcqs: c.study.mcqs.length,
        cases: c.study.cases.length,
      },
    };
  }),
);

export const loadQuickReference = cache(() => {
  const file = path.join(CONTENT_DIR, "quick-reference.md");
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    title: (data.title as string) ?? "Quick reference",
    summary: (data.summary as string) ?? "",
    body: content,
    headings: extractHeadings(content),
  };
});

/** Lightweight search index: titles, summaries, high-yield facts and headings. */
export const searchIndex = cache(() =>
  TOPICS.flatMap((t) => {
    const c = loadTopic(t.slug)!;
    return [
      {
        slug: t.slug,
        title: t.title,
        week: t.week,
        kind: "topic" as const,
        text: `${c.summary} ${t.blurb}`,
        anchor: "",
      },
      ...c.highYield.map((h) => ({ slug: t.slug, title: t.title, week: t.week, kind: "fact" as const, text: h, anchor: "" })),
      ...c.headings.map((h) => ({ slug: t.slug, title: t.title, week: t.week, kind: "section" as const, text: h.text, anchor: h.id })),
      ...c.study.flashcards.map((f) => ({ slug: t.slug, title: t.title, week: t.week, kind: "card" as const, text: `${f.front} — ${f.back}`, anchor: "" })),
    ];
  }),
);
