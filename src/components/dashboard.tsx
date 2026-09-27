"use client";

import Link from "next/link";
import { ArrowRight, Flame, Layers, ListChecks, Stethoscope, Target, Timer, Zap } from "lucide-react";
import { WEEK_THEMES, WEEKS, type Session } from "@/content/curriculum";
import type { TopicSummary } from "@/lib/types";
import { useStudy } from "@/lib/store/study-store";
import { cardsDue, quizAccuracy, studyStreak } from "@/lib/store/selectors";
import { addDays, formatDay, rotationInfo } from "@/lib/dates";
import { useNow } from "@/lib/use-now";
import { KindChip, ProgressBar, ProgressRing, SectionTitle, StatusDot } from "@/components/ui";

interface CaseLink {
  id: string;
  title: string;
  slug: string;
  topicTitle: string;
}

export function Dashboard({ topics, sessions, cases }: { topics: TopicSummary[]; sessions: Session[]; cases: CaseLink[] }) {
  const { state, hydrated } = useStudy();
  const now = useNow();
  const info = rotationInfo(state.settings.rotationStart);
  const done = topics.filter((t) => state.topics[t.slug]?.status === "done").length;
  const inProgress = topics.filter((t) => state.topics[t.slug]?.status === "in_progress");
  const bookmarked = topics.filter((t) => state.topics[t.slug]?.bookmarked);
  const totalCards = topics.reduce((n, t) => n + t.counts.flashcards, 0);
  const seenCards = Object.keys(state.cards).length;
  const due = cardsDue(state, now || undefined);
  const acc = quizAccuracy(state);
  const streak = studyStreak(state);
  const topicBySlug = Object.fromEntries(topics.map((t) => [t.slug, t]));

  // Teaching sessions to prepare for: today's, else the next day that has any.
  const teaching = sessions.filter((s) => s.topic);
  let focusDay = info.dayIndex;
  let focus = teaching.filter((s) => s.day === focusDay);
  if (!focus.length && info.phase !== "after") {
    const next = teaching.find((s) => s.day > info.dayIndex);
    if (next) {
      focusDay = next.day;
      focus = teaching.filter((s) => s.day === focusDay);
    }
  }
  const focusDate = addDays(info.start, focusDay);

  const caseOfDay = cases.length ? cases[Math.floor(now / 86_400_000) % cases.length] : null;
  const name = state.settings.displayName || "Edith";

  return (
    <div>
      {/* Hero */}
      <section className="card relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-soft opacity-70" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand">Obstetrics &amp; Gynaecology · Junior Clerkship</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">Hi {name} 👋</h1>
            <p className="mt-2 max-w-xl text-ink-2">
              {info.phase === "before" && <>Your rotation starts in {-info.dayIndex} day{info.dayIndex === -1 ? "" : "s"}. A head start now makes week 1 much easier.</>}
              {info.phase === "during" && (
                <>
                  Week {info.week} of 6: <span className="font-medium text-ink">{WEEK_THEMES[info.week!]}</span>.{" "}
                  {info.daysToTest > 0 ? `${info.daysToTest} days to the progressive written test.` : info.daysToTest === 0 ? "Written test today. You've got this!" : ""}
                </>
              )}
              {info.phase === "after" && <>Rotation timetable complete. Keep revising for end-of-semester exams, or set your own start date in Settings.</>}
            </p>
          </div>
          <ProgressRing value={hydrated ? done / topics.length : 0} size={88} label={`${done}/${topics.length} topics`} />
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<Layers size={18} />} label="Cards due" value={hydrated ? `${due}` : "–"} sub={`${Math.max(0, totalCards - seenCards)} new`} href="/flashcards" />
          <Stat icon={<Target size={18} />} label="Quiz accuracy" value={acc === null ? "–" : `${Math.round(acc * 100)}%`} sub={`${Object.keys(state.questions).length} answered`} href="/quiz" />
          <Stat icon={<Flame size={18} />} label="Study streak" value={hydrated ? `${streak}d` : "–"} sub="keep it going" />
          <Stat icon={<Timer size={18} />} label="Mock exam" value="Timed" sub="progressive-test style" href="/quiz?mode=exam" />
        </div>
      </section>

      {/* Prepare for teaching */}
      {focus.length > 0 && (
        <>
          <SectionTitle action={<Link href="/schedule" className="text-sm font-medium text-brand">Full timetable →</Link>}>
            {focusDay === info.dayIndex ? "Today's teaching" : `Next teaching · ${formatDay(focusDate, { weekday: "long", day: "numeric", month: "short" })}`}
          </SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {focus.map((s, i) => {
              const t = topicBySlug[s.topic!];
              return (
                <Link key={i} href={`/topics/${s.topic}`} className="card group flex items-start gap-3 p-4 transition hover:border-brand">
                  <div className="w-20 shrink-0 text-xs font-semibold text-ink-3">{s.time}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold leading-snug group-hover:text-brand">{s.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                      <span className="chip">{s.mode}</span>
                      {s.faculty && <span>{s.faculty}</span>}
                      {s.presenter && <span>· presenter {s.presenter}</span>}
                    </div>
                    {t && <div className="mt-2 text-sm text-ink-2 line-clamp-2">{t.summary}</div>}
                  </div>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-ink-3 group-hover:text-brand" />
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Action href="/flashcards" icon={<Layers />} title="Review cards" sub="spaced repetition" />
        <Action href="/quiz" icon={<ListChecks />} title="Practice MCQs" sub="with explanations" />
        <Action href="/cases" icon={<Stethoscope />} title="Clinical cases" sub="step-by-step reasoning" />
        <Action href="/quick-reference" icon={<Zap />} title="Quick reference" sub="doses, scores, criteria" />
      </div>

      {(inProgress.length > 0 || bookmarked.length > 0) && (
        <>
          <SectionTitle>Pick up where you left off</SectionTitle>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {[...inProgress, ...bookmarked.filter((b) => !inProgress.includes(b))].map((t) => (
              <Link key={t.slug} href={`/topics/${t.slug}`} className="card w-64 shrink-0 p-4 hover:border-brand">
                <div className="flex items-center gap-2 text-xs text-ink-3">
                  <StatusDot status={state.topics[t.slug]?.status} /> Week {t.week}
                  {state.topics[t.slug]?.bookmarked && <span>· ★ saved</span>}
                </div>
                <div className="mt-1 font-semibold leading-snug">{t.title}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {caseOfDay && (
        <>
          <SectionTitle>Case of the day</SectionTitle>
          <Link href={`/cases/${caseOfDay.id}`} className="card flex items-center gap-4 p-4 hover:border-brand">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Stethoscope />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{caseOfDay.title}</div>
              <div className="text-sm text-ink-3">{caseOfDay.topicTitle}</div>
            </div>
            <ArrowRight className="text-ink-3" size={18} />
          </Link>
        </>
      )}

      {/* Weeks */}
      <SectionTitle action={<Link href="/topics" className="text-sm font-medium text-brand">All topics →</Link>}>Your six weeks</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {WEEKS.map((w) => {
          const wt = topics.filter((t) => t.week === w);
          const wd = wt.filter((t) => state.topics[t.slug]?.status === "done").length;
          const current = info.week === w;
          return (
            <div key={w} className={`card p-4 ${current ? "ring-2 ring-brand" : ""}`}>
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                    Week {w} {current && "· now"}
                  </div>
                  <div className="font-serif text-lg font-semibold leading-snug">{WEEK_THEMES[w]}</div>
                </div>
                <div className="text-sm text-ink-3">
                  {wd}/{wt.length}
                </div>
              </div>
              <ProgressBar value={wt.length ? wd / wt.length : 0} className="mt-3" />
              <ul className="mt-3 space-y-1.5">
                {wt.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/topics/${t.slug}`} className="flex items-center gap-2 rounded-lg py-1 text-sm hover:text-brand">
                      <StatusDot status={state.topics[t.slug]?.status} />
                      <span className="flex-1 leading-snug">{t.title}</span>
                      <KindChip kind={t.kind} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-ink-3">
        Made with love for Edith. A study aid, not a substitute for clinical supervision or local protocols.
      </p>
    </div>
  );
}

function Stat({ icon, label, value, sub, href }: { icon: React.ReactNode; label: string; value: string; sub?: string; href?: string }) {
  const inner = (
    <>
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-3">
        {icon} {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-ink-3">{sub}</div>}
    </>
  );
  const cls = "rounded-xl bg-surface-2 p-3 block";
  return href ? (
    <Link href={href} className={`${cls} hover:ring-1 hover:ring-brand`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function Action({ href, icon, title, sub }: { href: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Link href={href} className="card flex flex-col gap-2 p-4 transition hover:border-brand">
      <div className="text-brand">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-ink-3">{sub}</div>
      </div>
    </Link>
  );
}
