import type { z } from "zod";
export const flashcardSchema: z.ZodTypeAny;
export const mcqSchema: z.ZodTypeAny;
export const caseSchema: z.ZodTypeAny;
export const referenceSchema: z.ZodTypeAny;
export const studySchema: z.ZodType<{
  slug: string;
  flashcards: unknown[];
  mcqs: unknown[];
  cases: unknown[];
  references: unknown[];
}>;
export const frontmatterSchema: z.ZodType<{ title: string; summary: string; highYield: string[] }>;
