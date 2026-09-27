"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session as AuthSession, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { newCard, review, type CardState, type Grade } from "./srs";

// ── State shape ──────────────────────────────────────────────
export type TopicStatus = "not_started" | "in_progress" | "done";

export interface TopicState {
  status: TopicStatus;
  bookmarked: boolean;
  confidence?: number | null;
  updatedAt: string;
}
export interface NoteState {
  body: string;
  updatedAt: string;
}
export interface QuestionState {
  topic: string;
  attempts: number;
  correct: number;
  lastCorrect: boolean | null;
  updatedAt: string;
}
export interface QuizSession {
  id: string;
  mode: "practice" | "exam";
  topics: string[];
  score: number;
  total: number;
  durationS?: number | null;
  createdAt: string;
}
export interface CaseState {
  topic: string;
  completed: boolean;
  updatedAt: string;
}
export interface Settings {
  rotationStart: string | null;
  displayName: string | null;
  updatedAt: string;
}

export interface StudyState {
  settings: Settings;
  topics: Record<string, TopicState>;
  notes: Record<string, NoteState>;
  cards: Record<string, CardState>;
  questions: Record<string, QuestionState>;
  sessions: QuizSession[];
  cases: Record<string, CaseState>;
}

const EPOCH = new Date(0).toISOString();
const emptyState = (): StudyState => ({
  settings: { rotationStart: null, displayName: null, updatedAt: EPOCH },
  topics: {},
  notes: {},
  cards: {},
  questions: {},
  sessions: [],
  cases: {},
});

const STORAGE_KEY = "for-edith:v1";
const now = () => new Date().toISOString();
const newer = (a?: { updatedAt: string }, b?: { updatedAt: string }) =>
  !b || (a && a.updatedAt > b.updatedAt);

function loadLocal(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
  } catch {}
  return emptyState();
}
function saveLocal(s: StudyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

// ── Supabase mapping ────────────────────────────────────────
type Row = Record<string, unknown>;

/** Supabase caps responses (1000 rows by default), so page through big tables. */
async function selectAll(sb: SupabaseClient, table: string, order: string) {
  const PAGE = 1000;
  const data: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const res = await sb.from(table).select("*").order(order).range(from, from + PAGE - 1);
    if (res.error) return { data: null, error: res.error };
    data.push(...(res.data as Row[]));
    if (res.data.length < PAGE) return { data, error: null };
  }
}

async function pullRemote(sb: SupabaseClient): Promise<StudyState> {
  const s = emptyState();
  const [settings, topics, notes, cards, questions, sessions, cases] = await Promise.all([
    sb.from("user_settings").select("*").maybeSingle(),
    selectAll(sb, "topic_progress", "topic_slug"),
    selectAll(sb, "topic_notes", "topic_slug"),
    selectAll(sb, "flashcard_reviews", "card_id"),
    selectAll(sb, "question_stats", "question_id"),
    sb.from("quiz_sessions").select("*").order("created_at", { ascending: false }).limit(200),
    selectAll(sb, "case_progress", "case_id"),
  ]);
  const firstError = [settings, topics, notes, cards, questions, sessions, cases].find((r) => r.error)?.error;
  if (firstError) throw firstError;
  if (settings.data)
    s.settings = {
      rotationStart: settings.data.rotation_start,
      displayName: settings.data.display_name,
      updatedAt: settings.data.updated_at,
    };
  for (const r of (topics.data ?? []) as Row[])
    s.topics[r.topic_slug as string] = {
      status: r.status as TopicStatus,
      bookmarked: r.bookmarked as boolean,
      confidence: r.confidence as number | null,
      updatedAt: r.updated_at as string,
    };
  for (const r of (notes.data ?? []) as Row[])
    s.notes[r.topic_slug as string] = { body: r.body as string, updatedAt: r.updated_at as string };
  for (const r of (cards.data ?? []) as Row[])
    s.cards[r.card_id as string] = {
      topic: r.topic_slug as string,
      ease: r.ease as number,
      interval: r.interval_days as number,
      reps: r.reps as number,
      lapses: r.lapses as number,
      due: r.due_at as string,
      updatedAt: r.updated_at as string,
    };
  for (const r of (questions.data ?? []) as Row[])
    s.questions[r.question_id as string] = {
      topic: r.topic_slug as string,
      attempts: r.attempts as number,
      correct: r.correct as number,
      lastCorrect: r.last_correct as boolean | null,
      updatedAt: r.updated_at as string,
    };
  s.sessions = ((sessions.data ?? []) as Row[]).map((r) => ({
    id: r.id as string,
    mode: r.mode as "practice" | "exam",
    topics: r.topics as string[],
    score: r.score as number,
    total: r.total as number,
    durationS: r.duration_s as number | null,
    createdAt: r.created_at as string,
  }));
  for (const r of (cases.data ?? []) as Row[])
    s.cases[r.case_id as string] = {
      topic: r.topic_slug as string,
      completed: r.completed as boolean,
      updatedAt: r.updated_at as string,
    };
  return s;
}

