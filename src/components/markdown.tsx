import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import type { Element, Root, ElementContent } from "hast";
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

/** Turns `> [!PEARL]` blockquotes into styled callouts. */
function rehypeCallouts() {
  const walk = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      if (child.tagName === "blockquote") {
        const p = child.children.find((c): c is Element => c.type === "element" && c.tagName === "p");
        const first = p?.children[0];
        if (p && first?.type === "text") {
          const m = first.value.match(/^\s*\[!([A-Z]+)\]\s*/);
          if (m && m[1] in CALLOUTS) {
            first.value = first.value.slice(m[0].length);
            // Drop a leading line break left behind after the marker.
            if (!first.value.trim()) {
              p.children.shift();
              if ((p.children[0] as ElementContent | undefined)?.type === "element" && (p.children[0] as Element).tagName === "br")
                p.children.shift();
              const next = p.children[0];
              if (next?.type === "text") next.value = next.value.replace(/^\n/, "");
            }
            child.properties = { ...child.properties, dataCallout: m[1] };
          }
        }
      }
      walk(child);
    }
  };
  return (tree: Root) => walk(tree);
}

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
