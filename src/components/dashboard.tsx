"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Flame, Layers, ListChecks, Stethoscope, Target, Timer, Zap } from "lucide-react";
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
      <section className="card blush relative overflow-hidden p-5 sm:p-8">
        <div className="dotted pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_90%_at_100%_0%,black,transparent)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="chip !border-brand-line !bg-surface/70 backdrop-blur">
              <Sparkles size={12} className="text-brand" /> Obstetrics &amp; Gynaecology · Junior Clerkship
            </span>
            <h1 className="mt-4 h-display !text-[clamp(2.4rem,1.6rem+3vw,3.5rem)]">
              {greeting(now)}, <em>{name}</em>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">
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
          <div className="hidden sm:block">
            <ProgressRing value={hydrated ? done / topics.length : 0} size={96} label={`${done}/${topics.length} topics`} />
          </div>
          <div className="sm:hidden">
            <div className="mb-1.5 flex justify-between text-[12px] text-ink-2">
              <span>Topics done</span>
              <span className="tabular-nums">
                {done}/{topics.length}
              </span>
            </div>
            <ProgressBar value={hydrated ? done / topics.length : 0} />
          </div>
        </div>
        <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat tone="pink" icon={<Layers size={15} />} label="Cards due" value={hydrated ? `${due}` : "–"} sub={`${Math.max(0, totalCards - seenCards)} new`} href="/flashcards" />
          <Stat tone="lilac" icon={<Target size={15} />} label="Quiz accuracy" value={acc === null ? "–" : `${Math.round(acc * 100)}%`} sub={`${Object.keys(state.questions).length} answered`} href="/quiz" />
          <Stat tone="peach" icon={<Flame size={15} />} label="Study streak" value={hydrated ? `${streak}d` : "–"} sub={streak ? "keep it going 💗" : "start today"} />
          <Stat tone="teal" icon={<Timer size={15} />} label="Mock exam" value="60 min" sub="progressive-test style" href="/quiz?mode=exam" />
        </div>
      </section>

      {/* Prepare for teaching */}
      {focus.length > 0 && (
        <>
          <SectionTitle action={<Link href="/schedule" className="text-[13px] font-medium text-ink-2 hover:text-brand">Full timetable →</Link>}>
            {focusDay === info.dayIndex ? "Today's teaching" : `Next teaching · ${formatDay(focusDate, { weekday: "long", day: "numeric", month: "short" })}`}
          </SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {focus.map((s, i) => {
              const t = topicBySlug[s.topic!];
              return (
                <Link key={i} href={`/topics/${s.topic}`} className="card group flex items-start gap-3 p-4">
                  <div className="w-20 shrink-0 pt-0.5 text-[12px] font-medium tabular-nums text-ink-3">{s.time}</div>
                  <div className="min-w-0 flex-1">
                    <div className="h-card group-hover:text-brand">{s.title}</div>
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
      <div className="mt-4 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        <Action tone="pink" href="/flashcards" icon={<Layers />} title="Review cards" sub="spaced repetition" />
        <Action tone="lilac" href="/quiz" icon={<ListChecks />} title="Practice MCQs" sub="with explanations" />
        <Action tone="teal" href="/cases" icon={<Stethoscope />} title="Clinical cases" sub="step-by-step reasoning" />
        <Action tone="peach" href="/quick-reference" icon={<Zap />} title="Quick reference" sub="doses, scores, criteria" />
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
          <Link href={`/cases/${caseOfDay.id}`} className="card blush group flex items-center gap-4 p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Stethoscope size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-card group-hover:text-brand">{caseOfDay.title}</div>
              <div className="text-[13px] text-ink-3">{caseOfDay.topicTitle}</div>
            </div>
            <ArrowRight className="text-ink-3" size={18} />
          </Link>
        </>
      )}

      {/* Weeks */}
      <SectionTitle action={<Link href="/topics" className="text-[13px] font-medium text-ink-2 hover:text-brand">All topics →</Link>}>Your six weeks</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {WEEKS.map((w) => {
          const wt = topics.filter((t) => t.week === w);
          const wd = wt.filter((t) => state.topics[t.slug]?.status === "done").length;
          const current = info.week === w;
          return (
            <div key={w} className={`card p-4 ${current ? "!border-brand-line shadow-pop" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="chip !border-transparent !bg-brand-soft !text-brand">Week {w}</span>
                    {current && <span className="chip !border-transparent !bg-brand !text-white">Now</span>}
                  </div>
                  <div className="h-card mt-2">{WEEK_THEMES[w]}</div>
                </div>
                <div className="text-[12px] tabular-nums text-ink-3">
                  {wd}/{wt.length}
                </div>
              </div>
              <ProgressBar value={wt.length ? wd / wt.length : 0} className="mt-3" />
              <ul className="-mx-2 mt-2.5 space-y-0.5">
                {wt.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/topics/${t.slug}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13.5px] hover:bg-surface-2">
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
        Made with 💗 for Edith. A study aid, not a substitute for clinical supervision or local protocols.
      </p>
    </div>
  );
}

const TONES = {
  pink: "bg-brand-soft text-brand",
  lilac: "bg-lilac-soft text-lilac",
  peach: "bg-peach-soft text-peach",
  teal: "bg-accent-soft text-accent",
} as const;
type Tone = keyof typeof TONES;

function greeting(now: number) {
  if (!now) return "Hello";
  const h = new Date(now).getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Stat({ icon, label, value, sub, href, tone }: { icon: React.ReactNode; label: string; value: string; sub?: string; href?: string; tone: Tone }) {
  const inner = (
    <>
      <div className="flex items-center gap-2 text-[12px] font-medium text-ink-2">
        <span className={`grid h-6 w-6 place-items-center rounded-md ${TONES[tone]}`}>{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-[26px] font-semibold leading-none tracking-tight tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[12px] text-ink-3">{sub}</div>}
    </>
  );
  const cls = "block rounded-[10px] border border-line bg-surface/80 p-3 backdrop-blur transition";
  return href ? (
    <Link href={href} className={`${cls} hover:border-brand-line hover:bg-surface`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function Action({ href, icon, title, sub, tone }: { href: string; icon: React.ReactNode; title: string; sub: string; tone: Tone }) {
  return (
    <Link href={href} className="card group flex items-center gap-3 p-3.5">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${TONES[tone]} [&_svg]:h-[18px] [&_svg]:w-[18px]`}>{icon}</span>
      <div className="min-w-0">
        <div className="h-card">{title}</div>
        <div className="truncate text-[12px] text-ink-3">{sub}</div>
      </div>
    </Link>
  );
}
