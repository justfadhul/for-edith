import clsx from "clsx";
import type { TopicKind } from "@/content/curriculum";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 72, label }: { value: number; size?: number; label?: string }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset .5s" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-lg font-bold leading-none">{Math.round(pct * 100)}%</div>
          {label && <div className="mt-0.5 text-[10px] text-ink-3">{label}</div>}
        </div>
      </div>
    </div>
  );
}

const KIND: Record<TopicKind, { label: string; cls: string }> = {
  lecture: { label: "Lecture", cls: "bg-accent-soft text-accent" },
  tutorial: { label: "Tutorial", cls: "bg-brand-soft text-brand" },
  skill: { label: "Skills", cls: "bg-warn-soft text-warn" },
};

export function KindChip({ kind }: { kind: TopicKind }) {
  return <span className={clsx("chip", KIND[kind].cls)}>{KIND[kind].label}</span>;
}

export function StatusDot({ status }: { status?: "not_started" | "in_progress" | "done" }) {
  return (
    <span
      className={clsx(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full border",
        status === "done" && "border-good bg-good",
        status === "in_progress" && "border-warn bg-warn",
        (!status || status === "not_started") && "border-ink-3",
      )}
      title={status === "done" ? "Done" : status === "in_progress" ? "In progress" : "Not started"}
    />
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-3">
      <h2 className="font-serif text-xl font-semibold">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 mt-2">
      {eyebrow && <div className="text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</div>}
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-2 max-w-2xl text-ink-2">{children}</div>}
    </div>
  );
}
