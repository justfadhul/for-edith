// Builds an iCalendar (.ics) file of Edith's timetable with reminder alarms.
// Times are Uganda time (EAT, UTC+3, no daylight saving) written as UTC.
import { addDays, formatDay } from "@/lib/dates";
import { parseTimeRange } from "@/lib/prep";
import type { EffectiveSession } from "@/lib/schedule";

const EAT_OFFSET_H = 3;

export type ReminderOptions = {
  /** Session modes to include. */
  modes: Set<string>;
  minutesBefore: number[];
  /** Alert at 20:00 the evening before, to prepare. */
  eveningBefore: boolean;
  /** Daily study reminder at "HH:MM", or null. */
  dailyStudy: string | null;
  /** Origin for links back to the site. */
  origin: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** A calendar date + Uganda clock time → iCalendar UTC timestamp. */
function stamp(date: Date, hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h - EAT_OFFSET_H, m));
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold lines longer than 75 octets (RFC 5545 §3.1). */
function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = "";
  let len = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (len + n > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = "";
      len = 0;
    }
    cur += ch;
    len += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

function alarm(trigger: string, text: string) {
  return ["BEGIN:VALARM", "ACTION:DISPLAY", trigger, `DESCRIPTION:${esc(text)}`, "END:VALARM"];
}

export function buildIcs(
  sessions: EffectiveSession[],
  start: Date,
  titles: Record<string, string>,
  opts: ReminderOptions,
): string {
  const n = new Date();
  const now = `${n.getUTCFullYear()}${pad(n.getUTCMonth() + 1)}${pad(n.getUTCDate())}T${pad(n.getUTCHours())}${pad(n.getUTCMinutes())}00Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//For Edith//Obs & Gyn timetable//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:For Edith · Obs & Gyn",
    "X-WR-TIMEZONE:Africa/Kampala",
  ];

  for (const s of sessions) {
    if (s.ghostOf || !opts.modes.has(s.mode)) continue;
    const date = addDays(start, s.day);
    const { start: from, end: to } = parseTimeRange(s.time);
    const title = s.topic ? titles[s.topic] ?? s.title : s.title;
    const summary = s.mode === "Assessment" || s.mode === "Ward round" || s.mode === "Grand round" ? title : `${s.mode}: ${title}`;
    const link = s.topic ? `${opts.origin}/topics/${s.topic}` : `${opts.origin}/schedule`;
    const desc = [
      s.faculty ? `Facilitator: ${s.faculty}` : "",
      s.movedFrom ? `Rescheduled from ${formatDay(addDays(start, s.movedFrom.day), { weekday: "short", day: "numeric", month: "short" })} ${s.movedFrom.time}.` : "",
      s.note ?? "",
      s.topic ? `Prepare: read the notes, do the flashcards and MCQs.\n${link}` : link,
    ]
      .filter(Boolean)
      .join("\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${s.key.replace(/[^a-z0-9-]/gi, "-")}@for-edith`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(date, from)}`,
      `DTEND:${stamp(date, to)}`,
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(desc)}`,
      `URL:${link}`,
      "CATEGORIES:" + esc(s.mode),
    );
    for (const m of opts.minutesBefore) lines.push(...alarm(`TRIGGER:-PT${m}M`, `${summary} in ${m >= 60 ? `${m / 60} h` : `${m} min`}`));
    if (opts.eveningBefore && s.topic)
      lines.push(...alarm(`TRIGGER;VALUE=DATE-TIME:${stamp(addDays(date, -1), 20)}`, `Tomorrow: ${summary}. Time to prepare.`));
    lines.push("END:VEVENT");
  }

  if (opts.dailyStudy) {
    const [hh, mm] = opts.dailyStudy.split(":").map(Number);
    const at = hh + mm / 60;
    lines.push(
      "BEGIN:VEVENT",
      "UID:daily-study@for-edith",
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(start, at)}`,
      `DTEND:${stamp(start, at + 0.25)}`,
      "RRULE:FREQ=DAILY;COUNT=42",
      "SUMMARY:Study: flashcards & MCQs (15 min)",
      `DESCRIPTION:${esc(`Clear your due flashcards and do a few MCQs.\n${opts.origin}/flashcards`)}`,
      `URL:${opts.origin}/flashcards`,
      "TRANSP:TRANSPARENT",
      ...alarm("TRIGGER:PT0M", "Time for 15 minutes of flashcards and MCQs"),
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
