"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Check, ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { WEEKS, WEEK_THEMES, type Session, type SessionMode } from "@/content/curriculum";
import { useStudy, type StudyState } from "@/lib/store/study-store";
import { addDays, formatDay, rotationInfo } from "@/lib/dates";
import { useNow } from "@/lib/use-now";
import { fmtHour, parseTimeRange } from "@/lib/prep";
import { effectiveSessions, type EffectiveSession } from "@/lib/schedule";
import { RescheduleSheet } from "@/components/reschedule-sheet";

// ── Categories & colours ────────────────────────────────────
type Cat = "lecture" | "tutorial" | "skills" | "bedside" | "rounds" | "assessment" | "routine";

const CAT_OF: Record<SessionMode, Cat> = {
  Lecture: "lecture",
  Tutorial: "tutorial",
  "Skills session": "skills",
  "Bedside teaching": "bedside",
  "Ward round": "rounds",
  "Grand round": "rounds",
  Assessment: "assessment",
  "Clinical work": "routine",
  Paediatrics: "routine",
};

// `tone` names the CSS colour tokens (--x, --x-soft, --x-text) used for the card.
const CATS: { id: Cat; label: string; tone: string; dot: string; muted?: boolean }[] = [
  { id: "lecture", label: "Lectures", tone: "lilac", dot: "bg-lilac" },
  { id: "tutorial", label: "Tutorials", tone: "brand", dot: "bg-brand" },
  { id: "skills", label: "Skills", tone: "peach", dot: "bg-peach" },
  { id: "bedside", label: "Bedside teaching", tone: "accent", dot: "bg-accent" },
  { id: "assessment", label: "Assessment", tone: "ink", dot: "bg-ink" },
  { id: "rounds", label: "Ward rounds", tone: "steel", dot: "bg-steel", muted: true },
  { id: "routine", label: "Clinical work", tone: "ink-3", dot: "bg-line-strong", muted: true },
];
const CAT = Object.fromEntries(CATS.map((c) => [c.id, c])) as Record<Cat, (typeof CATS)[number]>;

/** Visible hour range for a set of sessions (whole hours, at least 08:00–17:00). */
function hourRange(evs: { start: number; end: number }[]) {
  if (!evs.length) return { from: 8, to: 17 };
  return {
    from: Math.min(8, Math.floor(Math.min(...evs.map((e) => e.start)))),
    to: Math.max(17, Math.ceil(Math.max(...evs.map((e) => e.end)))),
  };
}

interface Ev extends EffectiveSession {
  start: number;
  end: number;
  cat: Cat;
  col: number;
  cols: number;
}

/** Place overlapping sessions side by side. */
function layoutDay(items: EffectiveSession[]): Ev[] {
  const evs = items
    .map((s) => ({ ...s, ...parseTimeRange(s.time), cat: CAT_OF[s.mode], col: 0, cols: 1 }))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  let cluster: Ev[] = [];
  let clusterEnd = -1;
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((e) => e.col + 1));
    cluster.forEach((e) => (e.cols = cols));
    cluster = [];
  };
  for (const e of evs) {
    if (e.start >= clusterEnd && cluster.length) flush();
    const used = new Set(cluster.filter((c) => c.end > e.start).map((c) => c.col));
    let col = 0;
    while (used.has(col)) col++;
    e.col = col;
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, e.end);
  }
  flush();
  return evs;
}

