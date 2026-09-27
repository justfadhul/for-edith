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

const CATS: { id: Cat; label: string; block: string; label_: string; dot: string }[] = [
  { id: "lecture", label: "Lectures", block: "bg-lilac-soft border-l-lilac", label_: "text-lilac-text", dot: "bg-lilac" },
  { id: "tutorial", label: "Tutorials", block: "bg-brand-soft border-l-brand", label_: "text-brand-text", dot: "bg-brand" },
  { id: "skills", label: "Skills sessions", block: "bg-peach-soft border-l-peach", label_: "text-peach-text", dot: "bg-peach" },
  { id: "bedside", label: "Bedside teaching", block: "bg-accent-soft border-l-accent", label_: "text-accent-text", dot: "bg-accent" },
  { id: "rounds", label: "Ward & grand rounds", block: "bg-steel-soft border-l-steel", label_: "text-steel-text", dot: "bg-steel" },
  { id: "assessment", label: "Assessment", block: "bg-bad-soft border-l-bad", label_: "text-bad", dot: "bg-bad" },
  { id: "routine", label: "Clinical work & paeds", block: "routine border-l-line-strong", label_: "text-ink-3", dot: "bg-line-strong" },
];
const CAT = Object.fromEntries(CATS.map((c) => [c.id, c])) as Record<Cat, (typeof CATS)[number]>;

const START_H = 8;
const END_H = 18;

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

function prepLabel(state: StudyState, topic?: string) {
  if (!topic) return null;
  const st = state.topics[topic]?.status;
  if (st === "done") return { text: "Prepared", cls: "text-good", done: true };
  if (st === "in_progress") return { text: "Studying", cls: "text-lilac-text", done: false };
  return { text: "Not prepared yet", cls: "text-ink-3", done: false };
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
                "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12.5px] font-medium transition",
                on ? "border-line-strong bg-surface text-ink" : "border-line bg-transparent text-ink-3 line-through decoration-ink-3/50",
              )}
            >
              <span className={clsx("h-2 w-2 rounded-[3px]", c.dot, !on && "opacity-40")} />
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
            <div className="grid grid-cols-[60px_repeat(5,minmax(0,1fr))] border-b border-line">
              <div />
              {days.map((d) => {
                const date = addDays(info.start, d);
                const isToday = d === todayIdx;
                return (
                  <div key={d} className={clsx("flex items-center gap-2 border-l border-line/70 px-3.5 py-3", isToday && "bg-brand-soft/40")}>
                    <span className={clsx("text-[12px]", isToday ? "font-medium text-brand-text" : "text-ink-3")}>
                      {formatDay(date, { weekday: "short" })}
                    </span>
                    {isToday ? (
                      <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-brand text-[15px] font-semibold text-white">{date.getDate()}</span>
                    ) : (
                      <span className={clsx("text-[20px] font-semibold tracking-tight", d < todayIdx && "text-ink-3")}>{date.getDate()}</span>
                    )}
                    {isToday && <span className="ml-auto text-[11.5px] text-brand-text">Today</span>}
                  </div>
                );
              })}
            </div>
            <div className="relative grid grid-cols-[60px_repeat(5,minmax(0,1fr))]" style={{ height: (END_H - START_H) * 64 + 8 }}>
              <div className="relative text-[11px] text-ink-3">
                {Array.from({ length: END_H - START_H }, (_, i) => (
                  <span key={i} className="absolute right-2.5" style={{ top: i * 64 + 4 }}>
                    {fmtHour(START_H + i)}
                  </span>
                ))}
              </div>
              {days.map((d) => (
                <DayColumn key={d} evs={byDay[d]} hour={64} isToday={d === todayIdx} nowH={nowH} titles={titles} state={state} onOpen={setOpen} start={info.start} />
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
            <div className="grid grid-cols-[44px_minmax(0,1fr)]" style={{ height: (END_H - START_H) * 52 + 12 }}>
              <div className="relative text-[11px] text-ink-3">
                {Array.from({ length: (END_H - START_H) / 2 + 1 }, (_, i) => (
                  <span key={i} className="absolute" style={{ top: i * 104 - (i ? 6 : 0) }}>
                    {fmtHour(START_H + i * 2)}
                  </span>
                ))}
              </div>
              <DayColumn evs={byDay[dayOfWeek]} hour={52} isToday={dayOfWeek === todayIdx} nowH={nowH} titles={titles} state={state} onOpen={setOpen} start={info.start} phone />
            </div>
          </div>
        </>
      ) : (
        <Agenda sessions={visible.filter((s) => !s.ghostOf)} titles={titles} state={state} now={now} />
      )}
      {open && <RescheduleSheet session={open} title={open.topic ? titles[open.topic] ?? open.title : open.title} onClose={() => setOpen(null)} />}
    </div>
  );
}