const rows = {
  settings: (uid: string, v: Settings) => ({
    user_id: uid,
    rotation_start: v.rotationStart,
    display_name: v.displayName,
    updated_at: v.updatedAt,
  }),
  topic: (uid: string, slug: string, v: TopicState) => ({
    user_id: uid,
    topic_slug: slug,
    status: v.status,
    bookmarked: v.bookmarked,
    confidence: v.confidence ?? null,
    updated_at: v.updatedAt,
  }),
  note: (uid: string, slug: string, v: NoteState) => ({ user_id: uid, topic_slug: slug, body: v.body, updated_at: v.updatedAt }),
  card: (uid: string, id: string, v: CardState) => ({
    user_id: uid,
    card_id: id,
    topic_slug: v.topic,
    ease: v.ease,
    interval_days: v.interval,
    reps: v.reps,
    lapses: v.lapses,
    due_at: v.due,
    updated_at: v.updatedAt,
  }),
  question: (uid: string, id: string, v: QuestionState) => ({
    user_id: uid,
    question_id: id,
    topic_slug: v.topic,
    attempts: v.attempts,
    correct: v.correct,
    last_correct: v.lastCorrect,
    updated_at: v.updatedAt,
  }),
  session: (uid: string, v: QuizSession) => ({
    id: v.id,
    user_id: uid,
    mode: v.mode,
    topics: v.topics,
    score: v.score,
    total: v.total,
    duration_s: v.durationS ?? null,
    created_at: v.createdAt,
  }),
  case: (uid: string, id: string, v: CaseState) => ({
    user_id: uid,
    case_id: id,
    topic_slug: v.topic,
    completed: v.completed,
    updated_at: v.updatedAt,
  }),
};

const TABLES = {
  topics: ["topic_progress", "user_id,topic_slug", rows.topic],
  notes: ["topic_notes", "user_id,topic_slug", rows.note],
  cards: ["flashcard_reviews", "user_id,card_id", rows.card],
  questions: ["question_stats", "user_id,question_id", rows.question],
  cases: ["case_progress", "user_id,case_id", rows.case],
} as const;

type KeyedSection = keyof typeof TABLES;

