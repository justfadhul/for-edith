import "server-only";
import { cache } from "react";
import GithubSlugger from "github-slugger";
import { extractHeadings, loadTopic } from "@/lib/content";
import type { Heading } from "@/lib/types";
import { ROTATIONS } from "@/content/rotations";

/** The Obs & Gyn drug handbook. Each rotation names its own in ROTATIONS (handbookSlug). */
export const HANDBOOK_SLUG = ROTATIONS.obgyn.handbookSlug;

export type Tone = "brand" | "lilac" | "peach" | "accent" | "steel";

type ChapterDef = { slug: string; title: string; blurb: string; icon: string; tone: Tone };
type GroupDef = ChapterDef & { match: RegExp };

/** The Obs & Gyn handbook's chapters. Each takes the H2 sections of notes.md whose titles match. */
const OBS_GROUPS: GroupDef[] = [
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

/** The paediatric handbook's chapters. */
const PAEDS_GROUPS: GroupDef[] = [
  { slug: "before-you-prescribe", title: "Before you prescribe", blurb: "Weight-based dosing, neonatal pharmacology, safe prescriptions and the common errors.", icon: "clipboard", tone: "steel", match: /nutshell|definitions|epidemiology|principles|clinical acumen|clinical workup/i },
  { slug: "antimicrobials", title: "Antimicrobials", blurb: "Amoxicillin, ampicillin, gentamicin, ceftriaxone, cloxacillin, metronidazole and more.", icon: "shield", tone: "accent", match: /antimicrobial/i },
  { slug: "antimalarials", title: "Antimalarials", blurb: "IV and rectal artesunate, ACTs by weight band, quinine.", icon: "bug", tone: "accent", match: /antimalarial/i },
  { slug: "anticonvulsants", title: "Anticonvulsants", blurb: "Diazepam, midazolam, phenobarbital and phenytoin in mg/kg.", icon: "brain", tone: "brand", match: /anticonvulsant/i },
  { slug: "respiratory", title: "Respiratory drugs", blurb: "Salbutamol, ipratropium, steroids, aminophylline, magnesium.", icon: "activity", tone: "lilac", match: /respiratory/i },
  { slug: "fluids-nutrition", title: "Fluids, electrolytes & nutrition", blurb: "ORS, ReSoMal, zinc, dextrose, potassium, F-75/F-100/RUTF.", icon: "droplet", tone: "brand", match: /fluids|electrolyte|nutrition/i },
  { slug: "analgesia", title: "Analgesia & antipyretics", blurb: "Paracetamol, ibuprofen, morphine; why not aspirin.", icon: "stethoscope", tone: "peach", match: /analgesi|antipyretic/i },
  { slug: "resuscitation", title: "Emergency & resuscitation drugs", blurb: "Adrenaline, atropine, naloxone, calcium, bicarbonate.", icon: "heart", tone: "brand", match: /resuscitation drugs/i },
  { slug: "neonatal", title: "Neonatal drugs", blurb: "Vitamin K, caffeine, phenobarbital, antibiotics by postnatal age.", icon: "baby", tone: "peach", match: /neonatal/i },
  { slug: "tb-hiv", title: "TB & HIV drugs", blurb: "Weight-band dosing for TB treatment, TPT, ART and co-trimoxazole.", icon: "ribbon", tone: "lilac", match: /tb|hiv/i },
  { slug: "vaccines-supplements", title: "Vaccines & supplements", blurb: "Vitamin A, iron, folate, albendazole and the vaccine schedule.", icon: "syringe", tone: "steel", match: /vaccine|supplement/i },
  { slug: "emergencies", title: "Poisoning & drug emergencies", blurb: "Antidotes, toxicity management and the acute-area drug box.", icon: "siren", tone: "brand", match: /poisoning|emergenc|drug box/i },
  { slug: "revision", title: "Revision", blurb: "Exam pearls, mnemonics and the high-yield dose table.", icon: "sparkles", tone: "lilac", match: /ward-round|mnemonic|high-yield/i },
];

/** Chapter groupings by handbook. A handbook without one gets a chapter per H2 section. */
const GROUPINGS: Record<string, GroupDef[]> = {
  [HANDBOOK_SLUG]: OBS_GROUPS,
  [ROTATIONS.paeds.handbookSlug]: PAEDS_GROUPS,
};

const TONES: Tone[] = ["brand", "lilac", "peach", "accent", "steel"];
const ICON_HINTS: [RegExp, string][] = [
  [/emergenc|resus|shock/i, "siren"],
  [/antibiotic|infect|sepsis/i, "shield"],
  [/malaria|worm|parasit/i, "bug"],
  [/hiv|art|antiretro/i, "ribbon"],
  [/fluid|electrolyte|dehydrat/i, "droplet"],
  [/vaccin|immunis|injection/i, "syringe"],
  [/neonat|newborn|baby/i, "baby"],
  [/seizure|convuls|anticonvuls|neuro/i, "brain"],
  [/heart|cardi/i, "heart"],
  [/pain|analges|sedat|anaesthe/i, "stethoscope"],
  [/revision|pearl|mnemonic|high-yield/i, "sparkles"],
  [/principle|nutshell|before|dosing|prescrib/i, "clipboard"],
];

/** Fallback: one chapter per H2 section, titled by its heading. */
function h2Groups(sections: string[]): ChapterDef[] {
  const slugger = new GithubSlugger();
  return sections.map((s, i) => {
    const title = s.slice(3, s.indexOf("\n")).replace(/[*_`]/g, "").trim();
    const firstPara = s
      .split("\n")
      .slice(1)
      .find((l) => l.trim() && !/^[#>|`\-*\d]/.test(l.trim()));
    const blurb = (firstPara ?? "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "").trim();
    return {
      slug: slugger.slug(title),
      title,
      blurb: blurb.length > 140 ? `${blurb.slice(0, 137).trimEnd()}…` : blurb,
      icon: ICON_HINTS.find(([re]) => re.test(title))?.[1] ?? "pill",
      tone: TONES[i % TONES.length],
    };
  });
}

/**
 * Splits a reference topic's notes (a drug handbook) into chapters. Unmatched sections stay
 * with the previous chapter. Returns [] when the topic has no notes yet.
 */
export const drugHandbook = cache((slug: string = HANDBOOK_SLUG): DrugGroup[] => {
  const c = loadTopic(slug);
  if (!c?.body || c.topic.kind !== "reference") return [];
  const sections: string[] = [];
  let inCode = false;
  for (const line of c.body.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    if (!inCode && line.startsWith("## ")) sections.push("");
    if (sections.length) sections[sections.length - 1] += line + "\n";
  }
  const grouping = GROUPINGS[slug];
  const groups: ChapterDef[] = grouping ?? h2Groups(sections);
  const bodies = new Map<string, string>();
  if (!groups.length) return [];
  let current = groups[0].slug;
  sections.forEach((s, i) => {
    const title = s.slice(3, s.indexOf("\n"));
    const g = grouping ? grouping.find((g) => g.match.test(title)) : groups[i];
    if (g) current = g.slug;
    bodies.set(current, (bodies.get(current) ?? "") + s);
  });
  return groups.filter((g) => bodies.has(g.slug)).map(({ slug, title, blurb, icon, tone }) => {
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
