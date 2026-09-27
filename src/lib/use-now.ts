"use client";
import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 30_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    clearInterval(t);
    document.removeEventListener("visibilitychange", cb);
  };
};
// Snapshot is stable within a minute so React doesn't loop.
const getSnapshot = () => Math.floor(Date.now() / 60_000) * 60_000;
const getServerSnapshot = () => 0;

/** Current time (ms, minute resolution) that re-renders as time passes. */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const nowMs = () => Date.now();
