// Content fingerprints for the generated PDFs, shared by build-pdfs and validate-content.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");

/** Bump when the PDF layout changes so every file is regenerated. */
export const PDF_TEMPLATE_VERSION = 1;
export const PDF_DIR = path.join(root, "public/pdf");
export const MANIFEST = path.join(PDF_DIR, "manifest.json");

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

/** Hash of everything that ends up in a topic's PDF. `meta` is the curriculum entry. */
export function topicHash(slug, meta) {
  const dir = path.join(root, "content/topics", slug);
  return crypto
    .createHash("sha256")
    .update(`v${PDF_TEMPLATE_VERSION}\n${JSON.stringify(meta)}\n${read(path.join(dir, "notes.md"))}\n${read(path.join(dir, "study.json"))}`)
    .digest("hex")
    .slice(0, 16);
}

export function quickRefHash() {
  return crypto
    .createHash("sha256")
    .update(`v${PDF_TEMPLATE_VERSION}\n${read(path.join(root, "content/quick-reference.md"))}`)
    .digest("hex")
    .slice(0, 16);
}

export function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}
