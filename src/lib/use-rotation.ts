"use client";

import { useCallback, useMemo } from "react";
import { ROTATIONS, type RotationConfig, type RotationId } from "@/content/rotations";
import { useStudy, type Settings } from "@/lib/store/study-store";
import { useNow } from "@/lib/use-now";
import { rotationInfo, type RotationInfo } from "@/lib/dates";

/** Edith's start date for a rotation (her own, or the timetable default). */
export function rotationStart(settings: Settings, id: RotationId): string {
  const own = id === "paeds" ? settings.paedsStart : settings.rotationStart;
  return own || ROTATIONS[id].defaultStart;
}

/** Where a rotation stands. Pass `now` from useNow() (see rotationInfo). */
export function rotationInfoFor(settings: Settings, id: RotationId, now?: number): RotationInfo {
  return rotationInfo(rotationStart(settings, id), now, ROTATIONS[id].defaultStart, ROTATIONS[id].lastDay);
}

export interface ActiveRotation {
  rotation: RotationConfig;
  id: RotationId;
  /** YYYY-MM-DD */
  start: string;
  info: RotationInfo;
  /** Slugs listed in this rotation (own + shared). */
  slugs: Set<string>;
  setRotation: (id: RotationId) => void;
}

/** The active rotation, its start date and where it stands today. */
export function useRotation(): ActiveRotation {
  const { state, updateSettings } = useStudy();
  const now = useNow();
  const id = state.settings.rotation;
  const rotation = ROTATIONS[id];
  const start = rotationStart(state.settings, id);
  const slugs = useMemo(() => new Set(rotation.topics.map((t) => t.slug)), [rotation]);
  const setRotation = useCallback(
    (next: RotationId) => {
      if (next !== id) updateSettings({ rotation: next });
    },
    [id, updateSettings],
  );
  return {
    rotation,
    id,
    start,
    info: rotationInfo(start, now, rotation.defaultStart, rotation.lastDay),
    slugs,
    setRotation,
  };
}
