import type { Metadata } from "next";
import { TOPICS } from "@/content/curriculum";
import { Timetable } from "@/components/timetable";

export const metadata: Metadata = { title: "Timetable" };

export default function SchedulePage() {
  const titles = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));
  return <Timetable titles={titles} />;
}
