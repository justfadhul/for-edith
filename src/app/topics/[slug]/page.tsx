import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, GraduationCap, Wrench, Pill } from "lucide-react";
import { TOPICS, SESSIONS, WEEK_THEMES, REFERENCE_WEEK } from "@/content/curriculum";
import { loadTopic } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { KindChip } from "@/components/ui";
import { TopicHeaderActions, TopicDetails, TopicTabs, TableOfContents } from "@/components/topic-view";

const KIND_ICON = { lecture: GraduationCap, tutorial: BookOpen, skill: Wrench, reference: Pill } as const;

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

  const jump = [
    { re: /^management/i, label: "Management" },
    { re: /clinical workup/i, label: "Clinical workup" },
    { re: /clinical acumen/i, label: "Clinical acumen" },
    { re: /procedure/i, label: "Procedure" },
    { re: /high-yield summary/i, label: "High-yield" },
    { re: /ward-round|exam pearls/i, label: "Ward-round pearls" },
  ]
    .map((j) => ({ ...j, h: c.headings.find((h) => h.depth === 2 && j.re.test(h.text)) }))
    .filter((j) => j.h);
  // The drug handbook jumps straight to its drug groups instead.
  if (topic.kind === "reference") {
    const skip = /nutshell|clinical acumen|clinical workup|ward-round|mnemonic/i;
    jump.splice(
      0,
      jump.length,
      ...c.headings
        .filter((h) => h.depth === 2 && !skip.test(h.text))
        .map((h) => ({ re: /./, label: h.text.split(/[:(]/)[0].trim(), h })),
    );
  }
  const Icon = KIND_ICON[topic.kind];

  return (
    <article>
      {/* Record header */}
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <span className="hidden h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-brand-soft text-brand sm:grid">
            <Icon size={24} strokeWidth={1.8} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <KindChip kind={topic.kind} />
              {topic.discipline !== "skills" && topic.week !== REFERENCE_WEEK && <span className="chip capitalize">{topic.discipline}</span>}
              {topic.week !== REFERENCE_WEEK && <span className="chip">Week {topic.week}</span>}
              {c.wordCount > 0 && <span className="chip">{Math.max(1, Math.round(c.wordCount / 200))} min read</span>}
              <div className="ml-auto hidden sm:block">
                <TopicHeaderActions slug={slug} title={topic.title} />
              </div>
            </div>
            <h1 className="h-display !text-[clamp(2.1rem,1.6rem+1.8vw,2.9rem)] !leading-[1.03]">{topic.title}</h1>
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink-2">{c.summary}</p>
            {topic.faculty.length > 0 && <p className="text-[13px] text-ink-3 xl:hidden">{topic.faculty.join(" · ")}</p>}
            <div className="sm:hidden">
              <TopicHeaderActions slug={slug} title={topic.title} />
            </div>
          </div>
        </div>
        {jump.length > 0 && (
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {jump.map((j, k) => (
              <a
                key={j.h!.id}
                href={`#${j.h!.id}`}
                className={
                  k === 0
                    ? "inline-flex h-[34px] shrink-0 items-center rounded-full bg-primary px-3.5 text-[13px] font-medium text-primary-ink"
                    : "inline-flex h-[34px] shrink-0 items-center rounded-full border border-line-strong bg-surface px-3.5 text-[13px] font-medium"
                }
              >
                {j.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_292px] xl:gap-10">
        <div className="min-w-0">
          {c.highYield.length > 0 && (
            <section className="mb-6 flex flex-col gap-2.5 rounded-[14px] border border-brand-line bg-surface px-5 py-4">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-brand-text">
                <Sparkles size={15} className="fill-brand text-brand" /> Must know before the ward round
              </h2>
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[14.5px] leading-relaxed marker:font-semibold marker:text-brand">
                {c.highYield.map((h, k) => (
                  <li key={k} className="pl-1">
                    <Markdown className="prose-compact [&_p]:m-0 [&_p]:text-[14.5px]">{h}</Markdown>
                  </li>
                ))}
              </ol>
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
              <div className="card p-8 text-center text-ink-3">Notes for this topic are being written. Check back soon, or try the flashcards and questions.</div>
            )}
          </TopicTabs>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-6 overflow-y-auto rounded-[14px] border border-line bg-surface p-5">
            <TopicDetails
              slug={slug}
              counts={{ flashcards: cards.length, mcqs: questions.length, cases: study.cases.length }}
              sessions={sessions}
              faculty={topic.faculty}
              weekLabel={topic.week === REFERENCE_WEEK ? "Reference · not timetabled" : `${topic.week} · ${WEEK_THEMES[topic.week]}`}
            />
            <div className="border-t border-line pt-4">
              <div className="mb-2 text-[12px] font-medium text-ink-3">On this page</div>
              <TableOfContents headings={c.headings} />
            </div>
          </div>
        </aside>
      </div>

      <nav className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/topics/${prev.slug}`} className="card flex min-w-0 items-center gap-2 p-4">
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
          <Link href={`/topics/${next.slug}`} className="card flex min-w-0 items-center justify-end gap-2 p-4 text-right">
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
