# Content guide: For Edith

Every topic lives in `content/topics/<slug>/` and has exactly two files:

| File | Purpose |
|---|---|
| `notes.md` | The study notes (Markdown + GFM tables, with front-matter) |
| `study.json` | Flashcards, single-best-answer MCQs, clinical cases and references |

Slugs come from `src/content/curriculum.ts`. Run `npm run validate` after writing
anything, and fix every error it reports.

The audience is **Edith**, a Year 3 junior clerk at **Uganda Christian University
School of Medicine** on her 6-week Obs & Gyn rotation (Mengo / Uganda setting). The
goal is to help her **understand concepts** and do well on the **ward, in bedside
presentations, OSCEs and the progressive written test**.

## The two priorities: management and clinical acumen

1. **Management must be excellent.** It should be step by step, in the order you would
   actually do things, and name the **drug, dose, route, frequency and duration**.
   Split it by setting where that helps (e.g. health centre III/IV vs regional or
   national referral hospital; before and after delivery; resuscitation, then
   definitive treatment, then follow-up).
2. **Clinical acumen must be taught explicitly**: how an experienced obstetrician
   *thinks*. Cover the focused history questions and why each one matters, the key
   examination findings, red flags, how to tell apart differentials that look alike,
   "what would you do next and why", common student mistakes, and how to present
   the case on a ward round.

## Source hierarchy (cite them)

1. **Uganda Clinical Guidelines 2023** (MoH) and other Uganda MoH documents (ANC,
   eMTCT/HIV consolidated guidelines, EmONC, MPDSR, cervical cancer).
2. WHO recommendations (ANC 2016, intrapartum care 2018, the Labour Care Guide,
   PPH 2012/2023 and E-MOTIVE, pre-eclampsia 2011/2023, MEC for contraception, HBB).
3. RCOG Green-top Guidelines, NICE, ACOG, FIGO, SOGC.
4. Standard textbooks: *Williams Obstetrics*, *Dewhurst's*, *Obstetrics by Ten
   Teachers*, *Gynaecology by Ten Teachers*, *Jeffcoate*, *Hacker & Moore*; StatPearls
   (NCBI Bookshelf) and review articles in the Lancet, BMJ, Cochrane, etc.

Where Uganda practice differs from WHO/UK guidance, **say so explicitly** (use an
`[!UGANDA]` callout). Double-check every dose against at least one guideline. Don't
invent citations; every URL in `references` must be a real page you found.

## `notes.md` format

```markdown
---
title: Postpartum Haemorrhage
summary: One or two sentences, exam-style, that capture the essence of the topic.
highYield:
  - 10–12 one-line must-know facts: numbers, cut-offs, doses, first-line actions (shown as "Must know")
---

## In a nutshell
...
```

### Required H2 sections (in this order)

The validator checks the ones marked ✔ (by keyword); the others are strongly
expected.

1. ✔ `## In a nutshell`: 5–10 lines: what it is, why it matters in Uganda, the one
   thing never to forget.
2. `## Definitions & classification`
3. `## Epidemiology & Uganda context`: burden, local statistics, the realities of
   health facilities.
4. `## Pathophysiology` (or `Anatomy` / `Physiology` / `Principles`, whichever fits):
   explain the *why*, because understanding the mechanism is what makes the
   management stick.
5. ✔ `## Clinical acumen`: subsections `### Focused history`,
   `### Examination`, `### Red flags`, `### Thinking like a clinician` (patterns,
   pitfalls, "if X then think Y").
5b. ✔ `## Clinical workup`: the stepwise ward approach to a patient with this condition, in the order
   you would really do it. Required subsections:
   - `### Step 0: First 5 minutes`: immediate assessment (ABC, vitals, shock index, danger signs), when to
     call for help, and what to start at once.
   - `### Step 1: Focused history`: a checklist; each item says *why* it matters (what answer changes the plan).
   - `### Step 2: Focused examination`: general, then system and obstetric/pelvic, with the key positive
     and negative findings to document.
   - `### Step 3: Bedside tests`: what you can do in minutes on the ward (urine dipstick, Hb/HemoCue, RBS,
     bedside clotting test, pregnancy test, point-of-care ultrasound, CTG/Doppler, partograph).
   - `### Step 4: Laboratory & imaging`: a **table**: Test | When | Expected / abnormal finding | How it
     changes management. Include Ugandan availability (HC IV vs regional/national referral).
   - `### Step 5: Putting it together`: a model one-line summary, problem list and working diagnosis,
     plus one or two worked examples of interpreting results (e.g. a partograph, a CTG, an OGTT, LFTs).
   For skill topics this is the pre-procedure assessment (indications checked, prerequisites, consent,
   equipment check) and the post-procedure checks.
