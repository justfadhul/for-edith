"use client";

import { useState } from "react";
import clsx from "clsx";
import { CalendarHeart, Info } from "lucide-react";
import { useNow } from "@/lib/use-now";
import { addDays, formatDay, startOfDay } from "@/lib/dates";
import {
  MILESTONES,
  TERM_DAYS,
  dateInput,
  daysBetween,
  eddFromLnmp,
  fmtGa,
  fromInput,
  gaOn,
  gaStatus,
  lnmpFromEdd,
  lnmpFromGa,
} from "@/lib/obstetric-dates";

type Mode = "lnmp" | "edd" | "ga";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "lnmp", label: "From LNMP", hint: "First day of the last normal menstrual period" },
  { id: "edd", label: "From EDD", hint: "Expected date of delivery on the ANC card" },
  { id: "ga", label: "From gestational age", hint: "e.g. a scan result on a given date" },
];

const long = (d: Date) => formatDay(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function DatingCalculator() {
  const now = useNow();
  const today = now ? startOfDay(new Date(now)) : null;
  const todayStr = today ? dateInput(today) : "";

  const [mode, setMode] = useState<Mode>("lnmp");
  const [lnmpStr, setLnmpStr] = useState("");
  const [cycle, setCycle] = useState(28);
  const [eddStr, setEddStr] = useState("");
  const [gaW, setGaW] = useState("");
  const [gaD, setGaD] = useState("0");
  const [gaDateStr, setGaDateStr] = useState("");
  const [onStr, setOnStr] = useState("");

  const on = fromInput(onStr || todayStr);

  // Everything is derived from one "effective LNMP" (for EDD/GA consistency).
  let lnmp: Date | null = null;
  let edd: Date | null = null;
  if (mode === "lnmp") {
    const d = fromInput(lnmpStr);
    if (d) {
      lnmp = d;
      edd = eddFromLnmp(d, cycle);
    }
  } else if (mode === "edd") {
    const d = fromInput(eddStr);
    if (d) {
      edd = d;
      lnmp = lnmpFromEdd(d);
    }
  } else {
    const d = fromInput(gaDateStr || todayStr);
    const w = parseInt(gaW, 10);
    const dd = parseInt(gaD || "0", 10);
    if (d && !Number.isNaN(w) && w >= 0 && w <= 45 && dd >= 0 && dd <= 6) {
      lnmp = lnmpFromGa(d, w, dd);
      edd = eddFromLnmp(lnmp);
    }
  }
  // GA is counted from the date that gives the EDD (a long cycle shifts ovulation).
  const datingLnmp = edd ? lnmpFromEdd(edd) : null;
  const ga = datingLnmp && on ? gaOn(datingLnmp, on) : null;
  const status = ga ? gaStatus(ga) : null;
  const daysToEdd = edd && on ? daysBetween(on, edd) : null;
  const tooFar = ga && (ga.totalDays > 45 * 7 || ga.totalDays < -7);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* Inputs */}
      <section className="card flex flex-col gap-5 self-start p-5">
        <div className="grid grid-cols-3 gap-1 rounded-[10px] bg-surface-3 p-[3px]">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={clsx(
                "rounded-lg px-2 py-1.5 text-[12.5px] leading-tight",
                mode === m.id ? "bg-surface font-semibold shadow-[0_1px_2px_rgb(0_0_0/0.06)]" : "text-ink-2",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="-mt-2 text-[13px] text-ink-3">{MODES.find((m) => m.id === mode)!.hint}</p>

        {mode === "lnmp" && (
          <>
            <Field label="LNMP (first day)">
              <input type="date" className="input" value={lnmpStr} max={todayStr || undefined} onChange={(e) => setLnmpStr(e.target.value)} />
            </Field>
            <Field label="Usual cycle length" hint="Naegele's rule assumes 28 days. For regular longer or shorter cycles the EDD shifts by the difference.">
              <div className="flex items-center gap-2">
                <input type="number" min={21} max={45} className="input !w-24" value={cycle} onChange={(e) => setCycle(Math.min(45, Math.max(21, +e.target.value || 28)))} />
                <span className="text-[13px] text-ink-3">days</span>
              </div>
            </Field>
          </>
        )}

        {mode === "edd" && (
          <Field label="EDD">
            <input type="date" className="input" value={eddStr} onChange={(e) => setEddStr(e.target.value)} />
          </Field>
        )}

        {mode === "ga" && (
          <>
            <Field label="Gestational age">
              <div className="flex items-center gap-2">
                <input type="number" inputMode="numeric" min={0} max={45} placeholder="weeks" className="input !w-24" value={gaW} onChange={(e) => setGaW(e.target.value)} />
                <span className="text-[13px] text-ink-3">weeks +</span>
                <input type="number" inputMode="numeric" min={0} max={6} className="input !w-20" value={gaD} onChange={(e) => setGaD(e.target.value)} />
                <span className="text-[13px] text-ink-3">days</span>
              </div>
            </Field>
            <Field label="Measured on">
              <input type="date" className="input" value={gaDateStr || todayStr} onChange={(e) => setGaDateStr(e.target.value)} />
            </Field>
          </>
        )}

        <div className="border-t border-line pt-4">
          <Field label="Calculate WOA on" hint="Defaults to today. Change it to date a past visit or a planned delivery.">
            <div className="flex gap-2">
              <input type="date" className="input" value={onStr || todayStr} onChange={(e) => setOnStr(e.target.value)} />
              {onStr && (
                <button className="btn btn-ghost" onClick={() => setOnStr("")}>
                  Today
                </button>
              )}
            </div>
          </Field>
        </div>
      </section>

      {/* Results */}
      <section className="flex flex-col gap-4">
        {!lnmp || !edd || !ga ? (
          <div className="card flex flex-col items-center gap-2 p-10 text-center text-ink-3">
            <CalendarHeart size={28} className="text-brand" />
            <div className="text-[15px] font-medium text-ink-2">Enter a date to see the EDD, LNMP and weeks of amenorrhoea</div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Result
                label={mode === "lnmp" && cycle !== 28 ? "Gestational age (corrected)" : "Weeks of amenorrhoea"}
                value={ga.totalDays >= 0 ? `${fmtGa(ga)} wk` : "–"}
                sub={
                  mode === "lnmp" && cycle !== 28 && on
                    ? `${cycle}-day cycle · by dates ${fmtGa(gaOn(lnmp, on))}`
                    : on
                      ? `on ${long(on)}`
                      : ""
                }
                accent
              />
              <Result label="EDD" value={formatDay(edd, { day: "numeric", month: "short", year: "numeric" })} sub={formatDay(edd, { weekday: "long" })} />
              <Result label="LNMP" value={formatDay(lnmp, { day: "numeric", month: "short", year: "numeric" })} sub={mode === "lnmp" ? "as entered" : "calculated"} />
            </div>

            <div className="card flex flex-col gap-4 p-5">
              {status && (
                <div className="flex flex-wrap items-center gap-2 text-[14px]">
                  <span
                    className={clsx(
                      "rounded-md px-2 py-0.5 text-[12.5px] font-medium",
                      status.tone === "good" && "bg-good-soft text-good",
                      status.tone === "warn" && "bg-peach-soft text-peach-text",
                      status.tone === "bad" && "bg-bad-soft text-bad",
                      status.tone === "neutral" && "bg-lilac-soft text-lilac-text",
                    )}
                  >
                    {status.label}
                  </span>
                  {daysToEdd !== null && (
                    <span className="text-ink-2">
                      {daysToEdd > 0 ? `${daysToEdd} days (${Math.floor(daysToEdd / 7)}+${daysToEdd % 7} wk) to the EDD` : daysToEdd === 0 ? "EDD is today" : `${-daysToEdd} days past the EDD`}
                    </span>
                  )}
                </div>
              )}
              {!tooFar && <Timeline totalDays={ga.totalDays} />}
              <ul className="divide-y divide-line text-[13.5px]">
                {MILESTONES.map((m) => {
                  const d = addDays(lnmpFromEdd(edd), m.at);
                  const passed = ga.totalDays >= m.at;
                  return (
                    <li key={m.label} className="flex items-center gap-3 py-2">
                      <span className={clsx("w-14 shrink-0 font-medium tabular-nums", passed ? "text-ink-3" : "text-ink")}>{m.at / 7}+0</span>
                      <span className="min-w-0 flex-1">
                        <span className={clsx("font-medium", passed && "text-ink-3")}>{m.label}</span>
                        <span className="block text-[12px] text-ink-3">{m.note}</span>
                      </span>
                      <span className={clsx("shrink-0 text-right tabular-nums", passed ? "text-ink-3" : "text-ink-2")}>{formatDay(d, { day: "numeric", month: "short", year: "numeric" })}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex gap-2.5 rounded-xl border border-line bg-surface-2/70 p-4 text-[13px] leading-relaxed text-ink-2">
              <Info size={16} className="mt-0.5 shrink-0 text-ink-3" />
              <div>
                <b className="font-semibold text-ink">How it works.</b> Naegele&apos;s rule: EDD = LNMP + 280 days (add 7 days, subtract 3 months, add 1 year), adjusted by
                (cycle − 28) days for regular cycles. WOA is counted from the LNMP. A first-trimester scan is more accurate than dates. If the scan differs from the
                LNMP by more than 5–7 days before 14 weeks, re-date by the scan (enter it under &quot;From gestational age&quot;). Always confirm on the ANC card and with
                your seniors.
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      {children}
      {hint && <span className="text-[12px] leading-snug text-ink-3">{hint}</span>}
    </label>
  );
}

function Result({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={clsx("rounded-[14px] border p-4", accent ? "border-brand-line bg-brand-soft/50" : "border-line bg-surface")}>
      <div className="text-[12.5px] text-ink-2">{label}</div>
      <div className={clsx("mt-1 text-[26px] font-semibold leading-tight tracking-[-0.02em] tabular-nums", accent && "text-brand-text")}>{value}</div>
      {sub && <div className="mt-0.5 text-[12.5px] text-ink-3">{sub}</div>}
    </div>
  );
}

/** 0–42 week bar with trimester bands and a marker at the current gestation. */
function Timeline({ totalDays }: { totalDays: number }) {
  const max = 42 * 7;
  const pct = (d: number) => `${(Math.min(max, Math.max(0, d)) / max) * 100}%`;
  return (
    <div className="pt-6">
      <div className="relative h-3 overflow-hidden rounded-full bg-surface-3">
        <div className="absolute inset-y-0 left-0 bg-lilac-soft" style={{ width: pct(14 * 7) }} />
        <div className="absolute inset-y-0 bg-brand-soft" style={{ left: pct(14 * 7), width: `calc(${pct(28 * 7)} - ${pct(14 * 7)})` }} />
        <div className="absolute inset-y-0 bg-peach-soft" style={{ left: pct(28 * 7), width: `calc(${pct(37 * 7)} - ${pct(28 * 7)})` }} />
        <div className="absolute inset-y-0 bg-good-soft" style={{ left: pct(37 * 7), width: `calc(${pct(TERM_DAYS + 13)} - ${pct(37 * 7)})` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand/70" style={{ width: pct(totalDays) }} />
      </div>
      <div className="relative -mt-[22px] h-0">
        <div className="absolute -translate-x-1/2 rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-surface" style={{ left: pct(totalDays) }}>
          {Math.floor(Math.max(0, totalDays) / 7)}+{((totalDays % 7) + 7) % 7}
        </div>
      </div>
      <div className="relative mt-5 h-4 text-[11px] text-ink-3">
        {[0, 14, 28, 37, 40, 42].map((w) => (
          <span key={w} className="absolute -translate-x-1/2 tabular-nums" style={{ left: pct(w * 7) }}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
