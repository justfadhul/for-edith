import clsx from "clsx";
import type { TopicKind } from "@/content/curriculum";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
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
  lecture: { label: "Lecture", cls: "!bg-lilac-soft !text-lilac !border-transparent" },
  tutorial: { label: "Tutorial", cls: "!bg-brand-soft !text-brand !border-transparent" },
  skill: { label: "Skills", cls: "!bg-peach-soft !text-peach !border-transparent" },
  reference: { label: "Drug handbook", cls: "!bg-accent-soft !text-accent !border-transparent" },
};

export function KindChip({ kind }: { kind: TopicKind }) {
  return <span className={clsx("chip", KIND[kind].cls)}>{KIND[kind].label}</span>;
}

export function StatusDot({ status }: { status?: "not_started" | "in_progress" | "done" }) {
  return (
    <span
      className={clsx(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px]",
        status === "done" && "border-brand bg-brand",
        status === "in_progress" && "border-brand bg-[linear-gradient(90deg,var(--brand)_50%,transparent_50%)]",
        (!status || status === "not_started") && "border-line-strong",
      )}
      title={status === "done" ? "Done" : status === "in_progress" ? "In progress" : "Not started"}
    />
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-10 flex items-end justify-between gap-3">
      <h2 className="h-section">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-7 mt-3">
      {eyebrow && (
        <div className="eyebrow">
          <span className="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-brand" />
          {eyebrow}
        </div>
      )}
      <h1 className="mt-2 h-display">{title}</h1>
      {children && <div className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-ink-2">{children}</div>}
    </div>
  );
}
