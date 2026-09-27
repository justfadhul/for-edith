# For Edith 🩺

A mobile-friendly study companion for Edith's **6-week Obstetrics & Gynaecology junior clerkship** at
Uganda Christian University School of Medicine (Year 3, Semester 2).

Every topic on the rotation timetable gets:

- **In-depth notes** that focus on **management** (step by step, with Uganda-available drugs and doses) and
  **clinical acumen** (focused history, examination, red flags, differentials, ward-round presentation)
- **High-yield summary** · **flashcards** (spaced repetition) · **single-best-answer MCQs** with explanations ·
  **step-by-step clinical cases** · **sources** (Uganda Clinical Guidelines 2023, WHO, RCOG, NICE, textbooks)

Plus a timetable that tracks the current day, a ward **quick reference** (doses, scores, criteria), a timed
**mock progressive test**, search, and progress tracking synced to Supabase.

## Tech

- **Next.js 16** (App Router, fully static) + **Tailwind CSS 4** + TypeScript
- **Supabase** for auth and per-user study progress (topic status, flashcard scheduling, quiz stats, notes)
- Content lives in the repo as Markdown + JSON (`content/topics/<slug>/`), validated by `npm run validate`
- Works without Supabase too: progress is kept in the browser until keys are configured

## Run locally

```bash
npm install
cp .env.example .env.local   # add Supabase keys (optional)
npm run dev                  # http://localhost:3000
```

## Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). It creates the
   tables with row-level security so each user only sees their own data.
3. In **Project Settings → API**, copy the **Project URL** and the **anon / publishable key** into
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. In **Authentication → URL Configuration**, set the **Site URL** to the Vercel URL and add
   `https://<your-app>.vercel.app/account` to the redirect URLs (used by email links).
   Optionally turn off "Confirm email" under **Authentication → Providers → Email** so sign-up is instant.

> Only the public anon key is used in the browser. **Never** put the `service_role` key in this app.

## Deploy to Vercel

1. Import the GitHub repo in Vercel (framework: Next.js, default settings).
2. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables.
3. Deploy. Every push to the main branch redeploys automatically.

## Editing content

See [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) for the format, and [`VERIFY.md`](VERIFY.md) for items a senior should confirm. Topics and the timetable are defined in
[`src/content/curriculum.ts`](src/content/curriculum.ts). After editing, run:

```bash
npm run validate    # structure, minimum counts, duplicate ids
npm run check:mcq   # MCQ explanations agree with the answer keys
```

---

*A study aid, not a clinical reference. Always follow current Ugandan guidelines and your supervising clinicians.*
