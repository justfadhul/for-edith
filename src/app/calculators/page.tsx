import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { DatingCalculator } from "@/components/dating-calculator";

export const metadata: Metadata = { title: "Calculators" };

export default function CalculatorsPage() {
  return (
    <>
      <PageHeader eyebrow="Obstetric dating" title="EDD, WOA & LNMP calculator">
        Work out the expected date of delivery, weeks of amenorrhoea (gestational age) and the LNMP from whichever you know, with the key
        milestones for this pregnancy.
      </PageHeader>
      <DatingCalculator />
    </>
  );
}
