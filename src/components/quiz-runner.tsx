"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronLeft, ChevronRight, Flag, RotateCcw, Timer, X } from "lucide-react";
import type { Mcq } from "@/lib/types";
import { useStudy } from "@/lib/store/study-store";
import { Markdown } from "@/components/markdown";
import { nowMs } from "@/lib/use-now";

export type QuizQuestion = Mcq & { topic: string; topicTitle?: string };

const LETTERS = ["A", "B", "C", "D", "E"];

export function QuizRunner({
  questions,
  mode = "practice",
  timeLimitMin,
  onExit,
}: {
  questions: QuizQuestion[];
  mode?: "practice" | "exam";
  timeLimitMin?: number;
  onExit?: () => void;
}) {
  const { recordAnswer, recordSession } = useStudy();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [flags, setFlags] = useState<boolean[]>(() => questions.map(() => false));
  const [submitted, setSubmitted] = useState(false);
  const [reviewOnlyWrong, setReviewOnlyWrong] = useState(false);
  const startedAt = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startedAt.current = nowMs();
  }, []);

  const finished = mode === "practice" ? answers.every((a) => a !== null) : submitted;
  const score = answers.reduce<number>((n, a, i) => n + (a === questions[i].answer ? 1 : 0), 0);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed(Math.floor((nowMs() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    answers.forEach((a, i) => recordAnswer(questions[i].id, questions[i].topic, a === questions[i].answer));
    recordSession({
      mode: "exam",
      topics: [...new Set(questions.map((q) => q.topic))],
      score: answers.reduce<number>((n, a, i) => n + (a === questions[i].answer ? 1 : 0), 0),
      total: questions.length,
      durationS: Math.floor((nowMs() - startedAt.current) / 1000),
    });
    setIdx(0);
  };

  const remaining = timeLimitMin ? timeLimitMin * 60 - elapsed : null;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-submit when the exam timer runs out
    if (mode === "exam" && remaining !== null && remaining <= 0 && !submitted) submit();
  });

  const choose = (opt: number) => {
    if (mode === "practice") {
      if (answers[idx] !== null) return;
      const next = answers.map((a, i) => (i === idx ? opt : a));
      setAnswers(next);
      recordAnswer(questions[idx].id, questions[idx].topic, opt === questions[idx].answer);
      if (next.every((a) => a !== null)) {
        recordSession({
          mode: "practice",
          topics: [...new Set(questions.map((q) => q.topic))],
          score: next.reduce<number>((n, a, i) => n + (a === questions[i].answer ? 1 : 0), 0),
          total: questions.length,
          durationS: Math.floor((nowMs() - startedAt.current) / 1000),
        });
      }
    } else if (!submitted) {
      setAnswers((a) => a.map((x, i) => (i === idx ? opt : x)));
    }
  };

  const visible = useMemo(
    () => questions.map((_, i) => i).filter((i) => !reviewOnlyWrong || answers[i] !== questions[i].answer),
    [questions, answers, reviewOnlyWrong],
  );

  if (!questions.length) return <div className="card p-6 text-center text-ink-3">No questions yet.</div>;

  const q = questions[idx];
  const chosen = answers[idx];
  const reveal = mode === "practice" ? chosen !== null : submitted;
  const fmt = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

  // ── Results summary (shown above review once finished) ──
  const summary = finished && (
    <div className="card mb-4 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-4xl font-bold text-brand">{Math.round((score / questions.length) * 100)}%</div>
        <div className="flex-1">
          <div className="font-semibold">
            {score} / {questions.length} correct
          </div>
          <div className="text-sm text-ink-3">
            Time {fmt(elapsed)} · {score / questions.length >= 0.7 ? "Great work, keep it up." : "Review the explanations below; each one teaches the reasoning."}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline" onClick={() => setReviewOnlyWrong((v) => !v)}>
            {reviewOnlyWrong ? "Show all" : "Only wrong ones"}
          </button>
          {onExit && (
            <button className="btn btn-primary" onClick={onExit}>
              <RotateCcw size={16} /> New quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {summary}
      {/* Header */}
      <div className="mb-3 flex items-center gap-3 text-sm">
        <span className="font-semibold">
          Question {idx + 1} <span className="text-ink-3">/ {questions.length}</span>
        </span>
        {q.topicTitle && (
          <Link href={`/topics/${q.topic}`} className="truncate text-ink-3 hover:text-brand">
            {q.topicTitle}
          </Link>
        )}
        <span className="ml-auto flex items-center gap-1 tabular-nums text-ink-3">
          <Timer size={15} />
          {remaining !== null && !finished ? fmt(remaining) : fmt(elapsed)}
        </span>
      </div>

      {/* Navigator */}
      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {questions.map((qq, i) => {
          const a = answers[i];
          const show = mode === "practice" ? a !== null : submitted;
          const dim = reviewOnlyWrong && !visible.includes(i);
          return (
            <button
              key={qq.id}
              onClick={() => setIdx(i)}
              className={clsx(
                "relative h-8 min-w-8 shrink-0 rounded-lg border text-xs font-semibold",
                i === idx ? "border-brand ring-2 ring-brand/30" : "border-line",
                show && a === qq.answer && "bg-good-soft text-good",
                show && a !== qq.answer && "bg-bad-soft text-bad",
                !show && a !== null && "bg-brand-soft text-brand",
                dim && "opacity-30",
              )}
            >
              {i + 1}
              {flags[i] && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warn" />}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div className="card p-5">
        <div className="flex items-start gap-2">
          <Markdown className="prose-compact flex-1 font-medium">{q.stem}</Markdown>
          {mode === "exam" && !submitted && (
            <button
              className={clsx("rounded-lg p-2", flags[idx] ? "text-warn" : "text-ink-3")}
              onClick={() => setFlags((f) => f.map((x, i) => (i === idx ? !x : x)))}
              aria-label="Flag for review"
            >
              <Flag size={18} />
            </button>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answer;
            const isChosen = chosen === i;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={reveal}
                className={clsx(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                  !reveal && (isChosen ? "border-brand bg-brand-soft" : "border-line hover:bg-surface-2"),
                  reveal && isAnswer && "border-good bg-good-soft",
                  reveal && isChosen && !isAnswer && "border-bad bg-bad-soft",
                  reveal && !isAnswer && !isChosen && "border-line opacity-70",
                )}
              >
                <span
                  className={clsx(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                    reveal && isAnswer ? "bg-good text-white" : reveal && isChosen ? "bg-bad text-white" : "bg-surface-2",
                  )}
                >
                  {reveal && isAnswer ? <Check size={14} /> : reveal && isChosen ? <X size={14} /> : LETTERS[i]}
                </span>
                <span className="pt-0.5">{opt}</span>
              </button>
            );
          })}
        </div>

        {reveal && (
          <div className="mt-5 rounded-xl border border-line bg-surface-2/70 p-4">
            <div className="mb-1.5 flex flex-wrap items-baseline gap-2 text-[14px] font-semibold">
              {chosen === q.answer ? (
                <span className="font-serif text-[24px] font-normal italic text-good">Nicely done.</span>
              ) : chosen === null ? null : (
                <span className="font-serif text-[24px] font-normal italic text-brand">Not quite.</span>
              )}
              <span>{chosen === q.answer ? `${LETTERS[q.answer]} is right` : `The answer is ${LETTERS[q.answer]}`}</span>
            </div>
            <Markdown className="prose-compact">{q.explanation}</Markdown>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2">
        <button className="btn btn-outline" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
          <ChevronLeft size={18} /> Prev
        </button>
        {mode === "exam" && !submitted && (
          <button
            className="btn btn-ghost ml-auto"
            onClick={() => {
              const unanswered = answers.filter((a) => a === null).length;
              if (!unanswered || confirm(`${unanswered} unanswered. Submit anyway?`)) submit();
            }}
          >
            Submit exam
          </button>
        )}
        <button
          className={clsx("btn btn-primary", !(mode === "exam" && !submitted) && "ml-auto")}
          onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
          disabled={idx === questions.length - 1}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
