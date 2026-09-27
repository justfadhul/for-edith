"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, CalendarDays, Home, Layers, ListChecks, Search, UserRound, Zap, Stethoscope } from "lucide-react";
import { useStudy } from "@/lib/store/study-store";

const NAV = [
  { href: "/", label: "Today", icon: Home },
  { href: "/topics", label: "Topics", icon: BookOpen },
  { href: "/flashcards", label: "Cards", icon: Layers },
  { href: "/quiz", label: "Quiz", icon: ListChecks },
  { href: "/cases", label: "Cases", icon: Stethoscope },
  { href: "/schedule", label: "Timetable", icon: CalendarDays },
  { href: "/quick-reference", label: "Quick ref", icon: Zap },
];

const MOBILE = ["/", "/topics", "/flashcards", "/quiz", "/cases"];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { sync } = useStudy();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-brand-ink text-sm">E</span>
          <span>
            For Edith <span className="hidden text-ink-3 font-sans text-sm font-normal sm:inline">· Obs &amp; Gyn</span>
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(pathname, n.href) ? "bg-brand-soft text-brand" : "text-ink-2 hover:bg-surface-2",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
            <Search size={20} />
          </Link>
          <Link
            href="/schedule"
            aria-label="Timetable"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2 lg:hidden"
          >
            <CalendarDays size={20} />
          </Link>
          <Link
            href="/quick-reference"
            aria-label="Quick reference"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2 lg:hidden"
          >
            <Zap size={20} />
          </Link>
          <Link
            href="/account"
            aria-label="Account & settings"
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-surface-2"
          >
            <UserRound size={20} />
            {sync.status === "synced" && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-good" />}
            {sync.status === "error" && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-bad" />}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {NAV.filter((n) => MOBILE.includes(n.href)).map((n) => {
          const active = isActive(pathname, n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={clsx("flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", active ? "text-brand" : "text-ink-3")}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
              {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
