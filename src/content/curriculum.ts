// Curriculum for the UCU Junior Clerkship Obstetrics & Gynaecology rotation
// (Trinity Semester, Year 3 Semester 2). Source: "Final Schedule Y3 Semester 2".

export type TopicKind = "lecture" | "tutorial" | "skill";
export type Discipline = "obstetrics" | "gynaecology" | "skills" | "foundations";

export interface Topic {
  slug: string;
  title: string;
  week: number;
  kind: TopicKind;
  discipline: Discipline;
  /** Lecturer(s)/facilitator(s) from the timetable */
  faculty: string[];
  blurb: string;
}

export const TOPICS: Topic[] = [
  // ── Week 1 ──────────────────────────────────────────────
  {
    slug: "partograph-labour-monitoring",
    title: "Partograph & Labour Monitoring Tools",
    week: 1,
    kind: "skill",
    discipline: "skills",
    faculty: ["Sr Kiggundu", "Dr Nanzira"],
    blurb: "Plotting and interpreting the WHO partograph and the WHO Labour Care Guide.",
  },
  {
    slug: "antenatal-care",
    title: "Antenatal Care & Pregnancy Monitoring",
    week: 1,
    kind: "tutorial",
    discipline: "obstetrics",
    faculty: ["Dr Nsingo"],
    blurb: "Focused ANC contacts, routine screening, IPTp, TT/Td, iron-folate and danger signs.",
  },
  {
    slug: "abortion-post-abortal-care",
    title: "Abortion & Post-Abortion Care",
    week: 1,
    kind: "tutorial",
    discipline: "gynaecology",
    faculty: ["Dr Nassimu"],
    blurb: "Types of abortion, septic abortion, uterine evacuation (MVA/misoprostol) and PAC.",
  },
  {
    slug: "obstetric-history-examination",
    title: "Obstetric & Gynaecological History and Examination",
    week: 1,
    kind: "skill",
    discipline: "skills",
    faculty: ["Dr Mutamba", "Dr Nanzira", "Dr Kaduyu"],
    blurb: "Guided case presentations: general, abdominal and obstetric examination.",
  },
  {
    slug: "anatomy-genital-tract-fetal-skull",
    title: "Anatomy of the Genital Tract & Fetal Skull",
    week: 1,
    kind: "lecture",
    discipline: "foundations",
    faculty: ["Dr Ndiwalana"],
    blurb: "Pelvis, pelvic floor, uterus and adnexa; fetal skull diameters, sutures and fontanelles.",
  },
  {
    slug: "diagnosis-physiological-changes-pregnancy",
    title: "Diagnosis of Pregnancy & Physiological Changes",
    week: 1,
    kind: "lecture",
    discipline: "foundations",
    faculty: ["Prof Mirembe"],
    blurb: "Symptoms, signs and tests of pregnancy; maternal adaptation system by system.",
  },
  {
    slug: "preterm-labour-prom-pprom",
    title: "Preterm Labour, PROM & PPROM",
    week: 1,
    kind: "tutorial",
    discipline: "obstetrics",
    faculty: ["Dr Nassimu"],
    blurb: "Diagnosis, tocolysis, antenatal corticosteroids, antibiotics and timing of delivery.",
  },
  // ── Week 2 ──────────────────────────────────────────────
  {
    slug: "caesarean-section",
    title: "Caesarean Section",
    week: 2,
    kind: "tutorial",
    discipline: "obstetrics",
    faculty: ["Dr Ndiwalana"],
    blurb: "Indications, classification (Robson), technique, complications and VBAC.",
  },
  {
    slug: "intrauterine-fetal-death",
    title: "Intrauterine Fetal Death",
    week: 2,
    kind: "tutorial",
    discipline: "obstetrics",
    faculty: ["Dr Nanzira"],
    blurb: "Causes, confirmation, induction, DIC risk and bereavement care.",
  },
  {
    slug: "mva-kit",
    title: "Manual Vacuum Aspiration (MVA) Kit",
    week: 2,
    kind: "skill",
    discipline: "skills",
    faculty: ["Dr Nsingo", "Dr Kavuma"],
    blurb: "Equipment, indications, procedure, complications and instrument processing.",
  },
  {
    slug: "normal-labour",
    title: "Normal Labour: Diagnosis, Mechanism, Progress & Delivery",
    week: 2,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Nanzira"],
    blurb: "Stages of labour, cardinal movements, AMTSL and immediate newborn care.",
  },
  {
    slug: "puerperium-lactation",
    title: "Puerperium & Lactation",
    week: 2,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Kaduyu"],
    blurb: "Normal puerperal changes, postnatal care, puerperal sepsis and breastfeeding.",
  },
  {
    slug: "infection-prevention-control",
    title: "Infection Prevention & Control in the Clinical Setting",
    week: 2,
    kind: "skill",
    discipline: "skills",
    faculty: ["Sr Kiggundu", "Dr Kaduyu"],
    blurb: "Hand hygiene, PPE, instrument processing, waste segregation and PEP.",
  },
  {
    slug: "ectopic-pregnancy",
    title: "Ectopic Pregnancy",
    week: 2,
    kind: "tutorial",
    discipline: "gynaecology",
    faculty: ["Dr Kavuma"],
    blurb: "Ruptured vs unruptured, resuscitation, laparotomy and medical management.",
  },
  // ── Week 3 ──────────────────────────────────────────────
  {
    slug: "cs-instruments-sutures-asepsis",
    title: "Caesarean Section Instruments, Sutures & Aseptic Technique",
    week: 3,
    kind: "skill",
    discipline: "skills",
    faculty: ["Dr Ndiwalana"],
    blurb: "Identifying the CS set, suture materials and scrubbing, gowning and gloving.",
  },
  {
    slug: "uti-in-pregnancy",
    title: "Urinary Tract Infection in Pregnancy",
    week: 3,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Nanzira"],
    blurb: "Asymptomatic bacteriuria, cystitis and pyelonephritis in pregnancy.",
  },
  {
    slug: "sickle-cell-disease-pregnancy",
    title: "Sickle Cell Disease in Pregnancy",
    week: 3,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Mutamba"],
    blurb: "Preconception, antenatal, intrapartum and crisis management in SCD.",
  },
  {
    slug: "vaginal-delivery-skills",
    title: "Vaginal Delivery: Equipment, Sutures & Simulated Delivery",
    week: 3,
    kind: "skill",
    discipline: "skills",
    faculty: ["Dr Kavuma", "Sr Kiggundu"],
    blurb: "Delivery pack, conducting a delivery, episiotomy and perineal repair.",
  },
  {
    slug: "postpartum-haemorrhage",
    title: "Postpartum Haemorrhage",
    week: 3,
    kind: "tutorial",
    discipline: "obstetrics",
    faculty: ["Dr Kavuma"],
    blurb: "The 4 Ts, the WHO E-MOTIVE bundle, uterotonics, TXA and surgical options.",
  },
  // ── Week 4 ──────────────────────────────────────────────
  {
    slug: "benign-lesions-cervix",
    title: "Benign Lesions of the Cervix",
    week: 4,
    kind: "tutorial",
    discipline: "gynaecology",
    faculty: ["Dr Kaduyu"],
    blurb: "Ectropion, cervicitis, polyps, Nabothian cysts and cervical fibroids.",
  },
  {
    slug: "ventouse-delivery",
    title: "Vacuum Extraction (Ventouse)",
    week: 4,
    kind: "skill",
    discipline: "skills",
    faculty: ["Prof Mirembe"],
    blurb: "Prerequisites, the flexion point, traction technique and complications.",
  },
  {
    slug: "multiple-pregnancy",
    title: "Multiple Pregnancy",
    week: 4,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Ndiwalana"],
    blurb: "Chorionicity, complications (TTTS), antenatal care and delivery of twins.",
  },
  {
    slug: "emoc-safe-motherhood",
    title: "Emergency Obstetric Care & Safe Motherhood",
    week: 4,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Prof Mirembe"],
    blurb: "EmONC signal functions, the three delays, MPDSR and maternal mortality in Uganda.",
  },
  {
    slug: "genital-prolapse",
    title: "Genital Prolapse",
    week: 4,
    kind: "tutorial",
    discipline: "gynaecology",
    faculty: ["Dr Nassimu"],
    blurb: "Pelvic floor support, POP-Q staging, pessaries and surgical repair.",
  },
  {
    slug: "pre-eclampsia-eclampsia",
    title: "Pre-eclampsia & Eclampsia",
    week: 4,
    kind: "tutorial",
    discipline: "obstetrics",
    faculty: ["Dr Nanzira"],
    blurb: "Hypertensive disorders, MgSO4 regimens, antihypertensives and timing of delivery.",
  },
  // ── Week 5 ──────────────────────────────────────────────
  {
    slug: "malignant-lesions-cervix",
    title: "Malignant Lesions of the Cervix",
    week: 5,
    kind: "tutorial",
    discipline: "gynaecology",
    faculty: ["Dr Kaduyu"],
    blurb: "HPV, screening (VIA/HPV), FIGO staging and treatment of cervical cancer.",
  },
  {
    slug: "infertility",
    title: "Infertility",
    week: 5,
    kind: "tutorial",
    discipline: "gynaecology",
    faculty: ["Prof Mirembe"],
    blurb: "Evaluation of the couple: ovulation, tubes, uterus and semen; management.",
  },
  {
    slug: "antepartum-haemorrhage",
    title: "Late Pregnancy Haemorrhage / Antepartum Haemorrhage",
    week: 5,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Kavuma"],
    blurb: "Placenta praevia, abruptio placentae, vasa praevia and uterine rupture.",
  },
  {
    slug: "congenital-malformations-genital-tract",
    title: "Congenital Malformations of the Genital Tract",
    week: 5,
    kind: "lecture",
    discipline: "gynaecology",
    faculty: ["Dr Kaduyu"],
    blurb: "Müllerian anomalies, imperforate hymen, vaginal septa and MRKH syndrome.",
  },
  {
    slug: "neonatal-resuscitation",
    title: "Neonatal Resuscitation",
    week: 5,
    kind: "skill",
    discipline: "skills",
    faculty: ["Dr Nassimu"],
    blurb: "Helping Babies Breathe: the Golden Minute, bag-and-mask ventilation and APGAR.",
  },
  {
    slug: "vvf-rvf",
    title: "Obstetric Fistula (VVF/RVF)",
    week: 5,
    kind: "tutorial",
    discipline: "gynaecology",
    faculty: ["Dr Kavuma"],
    blurb: "Causes, classification, prevention, catheter management and surgical repair.",
  },
  // ── Week 6 ──────────────────────────────────────────────
  {
    slug: "obstructed-labour-malpresentation",
    title: "Obstructed Labour, Malposition & Malpresentation",
    week: 6,
    kind: "tutorial",
    discipline: "obstetrics",
    faculty: ["Dr Mutamba"],
    blurb: "Recognising obstruction, OP position, breech, face, brow, shoulder and cord prolapse.",
  },
  {
    slug: "hiv-in-pregnancy",
    title: "HIV/AIDS in Pregnancy",
    week: 6,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Nsingo"],
    blurb: "eMTCT, ART regimens (TLD), viral load monitoring and infant prophylaxis.",
  },
  {
    slug: "diabetes-in-pregnancy",
    title: "Diabetes Mellitus in Pregnancy",
    week: 6,
    kind: "lecture",
    discipline: "obstetrics",
    faculty: ["Dr Nassimu"],
    blurb: "GDM screening, glycaemic targets, insulin/metformin and intrapartum care.",
  },
];

