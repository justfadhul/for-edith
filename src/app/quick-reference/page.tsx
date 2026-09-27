import type { Metadata } from "next";
import { loadQuickReference } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { PageHeader } from "@/components/ui";
import { TableOfContents } from "@/components/topic-view";

export const metadata: Metadata = { title: "Quick reference" };

export default function QuickReferencePage() {
  const qr = loadQuickReference();
  if (!qr)
    return (
      <>
        <PageHeader eyebrow="Ward cheat-sheet" title="Quick reference" />
        <div className="card p-8 text-center text-ink-3">The quick reference is being compiled. Check back soon.</div>
      </>
    );
  return (
    <>
      <PageHeader eyebrow="Ward cheat-sheet" title={qr.title}>
        {qr.summary}
      </PageHeader>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
        <Markdown headingIds className="min-w-0">
          {qr.body}
        </Markdown>
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto">
            <TableOfContents headings={qr.headings} />
          </div>
        </aside>
      </div>
    </>
  );
}
