import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { TOPICS, SESSIONS } from "@/content/curriculum";
import { loadTopic } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { KindChip } from "@/components/ui";
import { TopicActions, TopicTabs, TableOfContents } from "@/components/topic-view";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: PageProps<"/topics/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = loadTopic(slug);
  return c ? { title: c.topic.title, description: c.summary } : {};
}

export default async function TopicPage(props: PageProps<"/topics/[slug]">) {
  const { slug } = await props.params;
  const c = loadTopic(slug);
  if (!c) notFound();
  const { topic, study } = c;
  const i = TOPICS.findIndex((t) => t.slug === slug);
  const prev = TOPICS[i - 1];
  const next = TOPICS[i + 1];
  const sessions = SESSIONS.filter((s) => s.topic === slug);
  const questions = study.mcqs.map((q) => ({ ...q, topic: slug }));
  const cards = study.flashcards.map((f) => ({ ...f, topic: slug }));

  return (
    <article>
      <nav className="mb-3 flex items-center gap-2 text-sm text-ink-3">
        <Link href="/topics" className="hover:text-brand">
          Topics
        </Link>
        <span>/</span>
        <span>Week {topic.week}</span>
      </nav>

      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <KindChip kind={topic.kind} />
          <span className="chip capitalize">{topic.discipline}</span>
          {c.wordCount > 0 && (
            <span className="chip">
              <Clock size={12} /> {Math.max(1, Math.round(c.wordCount / 200))} min read
            </span>
          )}
        </div>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{topic.title}</h1>
        <p className="mt-2 max-w-3xl text-lg text-ink-2">{c.summary}</p>
        <p className="mt-2 text-sm text-ink-3">
          {topic.faculty.join(" · ")}
          {topic.presenters?.length ? ` · Presenter: ${topic.presenters.join(", ")}` : ""}
          {sessions.length > 0 && ` · ${sessions.map((s) => s.mode).join(" + ")}`}
        </p>
        <TopicActions slug={slug} />
      </header>

      {c.highYield.length > 0 && (
        <section className="card mb-6 border-brand/40 bg-brand-soft/60 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-brand">
            <Sparkles size={18} /> High-yield: must know
          </h2>
          <ul className="mt-2 space-y-1.5">
            {c.highYield.map((h, k) => (
              <li key={k} className="flex gap-2 text-[0.95rem] leading-snug">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <Markdown className="prose-compact [&_p]:m-0">{h}</Markdown>
              </li>
            ))}
          </ul>
        </section>
      )}

      <TopicTabs
        slug={slug}
        topicTitle={topic.title}
        cards={cards}
        questions={questions}
        cases={study.cases}
        references={study.references}
        toc={<TableOfContents headings={c.headings} />}
      >
        {c.body ? (
          <Markdown headingIds>{c.body}</Markdown>
        ) : (
          <div className="card p-8 text-center text-ink-3">
            Notes for this topic are being written. Check back soon, or try the flashcards and questions.
          </div>
        )}
      </TopicTabs>

      <nav className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/topics/${prev.slug}`} className="card flex min-w-0 items-center gap-2 p-4 hover:border-brand">
            <ChevronLeft size={18} className="shrink-0 text-ink-3" />
            <div className="min-w-0">
              <div className="text-xs text-ink-3">Previous</div>
              <div className="truncate font-medium">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/topics/${next.slug}`} className="card flex min-w-0 items-center justify-end gap-2 p-4 text-right hover:border-brand">
            <div className="min-w-0">
              <div className="text-xs text-ink-3">Next</div>
              <div className="truncate font-medium">{next.title}</div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-ink-3" />
          </Link>
        )}
      </nav>
    </article>
  );
}
