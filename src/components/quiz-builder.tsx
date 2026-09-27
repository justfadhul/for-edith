"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Play, Timer, Zap, TrendingDown } from "lucide-react";
import { WEEKS } from "@/content/curriculum";
import type { StudyData } from "@/lib/types";
import { useStudy } from "@/lib/store/study-store";
import { rotationInfo } from "@/lib/dates";
import { QuizRunner, type QuizQuestion } from "@/components/quiz-runner";

interface TopicLite {
  slug: string;
  title: string;
  week: number;
  mcqs: number;
}

type Filter = "any" | "unseen" | "wrong";

function shuffle<T>(a: T[]) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function QuizBuilder({ topics }: { topics: TopicLite[] }) {
  const { state } = useStudy();
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(topics.map((t) => t.slug)));
  const [count, setCount] = useState(20);
  const [filter, setFilter] = useState<Filter>("any");
  const [running, setRunning] = useState<{ questions: QuizQuestion[]; mode: "practice" | "exam"; minutes?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- honour ?mode=exam links
    if (new URLSearchParams(window.location.search).get("mode") === "exam") setMode("exam");
  }, []);

  const available = topics.filter((t) => selected.has(t.slug)).reduce((n, t) => n + t.mcqs, 0);
  const toggleWeek = (w: number) => {
    const ws = topics.filter((t) => t.week === w).map((t) => t.slug);
    const all = ws.every((s) => selected.has(s));
    setSelected((prev) => {
      const next = new Set(prev);
      ws.forEach((s) => (all ? next.delete(s) : next.add(s)));
      return next;
    });
  };

  const start = async (opts?: { slugs?: string[]; n?: number; m?: "practice" | "exam"; f?: Filter }) => {
    const slugs = opts?.slugs ?? [...selected];
    const m = opts?.m ?? mode;
    const f = opts?.f ?? filter;
    const n = opts?.n ?? count;
    setLoading(true);
    try {
      const data: (StudyData & { title: string })[] = await Promise.all(slugs.map((s) => fetch(`/data/topic/${s}`).then((r) => r.json())));
      let pool: QuizQuestion[] = data.flatMap((d) => d.mcqs.map((q) => ({ ...q, topic: d.slug, topicTitle: d.title })));
      if (f === "unseen") pool = pool.filter((q) => !state.questions[q.id]);
      if (f === "wrong") pool = pool.filter((q) => state.questions[q.id] && state.questions[q.id].lastCorrect === false);
      const questions = shuffle(pool).slice(0, n || pool.length);
      if (!questions.length) {
        alert(f === "wrong" ? "No previously-wrong questions in this selection. Nice!" : "No questions match. Try a wider selection.");
        return;
      }
      setRunning({ questions, mode: m, minutes: m === "exam" ? Math.ceil(questions.length * 1.2) : undefined });
      window.scrollTo({ top: 0 });
    } finally {
      setLoading(false);
    }
  };

  const weak = useMemo(() => {
    const byTopic = new Map<string, { a: number; c: number }>();
    for (const q of Object.values(state.questions)) {
      const x = byTopic.get(q.topic) ?? { a: 0, c: 0 };
      x.a += q.attempts;
      x.c += q.correct;
      byTopic.set(q.topic, x);
    }
    return [...byTopic.entries()]
      .filter(([, x]) => x.a >= 3)
      .map(([slug, x]) => ({ slug, acc: x.c / x.a, title: topics.find((t) => t.slug === slug)?.title ?? slug }))
      .sort((a, b) => a.acc - b.acc)
      .slice(0, 5);
  }, [state.questions, topics]);

  if (running)
    return (
      <div className="mx-auto max-w-3xl">
        <QuizRunner questions={running.questions} mode={running.mode} timeLimitMin={running.minutes} onExit={() => setRunning(null)} />
      </div>
    );

  const info = rotationInfo(state.settings.rotationStart);
  const soFar = topics.filter((t) => info.phase === "after" || (info.week !== null && t.week <= info.week)).map((t) => t.slug);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        {/* Presets */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Preset
            icon={<Timer />}
            title="Progressive test mock"
            sub="50 Qs · 60 min · all topics"
            onClick={() => start({ slugs: topics.map((t) => t.slug), n: 50, m: "exam", f: "any" })}
          />
          <Preset
            icon={<Zap />}
            title="Quick 10"
            sub={info.phase === "during" ? `Weeks 1–${info.week} so far` : "Random, all topics"}
            onClick={() => start({ slugs: soFar.length ? soFar : topics.map((t) => t.slug), n: 10, m: "practice", f: "any" })}
          />
          <Preset
            icon={<TrendingDown />}
            title="Fix my mistakes"
            sub="Questions you got wrong"
            onClick={() => start({ slugs: topics.map((t) => t.slug), n: 30, m: "practice", f: "wrong" })}
          />
        </div>

        <div className="card space-y-5 p-5">
          <h2 className="font-serif text-lg font-semibold">Build your own</h2>
          <Field label="Mode">
            <Seg value={mode} onChange={setMode} options={[["practice", "Practice: instant feedback"], ["exam", "Mock exam: timed"]]} />
          </Field>
          <Field label="Questions">
            <Seg value={count} onChange={setCount} options={[[10, "10"], [20, "20"], [30, "30"], [50, "50"], [0, "All"]]} />
          </Field>
          <Field label="Which questions">
            <Seg value={filter} onChange={setFilter} options={[["any", "Any"], ["unseen", "Unseen"], ["wrong", "Got wrong"]]} />
          </Field>
          <Field label={`Topics (${selected.size} selected · ${available} questions)`}>
            <div className="mb-2 flex flex-wrap gap-2">
              <button className="chip hover:bg-line" onClick={() => setSelected(new Set(topics.map((t) => t.slug)))}>Select all</button>
              <button className="chip hover:bg-line" onClick={() => setSelected(new Set())}>Clear</button>
            </div>
            <div className="space-y-3">
              {WEEKS.map((w) => {
                const wt = topics.filter((t) => t.week === w);
                const all = wt.every((t) => selected.has(t.slug));
                return (
                  <div key={w}>
                    <button onClick={() => toggleWeek(w)} className={clsx("mb-1.5 text-sm font-semibold", all ? "text-brand" : "text-ink-2")}>
                      {all ? "☑" : "☐"} Week {w}
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                      {wt.map((t) => (
                        <button
                          key={t.slug}
                          onClick={() =>
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(t.slug)) next.delete(t.slug);
                              else next.add(t.slug);
                              return next;
                            })
                          }
                          className={clsx(
                            "rounded-lg border px-2.5 py-1 text-left text-xs",
                            selected.has(t.slug) ? "border-brand bg-brand-soft text-brand" : "border-line text-ink-3",
                          )}
                        >
                          {t.title} <span className="opacity-60">({t.mcqs})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Field>
          <button className="btn btn-primary w-full sm:w-auto" disabled={!selected.size || loading} onClick={() => start()}>
            <Play size={16} /> {loading ? "Loading…" : "Start quiz"}
          </button>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="card p-5">
          <h3 className="font-semibold">Recent attempts</h3>
          {state.sessions.length === 0 ? (
            <p className="mt-2 text-sm text-ink-3">No quizzes yet. Your scores will appear here.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {state.sessions.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <span className={clsx("chip mr-2", s.mode === "exam" && "bg-brand-soft text-brand")}>{s.mode}</span>
                    {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  <span className="font-semibold">
                    {s.score}/{s.total} <span className="font-normal text-ink-3">({Math.round((s.score / s.total) * 100)}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {weak.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold">Topics to revisit</h3>
            <ul className="mt-2 space-y-2">
              {weak.map((w) => (
                <li key={w.slug} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/topics/${w.slug}`} className="hover:text-brand">
                    {w.title}
                  </Link>
                  <span className={clsx("font-semibold", w.acc < 0.6 ? "text-bad" : "text-warn")}>{Math.round(w.acc * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function Preset({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card flex flex-col gap-2 p-4 text-left transition hover:border-brand">
      <span className="text-brand">{icon}</span>
      <span className="font-semibold">{title}</span>
      <span className="text-xs text-ink-3">{sub}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      {children}
    </div>
  );
}

function Seg<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={clsx(
            "rounded-lg border px-3 py-1.5 text-sm font-medium",
            value === v ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface text-ink-2 hover:bg-surface-2",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
