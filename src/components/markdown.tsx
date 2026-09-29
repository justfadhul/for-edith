import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { rehypeCallouts } from "@/lib/rehype-callouts.mjs";
import clsx from "clsx";

export const CALLOUTS = {
  PEARL: { label: "Clinical pearl", icon: "💎", cls: "callout-pearl" },
  REDFLAG: { label: "Red flag", icon: "🚩", cls: "callout-redflag" },
  UGANDA: { label: "Uganda context", icon: "🇺🇬", cls: "callout-uganda" },
  DRUG: { label: "Drug dosing", icon: "💊", cls: "callout-drug" },
  EXAM: { label: "Exam favourite", icon: "📝", cls: "callout-exam" },
  NOTE: { label: "Note", icon: "📌", cls: "callout-note" },
} as const;

type CalloutType = keyof typeof CALLOUTS;

const components: Components = {
  table: ({ children }) => (
    <div className="table-wrap">
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  blockquote: ({ node, children }) => {
    const type = node?.properties?.dataCallout as CalloutType | undefined;
    if (!type) return <blockquote>{children}</blockquote>;
    const c = CALLOUTS[type];
    return (
      <aside className={clsx("callout", c.cls)}>
        <div className="callout-title">
          <span aria-hidden>{c.icon}</span> {c.label}
        </div>
        <div className="callout-body">{children}</div>
      </aside>
    );
  },
};

export function Markdown({
  children,
  className,
  headingIds = false,
}: {
  children: string;
  className?: string;
  headingIds?: boolean;
}) {
  return (
    <div className={clsx("prose-edith", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={headingIds ? [rehypeSlug, rehypeCallouts] : [rehypeCallouts]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
