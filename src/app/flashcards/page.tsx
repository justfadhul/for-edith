import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { FlashcardsHub } from "@/components/flashcards-hub";

export const metadata: Metadata = { title: "Flashcards" };

export default function FlashcardsPage() {
  return (
    <>
      <PageHeader eyebrow="Spaced repetition" title="Flashcards">
        Cards you find hard come back sooner and easy ones later, so a few minutes a day is enough. Rate yourself honestly.
      </PageHeader>
      <FlashcardsHub />
    </>
  );
}
