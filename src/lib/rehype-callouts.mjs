// Turns `> [!PEARL]` blockquotes into callouts by tagging them with data-callout.
// Shared by the site's <Markdown> and the PDF generator (scripts/build-pdfs.mjs).
export const CALLOUT_TYPES = ["PEARL", "REDFLAG", "UGANDA", "DRUG", "EXAM", "NOTE"];

export function rehypeCallouts() {
  const walk = (node) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      if (child.tagName === "blockquote") {
        const p = child.children.find((c) => c.type === "element" && c.tagName === "p");
        const first = p?.children[0];
        if (p && first?.type === "text") {
          const m = first.value.match(/^\s*\[!([A-Z]+)\]\s*/);
          if (m && CALLOUT_TYPES.includes(m[1])) {
            first.value = first.value.slice(m[0].length);
            // Drop a leading line break left behind after the marker.
            if (!first.value.trim()) {
              p.children.shift();
              if (p.children[0]?.type === "element" && p.children[0].tagName === "br") p.children.shift();
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
  return (tree) => walk(tree);
}
