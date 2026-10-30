// Curriculum for the UCU Junior Clerkship Paediatrics & Child Health rotation (Year 3).
// Six weeks, Monday to Saturday, with the same weekly pattern every week. Edith presents on Tuesdays.
// Shared with Obs & Gyn (and listed there): neonatal-resuscitation, infection-prevention-control.
import type { Session, Topic } from "./curriculum.ts";

type PaedsTopic = Omit<Topic, "rotation">;

const FN = "Dr Nabbale";
const DM = "Dr Mawanda";
const TA = "Dr Aliku";
const BN = "Dr Namugga";
const VN = "Dr Nabatte";
const RM = "Dr Mayega";

const TOPICS: PaedsTopic[] = [
  // ── Week 1 ──────────────────────────────────────────────
  {
    slug: "acute-asthma",
    title: "Acute Asthma",
    week: 1,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [DM],
    blurb: "Grading severity, salbutamol and ipratropium, steroids, magnesium and when to call for help.",
  },
  {
    slug: "upper-respiratory-tract-infections",
    title: "Acute Upper Respiratory Tract Infections",
    week: 1,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [TA],
    blurb: "Common cold, pharyngotonsillitis, otitis media, croup and epiglottitis; when antibiotics help.",
  },
  {
    slug: "malaria-in-children",
    title: "Malaria in Children",
    week: 1,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [BN],
    blurb: "Uncomplicated vs severe malaria, IV artesunate, ACTs, complications and prevention.",
  },
  {
    slug: "lower-respiratory-tract-infections",
    title: "Acute Lower Respiratory Tract Infections",
    week: 1,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [VN],
    blurb: "Pneumonia by IMCI classification, bronchiolitis, oxygen therapy and antibiotic choice.",
  },
  {
    slug: "paeds-history-communication",
    title: "Paediatric History Taking & Communication",
    week: 1,
    kind: "skill",
    discipline: "skills",
    faculty: [FN, RM],
    blurb: "The paediatric history: birth, feeding, immunisation and development, and talking with carers.",
  },
  {
    slug: "paeds-general-examination",
    title: "General Examination & Growth Assessment",
    week: 1,
    kind: "skill",
    discipline: "skills",
    faculty: [DM],
    blurb: "General survey, vital signs by age, anthropometry and plotting growth charts.",
  },
  {
    slug: "paeds-respiratory-ent-exam",
    title: "Respiratory & ENT Examination",
    week: 1,
    kind: "skill",
    discipline: "skills",
    faculty: [DM, VN],
    blurb: "Counting breaths, chest indrawing, auscultation in a crying child, ears and throat.",
  },
  {
    slug: "newborn-examination",
    title: "Examination of the Newborn",
    week: 1,
    kind: "skill",
    discipline: "skills",
    faculty: [FN],
    blurb: "Head-to-toe newborn check, primitive reflexes, gestational age and danger signs.",
  },
  // ── Week 2 ──────────────────────────────────────────────
  {
    slug: "diarrhoea-dehydration",
    title: "Diarrhoea, Vomiting & Dehydration",
    week: 2,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [FN],
    blurb: "Assessing dehydration, WHO Plans A, B and C, ORS, zinc and dysentery.",
  },
  {
    slug: "paediatric-hiv",
    title: "HIV/AIDS in Children",
    week: 2,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [DM],
    blurb: "Early infant diagnosis, WHO staging, paediatric ART, co-trimoxazole and opportunistic infections.",
  },
  {
    slug: "intestinal-worms",
    title: "Intestinal Worms",
    week: 2,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [TA],
    blurb: "Roundworm, hookworm, whipworm, pinworm and schistosomiasis; deworming programmes.",
  },
  {
    slug: "fluids-electrolytes",
    title: "Fluids & Electrolyte Imbalances",
    week: 2,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [BN],
    blurb: "Maintenance fluids by weight, sodium and potassium disorders and safe IV prescribing.",
  },
  {
    slug: "anaemia-blood-transfusion",
    title: "Anaemias & Blood Transfusion",
    week: 2,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [VN],
    blurb: "Causes of anaemia in Ugandan children, sickle cell disease, transfusion thresholds and volumes.",
  },
  {
    slug: "professionalism-ethics-paeds",
    title: "Professionalism & Medical Ethics",
    week: 2,
    kind: "lecture",
    discipline: "foundations",
    faculty: [DM],
    blurb: "Consent and assent, confidentiality, best interests and professional conduct with children.",
  },
  {
    slug: "paeds-cardiovascular-exam",
    title: "Cardiovascular Examination",
    week: 2,
    kind: "skill",
    discipline: "skills",
    faculty: [TA],
    blurb: "Pulses, capillary refill, heart sounds and murmurs, and signs of heart failure in children.",
  },
  {
    slug: "paeds-abdomen-gu-exam",
    title: "Abdominal & Genito-urinary Examination",
    week: 2,
    kind: "skill",
    discipline: "skills",
    faculty: [BN, TA],
    blurb: "Organomegaly, ascites, hernias and the genitalia; examining a frightened child.",
  },
  {
    slug: "paeds-cns-msk-exam",
    title: "CNS & Musculoskeletal Examination",
    week: 2,
    kind: "skill",
    discipline: "skills",
    faculty: ["Prof Karamagi", VN],
    blurb: "Consciousness (Blantyre coma scale), tone, reflexes, meningism, gait and joints.",
  },
  // ── Week 3 ──────────────────────────────────────────────
  {
    slug: "febrile-convulsions",
    title: "Febrile Convulsions",
    week: 3,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [FN],
    blurb: "Simple vs complex seizures, stopping a convulsion, excluding meningitis and counselling parents.",
  },
  {
    slug: "childhood-tuberculosis",
    title: "Tuberculosis in Children",
    week: 3,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [DM],
    blurb: "Contact screening, diagnosis without sputum, paediatric regimens and TB preventive therapy.",
  },
  {
    slug: "agn-nephrotic-syndrome-aki",
    title: "Acute Kidney Injury: AGN & Nephrotic Syndrome",
    week: 3,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [TA],
    blurb: "Nephritic vs nephrotic presentations, fluid restriction, steroids and AKI management.",
  },
  {
    slug: "malnutrition-growth-monitoring",
    title: "Malnutrition & Growth Monitoring",
    week: 3,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [BN],
    blurb: "MUAC and z-scores, SAM with and without complications, F-75, F-100 and RUTF.",
  },
  {
    slug: "meningitis",
    title: "Meningitis",
    week: 3,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [VN],
    blurb: "Recognising meningitis by age, lumbar puncture, CSF findings and empirical antibiotics.",
  },
  {
    slug: "paediatric-emergencies-etat",
    title: "Paediatric Emergencies, Triage & ETAT",
    week: 3,
    kind: "lecture",
    discipline: "paediatrics",
    faculty: [TA],
    blurb: "Emergency triage (ETAT): emergency and priority signs, ABCD, shock, coma and convulsions.",
  },
  // ── Week 4 ──────────────────────────────────────────────
  {
    slug: "prematurity-low-birth-weight",
    title: "Prematurity & Low Birth Weight",
    week: 4,
    kind: "tutorial",
    discipline: "neonatology",
    faculty: [FN],
    blurb: "Thermal care, Kangaroo Mother Care, feeding small babies and the complications of prematurity.",
  },
  {
    slug: "hypoglycaemia-children",
    title: "Hypoglycaemia",
    week: 4,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [DM],
    blurb: "Thresholds in neonates and children, causes, the dextrose bolus and preventing recurrence.",
  },
  {
    slug: "rheumatic-fever-rhd",
    title: "Acute Rheumatic Fever & Rheumatic Heart Disease",
    week: 4,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [TA],
    blurb: "Jones criteria, carditis, benzathine penicillin prophylaxis and heart failure care.",
  },
  {
    slug: "birth-asphyxia-hie",
    title: "Birth Asphyxia & Hypoxic-Ischaemic Encephalopathy",
    week: 4,
    kind: "tutorial",
    discipline: "neonatology",
    faculty: [BN],
    blurb: "Sarnat staging, supportive care, seizures, fluids and prognosis after asphyxia.",
  },
  {
    slug: "cerebral-palsy",
    title: "Cerebral Palsy",
    week: 4,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [VN],
    blurb: "Types and causes, early signs, associated problems and multidisciplinary care.",
  },
  {
    slug: "rational-use-of-investigations",
    title: "Rational Use of Investigations",
    week: 4,
    kind: "lecture",
    discipline: "foundations",
    faculty: [VN],
    blurb: "Choosing tests that change management, interpreting results and avoiding waste.",
  },
  // ── Week 5 ──────────────────────────────────────────────
  {
    slug: "measles",
    title: "Measles",
    week: 5,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [FN],
    blurb: "Clinical stages, complications, vitamin A, isolation and outbreak response.",
  },
  {
    slug: "immunisation",
    title: "Immunisation",
    week: 5,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [DM],
    blurb: "The UNEPI schedule, cold chain, contraindications, AEFIs and catch-up vaccination.",
  },
  {
    slug: "down-syndrome-congenital-anomalies",
    title: "Congenital Abnormalities & Down Syndrome",
    week: 5,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [TA],
    blurb: "Recognising Down syndrome, its associated problems, and other common congenital anomalies.",
  },
  {
    slug: "common-neonatal-disorders",
    title: "Common Neonatal Disorders",
    week: 5,
    kind: "tutorial",
    discipline: "neonatology",
    faculty: [BN],
    blurb: "Neonatal sepsis, jaundice, respiratory distress and feeding problems in the first month.",
  },
  {
    slug: "childhood-cancers",
    title: "Common Cancers in Children",
    week: 5,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [VN],
    blurb: "Burkitt lymphoma, leukaemia, Wilms tumour, retinoblastoma and Kaposi sarcoma; early warning signs.",
  },
  {
    slug: "infant-young-child-feeding",
    title: "Infant & Young Child Feeding",
    week: 5,
    kind: "lecture",
    discipline: "paediatrics",
    faculty: [BN],
    blurb: "Exclusive breastfeeding, complementary feeding from 6 months and feeding in HIV.",
  },
  // ── Week 6 ──────────────────────────────────────────────
  {
    slug: "neonatal-tetanus",
    title: "Neonatal Tetanus",
    week: 6,
    kind: "tutorial",
    discipline: "neonatology",
    faculty: [FN],
    blurb: "Cord care and spores, spasms, sedation, antitoxin, nursing care and maternal Td.",
  },
  {
    slug: "skin-diseases-children",
    title: "Common Skin Diseases",
    week: 6,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [DM],
    blurb: "Scabies, tinea, impetigo, eczema and HIV-related rashes; treatment and prevention.",
  },
  {
    slug: "poisoning-children",
    title: "Common Poisoning",
    week: 6,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [TA],
    blurb: "Paraffin, organophosphates, paracetamol, iron and household chemicals; decontamination and antidotes.",
  },
  {
    slug: "endocrine-disorders-children",
    title: "Common Endocrine Disorders",
    week: 6,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [BN],
    blurb: "Type 1 diabetes and DKA, hypothyroidism, short stature and disorders of puberty.",
  },
  {
    slug: "uti-children",
    title: "Urinary Tract Infections",
    week: 6,
    kind: "tutorial",
    discipline: "paediatrics",
    faculty: [VN],
    blurb: "Diagnosis by age, collecting urine, antibiotics and when to image the urinary tract.",
  },
  {
    slug: "growth-development",
    title: "Growth & Development",
    week: 6,
    kind: "lecture",
    discipline: "paediatrics",
    faculty: [FN],
    blurb: "Normal growth, developmental milestones by domain and recognising delay.",
  },
  {
    slug: "child-survival-uganda",
    title: "Child Survival & Key Interventions in Uganda",
    week: 6,
    kind: "lecture",
    discipline: "paediatrics",
    faculty: [DM],
    blurb: "Under-five mortality, its leading causes and the interventions that save children's lives.",
  },
  {
    slug: "child-rights-protection",
    title: "Child Rights & Violations in Uganda",
    week: 6,
    kind: "lecture",
    discipline: "paediatrics",
    faculty: [BN],
    blurb: "Children's rights in Ugandan law, recognising abuse and neglect, and how to report it.",
  },
  // ── Reference (not a timetabled session) ─────────────────
  {
    slug: "paediatric-pharmacology",
    title: "Prescribing for Children",
    week: 0,
    kind: "reference",
    discipline: "foundations",
    faculty: [VN],
    blurb: "The paediatric drug handbook: weight-based dosing, fluids, antibiotics, antimalarials, ART, emergency drugs and safe prescribing.",
  },
];

