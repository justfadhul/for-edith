import type { Topic } from "@/content/curriculum";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Mcq {
  id: string;
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: "core" | "advanced";
}

export interface ClinicalCase {
  id: string;
  title: string;
  presentation: string;
  steps: { prompt: string; answer: string }[];
  takeaway: string;
}

export interface Reference {
  title: string;
  source?: string;
  year?: number | string;
  url?: string;
}

export interface StudyData {
  slug: string;
  flashcards: Flashcard[];
  mcqs: Mcq[];
  cases: ClinicalCase[];
  references: Reference[];
}

export interface Heading {
  depth: number;
  text: string;
  id: string;
}

export interface TopicContent {
  topic: Topic;
  summary: string;
  highYield: string[];
  body: string;
  headings: Heading[];
  wordCount: number;
  study: StudyData;
}

export interface TopicSummary extends Topic {
  summary: string;
  highYield: string[];
  hasNotes: boolean;
  readMinutes: number;
  counts: { flashcards: number; mcqs: number; cases: number };
}

export type SearchEntry = {
  slug: string;
  title: string;
  week: number;
  kind: "topic" | "fact" | "section" | "card";
  text: string;
  anchor: string;
};