function DayColumn({
  evs,
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
  hour: number;
  isToday: boolean;
  nowH: number;
  titles: Record<string, string>;
  state: StudyState;
  onOpen: (s: EffectiveSession) => void;
  start: Date;
  phone?: boolean;
}) {
  return (
    <div
      className={clsx("relative", !phone && "border-l border-line/70", isToday && !phone && "bg-brand-soft/25")}
      style={{ backgroundImage: `repeating-linear-gradient(180deg, var(--line) 0, var(--line) 1px, transparent 1px, transparent ${hour}px)`, backgroundPositionY: phone ? 0 : hour - 1 }}
    >
      {evs.map((e, i) => {
        const top = (e.start - START_H) * hour + 2;
        const height = Math.max(28, (e.end - e.start) * hour - 4);
        const c = CAT[e.cat];
        const prep = prepLabel(state, e.topic);
        const live = isToday && nowH >= e.start && nowH < e.end;
        const title = e.topic ? titles[e.topic] ?? e.title : e.title;
        const pad = phone ? 0 : 6;
        const style = {
          top,
          height,
          left: `calc(${(e.col / e.cols) * 100}% + ${pad}px)`,
          width: `calc(${100 / e.cols}% - ${pad * 2 + (e.cols > 1 ? 3 : 0)}px)`,
        };
        if (e.ghostOf) {
          return (
            <button
              key={i}
              onClick={() => onOpen(e)}
              className="absolute flex flex-col gap-0.5 overflow-hidden rounded-[9px] border border-dashed border-line-strong bg-surface/60 px-2 py-1.5 text-left"
              style={style}
            >
              <span className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.02em] text-ink-3">
                <MoveRight size={12} /> Moved
              </span>
              <span className={clsx("line-clamp-2 font-medium leading-tight text-ink-3 line-through", phone ? "text-[13px]" : "text-[12px]")}>{title}</span>
              {height > 60 && (
                <span className="text-[11.5px] text-peach-text">
                  to {formatDay(addDays(start, e.ghostOf.day), { weekday: "short", day: "numeric" })} {e.ghostOf.time.split("–")[0]}
                </span>
              )}
            </button>
          );
        }
        const body = (
          <>
            {e.cat !== "routine" && (
              <span className={clsx("flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.02em]", c.label_)}>
                {e.mode === "Skills session" ? "Skills" : e.mode}
                {live && <span className="rounded-full bg-brand px-1.5 text-[9.5px] text-white">Now</span>}
                {e.movedFrom && <span className="rounded-full bg-peach px-1.5 text-[9.5px] text-white">Moved</span>}
              </span>
            )}
            <span className={clsx("line-clamp-3 font-semibold leading-tight", phone ? "text-[14px]" : "text-[12.5px]", e.cat === "routine" && "!font-normal text-ink-3")}>
              {title}
            </span>
            {height > 60 && (
              <span className="truncate text-[11.5px] text-ink-2">
                {e.time}
                {e.faculty && ` · ${e.faculty}`}
              </span>
            )}
            {prep && height > 90 && (
              <span className={clsx("mt-auto flex items-center gap-1 text-[11px] font-medium", prep.cls)}>
                {prep.done && <Check size={12} strokeWidth={2.6} />}
                {prep.text}
              </span>
            )}
          </>
        );
        const cls = clsx(
          "absolute flex flex-col gap-0.5 overflow-hidden rounded-[9px] border-l-[3px] px-2 py-1.5 text-left",
          c.block,
          live && "shadow-pop",
          e.movedFrom && "ring-1 ring-peach/50",
          e.topic && "transition hover:brightness-[0.98] hover:shadow-card",
        );
        return e.topic ? (
          <button key={i} onClick={() => onOpen(e)} className={cls} style={style}>
            {body}
          </button>
        ) : (
          <div key={i} className={cls} style={style}>
            {body}
          </div>
        );
      })}
      {isToday && nowH >= START_H && nowH <= END_H && (
        <>
          <div className="pointer-events-none absolute -left-1 right-0 z-10 h-0.5 bg-brand" style={{ top: (nowH - START_H) * hour }} />
          <div className="pointer-events-none absolute -left-1.5 z-10 h-2.5 w-2.5 rounded-full bg-brand" style={{ top: (nowH - START_H) * hour - 4 }} />
        </>
      )}
    </div>
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