export const PAEDS_TOPICS: Topic[] = TOPICS.map((t) => ({ ...t, rotation: "paeds" }));

/** Default rotation start (Monday, 17 Aug 2026), overridable in Settings. */
export const PAEDS_DEFAULT_START = "2026-08-17";

export const PAEDS_WEEK_THEMES: Record<number, string> = {
  0: "Drug handbook & shared skills",
  1: "Breathing, fever & the clinical methods",
  2: "Diarrhoea, fluids, HIV & anaemia",
  3: "Fits, TB, kidneys & nutrition",
  4: "Small babies, sugar & the heart",
  5: "Measles, vaccines & the newborn",
  6: "Tetanus, skin, poisons & hormones",
};

export const PAEDS_WEEK_NOTES: Record<number, string> = {
  1: "Neonatal Unit rotation this week",
  6: "OPD resuscitation room this week",
};

// ── Timetable ─────────────────────────────────────────────
// Tutorials by week, Monday to Friday (Monday of week 1 is the introduction).
const TUTORIALS: [string | null, string, string, string, string][] = [
  [null, "acute-asthma", "upper-respiratory-tract-infections", "malaria-in-children", "lower-respiratory-tract-infections"],
  ["diarrhoea-dehydration", "paediatric-hiv", "intestinal-worms", "fluids-electrolytes", "anaemia-blood-transfusion"],
  ["febrile-convulsions", "childhood-tuberculosis", "agn-nephrotic-syndrome-aki", "malnutrition-growth-monitoring", "meningitis"],
  ["prematurity-low-birth-weight", "hypoglycaemia-children", "rheumatic-fever-rhd", "birth-asphyxia-hie", "cerebral-palsy"],
  ["measles", "immunisation", "down-syndrome-congenital-anomalies", "common-neonatal-disorders", "childhood-cancers"],
  ["neonatal-tetanus", "skin-diseases-children", "poisoning-children", "endocrine-disorders-children", "uti-children"],
];