6. `## Differential diagnosis`: a **table** with columns such as Condition /
   Distinguishing features / Key investigation.
7. `## Investigations`: a table: Test / What you are looking for / Why.
8. ✔ `## Management`: the heart of the page. Use `###` subsections, ordered lists of
   steps, and **drug tables** (Drug / Dose / Route / Frequency / Notes).
   Include an algorithm-style numbered flow for emergencies.
9. `## Complications`
10. `## Ward-round & exam pearls`: a model **case presentation / summary line**, likely
    viva questions *with answers*, and OSCE tips.
11. `## Mnemonics & memory aids`
12. ✔ `## High-yield summary`: the last-minute revision page. Required subsections:
    `### Numbers & doses to know` (a table: item / value), `### Classic exam traps` (5–8 bullets:
    the tempting wrong answer and the right one), `### Questions seniors ask` (5–8 Q&As with short
    model answers).

For **skill topics** (`kind: "skill"`: partograph, MVA, instruments/sutures,
vaginal delivery, ventouse, IPC, neonatal resuscitation, history & exam),
adapt the headings: you may replace sections 3–7 with `## Equipment`,
`## Indications & contraindications`, `## Procedure step by step` (numbered), and
`## OSCE checklist` (a checklist table). You must still include `## Clinical acumen`
(judgement calls, when to abandon or escalate, troubleshooting) and a `## Management`
section (e.g. managing complications and aftercare), because the validator requires
both.

### Callouts

Use GitHub-style alert blockquotes. Supported types:

```markdown
> [!PEARL]
> A high-yield clinical pearl.

> [!REDFLAG]
> Danger signs that need urgent action.

> [!UGANDA]
> Local practice, guideline or context note.

> [!DRUG]
> Critical dosing information.

> [!EXAM]
> Commonly examined point / viva favourite.

> [!NOTE]
> Anything else.
```

### Style

- Plain, warm, clear English, written for a bright student rather than a consultant.
  Explain jargon the first time you use it.
- Prefer **tables** and **numbered steps** to walls of text. Bold the key words.
- Length: aim for **2,500–5,000 words** per topic. Be thorough; this is her textbook.
- Use SI units (mmol/L, g/dL as used in Uganda) and Ugandan drug availability
  (e.g. misoprostol, oxytocin, MgSO₄, hydralazine, nifedipine, methyldopa, TLD).
- No HTML and no images. Use Markdown only. You may draw simple ASCII diagrams inside
  fenced code blocks when a picture really helps (e.g. fetal skull diameters).

## `study.json` format

```json
{
  "slug": "postpartum-haemorrhage",
  "flashcards": [
    { "id": "pph-f01", "front": "Question or cue", "back": "Answer (can use **markdown**)" }
  ],
  "mcqs": [
    {
      "id": "pph-q01",
      "stem": "A 28-year-old P3 ... What is the MOST appropriate next step?",
      "options": ["...", "...", "...", "...", "..."],
      "answer": 2,
      "explanation": "Why C is right AND why each distractor is wrong.",
      "difficulty": "core"
    }
  ],
  "cases": [
    {
      "id": "pph-c01",
      "title": "Short title",
      "presentation": "Realistic Ugandan clinical vignette (Mengo / HC IV / regional referral).",
      "steps": [
        { "prompt": "What are your immediate priorities?", "answer": "Model answer (markdown ok)" }
      ],
      "takeaway": "The key lesson."
    }
  ],
  "references": [
    { "title": "Uganda Clinical Guidelines 2023", "source": "Ministry of Health Uganda", "year": 2023, "url": "https://..." }
  ]
}
```

Rules:
- `id`s must be unique and prefixed with a short topic code.
- `answer` is the **0-based index** into `options`, and there must be exactly 5 options.
  Spread correct answers across positions.
- Minimum per topic: **20 flashcards, 12 MCQs, 2 cases (each with ≥4 steps), 5 references.**
  More is better (target 20 / 15 / 3).
- MCQs should be clinical-vignette, single-best-answer style, like the UCU written
  test. At least half must test **management decisions** or **clinical reasoning**,
  not recall. Use `"difficulty": "core"` or `"advanced"`.
- Cases should unfold step by step: presentation, then history to take, then
  examination findings, then differentials, then investigations, then management,
  then complications or follow-up. That rhythm builds acumen.
- JSON must be valid: escape double quotes inside strings and write no trailing commas.
