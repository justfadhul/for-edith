import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="h-display">Page not found</h1>
      <p className="mt-2 text-ink-2">That page doesn&apos;t exist.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Back to today
      </Link>
    </div>
  );
}