/** Wednesday integrated paediatric lectures by week. */
const LECTURES: (string | null)[] = [
  null,
  "professionalism-ethics-paeds",
  "paediatric-emergencies-etat",
  "rational-use-of-investigations",
  "infant-young-child-feeding",
  "growth-development",
];

/** Tutorial titles as they appear on the timetable. */
const TUTORIAL_TITLE: Record<string, string> = {
  "acute-asthma": "Acute asthma",
  "upper-respiratory-tract-infections": "Acute URTI",
  "malaria-in-children": "Malaria",
  "lower-respiratory-tract-infections": "Acute LRTI",
  "diarrhoea-dehydration": "Diarrhoea, vomiting & dehydration",
  "paediatric-hiv": "HIV/AIDS",
  "intestinal-worms": "Intestinal worms",
  "fluids-electrolytes": "Fluids & electrolyte imbalances",
  "anaemia-blood-transfusion": "Anaemias & blood transfusion",
  "febrile-convulsions": "Febrile convulsions",
  "childhood-tuberculosis": "Tuberculosis",
  "agn-nephrotic-syndrome-aki": "AKI (AGN, nephrotic syndrome)",
  "malnutrition-growth-monitoring": "Malnutrition & growth monitoring",
  meningitis: "Meningitis",
  "prematurity-low-birth-weight": "Prematurity & LBW",
  "hypoglycaemia-children": "Hypoglycaemia",
  "rheumatic-fever-rhd": "Acute rheumatic fever / RHD",
  "birth-asphyxia-hie": "Birth asphyxia & HIE",
  "cerebral-palsy": "Cerebral palsy",
  measles: "Measles",
  immunisation: "Immunisation",
  "down-syndrome-congenital-anomalies": "Congenital abnormalities (Down syndrome)",
  "common-neonatal-disorders": "Common neonatal disorders",
  "childhood-cancers": "Common cancers in children",
  "neonatal-tetanus": "Neonatal tetanus",
  "skin-diseases-children": "Common skin diseases",
  "poisoning-children": "Common poisoning",
  "endocrine-disorders-children": "Common endocrine disorders",
  "uti-children": "Urinary tract infections",
};

