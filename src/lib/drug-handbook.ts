import "server-only";
import { cache } from "react";
import { extractHeadings, loadTopic } from "@/lib/content";
import type { Heading } from "@/lib/types";

export const HANDBOOK_SLUG = "obs-gyn-pharmacology";

export type Tone = "brand" | "lilac" | "peach" | "accent" | "steel";

/** The handbook's chapters. Each takes the H2 sections of notes.md whose titles match. */
const GROUPS: { slug: string; title: string; blurb: string; icon: string; tone: Tone; match: RegExp }[] = [
  { slug: "before-you-prescribe", title: "Before you prescribe", blurb: "How to think about a drug in pregnancy, and the checks before and after every dose.", icon: "clipboard", tone: "steel", match: /nutshell|clinical acumen|clinical workup/i },
  { slug: "magnesium-sulphate", title: "Magnesium sulphate", blurb: "Regimens, dilution maths, R-R-U monitoring, toxicity and calcium gluconate.", icon: "brain", tone: "brand", match: /magnesium/i },
  { slug: "antihypertensives", title: "Antihypertensives", blurb: "Nifedipine, hydralazine, labetalol, methyldopa; aspirin and calcium for prevention.", icon: "heart", tone: "lilac", match: /antihypertensive/i },
  { slug: "tocolytics-steroids", title: "Tocolytics & steroids", blurb: "Buying 48 hours for dexamethasone: nifedipine, indomethacin, β-agonists.", icon: "timer", tone: "peach", match: /tocolytic/i },
  { slug: "uterotonics", title: "Uterotonics & PPH drugs", blurb: "Oxytocin, ergometrine, carboprost, misoprostol, carbetocin, TXA and induction.", icon: "droplet", tone: "brand", match: /uterotonic|tranexamic|cervical ripening/i },
  { slug: "miscarriage-ectopic", title: "Miscarriage, IUFD & ectopic", blurb: "Mifepristone, misoprostol by gestation and methotrexate.", icon: "pill", tone: "peach", match: /miscarriage|ectopic/i },
  { slug: "antibiotics", title: "Antibiotics", blurb: "Safe versus avoid in pregnancy, regimens by indication, gentamicin dosing.", icon: "shield", tone: "accent", match: /antibiotic/i },
  { slug: "antimalarials", title: "Antimalarials", blurb: "IPTp-SP, treatment by trimester and IV artesunate.", icon: "bug", tone: "accent", match: /antimalarial/i },
  { slug: "hiv-emtct", title: "HIV & eMTCT", blurb: "TLD, infant prophylaxis and co-trimoxazole.", icon: "ribbon", tone: "lilac", match: /hiv|emtct/i },
  { slug: "anti-d-supplements", title: "Anti-D, iron & supplements", blurb: "Anti-D by event, FeFo, folic acid doses, deworming and vaccines.", icon: "syringe", tone: "steel", match: /anti-d|haematinic|supplement/i },
  { slug: "contraception-hormones", title: "Contraception & hormones", blurb: "COC, progestogens, IUDs, emergency contraception, fertility drugs, HRT.", icon: "calendar", tone: "lilac", match: /contracepti|hormone/i },
  { slug: "analgesia-anaesthesia", title: "Analgesia & anaesthesia", blurb: "Paracetamol, NSAIDs, opioids, lignocaine maximums, spinal and GA.", icon: "stethoscope", tone: "peach", match: /analgesi|anaesthe/i },
  { slug: "other-medical", title: "Other medical drugs", blurb: "Insulin, heparins, anti-emetics, antiepileptics, thyroid drugs.", icon: "activity", tone: "accent", match: /other medical/i },
  { slug: "drug-safety", title: "Drug safety", blurb: "Teratogens and their windows, breastfeeding, pregnancy pharmacokinetics.", icon: "baby", tone: "brand", match: /drug safety|teratogen/i },
  { slug: "emergencies", title: "Drug emergencies", blurb: "Mg toxicity, hyperstimulation, LA toxicity, anaphylaxis; the emergency boxes.", icon: "siren", tone: "brand", match: /emergenc/i },
  { slug: "revision", title: "Revision", blurb: "Exam pearls, mnemonics and the high-yield dose table.", icon: "sparkles", tone: "lilac", match: /ward-round|mnemonic|high-yield/i },
];

export type DrugGroup = {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  tone: Tone;
  body: string;
  headings: Heading[];
  /** The individual drugs / subsections (H3s). */
  items: Heading[];
};

const clean = (t: string) => t.replace(/^Drug card:\s*/i, "");

const SKIP = /ward pearls|comparison|at a glance/i;

/** The jump list for a chapter: its drugs (H3), or its subsections (H4) when it is about one drug. */
function chapterItems(body: string): Heading[] {
  const all = extractHeadings(body, [3, 4]).filter((h) => !SKIP.test(h.text));
  const h3 = all.filter((h) => h.depth === 3);
  return (h3.length >= 2 ? h3 : all).map((h) => ({ ...h, text: clean(h.text) }));
}

/** Splits the pharmacology notes into chapters. Unmatched sections stay with the previous chapter. */
export const drugHandbook = cache((): DrugGroup[] => {
  const c = loadTopic(HANDBOOK_SLUG);
  if (!c?.body) return [];
  const sections: string[] = [];
  let inCode = false;
  for (const line of c.body.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    if (!inCode && line.startsWith("## ")) sections.push("");
    if (sections.length) sections[sections.length - 1] += line + "\n";
  }
  const bodies = new Map<string, string>();
  let current = GROUPS[0].slug;
  for (const s of sections) {
    const title = s.slice(3, s.indexOf("\n"));
    const g = GROUPS.find((g) => g.match.test(title));
    if (g) current = g.slug;
    bodies.set(current, (bodies.get(current) ?? "") + s);
  }
  return GROUPS.filter((g) => bodies.has(g.slug)).map(({ slug, title, blurb, icon, tone }) => {
    const body = bodies.get(slug)!;
    const headings = extractHeadings(body);
    return {
      slug,
      title,
      blurb,
      icon,
      tone,
      body,
      headings,
      items: chapterItems(body),
    };
  });
});
