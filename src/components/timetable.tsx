"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { WEEKS, WEEK_THEMES, type Session, type SessionMode } from "@/content/curriculum";
import { useStudy } from "@/lib/store/study-store";
import { addDays, formatDay, rotationInfo } from "@/lib/dates";
import { StatusDot } from "@/components/ui";

const MODE_CLS: Partial<Record<SessionMode, string>> = {
  Lecture: "bg-accent-soft text-accent",
  Tutorial: "bg-brand-soft text-brand",
  "Skills session": "bg-warn-soft text-warn",
  "Bedside teaching": "bg-good-soft text-good",
  Assessment: "bg-bad-soft text-bad",
};

const ROUTINE: SessionMode[] = ["Clinical work", "Paediatrics", "Grand round", "Ward round"];

export function Timetable({ sessions, titles }: { sessions: Session[]; titles: Record<string, string> }) {
  const { state } = useStudy();
  const [teachingOnly, setTeachingOnly] = useState(true);
  const info = rotationInfo(state.settings.rotationStart);
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    todayRef.current?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div>
      <label className="mb-5 inline-flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={teachingOnly} onChange={(e) => setTeachingOnly(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
        Teaching sessions only (hide clinical work, ward rounds &amp; paediatrics)
      </label>
      {WEEKS.map((w) => {
        const days = [0, 1, 2, 3, 4].map((d) => (w - 1) * 7 + d);
        return (
          <section key={w} className="mb-10">
            <h2 className="mb-3 h-section">
              <span className="text-brand">Week {w}</span> · {WEEK_THEMES[w]}
            </h2>
            <div className="space-y-3">
              {days.map((day) => {
                const items = sessions.filter((s) => s.day === day && (!teachingOnly || !ROUTINE.includes(s.mode)));
                if (!items.length) return null;
                const date = addDays(info.start, day);
                const isToday = day === info.dayIndex;
                const past = day < info.dayIndex;
                return (
                  <div
                    key={day}
                    ref={isToday ? todayRef : undefined}
                    className={clsx("card scroll-mt-20 overflow-hidden", isToday && "ring-2 ring-brand", past && "opacity-75")}
                  >
                    <div className={clsx("flex items-center justify-between px-4 py-2 text-sm font-semibold", isToday ? "bg-brand text-brand-ink" : "bg-surface-2")}>
                      <span>{formatDay(date, { weekday: "long", day: "numeric", month: "long" })}</span>
                      {isToday && <span>Today</span>}
                    </div>
                    <ul className="divide-y divide-line">
                      {items.map((s, i) => {
                        const body = (
                          <>
                            <div className="w-24 shrink-0 text-xs font-semibold tabular-nums text-ink-3">{s.time}</div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium leading-snug">{s.title}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                                <span className={clsx("chip", MODE_CLS[s.mode])}>{s.mode}</span>
                                {s.faculty && <span>{s.faculty}</span>}
                                {s.presenter && <span>· {s.presenter}</span>}
                              </div>
                            </div>
                            {s.topic && (
                              <span className="flex items-center gap-1.5 self-center">
                                <StatusDot status={state.topics[s.topic]?.status} />
                                <ChevronRight size={16} className="text-ink-3" />
                              </span>
                            )}
                          </>
                        );
                        return (
                          <li key={i}>
                            {s.topic ? (
                              <Link href={`/topics/${s.topic}`} className="flex gap-3 px-4 py-3 hover:bg-surface-2" title={titles[s.topic]}>
                                {body}
                              </Link>
                            ) : (
                              <div className="flex gap-3 px-4 py-3">{body}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