export const TOPIC_BY_SLUG: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
);

export const WEEKS = [1, 2, 3, 4, 5, 6] as const;

export const WEEK_THEMES: Record<number, string> = {
  1: "Foundations, ANC & early pregnancy",
  2: "Labour, delivery & the puerperium",
  3: "Medical disorders & PPH",
  4: "Hypertension, twins & the pelvic floor",
  5: "Bleeding, cancer & fertility",
  6: "Obstruction, HIV, diabetes & the written test",
};

// ── Timetable ─────────────────────────────────────────────
export type SessionMode =
  | "Lecture"
  | "Tutorial"
  | "Skills session"
  | "Bedside teaching"
  | "Ward round"
  | "Clinical work"
  | "Grand round"
  | "Paediatrics"
  | "Assessment";

export interface Session {
  /** Day offset from the rotation start (Monday of week 1 = 0) */
  day: number;
  time: string;
  title: string;
  mode: SessionMode;
  faculty?: string;
  topic?: string;
}

/** Default rotation start (Monday, 17 Aug 2026) — overridable in Settings. */
export const DEFAULT_START = "2026-08-17";

const CW = "Clinical work (at rotation sites)";

export const SESSIONS: Session[] = [
  // Week I
  { day: 0, time: "8:00–10:00", title: CW, mode: "Clinical work" },
  { day: 0, time: "10:00–12:00", title: "Practical session on the partograph", mode: "Skills session", faculty: "Sr Kiggundu", topic: "partograph-labour-monitoring" },
  { day: 0, time: "14:00–16:00", title: "Antenatal care and pregnancy monitoring", mode: "Tutorial", faculty: "Dr Nsingo", topic: "antenatal-care" },
  { day: 0, time: "16:00–18:00", title: "Abortion & post-abortal care", mode: "Tutorial", faculty: "Dr Nassimu", topic: "abortion-post-abortal-care" },
  { day: 1, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 1, time: "11:00–13:00", title: "Bedside teaching: guided case presentations & abdominal exam", mode: "Bedside teaching", faculty: "Dr Mutamba", topic: "obstetric-history-examination" },
  { day: 1, time: "15:00–16:00", title: "Labour monitoring tool", mode: "Lecture", faculty: "Dr Nanzira", topic: "partograph-labour-monitoring" },
  { day: 2, time: "8:00–10:00", title: CW, mode: "Clinical work" },
  { day: 2, time: "10:00–13:00", title: "Bedside teaching: guided case presentations & obstetric exam", mode: "Bedside teaching", faculty: "Dr Nanzira", topic: "obstetric-history-examination" },
  { day: 2, time: "14:00–18:00", title: "Integrated paediatric lectures", mode: "Paediatrics" },
  { day: 3, time: "8:00–13:00", title: "Major ward round (Mpereza)", mode: "Ward round" },
  { day: 3, time: "14:00–16:00", title: "Anatomy of the genital tract & fetal skull", mode: "Lecture", faculty: "Dr Ndiwalana", topic: "anatomy-genital-tract-fetal-skull" },
  { day: 3, time: "16:00–18:00", title: "Diagnosis of pregnancy & physiological changes in pregnancy", mode: "Lecture", faculty: "Prof Mirembe", topic: "diagnosis-physiological-changes-pregnancy" },
  { day: 4, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 4, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nassimu" },
  { day: 4, time: "14:00–16:00", title: "Preterm labour, PROM, PPROM", mode: "Tutorial", faculty: "Dr Nassimu", topic: "preterm-labour-prom-pprom" },
  // Week II
  { day: 7, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 7, time: "11:00–13:00", title: "Bedside teaching: guided case presentations & general examination", mode: "Bedside teaching", faculty: "Dr Kaduyu", topic: "obstetric-history-examination" },
  { day: 7, time: "14:00–16:00", title: "Caesarean section", mode: "Tutorial", faculty: "Dr Ndiwalana", topic: "caesarean-section" },
  { day: 7, time: "16:00–18:00", title: "Intrauterine fetal death", mode: "Tutorial", faculty: "Dr Nanzira", topic: "intrauterine-fetal-death" },
  { day: 8, time: "8:00–12:00", title: "Ward work (at rotation sites)", mode: "Clinical work" },
  { day: 8, time: "12:00–13:00", title: "MVA kit: equipment, indications, procedure, complications & sterilisation", mode: "Skills session", faculty: "Dr Nsingo / Dr Kavuma", topic: "mva-kit" },
  { day: 8, time: "14:00–18:00", title: "Grand round", mode: "Grand round" },
  { day: 9, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 9, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Mutamba" },
  { day: 9, time: "14:00–18:00", title: "Integrated paediatric lectures", mode: "Paediatrics" },
  { day: 10, time: "8:00–13:00", title: "Major ward round", mode: "Ward round" },
  { day: 10, time: "14:00–16:00", title: "Normal labour: diagnosis, mechanism, progress & delivery", mode: "Lecture", faculty: "Dr Nanzira", topic: "normal-labour" },
  { day: 10, time: "16:00–18:00", title: "Puerperium & lactation", mode: "Lecture", faculty: "Dr Kaduyu", topic: "puerperium-lactation" },
  { day: 11, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 11, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Ndiwalana" },
  { day: 11, time: "14:00–16:00", title: "Practical session on infection control in a clinical setting", mode: "Skills session", faculty: "Sr Kiggundu", topic: "infection-prevention-control" },
  { day: 14, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 14, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Kaduyu" },
  { day: 14, time: "14:00–16:00", title: "Ectopic pregnancy", mode: "Tutorial", faculty: "Dr Kavuma", topic: "ectopic-pregnancy" },
  // Week III
  { day: 15, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 15, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nsingo / Dr Mutamba" },
  { day: 15, time: "14:00–18:00", title: "Grand round", mode: "Grand round" },
  { day: 16, time: "8:00–9:00", title: CW, mode: "Clinical work" },
  { day: 16, time: "9:00–11:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Mutamba" },
  { day: 16, time: "11:00–13:00", title: "Instruments & sutures for caesarean section + aseptic technique", mode: "Skills session", faculty: "Dr Ndiwalana", topic: "cs-instruments-sutures-asepsis" },
  { day: 16, time: "14:00–18:00", title: "Integrated paediatric lectures", mode: "Paediatrics" },
  { day: 17, time: "8:00–13:00", title: "Major ward round", mode: "Ward round" },
  { day: 17, time: "14:00–16:00", title: "UTI in pregnancy", mode: "Lecture", faculty: "Dr Nanzira", topic: "uti-in-pregnancy" },
  { day: 17, time: "16:00–18:00", title: "Sickle cell disease in pregnancy", mode: "Lecture", faculty: "Dr Mutamba", topic: "sickle-cell-disease-pregnancy" },
  { day: 18, time: "8:00–11:00", title: CW, mode: "Clinical work", faculty: "Dr Kaduyu" },
  { day: 18, time: "11:00–13:00", title: "Vaginal delivery (instruments, sutures & equipment) + simulated vaginal delivery", mode: "Skills session", faculty: "Dr Kavuma / Sr Kiggundu", topic: "vaginal-delivery-skills" },
  { day: 18, time: "14:00–16:00", title: "Postpartum haemorrhage", mode: "Tutorial", faculty: "Dr Kavuma", topic: "postpartum-haemorrhage" },
  // Week IV
  { day: 21, time: "8:00–10:00", title: "Teaching round", mode: "Ward round", faculty: "Dr Nassimu" },
  { day: 21, time: "10:00–13:00", title: CW, mode: "Clinical work" },
  { day: 21, time: "14:00–16:00", title: "Benign lesions of the cervix", mode: "Tutorial", faculty: "Dr Kaduyu", topic: "benign-lesions-cervix" },
  { day: 21, time: "16:00–18:00", title: "Practical session on ventouse (principles & simulation)", mode: "Skills session", faculty: "Prof Mirembe", topic: "ventouse-delivery" },
  { day: 22, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 22, time: "12:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nsingo / Dr Kavuma" },
  { day: 22, time: "14:00–18:00", title: "Grand round", mode: "Grand round" },
  { day: 23, time: "8:00–12:00", title: CW, mode: "Clinical work", faculty: "Dr Nanzira" },
  { day: 23, time: "12:00–13:00", title: "Infection prevention & control (practical & simulation)", mode: "Skills session", faculty: "Dr Kaduyu", topic: "infection-prevention-control" },
  { day: 23, time: "14:00–16:00", title: "Integrated paediatric lectures", mode: "Paediatrics" },
  { day: 24, time: "8:00–13:00", title: "Major ward round", mode: "Ward round" },
  { day: 24, time: "14:00–16:00", title: "Multiple pregnancy", mode: "Lecture", faculty: "Dr Ndiwalana", topic: "multiple-pregnancy" },
  { day: 24, time: "16:00–18:00", title: "Emergency obstetric care & safe motherhood", mode: "Lecture", faculty: "Prof Mirembe", topic: "emoc-safe-motherhood" },
  { day: 25, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 25, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Ndiwalana" },
  { day: 25, time: "14:00–16:00", title: "Genital prolapse", mode: "Tutorial", faculty: "Dr Nassimu", topic: "genital-prolapse" },
  { day: 25, time: "14:00–18:00", title: "Pre-eclampsia / eclampsia", mode: "Tutorial", faculty: "Dr Nanzira", topic: "pre-eclampsia-eclampsia" },
  // Week V
  { day: 28, time: "8:00–9:00", title: CW, mode: "Clinical work" },
  { day: 28, time: "9:00–12:00", title: "Teaching round", mode: "Ward round", faculty: "Dr Nassimu" },
  { day: 28, time: "14:00–16:00", title: CW, mode: "Clinical work" },
  { day: 29, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 29, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nsingo / Dr Mutamba" },
  { day: 29, time: "11:00–13:00", title: "Malignant lesions of the cervix", mode: "Tutorial", faculty: "Dr Kaduyu", topic: "malignant-lesions-cervix" },
  { day: 29, time: "14:00–18:00", title: "Infertility", mode: "Tutorial", faculty: "Prof Mirembe", topic: "infertility" },
  { day: 30, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 30, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nanzira" },
  { day: 30, time: "14:00–18:00", title: "Integrated paediatric lectures", mode: "Paediatrics" },
  { day: 31, time: "8:00–13:00", title: "Major ward round", mode: "Ward round" },
  { day: 31, time: "14:00–16:00", title: "Late pregnancy haemorrhage / APH", mode: "Lecture", faculty: "Dr Kavuma", topic: "antepartum-haemorrhage" },
  { day: 31, time: "16:00–18:00", title: "Congenital malformations of the genital tract", mode: "Lecture", faculty: "Dr Kaduyu", topic: "congenital-malformations-genital-tract" },
  { day: 32, time: "8:00–10:00", title: CW, mode: "Clinical work" },
  { day: 32, time: "10:00–12:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nassimu" },
  { day: 32, time: "12:00–13:00", title: "Neonatal resuscitation practical session", mode: "Skills session", faculty: "Dr Nassimu", topic: "neonatal-resuscitation" },
  { day: 32, time: "14:00–16:00", title: "VVF / RVF", mode: "Tutorial", faculty: "Dr Kavuma", topic: "vvf-rvf" },
  // Week VI
  { day: 35, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 35, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Kavuma" },
  { day: 36, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 36, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nsingo / Dr Mutamba" },
  { day: 36, time: "14:00–18:00", title: "Grand round", mode: "Grand round" },
  { day: 37, time: "8:00–11:00", title: CW, mode: "Clinical work" },
  { day: 37, time: "11:00–13:00", title: "Bedside teaching (guided case presentations)", mode: "Bedside teaching", faculty: "Dr Nanzira" },
  { day: 37, time: "14:00–16:00", title: "Obstructed labour, malposition & malpresentation", mode: "Tutorial", faculty: "Dr Mutamba", topic: "obstructed-labour-malpresentation" },
  { day: 38, time: "8:00–13:00", title: "Major ward round", mode: "Ward round" },
  { day: 38, time: "14:00–16:00", title: "HIV/AIDS in pregnancy", mode: "Lecture", faculty: "Dr Nsingo", topic: "hiv-in-pregnancy" },
  { day: 38, time: "16:00–18:00", title: "Diabetes mellitus in pregnancy", mode: "Lecture", faculty: "Dr Nassimu", topic: "diabetes-in-pregnancy" },
  { day: 39, time: "9:00–11:00", title: "PROGRESSIVE WRITTEN TEST", mode: "Assessment", faculty: "Dr Nassimu" },
  { day: 39, time: "12:00–18:00", title: CW, mode: "Clinical work" },
];
