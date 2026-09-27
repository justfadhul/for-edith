"use client";

import { useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Eye, Lightbulb, RotateCcw } from "lucide-react";
import type { ClinicalCase } from "@/lib/types";
import { useStudy } from "@/lib/store/study-store";
import { Markdown } from "@/components/markdown";

/** Walks through a case one decision at a time. Think first, then reveal. */
export function CaseRunner({ c, topic }: { c: ClinicalCase; topic: string }) {
  const { state, setCaseCompleted } = useStudy();
  const [revealed, setRevealed] = useState(0);
  const [jots, setJots] = useState<string[]>(() => c.steps.map(() => ""));
  const done = revealed >= c.steps.length;
  const completed = state.cases[c.id]?.completed;

  return (
    <div>
      <div className="card border-l-4 border-l-brand p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-brand">Presentation</div>
        <Markdown className="prose-compact mt-1">{c.presentation}</Markdown>
      </div>

      <ol className="mt-4 space-y-3">
        {c.steps.map((s, i) => {
          if (i > revealed) return null;
          const shown = i < revealed;
          return (
            <li key={i} className="card p-4">
              <div className="flex items-start gap-3">
                <span className={clsx("grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold", shown ? "bg-good-soft text-good" : "bg-brand text-brand-ink")}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Markdown className="prose-compact font-semibold">{s.prompt}</Markdown>
                  {!shown && (
                    <>
                      <textarea
                        className="input mt-3 min-h-20 text-sm"
                        placeholder="Think it through first. Jot your answer here (optional)…"
                        value={jots[i]}
                        onChange={(e) => setJots((j) => j.map((x, k) => (k === i ? e.target.value : x)))}
                      />
                      <button className="btn btn-primary mt-3" onClick={() => setRevealed(i + 1)}>
                        <Eye size={16} /> Reveal model answer
                      </button>
                    </>
                  )}
                  {shown && (
                    <>
                      {jots[i] && (
                        <div className="mt-2 rounded-lg border border-dashed border-line p-2 text-sm text-ink-2">
                          <span className="font-semibold">You wrote:</span> {jots[i]}
                        </div>
                      )}
                      <div className="mt-2 rounded-xl bg-surface-2 p-3">
                        <Markdown className="prose-compact">{s.answer}</Markdown>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {done && (
        <div className="card mt-4 border-accent bg-accent-soft p-5">
          <div className="flex items-center gap-2 font-semibold text-accent">
            <Lightbulb size={18} /> Take-home message
          </div>
          <Markdown className="prose-compact mt-1">{c.takeaway}</Markdown>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={clsx("btn", completed ? "btn-outline" : "btn-primary")} onClick={() => setCaseCompleted(c.id, topic, !completed)}>
              <CheckCircle2 size={16} /> {completed ? "Completed ✓" : "Mark case as completed"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setRevealed(0);
                setJots(c.steps.map(() => ""));
              }}
            >
              <RotateCcw size={16} /> Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