/** Merge two states: per key, the most recently updated record wins. */
function merge(local: StudyState, remote: StudyState) {
  const merged = emptyState();
  const toPush: { [K in KeyedSection]: string[] } & { settings: boolean; sessions: QuizSession[] } = {
    topics: [],
    notes: [],
    cards: [],
    questions: [],
    cases: [],
    settings: false,
    sessions: [],
  };
  merged.settings = newer(local.settings, remote.settings) ? local.settings : remote.settings;
  toPush.settings = merged.settings === local.settings && local.settings.updatedAt !== EPOCH;
  for (const section of Object.keys(TABLES) as KeyedSection[]) {
    const l = local[section] as Record<string, { updatedAt: string }>;
    const r = remote[section] as Record<string, { updatedAt: string }>;
    const out = merged[section] as Record<string, { updatedAt: string }>;
    for (const k of new Set([...Object.keys(l), ...Object.keys(r)])) {
      if (newer(l[k], r[k])) {
        out[k] = l[k];
        toPush[section].push(k);
      } else out[k] = r[k];
    }
  }
  const remoteIds = new Set(remote.sessions.map((x) => x.id));
  toPush.sessions = local.sessions.filter((x) => !remoteIds.has(x.id));
  merged.sessions = [...remote.sessions, ...toPush.sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { merged, toPush };
}

// ── Context ─────────────────────────────────────────────────
export type SyncStatus = "local" | "syncing" | "synced" | "error";

interface StudyContextValue {
  state: StudyState;
  hydrated: boolean;
  sync: { status: SyncStatus; error?: string; email?: string | null; configured: boolean };
  setTopicStatus(slug: string, status: TopicStatus): void;
  toggleBookmark(slug: string): void;
  setConfidence(slug: string, confidence: number): void;
  saveNote(slug: string, body: string): void;
  gradeCard(cardId: string, topic: string, grade: Grade): void;
  recordAnswer(questionId: string, topic: string, correct: boolean): void;
  recordSession(s: Omit<QuizSession, "id" | "createdAt">): void;
  setCaseCompleted(caseId: string, topic: string, completed: boolean): void;
  updateSettings(patch: Partial<Omit<Settings, "updatedAt">>): void;
  signOut(): Promise<void>;
  resyncNow(): Promise<void>;
  resetLocal(): void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StudyState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [syncError, setSyncError] = useState<string>();
  const stateRef = useRef(state);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const commit = useCallback((updater: (s: StudyState) => StudyState) => {
    setState((prev) => {
      const next = updater(prev);
      stateRef.current = next;
      saveLocal(next);
      return next;
    });
  }, []);

  // Load from localStorage once on mount.
  useEffect(() => {
    const local = loadLocal();
    stateRef.current = local;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from browser storage
    setState(local);
    setHydrated(true);
  }, []);

  // Track the Supabase auth session.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;

  const push = useCallback(
    async (table: string, onConflict: string | null, payload: Row | Row[]) => {
      const sb = getSupabase();
      if (!sb || !uid) return;
      const q = onConflict
        ? sb.from(table).upsert(payload, { onConflict })
        : sb.from(table).insert(payload);
      const { error } = await q;
      if (error) {
        setSyncStatus("error");
        setSyncError(error.message);
      } else setSyncStatus("synced");
    },
    [uid],
  );

  const fullSync = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !uid) return;
    setSyncStatus("syncing");
    try {
      const remote = await pullRemote(sb);
      const { merged, toPush } = merge(stateRef.current, remote);
      stateRef.current = merged;
      setState(merged);
      saveLocal(merged);
      const writes: Promise<unknown>[] = [];
      if (toPush.settings) writes.push(push("user_settings", "user_id", rows.settings(uid, merged.settings)));
      for (const section of Object.keys(TABLES) as KeyedSection[]) {
        const [table, conflict, toRow] = TABLES[section];
        const keys = toPush[section];
        if (!keys.length) continue;
        const data = merged[section] as Record<string, never>;
        const payload = keys.map((k) => (toRow as (u: string, k: string, v: never) => Row)(uid, k, data[k]));
        for (let i = 0; i < payload.length; i += 500) writes.push(push(table, conflict, payload.slice(i, i + 500)));
      }
      if (toPush.sessions.length) writes.push(push("quiz_sessions", "id", toPush.sessions.map((x) => rows.session(uid, x))));
      await Promise.all(writes);
      setSyncStatus((s) => (s === "error" ? s : "synced"));
      setSyncError(undefined);
    } catch (e) {
      setSyncStatus("error");
      setSyncError(e instanceof Error ? e.message : String(e));
    }
  }, [uid, push]);

  useEffect(() => {
    if (!hydrated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with Supabase when the session changes
    if (uid) void fullSync();
    else setSyncStatus("local");
  }, [uid, hydrated, fullSync]);

  // Re-sync when the tab regains focus (e.g. studied on another device).
  useEffect(() => {
    if (!uid) return;
    const onFocus = () => document.visibilityState === "visible" && void fullSync();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [uid, fullSync]);

  // ── Actions ───────────────────────────────────────────────
  const updateTopic = useCallback(
    (slug: string, patch: Partial<TopicState>) => {
      const base: TopicState = stateRef.current.topics[slug] ?? { status: "not_started", bookmarked: false, updatedAt: EPOCH };
      const next = { ...base, ...patch, updatedAt: now() };
      commit((s) => ({ ...s, topics: { ...s.topics, [slug]: next } }));
      if (uid) void push("topic_progress", "user_id,topic_slug", rows.topic(uid, slug, next));
    },
    [commit, push, uid],
  );

  const value = useMemo<StudyContextValue>(
    () => ({
      state,
      hydrated,
      sync: { status: syncStatus, error: syncError, email: session?.user.email, configured: supabaseConfigured },
      setTopicStatus: (slug, status) => updateTopic(slug, { status }),
      toggleBookmark: (slug) => updateTopic(slug, { bookmarked: !stateRef.current.topics[slug]?.bookmarked }),
      setConfidence: (slug, confidence) => updateTopic(slug, { confidence }),
      saveNote: (slug, body) => {
        const next = { body, updatedAt: now() };
        commit((s) => ({ ...s, notes: { ...s.notes, [slug]: next } }));
        if (uid) {
          clearTimeout(noteTimers.current[slug]);
          noteTimers.current[slug] = setTimeout(() => void push("topic_notes", "user_id,topic_slug", rows.note(uid, slug, next)), 800);
        }
      },
      gradeCard: (cardId, topic, grade) => {
        const next = review(stateRef.current.cards[cardId] ?? newCard(topic), grade);
        commit((s) => ({ ...s, cards: { ...s.cards, [cardId]: next } }));
        if (uid) void push("flashcard_reviews", "user_id,card_id", rows.card(uid, cardId, next));
      },
      recordAnswer: (questionId, topic, correct) => {
        const prev = stateRef.current.questions[questionId];
        const next: QuestionState = {
          topic,
          attempts: (prev?.attempts ?? 0) + 1,
          correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
          lastCorrect: correct,
          updatedAt: now(),
        };
        commit((s) => ({ ...s, questions: { ...s.questions, [questionId]: next } }));
        if (uid) void push("question_stats", "user_id,question_id", rows.question(uid, questionId, next));
      },
      recordSession: (partial) => {
        const next: QuizSession = { ...partial, id: crypto.randomUUID(), createdAt: now() };
        commit((s) => ({ ...s, sessions: [next, ...s.sessions] }));
        if (uid) void push("quiz_sessions", "id", rows.session(uid, next));
      },
      setCaseCompleted: (caseId, topic, completed) => {
        const next = { topic, completed, updatedAt: now() };
        commit((s) => ({ ...s, cases: { ...s.cases, [caseId]: next } }));
        if (uid) void push("case_progress", "user_id,case_id", rows.case(uid, caseId, next));
      },
      updateSettings: (patch) => {
        const next = { ...stateRef.current.settings, ...patch, updatedAt: now() };
        commit((s) => ({ ...s, settings: next }));
        if (uid) void push("user_settings", "user_id", rows.settings(uid, next));
      },
      signOut: async () => {
        await getSupabase()?.auth.signOut();
      },
      resyncNow: fullSync,
      resetLocal: () => commit(() => emptyState()),
    }),
    [state, hydrated, syncStatus, syncError, session, updateTopic, commit, push, uid, fullSync],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside <StudyProvider>");
  return ctx;
}
