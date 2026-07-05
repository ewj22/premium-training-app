# Premium Training App

Apple-inspired, dark-first training platform. Two surfaces: a React Native (Expo)
client app and a coach web dashboard, sharing one Supabase backend and one
`packages/types` contract.

## Monorepo layout

```
apps/
  mobile/     Expo RN app — client-facing (this phase)
  web/        Next.js coach dashboard (Phase 6+)
packages/
  types/      Shared domain types (view models)
  database/   SQL migrations + RLS policies (single source of truth for schema)
  config/     Shared Tailwind tokens (Phase 6, once web exists)
```

## Why this structure

- **Feature-first, not layer-first** inside `apps/mobile/src/features/*` — each
  feature (auth, workouts, nutrition...) owns its API calls, hooks, and
  components. You can delete a feature folder and nothing else breaks.
- **Zustand vs React Query is a hard boundary**: Zustand holds *who is using
  the app right now* (session, profile, role). React Query holds *what the
  server says* (workouts, messages, everything fetched). Never mix the two —
  it's the #1 source of stale-UI bugs in apps like this.
- **RLS is the real authorization layer**, not client-side role checks. Every
  table in `002_rls_policies.sql` is deny-by-default; the mobile app's role
  checks are UX conveniences (hiding buttons), not security.
- **Design tokens live in two places on purpose**: `tailwind.config.js` for
  anything using `className`, `shared/theme/tokens.ts` for raw JS values
  (Reanimated configs, chart libraries). Keep them numerically in sync.

## Setup

```bash
pnpm install
cp apps/mobile/.env.example apps/mobile/.env   # fill in Supabase URL + anon key

# Push schema to your Supabase project
supabase link --project-ref <your-project-ref>
pnpm db:push

# Generate typed database types (re-run after every migration)
supabase gen types typescript --project-id <your-project-id> \
  > apps/mobile/src/shared/types/database.types.ts

pnpm mobile   # starts Expo
```

## Phase roadmap

- [x] **Phase 1 — Foundation**: project scaffold, auth (sign up/in/out, session
      persistence), full DB schema + RLS, navigation shell, design system.
- [x] **Phase 2 — Workout logging** (this delivery): exercise library +
      seed data, quick-start workout flow (pick exercises → log sets →
      finish), rest timer, progressive overload display (shows last
      session's best lift right above the input), automatic personal-best
      detection, workout history + read-only session detail view.
- [ ] **Phase 3 — Nutrition & habits**: macro dashboard, food logging, weight
      tracking, step/water/sleep habit tracking.
- [ ] **Phase 4 — Progress**: progress photos (upload + comparison slider),
      body metrics charts, check-in submission flow.
- [ ] **Phase 5 — Messaging & notifications**: realtime chat via Supabase
      Realtime, push notifications via Expo push service + edge functions.
- [ ] **Phase 6 — Coach web dashboard**: Next.js app, client management,
      drag-and-drop workout builder, nutrition builder, check-in review,
      analytics, programme duplication.

### Migrations to run (in order)

```
001_initial_schema.sql
002_rls_policies.sql
003_seed_exercises.sql   -- new in Phase 2: exercise library content
004_logged_sets_unique_constraint.sql  -- new in Phase 2: needed for set upserts
```

### Notes on Phase 2's design choice

There's no coach-assigned programme yet (that's the web dashboard, Phase 6),
so Phase 2 ships a **"quick start" workout**: pick exercises from the library,
log sets freely. This exercises the full logged_exercises/logged_sets data
model and PB detection now, without blocking on the coach dashboard. Once
Phase 6 ships, "quick start" and "assigned programme" workouts will both
flow into the exact same workout_sessions/logged_sets tables — no schema
changes needed, just a different starting screen.

### Bug fixes applied in this delivery

If you were patching a Phase 1 copy by hand, this delivery has all of the
following already fixed, so a fresh copy replaces the need for manual patches:
`index.js` entry point, `App.tsx`/`MainNavigator.tsx`/`AuthNavigator.tsx`
import paths, `app.json` plugin/asset references, `package.json` main field +
Expo SDK 54 + `react-native-worklets` + `nativewind`/`react-native-css-interop`
versions.


## Verifying Phase 1 works

1. `pnpm mobile`, open in Expo Go or a simulator.
2. Sign up → creates `auth.users` row + `public.profiles` row (role: client).
3. You land on the Onboarding stub (since `onboarding_completed = false`).
4. Sign out, sign back in → session persists via AsyncStorage/SecureStore,
   RootNavigator resolves to the correct stack without flicker.
5. Manually flip `onboarding_completed = true` in the Supabase table editor,
   reload → you land on the tab navigator with all 5 stub screens working.
