#!/usr/bin/env node
// Validates every topic in content/topics against CONTENT_GUIDE.md.
// Usage: npm run validate [-- slug1 slug2 ...]   (--strict fails on missing topics)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { studySchema, frontmatterSchema } from "../src/lib/content-schema.mjs";
import { topicHash, quickRefHash, readManifest } from "./pdf/hash.mjs";
import { TOPICS } from "../src/content/curriculum.ts";

const root = path.resolve(import.meta.dirname, "..");
const curriculum = fs.readFileSync(path.join(root, "src/content/curriculum.ts"), "utf8");
const topicBlock = curriculum.slice(0, curriculum.indexOf("export const TOPIC_BY_SLUG"));
const allSlugs = [...topicBlock.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const only = args.filter((a) => !a.startsWith("--"));
const slugs = only.length ? only : allSlugs;

const MIN = { flashcards: 20, mcqs: 12, cases: 2, references: 5, caseSteps: 4 };
const REQUIRED_HEADINGS = [
  [/nutshell/i, "## In a nutshell"],
  [/clinical acumen/i, "## Clinical acumen"],
  [/management|procedure/i, "## Management"],
  [/clinical workup/i, "## Clinical workup"],
  [/high-yield summary/i, "## High-yield summary"],
];

let errors = 0;
let warnings = 0;
let missing = 0;
const err = (slug, msg) => (errors++, console.log(`  ✖ [${slug}] ${msg}`));
const warn = (slug, msg) => (warnings++, console.log(`  ⚠ [${slug}] ${msg}`));
const seenIds = new Map();

for (const slug of slugs) {
  if (!allSlugs.includes(slug)) {
    err(slug, "unknown slug (not in src/content/curriculum.ts)");
    continue;
  }
  const dir = path.join(root, "content/topics", slug);
  const notesPath = path.join(dir, "notes.md");
  const studyPath = path.join(dir, "study.json");
  if (!fs.existsSync(notesPath) && !fs.existsSync(studyPath)) {
    missing++;
    if (strict || only.length) err(slug, "topic has no content yet");
    continue;
  }

  // notes.md
  if (!fs.existsSync(notesPath)) err(slug, "missing notes.md");
  else {
    const raw = fs.readFileSync(notesPath, "utf8");
    const { data, content } = matter(raw);
    const fm = frontmatterSchema.safeParse(data);
    if (!fm.success) err(slug, `front-matter: ${fm.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    else if (fm.data.highYield.length < 10) warn(slug, `highYield has ${fm.data.highYield.length} items (want 10–12)`);
    const h2 = [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    for (const [re, label] of REQUIRED_HEADINGS)
      if (!h2.some((h) => re.test(h))) err(slug, `notes.md missing a "${label}" section`);
    const words = content.split(/\s+/).filter(Boolean).length;
    if (words < 1500) warn(slug, `notes.md is only ${words} words (target 2,500–5,000)`);
    if (/<\/?[a-z][^>]*>/i.test(content.replace(/```[\s\S]*?```/g, "")))
      warn(slug, "notes.md appears to contain raw HTML (use Markdown only)");
    const badCallouts = [...content.matchAll(/^> \[!([A-Z]+)\]/gm)]
      .map((m) => m[1])
      .filter((t) => !["PEARL", "REDFLAG", "UGANDA", "DRUG", "EXAM", "NOTE"].includes(t));
    if (badCallouts.length) err(slug, `unknown callout types: ${[...new Set(badCallouts)].join(", ")}`);
  }

  // study.json
  if (!fs.existsSync(studyPath)) err(slug, "missing study.json");
  else {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(studyPath, "utf8"));
    } catch (e) {
      err(slug, `study.json is not valid JSON: ${e.message}`);
      continue;
    }
    const parsed = studySchema.safeParse(json);
    if (!parsed.success) {
      for (const i of parsed.error.issues.slice(0, 15)) err(slug, `study.json ${i.path.join(".")}: ${i.message}`);
      continue;
    }
    const s = parsed.data;
    if (s.slug !== slug) err(slug, `study.json slug "${s.slug}" does not match folder`);
    for (const k of ["flashcards", "mcqs", "cases", "references"])
      if (s[k].length < MIN[k]) err(slug, `${k}: ${s[k].length} (minimum ${MIN[k]})`);
    for (const c of s.cases)
      if (c.steps.length < MIN.caseSteps) err(slug, `case ${c.id} has ${c.steps.length} steps (minimum ${MIN.caseSteps})`);
    for (const item of [...s.flashcards, ...s.mcqs, ...s.cases]) {
      if (seenIds.has(item.id)) err(slug, `duplicate id "${item.id}" (also in ${seenIds.get(item.id)})`);
      seenIds.set(item.id, slug);
    }
    if (s.mcqs.length >= 8) {
      const dist = [0, 0, 0, 0, 0];
      s.mcqs.forEach((q) => dist[q.answer]++);
      if (Math.max(...dist) > s.mcqs.length * 0.5) warn(slug, `MCQ answers are clustered: ${dist.join("/")} (A/B/C/D/E)`);
    }
  }
}

// Downloadable PDFs must match the current content.
const manifest = readManifest();
const stale = TOPICS.filter(
  (t) => slugs.includes(t.slug) && fs.existsSync(path.join(root, "content/topics", t.slug, "notes.md")) && manifest[t.slug] !== topicHash(t.slug, t),
).map((t) => t.slug);
if (!only.length && fs.existsSync(path.join(root, "content/quick-reference.md")) && manifest["quick-reference"] !== quickRefHash()) stale.push("quick-reference");
if (stale.length) err("pdf", `${stale.length} PDF(s) out of date (${stale.join(", ")}). Run \`npm run pdf\` and commit public/pdf.`);

const done = slugs.length - missing;
console.log(`\n${done}/${slugs.length} topics present · ${errors} error(s) · ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