const TITLE_OF = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));
const CLERK = "Clerking patients";
const WORSHIP = "Community worship";
const BEDSIDE = "Bedside teaching";

/** One week of the (identical) weekly pattern. Day offsets: Monday = 0 … Saturday = 5. */
function weekSessions(w: number): Session[] {
  const d = (wd: number) => (w - 1) * 7 + wd;
  const tut = TUTORIALS[w - 1];
  const tutorial = (wd: number, time: string, faculty: string): Session => {
    const topic = tut[wd]!;
    return { day: d(wd), time, title: TUTORIAL_TITLE[topic], mode: "Tutorial", faculty, topic, ...(wd === 1 ? { presenting: true } : {}) };
  };
  const lecture = LECTURES[w - 1];
  const sessions: Session[] = [
    // Monday
    tut[0]
      ? tutorial(0, "8:00–9:30", FN)
      : { day: d(0), time: "8:00–9:00", title: "Introduction: the course, paediatrics & clinical methods", mode: "Tutorial", faculty: "All tutors" },
    { day: d(0), time: "10:00–12:00", title: BEDSIDE, mode: "Bedside teaching", faculty: FN },
    { day: d(0), time: "12:00–13:00", title: BEDSIDE, mode: "Bedside teaching", faculty: FN },
    { day: d(0), time: "14:00–18:00", title: CLERK, mode: "Clinical work" },
    // Tuesday (Edith presents)
    tutorial(1, "8:00–9:30", DM),
    { day: d(1), time: "10:00–12:00", title: "Major ward round / bedside teaching", mode: "Grand round", faculty: `${RM} / ${DM}` },
    { day: d(1), time: "12:00–13:00", title: WORSHIP, mode: "Clinical work" },
    { day: d(1), time: "14:00–18:00", title: CLERK, mode: "Clinical work" },
    // Wednesday
    tutorial(2, "8:00–9:30", TA),
    { day: d(2), time: "10:00–12:00", title: "Ward round", mode: "Ward round" },
    { day: d(2), time: "12:00–13:00", title: BEDSIDE, mode: "Bedside teaching", faculty: TA },
    lecture
      ? { day: d(2), time: "14:00–16:00", title: TITLE_OF[lecture], mode: "Lecture", faculty: TOPICS.find((t) => t.slug === lecture)!.faculty.join(" / "), topic: lecture }
      : { day: d(2), time: "14:00–16:00", title: "Integrated lecture (Paediatrics)", mode: "Lecture" },
    { day: d(2), time: "16:00–18:00", title: CLERK, mode: "Clinical work" },
    // Thursday
    tutorial(3, "8:00–9:30", BN),
    { day: d(3), time: "10:00–12:00", title: BEDSIDE, mode: "Bedside teaching", faculty: BN },
    { day: d(3), time: "12:00–13:00", title: WORSHIP, mode: "Clinical work" },
    { day: d(3), time: "14:00–16:00", title: "Integrated lecture (Obs & Gyn)", mode: "Lecture" },
    { day: d(3), time: "16:00–18:00", title: CLERK, mode: "Clinical work" },
    // Friday
    { day: d(4), time: "8:00–9:30", title: BEDSIDE, mode: "Bedside teaching", faculty: VN },
    { day: d(4), time: "10:00–12:00", title: "Ward round", mode: "Ward round" },
    { day: d(4), time: "12:00–13:00", title: CLERK, mode: "Clinical work" },
    tutorial(4, "14:00–16:00", VN),
    { day: d(4), time: "16:00–18:00", title: BEDSIDE, mode: "Bedside teaching", faculty: VN },
    // Saturday
    { day: d(5), time: "8:00–18:00", title: "Self-directed learning (SDL)", mode: "Self-directed learning" },
  ];
  return sessions.map((s) => ({ ...s, rotation: "paeds" }));
}

export const PAEDS_SESSIONS: Session[] = [1, 2, 3, 4, 5, 6].flatMap(weekSessions);
