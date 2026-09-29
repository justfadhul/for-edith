"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Bell, CalendarPlus, Check, X } from "lucide-react";
import { SESSIONS, TOPICS, type SessionMode } from "@/content/curriculum";
import { useStudy } from "@/lib/store/study-store";
import { effectiveSessions } from "@/lib/schedule";
import { addDays, formatDay, rotationInfo } from "@/lib/dates";
import { useNow } from "@/lib/use-now";
import Link from "next/link";
import { buildIcs } from "@/lib/ics";

const KEY = "for-edith:reminders";
const TITLES = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));

const GROUPS: { id: string; label: string; modes: SessionMode[]; on: boolean }[] = [
  { id: "teaching", label: "Lectures, tutorials, skills & bedside teaching", modes: ["Lecture", "Tutorial", "Skills session", "Bedside teaching"], on: true },
  { id: "assessment", label: "Assessments & the written test", modes: ["Assessment"], on: true },
  { id: "rounds", label: "Ward rounds & grand rounds", modes: ["Ward round", "Grand round"], on: false },
  { id: "routine", label: "Clinical work & paediatrics", modes: ["Clinical work", "Paediatrics"], on: false },
];

type Prefs = { groups: string[]; before: number[]; evening: boolean; daily: boolean; dailyAt: string };
const DEFAULTS: Prefs = { groups: GROUPS.filter((g) => g.on).map((g) => g.id), before: [30], evening: true, daily: true, dailyAt: "19:00" };

function loadPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

/** Timetable button that opens the reminders sheet. */
export function RemindersButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={clsx("btn btn-outline !min-h-8 !py-0 text-[13px]", className)}>
        <Bell size={15} /> Reminders
      </button>
      {open && <RemindersSheet onClose={() => setOpen(false)} />}
    </>
  );
}

/** Exports the timetable (with Edith's reschedules) to her phone's calendar, with alerts. */
export function RemindersSheet({ onClose }: { onClose: () => void }) {
  const { state } = useStudy();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [done, setDone] = useState(false);
  const now = useNow();
  const info = rotationInfo(state.settings.rotationStart, now);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPrefs(loadPrefs()));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const update = (p: Partial<Prefs>) => {
    setDone(false);
    setPrefs((cur) => {
      const next = { ...cur, ...p };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const modes = new Set(GROUPS.filter((g) => prefs.groups.includes(g.id)).flatMap((g) => g.modes));
  const sessions = effectiveSessions(SESSIONS, state.overrides).filter((s) => !s.ghostOf && modes.has(s.mode));
  const moved = sessions.filter((s) => s.movedFrom).length;

  const download = () => {
    const { start } = rotationInfo(state.settings.rotationStart);
    const ics = buildIcs(effectiveSessions(SESSIONS, state.overrides), start, TITLES, {
      modes,
      minutesBefore: prefs.before,
      eveningBefore: prefs.evening,
      dailyStudy: prefs.daily ? prefs.dailyAt : null,
      origin: window.location.origin,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "for-edith-timetable.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminders-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="safe-bottom max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[22px] border border-line bg-surface p-5 shadow-pop sm:rounded-[18px]"
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line-strong sm:hidden" />
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand">
            <Bell size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="reminders-title" className="text-[19px] font-semibold leading-snug tracking-[-0.02em]">
              Reminders on your phone
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-ink-3">Adds your timetable to your phone&apos;s calendar, which alerts you even when this site is closed.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-3 hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>

        {now > 0 && info.phase === "after" && (
          <div className="mt-4 rounded-xl border border-peach/30 bg-peach-soft px-3.5 py-2.5 text-[13px] leading-snug text-ink-2">
            <b className="text-peach-text">Check your dates.</b> Your rotation is set to start on{" "}
            {formatDay(info.start, { weekday: "short", day: "numeric", month: "short" })} and ended on{" "}
            {formatDay(addDays(info.start, 39), { day: "numeric", month: "short" })}, so these reminders would be in the past.{" "}
            <Link href="/account" className="font-medium text-brand-text underline">
              Set your start date
            </Link>{" "}
            first.
          </div>
        )}

        <Section title="Include">
          {GROUPS.map((g) => (
            <Check_ key={g.id} checked={prefs.groups.includes(g.id)} onChange={() => update({ groups: toggleIn(prefs.groups, g.id) })}>
              {g.label}
            </Check_>
          ))}
        </Section>

        <Section title="Alert me">
          <Check_ checked={prefs.evening} onChange={() => update({ evening: !prefs.evening })}>
            The evening before (20:00), to prepare the topic
          </Check_>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[15, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => update({ before: toggleIn(prefs.before, m).sort((a, b) => a - b) })}
                className={clsx(
                  "rounded-full border px-3 py-1 text-[13px]",
                  prefs.before.includes(m) ? "border-brand-line bg-brand-soft font-medium text-brand-text" : "border-line text-ink-2",
                )}
              >
                {m === 60 ? "1 hour" : `${m} min`} before
              </button>
            ))}
          </div>
        </Section>

        <Section title="Daily study nudge">
          <div className="flex items-center gap-3">
            <Check_ checked={prefs.daily} onChange={() => update({ daily: !prefs.daily })}>
              15 minutes of flashcards & MCQs every day at
            </Check_>
            <input
              type="time"
              value={prefs.dailyAt}
              disabled={!prefs.daily}
              onChange={(e) => update({ dailyAt: e.target.value || "19:00" })}
              className="input !h-9 !w-[8rem] shrink-0 !py-0 disabled:opacity-50"
            />
          </div>
        </Section>

        <button onClick={download} disabled={!sessions.length && !prefs.daily} className="btn btn-primary mt-5 w-full">
          {done ? <Check size={16} /> : <CalendarPlus size={16} />} {done ? "Downloaded: open it to add" : "Add to my calendar"}
        </button>
        <p className="mt-2 text-center text-[12.5px] text-ink-3">
          {sessions.length} sessions{moved ? `, including ${moved} you rescheduled` : ""}
          {prefs.daily ? " + a daily study reminder" : ""}
        </p>

        <div className="mt-4 rounded-xl bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
          <p>
            <b>iPhone:</b> tap <i>Add to my calendar</i>, then <i>Add All</i>.
          </p>
          <p className="mt-1">
            <b>Android:</b> open the downloaded file and choose your calendar. For Google Calendar, import it at calendar.google.com
            (Settings → Import); Google then uses its own default alerts.
          </p>
          <p className="mt-1">
            If you move a session later, add the calendar again. Updated events replace the old ones in Apple Calendar; in other apps,
            delete the old copy first.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Check_({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[14px] leading-snug">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
      <span>{children}</span>
    </label>
  );
}