export function Timetable({ sessions, titles }: { sessions: Session[]; titles: Record<string, string> }) {
  const { state } = useStudy();
  const now = useNow();
  const info = rotationInfo(state.settings.rotationStart, now);
  const defaultWeek = info.week ?? (info.phase === "before" ? 1 : 6);
  const [week, setWeek] = useState<number | null>(null);
  const w = week ?? defaultWeek;
  const [view, setView] = useState<"week" | "agenda">("week");
  const [hidden, setHidden] = useState<Set<Cat>>(() => new Set<Cat>(["routine"]));
  const todayIdx = info.dayIndex;
  const [pickedDay, setPickedDay] = useState<number | null>(null);
  const days = [0, 1, 2, 3, 4].map((d) => (w - 1) * 7 + d);
  const dayOfWeek = pickedDay !== null && days.includes(pickedDay) ? pickedDay : days.includes(todayIdx) ? todayIdx : days[0];

  const [open, setOpen] = useState<EffectiveSession | null>(null);
  const eff = effectiveSessions(sessions, state.overrides);
  const visible = eff.filter((s) => !hidden.has(CAT_OF[s.mode]));
  const changes = eff.filter((s) => s.movedFrom && (days.includes(s.day) || days.includes(s.movedFrom.day)));
  const byDay: Record<number, Ev[]> = Object.fromEntries(days.map((d) => [d, layoutDay(visible.filter((s) => s.day === d))]));

  const nowH = now ? new Date(now).getHours() + new Date(now).getMinutes() / 60 : -1;
  const weekHours = hourRange(days.flatMap((d) => byDay[d]));
  const first = addDays(info.start, days[0]);
  const last = addDays(info.start, days[4]);
  const range = `${first.getDate()}–${last.getDate()} ${formatDay(last, { month: "short" })}`;
  const live = eff.filter((s) => !s.ghostOf);
  const teachingCount = live.filter((s) => days.includes(s.day) && s.topic).length;
  const toPrepare = live.filter((s) => days.includes(s.day) && s.topic && state.topics[s.topic]?.status !== "done").length;

  const toggle = (c: Cat) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="h-display !text-[clamp(2rem,1.6rem+1.6vw,2.6rem)] !leading-none">
          Week {w} <em>· {range}</em>
        </h1>
        <div className="flex gap-1">
          <button aria-label="Previous week" disabled={w === 1} onClick={() => setWeek(Math.max(1, w - 1))} className="btn btn-outline !min-h-8 !w-8 !p-0">
            <ChevronLeft size={16} />
          </button>
          <button aria-label="Next week" disabled={w === 6} onClick={() => setWeek(Math.min(6, w + 1))} className="btn btn-outline !min-h-8 !w-8 !p-0">
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => {
              setWeek(null);
              setPickedDay(null);
            }}
            className="btn btn-outline !min-h-8 !py-0 text-[13px]"
          >
            Today
          </button>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-[3px] rounded-[10px] bg-surface-3 p-[3px]">
          {(["week", "agenda"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx("h-[30px] rounded-lg px-4 text-[13px] capitalize", view === v ? "bg-surface font-semibold shadow-[0_1px_2px_rgb(0_0_0/0.06)]" : "text-ink-2")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <p className="-mt-2 text-[13.5px] text-ink-2">
        {WEEK_THEMES[w]} · {teachingCount} teaching sessions{toPrepare ? ` · ${toPrepare} still to prepare` : " · all prepared"}
      </p>

      {/* Filters */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {CATS.map((c) => {
          const on = !hidden.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              aria-pressed={on}
              className={clsx(
                "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] transition",
                on ? "bg-surface text-ink shadow-[0_0_0_1px_var(--line)]" : "text-ink-3 hover:text-ink-2",
              )}
            >
              <span className={clsx("h-2 w-2 rounded-full", on ? c.dot : "border border-line-strong bg-transparent")} />
              {c.label}
            </button>
          );
        })}
      </div>

      {changes.length > 0 && (
        <div className="flex flex-col gap-2 rounded-[14px] border border-peach/30 bg-peach-soft px-4 py-3">
          <div className="text-[12.5px] font-semibold text-peach-text">
            {changes.length === 1 ? "1 session rescheduled" : `${changes.length} sessions rescheduled`} this week
          </div>
          {changes.map((c) => (
            <button key={c.key} onClick={() => setOpen(c)} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-left text-[13.5px]">
              <span className="font-medium">{c.topic ? titles[c.topic] ?? c.title : c.title}</span>
              <span className="text-ink-3 line-through">
                {formatDay(addDays(info.start, c.movedFrom!.day), { weekday: "short", day: "numeric", month: "short" })} {c.movedFrom!.time.split("–")[0]}
              </span>
              <ArrowRight size={13} className="text-peach" />
              <span className="font-medium text-peach-text">
                {formatDay(addDays(info.start, c.day), { weekday: "short", day: "numeric", month: "short" })} {c.time.split("–")[0]}
              </span>
              {c.note && <span className="text-ink-3">· {c.note}</span>}
            </button>
          ))}
        </div>
      )}

      {view === "week" ? (
        <>
          {/* Desktop week grid */}
          <div className="card hidden overflow-hidden md:block">
            <div className="grid grid-cols-[56px_repeat(5,minmax(0,1fr))] border-b border-line">
              <div />
              {days.map((d) => {
                const date = addDays(info.start, d);
                const isToday = d === todayIdx;
                return (
                  <div key={d} className="flex items-baseline gap-1.5 border-l border-line px-3 pb-2.5 pt-3">
                    <span className={clsx("text-[12px] font-medium", isToday ? "text-brand-text" : "text-ink-3")}>{formatDay(date, { weekday: "short" })}</span>
                    <span
                      className={clsx(
                        "text-[15px] font-semibold tabular-nums",
                        isToday && "grid h-6 min-w-6 place-items-center rounded-full bg-brand px-1 text-[13px] text-white",
                        !isToday && d < todayIdx && "text-ink-3",
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-[56px_repeat(5,minmax(0,1fr))] py-2">
              <HourGutter from={weekHours.from} to={weekHours.to} hour={60} />
              {days.map((d) => (
                <DayColumn
                  key={d}
                  evs={byDay[d]}
                  from={weekHours.from}
                  to={weekHours.to}
                  hour={60}
                  isToday={d === todayIdx}
                  nowH={nowH}
                  titles={titles}
                  state={state}
                  onOpen={setOpen}
                  start={info.start}
                />
              ))}
            </div>
          </div>

          {/* Phone: week strip + day timeline */}
          <div className="md:hidden">
            <div className="grid grid-cols-5 gap-1.5 border-b border-line pb-3">
              {days.map((d) => {
                const date = addDays(info.start, d);
                const sel = d === dayOfWeek;
                const cats = [...new Set(live.filter((s) => s.day === d && s.topic).map((s) => CAT_OF[s.mode]))];
                return (
                  <button
                    key={d}
                    onClick={() => setPickedDay(d)}
                    className={clsx(
                      "flex h-[62px] flex-col items-center justify-center gap-0.5 rounded-[14px] transition",
                      sel ? "bg-brand text-white shadow-[0_6px_16px_rgb(214_61_120/0.3)]" : d === todayIdx ? "text-brand-text" : "text-ink-2",
                    )}
                  >
                    <span className="text-[11.5px]">{formatDay(date, { weekday: "short" })}</span>
                    <span className="text-[18px] font-semibold">{date.getDate()}</span>
                    <span className="flex h-1 gap-0.5">
                      {cats.map((c) => (
                        <span key={c} className={clsx("h-1 w-1 rounded-full", sel ? "bg-white" : CAT[c].dot)} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center py-3 text-[13px]">
              <span className="font-semibold">{formatDay(addDays(info.start, dayOfWeek), { weekday: "long", day: "numeric", month: "long" })}</span>
              <span className="ml-auto text-ink-3">{byDay[dayOfWeek].length} sessions</span>
            </div>
            <DayList evs={byDay[dayOfWeek]} isToday={dayOfWeek === todayIdx} nowH={nowH} titles={titles} state={state} onOpen={setOpen} start={info.start} />
          </div>
        </>
      ) : (
        <Agenda sessions={visible.filter((s) => !s.ghostOf)} titles={titles} state={state} now={now} />
      )}
      {open && <RescheduleSheet session={open} title={open.topic ? titles[open.topic] ?? open.title : open.title} onClose={() => setOpen(null)} />}
    </div>
  );
}

function HourGutter({ from, to, hour }: { from: number; to: number; hour: number }) {
  return (
    <div className="relative" style={{ height: (to - from) * hour }}>
      {Array.from({ length: to - from + 1 }, (_, i) => (
        <span key={i} className="absolute right-2.5 -translate-y-1/2 text-[11px] tabular-nums text-ink-3" style={{ top: i * hour }}>
          {fmtHour(from + i)}
        </span>
      ))}
    </div>
  );
}

function PrepDot({ status }: { status?: string }) {
  if (status === "done")
    return (
      <span title="Prepared" className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-good text-white">
        <Check size={10} strokeWidth={3} />
      </span>
    );
  if (status === "in_progress")
    return <span title="Studying" className="block h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px] border-lilac bg-[linear-gradient(90deg,var(--lilac)_50%,transparent_50%)]" />;
  return <span title="Not prepared yet" className="block h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px] border-line-strong" />;
}

function DayColumn({
  evs,
  from,
  to,
  hour,
  isToday,
  nowH,
  titles,
  state,
  onOpen,
  start,
  phone = false,
}: {
  evs: Ev[];
  from: number;
  to: number;
  hour: number;
  isToday: boolean;
  nowH: number;
  titles: Record<string, string>;
  state: StudyState;
  onOpen: (s: EffectiveSession) => void;
  start: Date;
  phone?: boolean;
}) {
  const gap = phone ? 0 : 5;
  return (
    <div className={clsx("relative", !phone && "border-l border-line", isToday && !phone && "bg-brand-soft/30")} style={{ height: (to - from) * hour }}>
      {/* hour and half-hour rules */}
      {Array.from({ length: to - from + 1 }, (_, i) => (
        <div key={i} className="pointer-events-none absolute inset-x-0 border-t border-line" style={{ top: i * hour }} />
      ))}
      {Array.from({ length: to - from }, (_, i) => (
        <div key={`h${i}`} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line/60" style={{ top: i * hour + hour / 2 }} />
      ))}

      {evs.map((e, i) => {
        const top = (e.start - from) * hour + 2;
        const height = Math.max(26, (e.end - e.start) * hour - 4);
        const c = CAT[e.cat];
        const title = e.topic ? titles[e.topic] ?? e.title : e.title;
        const live = isToday && nowH >= e.start && nowH < e.end;
        const style: React.CSSProperties = {
          top,
          height,
          left: `calc(${(e.col / e.cols) * 100}% + ${gap}px)`,
          width: `calc(${100 / e.cols}% - ${gap * 2}px)`,
        };
        const compact = height < 56;

        if (e.ghostOf) {
          return (
            <button
              key={i}
              onClick={() => onOpen(e)}
              className="absolute flex flex-col gap-0.5 overflow-hidden rounded-[10px] border border-dashed border-line-strong bg-surface/70 px-2.5 py-1.5 text-left"
              style={style}
            >
              <span className="flex items-center gap-1 text-[11px] text-ink-3">
                <MoveRight size={12} /> Moved to {formatDay(addDays(start, e.ghostOf.day), { weekday: "short", day: "numeric" })} {e.ghostOf.time.split("–")[0]}
              </span>
              {!compact && <span className="line-clamp-2 text-[12.5px] text-ink-3 line-through">{title}</span>}
            </button>
          );
        }

        const assessment = e.cat === "assessment";
        const tone = c.muted
          ? { background: "var(--surface-2)", borderColor: "var(--line)" }
          : assessment
            ? { background: "var(--primary)", borderColor: "var(--primary)" }
            : { background: `var(--${c.tone}-soft)`, borderColor: `color-mix(in srgb, var(--${c.tone}) 24%, transparent)` };
        const body = (
          <>
            <span className={clsx("flex items-center gap-1.5 text-[11.5px] tabular-nums", assessment ? "text-white/70" : "text-ink-2")}>
              {!c.muted && !assessment && <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", c.dot)} />}
              <span className="truncate">{e.time}</span>
              {live && <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold leading-4 text-white">Now</span>}
              {e.movedFrom && <span className="rounded-full bg-peach px-1.5 text-[10px] font-semibold leading-4 text-white">Moved</span>}
              {e.topic && (
                <span className="ml-auto flex">
                  <PrepDot status={state.topics[e.topic]?.status} />
                </span>
              )}
            </span>
            <span
              className={clsx(
                "leading-snug",
                compact ? "line-clamp-1" : "line-clamp-3",
                phone ? "text-[14px]" : "text-[13px]",
                c.muted ? "font-medium text-ink-2" : "font-semibold",
                assessment && "text-white",
              )}
            >
              {title}
            </span>
            {!compact && e.faculty && height > 72 && (
              <span className={clsx("truncate text-[12px]", assessment ? "text-white/70" : "text-ink-3")}>
                {e.faculty}
                {!c.muted && !assessment && ` · ${e.mode === "Skills session" ? "Skills" : e.mode}`}
              </span>
            )}
          </>
        );
        const cls = clsx(
          "absolute flex flex-col gap-0.5 overflow-hidden rounded-[10px] border px-2.5 py-1.5 text-left",
          live && "shadow-pop",
          e.movedFrom && "outline outline-1 outline-offset-1 outline-peach/60",
          e.topic && "transition hover:shadow-card hover:brightness-[0.985]",
        );
        return e.topic ? (
          <button key={i} onClick={() => onOpen(e)} className={cls} style={{ ...style, ...tone }}>
            {body}
          </button>
        ) : (
          <div key={i} className={cls} style={{ ...style, ...tone }}>
            {body}
          </div>
        );
      })}

      {isToday && nowH >= from && nowH <= to && (
        <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: (nowH - from) * hour }}>
          <div className="h-0.5 bg-brand" />
          <div className="absolute -left-1 -top-[4px] h-2.5 w-2.5 rounded-full bg-brand" />
        </div>
      )}
    </div>
  );
}

/** Phone day view: a simple list, so long ward rounds don't fill the screen. */
function DayList({
  evs,
  isToday,
  nowH,
  titles,
  state,
  onOpen,
  start,
}: {
  evs: Ev[];
  isToday: boolean;
  nowH: number;
  titles: Record<string, string>;
  state: StudyState;
  onOpen: (s: EffectiveSession) => void;
  start: Date;
}) {
  if (!evs.length) return <div className="rounded-xl border border-dashed border-line-strong p-8 text-center text-[14px] text-ink-3">No sessions shown for this day.</div>;
  return (
    <ol className="flex flex-col gap-2 pb-2">
      {evs.map((e, i) => {
        const c = CAT[e.cat];
        const title = e.topic ? titles[e.topic] ?? e.title : e.title;
        const live = isToday && nowH >= e.start && nowH < e.end;
        const past = isToday && nowH >= e.end;
        const assessment = e.cat === "assessment";
        const tone = e.ghostOf
          ? { background: "transparent", borderColor: "var(--line-strong)", borderStyle: "dashed" }
          : c.muted
            ? { background: "var(--surface-2)", borderColor: "var(--line)" }
            : assessment
              ? { background: "var(--primary)", borderColor: "var(--primary)" }
              : { background: `var(--${c.tone}-soft)`, borderColor: `color-mix(in srgb, var(--${c.tone}) 24%, transparent)` };
        const content = (
          <>
            <span className={clsx("flex w-[52px] shrink-0 flex-col text-[12.5px] tabular-nums", assessment ? "text-white/80" : "text-ink-2")}>
              <span className="font-semibold">{fmtHour(e.start)}</span>
              <span className={assessment ? "text-white/60" : "text-ink-3"}>{fmtHour(e.end)}</span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1.5">
                {e.ghostOf ? (
                  <span className="text-[12px] text-ink-3">
                    Moved to {formatDay(addDays(start, e.ghostOf.day), { weekday: "short", day: "numeric" })} {e.ghostOf.time.split("–")[0]}
                  </span>
                ) : (
                  <span className={clsx("text-[12px]", assessment ? "text-white/70" : "text-ink-3")}>
                    {e.mode === "Skills session" ? "Skills" : e.mode}
                  </span>
                )}
                {live && <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold leading-4 text-white">Now</span>}
                {e.movedFrom && <span className="rounded-full bg-peach px-1.5 text-[10px] font-semibold leading-4 text-white">Moved</span>}
              </span>
              <span
                className={clsx(
                  "text-[15px] leading-snug",
                  c.muted ? "font-medium text-ink-2" : "font-semibold",
                  assessment && "text-white",
                  e.ghostOf && "!font-normal text-ink-3 line-through",
                )}
              >
                {title}
              </span>
              {e.faculty && !e.ghostOf && <span className={clsx("truncate text-[12.5px]", assessment ? "text-white/70" : "text-ink-3")}>{e.faculty}</span>}
            </span>
            {e.topic && !e.ghostOf && (
              <span className="self-center">
                <PrepDot status={state.topics[e.topic]?.status} />
              </span>
            )}
          </>
        );
        const cls = clsx("flex items-start gap-3 rounded-[12px] border px-3.5 py-3 text-left", live && "shadow-pop", past && "opacity-60");
        return (
          <li key={i}>
            {e.topic ? (
              <button onClick={() => onOpen(e)} className={clsx(cls, "w-full")} style={tone}>
                {content}
              </button>
            ) : (
              <div className={cls} style={tone}>
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Agenda({ sessions, titles, state, now }: { sessions: Session[]; titles: Record<string, string>; state: StudyState; now: number }) {
  const info = rotationInfo(state.settings.rotationStart, now);
  return (
    <div className="flex flex-col gap-8">
      {WEEKS.map((w) => {
        const days = [0, 1, 2, 3, 4].map((d) => (w - 1) * 7 + d);
        return (
          <section key={w}>
            <h2 className="h-section mb-3">
              <span className="text-brand-text">Week {w}</span> · {WEEK_THEMES[w]}
            </h2>
            <div className="flex flex-col gap-3">
              {days.map((day) => {
                const items = sessions.filter((s) => s.day === day);
                if (!items.length) return null;
                const isToday = day === info.dayIndex;
                return (
                  <div key={day} className={clsx("card overflow-hidden", isToday && "!border-brand-line")}>
                    <div className={clsx("flex items-center justify-between px-4 py-2 text-[13px] font-semibold", isToday ? "bg-brand text-white" : "bg-surface-2")}>
                      <span>{formatDay(addDays(info.start, day), { weekday: "long", day: "numeric", month: "long" })}</span>
                      {isToday && <span>Today</span>}
                    </div>
                    <ul className="divide-y divide-line">
                      {items.map((s, i) => {
                        const c = CAT[CAT_OF[s.mode]];
                        const inner = (
                          <>
                            <span className="w-24 shrink-0 text-[12px] font-medium tabular-nums text-ink-3">{s.time}</span>
                            <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-[3px]", c.dot)} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[14px] font-medium leading-snug">{s.topic ? titles[s.topic] ?? s.title : s.title}</span>
                              <span className="block text-[12px] text-ink-3">
                                {s.mode}
                                {s.faculty && ` · ${s.faculty}`}
                              </span>
                            </span>
                          </>
                        );
                        return (
                          <li key={i}>
                            {s.topic ? (
                              <Link href={`/topics/${s.topic}`} className="flex gap-3 px-4 py-3 hover:bg-surface-2">
                                {inner}
                              </Link>
                            ) : (
                              <div className="flex gap-3 px-4 py-3">{inner}</div>
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
