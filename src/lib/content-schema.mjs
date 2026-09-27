// Shared schema for topic study material. Plain ESM so the validator script and
// the Next.js app can both import it.
import { z } from "zod";

export const flashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
});

export const mcqSchema = z.object({
  id: z.string().min(1),
  stem: z.string().min(10),
  options: z.array(z.string().min(1)).length(5),
  answer: z.number().int().min(0).max(4),
  explanation: z.string().min(10),
  difficulty: z.enum(["core", "advanced"]).default("core"),
});

export const caseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  presentation: z.string().min(10),
  steps: z
    .array(z.object({ prompt: z.string().min(1), answer: z.string().min(1) }))
    .min(1),
  takeaway: z.string().min(1),
});

export const referenceSchema = z.object({
  title: z.string().min(1),
  source: z.string().optional(),
  year: z.union([z.number(), z.string()]).optional(),
  url: z.string().url().optional(),
});

export const studySchema = z.object({
  slug: z.string(),
  flashcards: z.array(flashcardSchema),
  mcqs: z.array(mcqSchema),
  cases: z.array(caseSchema),
  references: z.array(referenceSchema),
});

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  highYield: z.array(z.string().min(1)).default([]),
});
