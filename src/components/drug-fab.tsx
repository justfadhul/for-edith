"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { GripVertical, Pill } from "lucide-react";

const HREF = "/topics/obs-gyn-pharmacology";
const KEY = "for-edith:drug-fab";
const MARGIN = 12;
const DRAG_THRESHOLD = 6;

/** Position as fractions of the free space, so it survives rotation and resizing. */
type Spot = { fx: number; fy: number };

function load(): Spot | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return s && typeof s.fx === "number" && typeof s.fy === "number" ? s : null;
  } catch {
    return null;
  }
}

function save(s: Spot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

/** Bottom-right, clear of the phone tab bar. */
function defaultPx(w: number, h: number, bw: number, bh: number) {
  const phone = window.innerWidth < 1024;
  return { x: w - bw - (phone ? 16 : 28), y: h - bh - (phone ? 96 : 28) };
}

/**
 * Floating "Drug handbook" button for the home page. Tap to open; drag to put it anywhere.
 * The spot is remembered on this device.
 */
export function DrugFab() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState(false);
  const justDragged = useRef(false);
  const drag = useRef<{ id: number; dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);

  const bounds = () => {
    const el = ref.current!;
    return {
      w: window.innerWidth,
      h: window.innerHeight,
      bw: el.offsetWidth,
      bh: el.offsetHeight,
    };
  };
  const clamp = (x: number, y: number) => {
    const { w, h, bw, bh } = bounds();
    return {
      x: Math.min(Math.max(MARGIN, x), w - bw - MARGIN),
      y: Math.min(Math.max(MARGIN, y), h - bh - MARGIN),
    };
  };
  const fromSpot = (s: Spot | null) => {
    const { w, h, bw, bh } = bounds();
    if (!s) return clamp(...(Object.values(defaultPx(w, h, bw, bh)) as [number, number]));
    return clamp(MARGIN + s.fx * (w - bw - 2 * MARGIN), MARGIN + s.fy * (h - bh - 2 * MARGIN));
  };
  const toSpot = (p: { x: number; y: number }): Spot => {
    const { w, h, bw, bh } = bounds();
    return { fx: (p.x - MARGIN) / Math.max(1, w - bw - 2 * MARGIN), fy: (p.y - MARGIN) / Math.max(1, h - bh - 2 * MARGIN) };
  };

  // Place after mount (it needs the window and its own size), and keep it on screen when the viewport changes.
  useEffect(() => {
    const stored = load();
    let hintTimer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      setPos(fromSpot(stored));
      if (!stored) {
        setHint(true);
        hintTimer = setTimeout(() => setHint(false), 6000);
      }
    });
    const onResize = () => setPos(fromSpot(load()));
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hintTimer);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!pos || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { id: e.pointerId, dx: e.clientX - pos.x, dy: e.clientY - pos.y, sx: e.clientX, sy: e.clientY, moved: false };
    ref.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      setHint(false);
    }
    setPos(clamp(e.clientX - d.dx, e.clientY - d.dy));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (d.moved && pos) {
      save(toSpot(pos));
      // The click that follows pointerup must not open the page.
      justDragged.current = true;
      setTimeout(() => (justDragged.current = false), 0);
    }
  };

  return (
    <Link
      ref={ref}
      href={HREF}
      aria-label="Open the drug handbook (drag to move)"
      title="Drug handbook · drag to move"
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => {
        // A drag must not also open the page.
        if (justDragged.current) e.preventDefault();
      }}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={clsx(
        "fixed z-40 flex touch-none select-none items-center gap-2 rounded-full bg-brand py-2.5 pl-2.5 pr-4 text-[14px] font-semibold text-white",
        "shadow-[0_10px_30px_-8px_rgba(214,61,120,0.65),0_2px_6px_rgba(0,0,0,0.12)] ring-4 ring-brand/15",
        dragging ? "cursor-grabbing scale-105" : "cursor-pointer transition-[transform,box-shadow] hover:-translate-y-0.5",
        pos ? "opacity-100" : "pointer-events-none right-4 bottom-24 opacity-0",
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
        <Pill size={17} strokeWidth={2.2} />
      </span>
      Drug handbook
      <GripVertical size={15} className="-mr-1.5 opacity-60" aria-hidden />
      {hint && (
        <span className="pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-[12px] font-medium text-white shadow-md">
          Drag me anywhere
        </span>
      )}
    </Link>
  );
}
