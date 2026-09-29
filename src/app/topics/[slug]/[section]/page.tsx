import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, ListChecks, Layers } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { ChapterList, GroupIcon } from "@/components/drug-handbook";
import { TableOfContents } from "@/components/topic-view";
import { drugHandbook, HANDBOOK_SLUG } from "@/lib/drug-handbook";

export const dynamicParams = false;

export function generateStaticParams() {
  return drugHandbook().map((g) => ({ slug: HANDBOOK_SLUG, section: g.slug }));
}

export async function generateMetadata(props: PageProps<"/topics/[slug]/[section]">): Promise<Metadata> {
  const { section } = await props.params;
  const g = drugHandbook().find((g) => g.slug === section);
  return g ? { title: `${g.title} · Drug handbook`, description: g.blurb } : {};
}

export default async function DrugChapterPage(props: PageProps<"/topics/[slug]/[section]">) {
  const { slug, section } = await props.params;
  const groups = drugHandbook();
  const i = groups.findIndex((g) => g.slug === section);
  if (slug !== HANDBOOK_SLUG || i < 0) notFound();
  const g = groups[i];
  const prev = groups[i - 1];
  const next = groups[i + 1];
  const base = `/topics/${HANDBOOK_SLUG}`;
  const cards = groups.map(({ slug, title, blurb, icon, tone, items }) => ({ slug, title, blurb, icon, tone, items: items.map(({ id, text }) => ({ id, text })) }));

  return (
    <article>
      <header className="mb-5 flex flex-col gap-3">
        <Link href={base} className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-ink-3 hover:text-ink">
          <ChevronLeft size={15} /> Drug handbook
        </Link>
        <div className="flex items-start gap-3.5">
          <GroupIcon icon={g.icon} tone={g.tone} size={24} className="h-[52px] w-[52px]" />
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-ink-3">
              Chapter {i + 1} of {groups.length}
            </div>
            <h1 className="h-display !text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)] !leading-[1.05]">{g.title}</h1>
            <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-2">{g.blurb}</p>
          </div>
        </div>
        {g.items.length > 0 && (
          <nav aria-label="Drugs in this chapter" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {g.items.map((it) => (
              <a
                key={it.id}
                href={`#${it.id}`}
                className="inline-flex h-[34px] shrink-0 items-center rounded-full border border-line-strong bg-surface px-3.5 text-[13px] font-medium hover:border-brand-line hover:text-brand-text"
              >
                {it.text}
              </a>
            ))}
          </nav>
        )}
      </header>

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-10">
        <div className="min-w-0">
          <Markdown headingIds>{g.body}</Markdown>

          <div className="mt-8 flex flex-wrap gap-2 rounded-[14px] border border-brand-line bg-surface p-4">
            <div className="w-full text-[13px] font-semibold text-brand-text">Test yourself on the drug handbook</div>
            <Link href={`${base}#quiz`} className="btn btn-primary !min-h-9 !py-1.5 text-[13px]">
              <ListChecks size={15} /> MCQs
            </Link>
            <Link href={`${base}#cards`} className="btn btn-outline !min-h-9 !py-1.5 text-[13px]">
              <Layers size={15} /> Flashcards
            </Link>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-5 overflow-y-auto rounded-[14px] border border-line bg-surface p-4">
            <div>
              <div className="mb-2 text-[12px] font-medium text-ink-3">On this page</div>
              <TableOfContents headings={g.headings} />
            </div>
            <div className="border-t border-line pt-4">
              <div className="mb-2 text-[12px] font-medium text-ink-3">Chapters</div>
              <ChapterList base={base} groups={cards} current={g.slug} />
            </div>
          </div>
        </aside>
      </div>

      <nav className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`${base}/${prev.slug}`} className="card flex min-w-0 items-center gap-2 p-4">
            <ChevronLeft size={18} className="shrink-0 text-ink-3" />
            <div className="min-w-0">
              <div className="text-xs text-ink-3">Previous chapter</div>
              <div className="truncate font-medium">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`${base}/${next.slug}`} className="card flex min-w-0 items-center justify-end gap-2 p-4 text-right">
            <div className="min-w-0">
              <div className="text-xs text-ink-3">Next chapter</div>
              <div className="truncate font-medium">{next.title}</div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-ink-3" />
          </Link>
        )}
      </nav>
    </article>
  );
}
