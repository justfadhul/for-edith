"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, BookOpen, CalendarClock, RotateCcw, X } from "lucide-react";
import { useStudy } from "@/lib/store/study-store";
import { addDays, formatDay, rotationInfo, toISODate, parseDate } from "@/lib/dates";
import { parseTimeRange, fmtHour } from "@/lib/prep";
import type { EffectiveSession } from "@/lib/schedule";

const DAY = 86_400_000;

/** Details of a timetable session, with "move to another day/time". */
export function RescheduleSheet({ session, title, onClose }: { session: EffectiveSession; title: string; onClose: () => void }) {
  const { state, moveSession, resetSession } = useStudy();
  const { start } = rotationInfo(state.settings.rotationStart);
  // A ghost stands in the original slot; edit the live (moved) session.
  const current = session.ghostOf ? { day: session.ghostOf.day, time: session.ghostOf.time } : { day: session.day, time: session.time };
  const original = session.movedFrom ?? (session.ghostOf ? { day: session.day, time: session.time } : null);
  const moved = Boolean(original);
  const range = parseTimeRange(current.time);

  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(toISODate(addDays(start, current.day)));
  const [from, setFrom] = useState(fmtHour(range.start));
  const [to, setTo] = useState(fmtHour(range.end));
  const [note, setNote] = useState(state.overrides[session.key]?.note ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fmt = (day: number, time: string) =>
    `${formatDay(addDays(start, day), { weekday: "long", day: "numeric", month: "short" })} · ${time}`;

  const save = () => {
    const day = Math.round((parseDate(date).getTime() - start.getTime()) / DAY);
    if (!date || Number.isNaN(day)) return setError("Choose a date.");
    if (day < 0 || day > 41) return setError("Pick a date within the six-week rotation.");
    if (!from || !to || to <= from) return setError("The end time must be after the start time.");
    moveSession(session.key, day, `${from}–${to}`, note.trim() || null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="safe-bottom w-full max-w-md rounded-t-[22px] border border-line bg-surface p-5 shadow-pop sm:rounded-[18px]"
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line-strong sm:hidden" />
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-ink-3">
              {session.mode}
              {session.faculty && ` · ${session.faculty}`}
            </div>
            <h2 id="sheet-title" className="mt-1 text-[19px] font-semibold leading-snug tracking-[-0.02em]">
              {title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-3 hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[14px]">
          <CalendarClock size={16} className="text-ink-3" />
          {fmt(current.day, current.time)}
        </div>
        {moved && original && (
          <div className="mt-3 rounded-xl border border-peach/30 bg-peach-soft px-3 py-2.5 text-[13px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-peach-text">Rescheduled</span>
              <span className="text-ink-3 line-through">{fmt(original.day, original.time)}</span>
              <ArrowRight size={13} className="text-peach" />
            </div>
            {state.overrides[session.key]?.note && <div className="mt-1 text-ink-2">{state.overrides[session.key]?.note}</div>}
          </div>
        )}

        {editing ? (
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-[13px] font-medium">
              New date
              <input
                type="date"
                className="input"
                value={date}
                min={toISODate(start)}
                max={toISODate(addDays(start, 41))}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-[13px] font-medium">
                Starts
                <input type="time" step={900} className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-[13px] font-medium">
                Ends
                <input type="time" step={900} className="input" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-[13px] font-medium">
              Reason <span className="font-normal text-ink-3">(optional)</span>
              <input className="input" placeholder="e.g. Dr Nanzira in theatre" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} />
            </label>
            {error && <p className="text-[13px] text-bad">{error}</p>}
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="btn btn-primary flex-1" onClick={save}>
                Save new time
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {session.topic && (
              <Link href={`/topics/${session.topic}`} className="btn btn-pink w-full">
                <BookOpen size={16} /> Open notes
              </Link>
            )}
            <button className={clsx("btn btn-outline w-full")} onClick={() => setEditing(true)}>
              <CalendarClock size={16} /> {moved ? "Change the new time" : "Move to another day or time"}
            </button>
            {moved && (
              <button
                className="btn btn-ghost w-full"
                onClick={() => {
                  resetSession(session.key);
                  onClose();
                }}
              >
                <RotateCcw size={15} /> Move back to the original slot
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
