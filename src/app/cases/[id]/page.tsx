import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS } from "@/content/curriculum";
import { loadStudy } from "@/lib/content";
import { CaseRunner } from "@/components/case-runner";

export const dynamicParams = false;

function allCases() {
  return TOPICS.flatMap((t) => loadStudy(t.slug).cases.map((c) => ({ c, topic: t })));
}

export function generateStaticParams() {
  const ids = allCases().map(({ c }) => ({ id: c.id }));
  // Next requires at least one param for a static dynamic route.
  return ids.length ? ids : [{ id: "placeholder" }];
}

export async function generateMetadata(props: PageProps<"/cases/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const found = allCases().find(({ c }) => c.id === id);
  return found ? { title: found.c.title } : {};
}

export default async function CasePage(props: PageProps<"/cases/[id]">) {
  const { id } = await props.params;
  const list = allCases();
  const i = list.findIndex(({ c }) => c.id === id);
  if (i < 0) notFound();
  const { c, topic } = list[i];
  const next = list[i + 1];
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-ink-3">
        <Link href="/cases" className="hover:text-brand">
          Cases
        </Link>
        <span>/</span>
        <Link href={`/topics/${topic.slug}`} className="hover:text-brand">
          {topic.title}
        </Link>
      </nav>
      <h1 className="mb-5 font-serif text-3xl font-semibold leading-tight">{c.title}</h1>
      <CaseRunner c={c} topic={topic.slug} />
      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Link href={`/topics/${topic.slug}`} className="btn btn-outline">
          Read the topic notes
        </Link>
        {next && (
          <Link href={`/cases/${next.c.id}`} className="btn btn-primary">
            Next case →
          </Link>
        )}
      </div>
    </div>
  );
}
