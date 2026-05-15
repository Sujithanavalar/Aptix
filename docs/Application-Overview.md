# Aptix Web – Application Flow and Tech Stack

## What the Application Does
- Aptix is an aptitude learning and testing platform with topic-based practice and timed tests.
- Users take tests across three difficulties (`easy`, `medium`, `hard`) per topic; higher levels unlock when users score ≥ 80% in the prior level.
- Progress, attempts, and feedback are stored securely with Row Level Security (RLS) in Supabase.
- The UI is a single-page app built with React, Vite, Tailwind, and Radix UI.

## Core Features
- Topic browsing and selection
- Test configuration (question count, timer)
- Timed test-taking with per-question answers
- Results view with score, time, and summary
- Automatic saving of attempts and level unlocking
- Wrong answers review page with question details and solution steps
- Progress statistics and history
- Feedback submission with star rating and optional comments

## High-Level Flow
1. Authentication
   - Users sign up and sign in via Supabase Auth.
   - Hook: `src/hooks/useAuth.ts:73` handles `signIn`, `signUp`, `signOut`.
   - Profile fetch and auth state subscription in `src/hooks/useAuth.ts:1-44`.
2. Configure Test
   - Page: `src/pages/TestConfig.tsx:53` fetches and composes level unlocks (easy default; medium/hard based on scores).
3. Take Test
   - Users answer questions; configuration dictates question count and timer.
4. Save Attempt
   - Results page saves attempt: `src/pages/TestResults.tsx:48`.
   - Triggers server-side sync to level progress via DB trigger after insert: `supabase/migrations/20251212_add_test_attempts_trigger_update_level_progress.sql:1-30`.
5. Update Level Progress and Unlock
   - Client RPC path: `src/db/api.ts:501` calls `update_level_progress` and falls back to upserts if needed.
   - Server function (80% rule, unlock next): `supabase/migrations/20240115000006_add_level_progress.sql:113-227`.
   - Additional grants/backfill helper: `supabase/migrations/20251212_add_level_progress_grants_and_backfill.sql:1-57`.
6. Show Results and Unlock Notification
   - UI toast on unlock: `src/pages/TestResults.tsx:90-123`.
7. Wrong Answers Review
   - Navigate from results to dedicated page showing wrong answers (question, options, chosen vs correct, explanation, steps).
   - Page: `src/pages/WrongAnswers.tsx` (route added in `src/routes.tsx`).
8. History and Progress
   - History visible from learning dashboard; deduplication ensures one display per attempt.
9. Feedback Submission
   - Modal UI: `src/components/common/FeedbackModal.tsx:1-174`.
   - RPC ensures RLS-safe insert with `auth.uid()`: `supabase/migrations/20251212_submit_feedback_rpc.sql:1-25`.
   - Trigger sets `user_id` automatically for direct inserts: `supabase/migrations/20251212_feedback_set_user_id_trigger.sql:1-18`.

## Data Model & Security
- RLS-enabled tables: profiles, topics, questions, test_attempts, user_progress, user_level_progress, feedback.
- Initial schema: `supabase/migrations/00001_create_initial_schema.sql:136-182`.
- Level progress table and policies: `supabase/migrations/20240115000006_add_level_progress.sql:1-78`.
- Feedback table and policies: `supabase/migrations/00009_create_feedback_table.sql:1-61`.
- Functions marked `SECURITY DEFINER` to run with appropriate privileges, combined with grants to `authenticated`.

## Routing
- Client-side routing via React Router.
- SPA fallback configured for Netlify with `public/_redirects` containing `/* /index.html 200`.
- Example routes:
  - Test configuration/results: `src/pages/TestConfig.tsx`, `src/pages/TestResults.tsx`
  - Wrong answers: `src/pages/WrongAnswers.tsx` (linked from results)
  - About page: `src/pages/About.tsx:144-170`

## Tech Stack
- Frontend: React 18 (`react`, `react-dom`), Vite 5 (`vite`, `@vitejs/plugin-react`)
- UI components: Radix UI (`@radix-ui/*`), Tailwind CSS (`tailwindcss`, `tailwindcss-animate`), Lucide icons (`lucide-react`)
- State/forms: `react-hook-form`, `zod`
- Charts: `recharts`
- Routing: `react-router`, `react-router-dom`
- API/data: Supabase JS (`@supabase/supabase-js`), Axios (`axios`)
- Utilities: `date-fns`, `clsx`, `tailwind-merge`
- Build tooling: Rollup (via Vite), SVGR (`vite-plugin-svgr`)
- Linting: Biome (`@biomejs/biome`), TypeScript (`typescript`)
- Package manager: pnpm (pinned via `packageManager` in `package.json`)
- See `package.json:1-90` for the full dependency list.

## Environment & Config
- Required env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Favicon configured in `index.html:5-7` using `/favicon.png` (with cache busting query).
- Supabase auth confirmations disabled in `supabase/config.toml:1-5` for dev convenience.

## Deployment Notes (Netlify)
- Build command: `pnpm run build`
- Publish directory: `dist`
- SPA redirects: `public/_redirects` with `/* /index.html 200`
- Environment variables set under Builds scope.
- Node version can be left to Netlify default (Node 22); optional pin via `NODE_VERSION=22`.

## User Flow Summary
- Sign in → choose topic/difficulty → start test → finish and save attempt → level progress updates and potentially unlocks next level → view results and wrong answers → track progress and history → submit feedback.

