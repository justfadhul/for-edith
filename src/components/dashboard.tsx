"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Check, ChevronRight, Flame, Layers, ListChecks, Stethoscope, BookOpen } from "lucide-react";
import { WEEK_THEMES, WEEKS, type Session } from "@/content/curriculum";
import type { TopicSummary } from "@/lib/types";
import { useStudy, type StudyState } from "@/lib/store/study-store";
import { cardsDue, quizAccuracy, studyStreak } from "@/lib/store/selectors";
import { addDays, formatDay, rotationInfo, toISODate } from "@/lib/dates";
import { useNow } from "@/lib/use-now";
import { parseTimeRange, topicPrep } from "@/lib/prep";
import { effectiveSessions } from "@/lib/schedule";

interface CaseLink {
  id: string;
  title: string;
  slug: string;
  topicTitle: string;
  steps: number;
}

const MODE_LABEL: Record<string, string> = { Lecture: "Lecture", Tutorial: "Tutorial", "Skills session": "Skills session", "Bedside teaching": "Bedside teaching" };

export function Dashboard({ topics, sessions, cases }: { topics: TopicSummary[]; sessions: Session[]; cases: CaseLink[] }) {
  const { state, hydrated } = useStudy();
  const now = useNow();
  const info = rotationInfo(state.settings.rotationStart, now);
  const done = topics.filter((t) => state.topics[t.slug]?.status === "done").length;
  const totalCards = topics.reduce((n, t) => n + t.counts.flashcards, 0);
  const seenCards = Object.keys(state.cards).length;
  const due = hydrated ? cardsDue(state, now || undefined) : 0;
  const acc = quizAccuracy(state);
  const streak = studyStreak(state);
  const bySlug = Object.fromEntries(topics.map((t) => [t.slug, t]));
  const name = state.settings.displayName || "Edith";

  // ── Up next: the next teaching session with a topic, else something to revise ──
  const hourNow = now ? new Date(now).getHours() + new Date(now).getMinutes() / 60 : 0;
  const teaching = effectiveSessions(sessions, state.overrides)
    .filter((s) => s.topic && !s.ghostOf)
    .map((s) => ({ ...s, ...parseTimeRange(s.time) }))
    .sort((a, b) => a.day - b.day || a.start - b.start);
  const upcoming = teaching.filter((s) => s.day > info.dayIndex || (s.day === info.dayIndex && s.end > hourNow));
  const nextSession = info.phase === "after" ? null : upcoming[0] ?? null;
  const thenSession = nextSession ? upcoming.find((s) => s !== nextSession && s.day === nextSession.day) : null;
  const fallback =
    topics.find((t) => state.topics[t.slug]?.status === "in_progress") ?? topics.find((t) => state.topics[t.slug]?.status !== "done") ?? topics[0];
  const focusTopic = nextSession ? bySlug[nextSession.topic!] : fallback;
  const prep = topicPrep(state, focusTopic.slug, focusTopic.counts);

  const sessionWhen = nextSession
    ? nextSession.day === info.dayIndex
      ? `Up next · ${nextSession.time.split("–")[0]}`
      : nextSession.day === info.dayIndex + 1
        ? `Tomorrow · ${nextSession.time.split("–")[0]}`
        : `${formatDay(addDays(info.start, nextSession.day), { weekday: "short", day: "numeric", month: "short" })} · ${nextSession.time.split("–")[0]}`
    : state.topics[focusTopic.slug]?.status === "in_progress"
      ? "Continue studying"
      : "Suggested next";

  const nextStep = !prep.steps[0].done
    ? { label: "Start with the notes", href: `/topics/${focusTopic.slug}` }
    : !prep.steps[1].done
      ? { label: prep.cardsSeen ? "Continue with flashcards" : "Start the flashcards", href: `/topics/${focusTopic.slug}#cards` }
      : !prep.steps[2].done
        ? { label: "Answer the MCQs", href: `/topics/${focusTopic.slug}#quiz` }
        : !prep.steps[3].done
          ? { label: "Work through a case", href: `/topics/${focusTopic.slug}#cases` }
          : { label: "Review the notes again", href: `/topics/${focusTopic.slug}` };

  const caseOfDay = cases.length ? cases[Math.floor(now / 86_400_000) % cases.length] : null;
  const todayLabel = now ? formatDay(new Date(now), { weekday: "long", day: "numeric", month: "long" }) : "";

  return (
    <div className="flex flex-col gap-7">
      {/* Greeting */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="text-[13px] text-ink-3">
            {todayLabel}
            {info.phase === "during" && ` · Week ${info.week} of 6`}
          </div>
          <h1 className="h-display !text-[clamp(2.5rem,1.8rem+2.6vw,3.5rem)] !leading-none">
            {greeting(now)}, <em>{name}</em>
          </h1>
          <RotationBar
            info={info}
            hydrated={hydrated}
            weekDone={WEEKS.map((w) => {
              const wt = topics.filter((t) => t.week === w);
              return wt.length ? wt.filter((t) => state.topics[t.slug]?.status === "done").length / wt.length : 0;
            })}
            next={
              nextSession
                ? {
                    href: `/topics/${nextSession.topic}`,
                    title: bySlug[nextSession.topic!]?.title ?? nextSession.title,
                    when:
                      nextSession.day === info.dayIndex
                        ? `today ${nextSession.time.split("–")[0]}`
                        : nextSession.day === info.dayIndex + 1
                          ? `tomorrow ${nextSession.time.split("–")[0]}`
                          : `${formatDay(addDays(info.start, nextSession.day), { weekday: "short", day: "numeric", month: "short" })} ${nextSession.time.split("–")[0]}`,
                    mode: nextSession.mode,
                  }
                : null
            }
          />
        </div>
        <Countdown info={info} done={done} total={topics.length} hydrated={hydrated} />
      </section>

      {/* Up next + side stack */}
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card flex flex-col gap-4 p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 font-medium text-brand-text">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {sessionWhen}
            </span>
            {nextSession?.movedFrom && (
              <Link href="/schedule" className="inline-flex items-center gap-1 rounded-full bg-peach-soft px-2.5 py-0.5 font-medium text-peach-text">
                Rescheduled from {formatDay(addDays(info.start, nextSession.movedFrom.day), { weekday: "short", day: "numeric" })}{" "}
                {nextSession.movedFrom.time.split("–")[0]}
              </Link>
            )}
            {nextSession && (
              <span>
                {MODE_LABEL[nextSession.mode] ?? nextSession.mode}
                {nextSession.faculty && ` · ${nextSession.faculty}`}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Link href={`/topics/${focusTopic.slug}`} className="text-[24px] font-semibold leading-tight tracking-[-0.025em] hover:text-brand sm:text-[26px]">
              {focusTopic.title}
            </Link>
            <p className="line-clamp-2 text-[14.5px] leading-relaxed text-ink-2">{focusTopic.summary}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <PrepTile icon={<BookOpen size={15} />} label="Read notes" done={prep.steps[0].done} value={prep.steps[0].done ? `${focusTopic.readMinutes} min · done` : `${focusTopic.readMinutes} min read`} />
            <PrepTile
              icon={<Layers size={15} />}
              label="Flashcards"
              done={prep.steps[1].done}
              value={`${prep.cardsSeen} of ${focusTopic.counts.flashcards}`}
              progress={focusTopic.counts.flashcards ? prep.cardsSeen / focusTopic.counts.flashcards : 0}
              active={prep.steps[0].done && !prep.steps[1].done}
            />
            <PrepTile
              icon={<ListChecks size={15} />}
              label="MCQs"
              done={prep.steps[2].done}
              value={prep.answered ? `${prep.correct}/${prep.answered} correct` : `${focusTopic.counts.mcqs} questions`}
              progress={focusTopic.counts.mcqs ? prep.answered / focusTopic.counts.mcqs : 0}
              active={prep.steps[1].done && !prep.steps[2].done}
            />
            <PrepTile
              icon={<Stethoscope size={15} />}
              label="Cases"
              done={prep.steps[3].done}
              value={prep.casesDone ? `${prep.casesDone} of ${focusTopic.counts.cases} done` : `${focusTopic.counts.cases} to work through`}
              active={prep.steps[2].done && !prep.steps[3].done}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={nextStep.href} className="btn btn-primary">
              {nextStep.label}
              <ArrowRight size={16} />
            </Link>
            <Link href={`/topics/${focusTopic.slug}#management`} className="btn btn-outline">
              Jump to management
            </Link>
            {thenSession && (
              <span className="text-[12.5px] text-ink-3 sm:ml-auto">
                Then at {thenSession.time.split("–")[0]} · {bySlug[thenSession.topic!]?.title}
              </span>
            )}
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <article className="card flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-brand-soft text-brand">
                <Layers size={14} />
              </span>
              Reviews due
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{hydrated ? due : "–"}</span>
              <span className="text-[13px] text-ink-2">
                {due ? `cards · about ${Math.max(1, Math.round(due / 3))} min` : `all caught up · ${Math.max(0, totalCards - seenCards)} new`}
              </span>
            </div>
            <Link href="/flashcards" className="btn btn-pink">
              {due ? "Start review" : "Learn new cards"}
            </Link>
          </article>
          <StreakCard state={state} now={now} streak={streak} acc={acc} />
        </div>
      </section>

      {/* Six weeks table */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center">
          <h2 className="h-section">Your six weeks</h2>
          <Link href="/topics" className="ml-auto text-[13px] font-medium text-ink-2 hover:text-brand">
            All {topics.length} topics →
          </Link>
        </div>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[64px_minmax(0,1fr)_96px] gap-3 border-b border-line bg-surface-2/60 px-4 py-2.5 text-[12px] font-medium text-ink-3 sm:grid-cols-[80px_minmax(0,1fr)_110px_200px_110px] sm:gap-4 sm:px-5">
            <span>Week</span>
            <span>Theme</span>
            <span className="hidden sm:block">Topics</span>
            <span>Progress</span>
            <span className="hidden sm:block">Status</span>
          </div>
          {WEEKS.map((w) => {
            const wt = topics.filter((t) => t.week === w);
            const wd = wt.filter((t) => state.topics[t.slug]?.status === "done").length;
            const current = info.week === w;
            const past = info.week !== null ? w < info.week : info.phase === "after";
            const status =
              wd === wt.length
                ? { label: "Complete", cls: "bg-good-soft text-good" }
                : current
                  ? { label: "This week", cls: "bg-brand text-white" }
                  : wd > 0 || past
                    ? { label: `${wt.length - wd} left`, cls: "bg-lilac-soft text-lilac-text" }
                    : { label: "Upcoming", cls: "bg-surface-2 text-ink-2" };
            return (
              <Link
                key={w}
                href={`/topics#week-${w}`}
                className={clsx(
                  "grid grid-cols-[64px_minmax(0,1fr)_96px] items-center gap-3 border-b border-line/70 px-4 py-3 text-[13.5px] last:border-0 hover:bg-surface-2/60 sm:grid-cols-[80px_minmax(0,1fr)_110px_200px_110px] sm:gap-4 sm:px-5",
                  current && "bg-brand-soft/40",
                )}
              >
                <span className={clsx("font-semibold", current && "text-brand-text")}>Week {w}</span>
                <span className={clsx("truncate", current && "font-medium")}>{WEEK_THEMES[w]}</span>
                <span className="hidden text-ink-2 sm:block">{wt.length} topics</span>
                <span className="h-[5px] rounded-full bg-surface-3">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(wd / wt.length) * 100}%` }} />
                </span>
                <span className={clsx("hidden justify-self-start rounded-md px-2 py-0.5 text-[12px] font-medium sm:block", status.cls)}>{status.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {caseOfDay && (
        <Link href={`/cases/${caseOfDay.id}`} className="card group flex items-center gap-4 p-4 sm:px-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent">
            <Stethoscope size={18} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[12px] text-ink-3">Case of the day · {caseOfDay.topicTitle}</span>
            <span className="truncate text-[15px] font-semibold tracking-[-0.01em] group-hover:text-brand">{caseOfDay.title}</span>
          </span>
          <span className="hidden text-[13px] text-ink-2 sm:block">{caseOfDay.steps} steps</span>
          <ChevronRight size={16} className="text-ink-3" />
        </Link>
      )}

      <p className="text-center text-xs text-ink-3">Made with 💗 for Edith. A study aid, not a substitute for clinical supervision or local protocols.</p>
    </div>
  );
}

function greeting(now: number) {
  if (!now) return "Hello";
  const h = new Date(now).getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Six week segments filling as the rotation goes by (or by topics done afterwards), plus the next session. */
function RotationBar({
  info,
  hydrated,
  weekDone,
  next,
}: {
  info: ReturnType<typeof rotationInfo>;
  hydrated: boolean;
  weekDone: number[];
  next: { href: string; title: string; when: string; mode: string } | null;
}) {
  const byTime = info.phase !== "after";
  const fill = (i: number) =>
    !hydrated ? 0 : byTime ? Math.min(1, Math.max(0, (info.dayIndex + 1 - i * 7) / 5)) : weekDone[i];
  const label =
    info.phase === "before"
      ? `Starts in ${-info.dayIndex} day${info.dayIndex === -1 ? "" : "s"}`
      : info.phase === "during"
        ? `Day ${Math.min(40, info.dayIndex + 1)} of 40`
        : "Rotation complete · topics revised";
  return (
    <div className="flex max-w-xl flex-col gap-2 pt-1">
      <div className="grid grid-cols-6 gap-1.5" role="img" aria-label={label}>
        {weekDone.map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${fill(i) * 100}%` }} />
            </div>
            <span className={clsx("text-[11px] tabular-nums", info.week === i + 1 ? "font-semibold text-brand-text" : "text-ink-3")}>W{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 text-[13px] text-ink-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
        <span className="font-medium text-ink">{label}</span>
        {next && (
          <>
            <span className="hidden text-ink-3 sm:inline">·</span>
            <Link href={next.href} className="inline-flex min-w-0 items-center gap-1.5 hover:text-brand">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Next: <span className="truncate font-medium text-ink">{next.title}</span>
              <span className="text-ink-3">
                {next.when} · {next.mode}
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function Countdown({ info, done, total, hydrated }: { info: ReturnType<typeof rotationInfo>; done: number; total: number; hydrated: boolean }) {
  const pct = hydrated ? done / total : 0;
  return (
    <div className="flex items-center gap-3.5 self-start rounded-[14px] border border-line bg-surface px-4 py-3.5 md:self-auto">
      <div className="grid h-[52px] w-[52px] place-items-center rounded-full" style={{ background: `conic-gradient(var(--brand) 0 ${pct * 100}%, var(--surface-3) ${pct * 100}% 100%)` }}>
        <div className="grid h-[42px] w-[42px] place-items-center rounded-full bg-surface text-[13px] font-semibold tabular-nums">{Math.round(pct * 100)}%</div>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="text-[13px] font-semibold">{info.phase === "before" ? "Rotation starts" : info.phase === "during" ? "Progressive test" : "Rotation complete"}</div>
        <div className="text-[13px] text-ink-2">
          {info.phase === "before" && (
            <>
              in <b className="font-semibold text-ink">{-info.dayIndex} days</b> ·{" "}
            </>
          )}
          {info.phase === "during" && (
            <>
              {info.daysToTest > 0 ? (
                <>
                  in <b className="font-semibold text-ink">{info.daysToTest} days</b> ·{" "}
                </>
              ) : (
                <b className="font-semibold text-ink">today · </b>
              )}
            </>
          )}
          {done}/{total} topics done
        </div>
      </div>
    </div>
  );
}

function PrepTile({ icon, label, value, done, progress, active }: { icon: React.ReactNode; label: string; value: string; done: boolean; progress?: number; active?: boolean }) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2 rounded-xl border p-3",
        done ? "border-line bg-surface-2/60" : active ? "border-brand-line bg-brand-soft/40" : "border-line",
      )}
    >
      <div className={clsx("flex items-center gap-1.5 text-[12.5px]", done ? "text-ink-2" : active ? "text-brand-text" : "text-ink-2")}>
        {done ? <Check size={15} className="text-good" strokeWidth={2.4} /> : icon}
        {label}
      </div>
      <div className="text-[13px] font-medium">{value}</div>
      {progress !== undefined && !done && progress > 0 && (
        <div className="h-1 rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(1, progress) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

function StreakCard({ state, now, streak, acc }: { state: StudyState; now: number; streak: number; acc: number | null }) {
  // Activity per day for the last 7 days.
  const counts = new Map<string, number>();
  const bump = (iso?: string) => {
    if (!iso) return;
    const k = toISODate(new Date(iso));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  };
  Object.values(state.cards).forEach((x) => bump(x.updatedAt));
  Object.values(state.questions).forEach((x) => bump(x.updatedAt));
  Object.values(state.cases).forEach((x) => bump(x.updatedAt));
  Object.values(state.topics).forEach((x) => bump(x.updatedAt));
  const today = now ? new Date(now) : null;
  const days = today
    ? Array.from({ length: 7 }, (_, i) => {
        const d = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), i - 6);
        return { d, n: counts.get(toISODate(d)) ?? 0, isToday: i === 6 };
      })
    : [];
  const shade = (n: number) => (n === 0 ? "bg-surface-3" : n < 5 ? "bg-brand/35" : n < 15 ? "bg-brand/65" : "bg-brand");
  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-peach-soft text-peach">
          <Flame size={14} />
        </span>
        {streak ? `${streak}-day streak` : "Start a streak today"}
        <span className="ml-auto text-[12.5px] font-normal text-ink-3">{acc === null ? "No MCQs yet" : `MCQ accuracy ${Math.round(acc * 100)}%`}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ d, n, isToday }) => (
          <div key={d.toISOString()} className={clsx("flex flex-col items-center gap-1.5 text-[11px]", isToday ? "font-semibold text-ink" : "text-ink-3")}>
            <div className={clsx("h-[30px] w-full rounded-[7px]", shade(n), isToday && "ring-[1.5px] ring-brand ring-inset")} title={`${n} study actions`} />
            {formatDay(d, { weekday: "narrow" })}
          </div>
        ))}
      </div>
    </article>
  );
}
