"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Cloud, CloudOff, Download, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { useStudy } from "@/lib/store/study-store";
import { getSupabase } from "@/lib/supabase";
import { DEFAULT_START } from "@/content/curriculum";
import { PageHeader } from "@/components/ui";

type Theme = "system" | "light" | "dark";

export function AccountView() {
  const { state, sync, updateSettings, signOut, resyncNow, resetLocal, hydrated } = useStudy();
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read saved preference
      setTheme((localStorage.getItem("for-edith:theme") as Theme) || "system");
    } catch {}
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    try {
      if (t === "system") {
        localStorage.removeItem("for-edith:theme");
        document.documentElement.removeAttribute("data-theme");
      } else {
        localStorage.setItem("for-edith:theme", t);
        document.documentElement.setAttribute("data-theme", t);
      }
    } catch {}
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `for-edith-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Account & settings" />

      {/* Sync */}
      <section className="card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          {sync.email ? <Cloud size={18} className="text-good" /> : <CloudOff size={18} className="text-ink-3" />} Cloud sync
        </h2>
        {!sync.configured ? (
          <p className="mt-2 text-sm text-ink-2">
            Cloud sync isn&apos;t set up on this deployment yet, so your progress is saved on this device only. Once the Supabase keys are
            added, you can sign in here and study across your phone and laptop.
          </p>
        ) : sync.email ? (
          <div className="mt-2 space-y-3 text-sm">
            <p>
              Signed in as <strong>{sync.email}</strong>.{" "}
              <span className={clsx(sync.status === "error" ? "text-bad" : sync.status === "synced" ? "text-good" : "text-ink-3")}>
                {sync.status === "syncing" ? "Syncing…" : sync.status === "synced" ? "All progress synced." : sync.status === "error" ? `Sync error: ${sync.error}` : ""}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-outline" onClick={() => void resyncNow()}>
                <RefreshCw size={16} /> Sync now
              </button>
              <button className="btn btn-ghost" onClick={() => void signOut()}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        ) : (
          <SignIn />
        )}
      </section>

      {/* Settings */}
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Personalise</h2>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Your name</span>
          <input
            className="input"
            placeholder="Edith"
            disabled={!hydrated}
            defaultValue={state.settings.displayName ?? ""}
            key={`name-${hydrated}-${state.settings.updatedAt}`}
            onBlur={(e) => e.target.value !== (state.settings.displayName ?? "") && updateSettings({ displayName: e.target.value || null })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Rotation start date (Monday of week 1)</span>
          <input
            type="date"
            className="input"
            disabled={!hydrated}
            value={state.settings.rotationStart ?? DEFAULT_START}
            onChange={(e) => updateSettings({ rotationStart: e.target.value || null })}
          />
          <span className="mt-1 block text-xs text-ink-3">
            The timetable default is 17 Aug 2026. If your group rotates later, set your own start date and every date shifts to match.
          </span>
        </label>
        <div>
          <span className="mb-1 block text-sm font-medium">Appearance</span>
          <div className="flex gap-1.5">
            {(["system", "light", "dark"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => applyTheme(t)}
                className={clsx(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium capitalize",
                  theme === t ? "border-brand-line bg-brand-soft text-brand" : "border-line bg-surface text-ink-2",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-ink-2">
          {Object.keys(state.topics).length} topics tracked · {Object.keys(state.cards).length} cards reviewed ·{" "}
          {Object.keys(state.questions).length} questions answered · {state.sessions.length} quizzes
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline" onClick={exportData}>
            <Download size={16} /> Export progress
          </button>
          <button
            className="btn btn-ghost text-bad"
            onClick={() => confirm("Clear progress stored on this device? (Synced data in your account is not deleted.)") && resetLocal()}
          >
            <Trash2 size={16} /> Clear this device
          </button>
        </div>
      </section>

      <p className="px-2 text-center text-xs text-ink-3">
        For Edith is a study aid compiled from Uganda Clinical Guidelines, WHO, RCOG and standard textbooks. Always follow your
        consultants and current local protocols in clinical practice.
      </p>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setMsg(null);
    const redirect = `${window.location.origin}/account`;
    const res =
      mode === "magic"
        ? await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } })
        : mode === "signup"
          ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect } })
          : await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) setMsg({ ok: false, text: res.error.message });
    else if (mode === "magic") setMsg({ ok: true, text: "Check your email for a sign-in link." });
    else if (mode === "signup" && !res.data.session) setMsg({ ok: true, text: "Account created. Check your email to confirm, then sign in." });
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <p className="text-sm text-ink-2">Sign in to save your progress to the cloud and pick up on any device.</p>
      <div className="flex gap-1.5 text-sm">
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
            ["magic", "Email link"],
          ] as const
        ).map(([m, label]) => (
          <button
            type="button"
            key={m}
            onClick={() => setMode(m)}
            className={clsx("rounded-lg px-3 py-1.5 font-medium", mode === m ? "bg-brand-soft text-brand" : "text-ink-3")}
          >
            {label}
          </button>
        ))}
      </div>
      <input className="input" type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {mode !== "magic" && (
        <input
          className="input"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Please wait…" : mode === "magic" ? "Send link" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
      {msg && <p className={clsx("text-sm", msg.ok ? "text-good" : "text-bad")}>{msg.text}</p>}
    </form>
  );
}
