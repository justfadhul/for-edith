"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  Activity,
  Baby,
  Brain,
  Bug,
  CalendarRange,
  ChevronRight,
  ClipboardCheck,
  Droplet,
  HeartPulse,
  Pill,
  Ribbon,
  Search,
  ShieldPlus,
  Siren,
  Sparkles,
  Stethoscope,
  Syringe,
  Timer,
  X,
} from "lucide-react";

export type Tone = "brand" | "lilac" | "peach" | "accent" | "steel";
export type GroupCard = {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  tone: Tone;
  items: { id: string; text: string }[];
};

const ICONS: Record<string, typeof Pill> = {
  clipboard: ClipboardCheck,
  brain: Brain,
  heart: HeartPulse,
  timer: Timer,
  droplet: Droplet,
  pill: Pill,
  shield: ShieldPlus,
  bug: Bug,
  ribbon: Ribbon,
  syringe: Syringe,
  calendar: CalendarRange,
  stethoscope: Stethoscope,
  activity: Activity,
  baby: Baby,
  siren: Siren,
  sparkles: Sparkles,
};

export const TONE: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  lilac: "bg-lilac-soft text-lilac",
  peach: "bg-peach-soft text-peach",
  accent: "bg-accent-soft text-accent",
  steel: "bg-steel-soft text-steel",
};

export function GroupIcon({ icon, tone, size = 20, className }: { icon: string; tone: Tone; size?: number; className?: string }) {
  const Icon = ICONS[icon] ?? Pill;
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-[12px]", TONE[tone], className ?? "h-10 w-10")}>
      <Icon size={size} strokeWidth={1.9} />
    </span>
  );
}

/** The handbook's front page: find a drug, or open a chapter. */
export function DrugGroupGrid({ base, groups }: { base: string; groups: GroupCard[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const hits = useMemo(
    () =>
      needle
        ? groups.flatMap((g) =>
            [
              ...(g.title.toLowerCase().includes(needle) ? [{ g, id: "", text: g.title }] : []),
              ...g.items.filter((i) => i.text.toLowerCase().includes(needle)).map((i) => ({ g, id: i.id, text: i.text })),
            ],
          )
        : [],
    [groups, needle],
  );

  return (
    <div className="flex flex-col gap-5">
      <label className="relative block">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          className="input !pl-10 !pr-10"
          placeholder="Find a drug: magnesium, oxytocin, gentamicin…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-ink-3 hover:bg-surface-2">
            <X size={15} />
          </button>
        )}
      </label>

      {needle ? (
        hits.length ? (
          <ul className="card divide-y divide-line overflow-hidden">
            {hits.map((h, k) => (
              <li key={k}>
                <Link href={`${base}/${h.g.slug}${h.id ? `#${h.id}` : ""}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                  <GroupIcon icon={h.g.icon} tone={h.g.tone} size={16} className="h-8 w-8" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{h.text}</div>
                    <div className="truncate text-[12.5px] text-ink-3">{h.id ? h.g.title : `${h.g.items.length} sections`}</div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-ink-3" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-ink-3">No drug matches “{q}”. Try the generic name.</p>
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.slug} className="card flex min-w-0 flex-col gap-3 p-4 transition hover:border-line-strong">
              <Link href={`${base}/${g.slug}`} className="flex items-start gap-3">
                <GroupIcon icon={g.icon} tone={g.tone} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 font-semibold leading-tight">
                    {g.title}
                    <ChevronRight size={15} className="text-ink-3" />
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-ink-3">{g.blurb}</p>
                </div>
              </Link>
              {g.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {g.items.slice(0, 5).map((i) => (
                    <Link key={i.id} href={`${base}/${g.slug}#${i.id}`} className="chip max-w-full truncate hover:border-line-strong hover:text-ink">
                      {i.text}
                    </Link>
                  ))}
                  {g.items.length > 5 && (
                    <Link href={`${base}/${g.slug}`} className="chip text-ink-3 hover:text-ink">
                      +{g.items.length - 5} more
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Chapter list for the side panel. */
export function ChapterList({ base, groups, current }: { base: string; groups: GroupCard[]; current?: string }) {
  return (
    <ul className="space-y-0.5 text-[13px]">
      {groups.map((g) => (
        <li key={g.slug}>
          <Link
            href={`${base}/${g.slug}`}
            className={clsx(
              "flex items-center gap-2 rounded-[7px] px-2 py-1.5 leading-snug transition",
              current === g.slug ? "bg-brand-soft font-medium text-brand-text" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <GroupIcon icon={g.icon} tone={g.tone} size={13} className="h-6 w-6 !rounded-[7px]" />
            {g.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
