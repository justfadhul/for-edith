import type { Metadata } from "next";
import { SESSIONS, TOPICS } from "@/content/curriculum";
import { PageHeader } from "@/components/ui";
import { Timetable } from "@/components/timetable";

export const metadata: Metadata = { title: "Timetable" };

export default function SchedulePage() {
  const titles = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));
  return (
    <>
      <PageHeader eyebrow="UCU School of Medicine · Junior Clerkship" title="Rotation timetable">
        Seminars, lectures, tutorials and skills sessions for the 6 weeks. Tap a session to open its study notes. Dates follow the
        rotation start date in Settings.
      </PageHeader>
      <Timetable sessions={SESSIONS} titles={titles} />
    </>
  );
}
