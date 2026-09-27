#!/usr/bin/env node
// Flags MCQ explanations whose "X is correct"-style statements disagree with the answer key.
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve(import.meta.dirname, "../content/topics");
const L = "ABCDE";
let issues = 0, total = 0;
for (const slug of fs.readdirSync(dir)) {
  const f = path.join(dir, slug, "study.json");
  if (!fs.existsSync(f)) continue;
  for (const q of JSON.parse(fs.readFileSync(f, "utf8")).mcqs) {
    total++;
    const e = q.explanation.replace(/[*_]/g, "");
    const key = L[q.answer];
    const claims = [
      ...e.matchAll(/\b(?:answer|option)\s+(?:is\s+)?\(?([A-E])\)?\s+(?:is\s+)?(?:correct|right|the best)/gi),
      ...e.matchAll(/\b(?:correct|best)\s+(?:answer|option|choice)\s+(?:is\s+)?\(?([A-E])\b/gi),
      ...e.matchAll(/(?:^|[.;:!?]\s+|\n)\(?([A-E])\)?\s*(?:\)|:|—|-|–)?\s*(?:is\s+)?(?:correct|right|the (?:single )?best)\b(?!\s+(?:drug|dose|agent|otherwise|in principle|but))/g),
    ];
    const wrong = [...e.matchAll(/(?:^|[.;:!?]\s+|\n)\(?([A-E])\)?\s*(?:\)|:|—|-|–)?\s*(?:is\s+)?(?:wrong|incorrect)\b/g)];
    for (const m of claims) if (m[1] !== key) (issues++, console.log(`${slug} ${q.id}: key ${key}, text "${m[0].trim().slice(0, 50)}"`));
    for (const m of wrong) if (m[1] === key) (issues++, console.log(`${slug} ${q.id}: key ${key} but text calls it wrong: "${m[0].trim().slice(0, 50)}"`));
  }
}
console.log(`${total} MCQs checked, ${issues} possible mismatch(es)`);
process.exit(issues ? 1 : 0);
