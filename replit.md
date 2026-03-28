# ForgeFit App

A React Native Expo fitness tracker (SDK 54) with a Python FastAPI + MongoDB backend.

## Recent Features Added
- **Fixed profile update bug**: Admin account now uses stable `user_id: "user_forgefit_admin"` — tokens remain valid across backend restarts. Fallback JWT auth by email added.
- **Country dropdown**: `SelectPicker` component with searchable modal, 75+ countries with flags.
- **Language preference**: 18 languages (Arabic, Chinese, French, German, Hindi, etc.) with flag icons. Stored in `preferred_language` user field.
- **Gym finder**: Country-specific gym chain chips + Google Maps deep-link to find/view gyms.
- **Language-aware TTS**: Workout voice coach speaks in user's chosen language using `expo-speech` with translated phrases in 15 languages.
- **Profile tab**: Shows country flag, city, and language preference.

## Architecture

### Frontend (`/frontend`)
- **Framework**: React Native + Expo SDK 54
- **Router**: Expo Router (file-based, `app/` directory)
- **State**: Zustand (`src/store/authStore.ts`, `src/store/workoutStore.ts`)
- **Metro Port**: 8081 (`RCT_METRO_PORT=8081`)
- **Tunnel**: `exp://sej73ie-anonymous-8081.exp.direct`
- **Backend URL**: set in `frontend/.env` as `EXPO_PUBLIC_BACKEND_URL`

### Backend (`/backend`)
- **Framework**: FastAPI + uvicorn
- **Database**: MongoDB on `localhost:27017`, DB name: `forgefit_db`
- **Port**: 5000 on `0.0.0.0` (Replit external port 80 → no port suffix in URL)
- **AI**: rule-based fallback active (`emergentintegrations` unavailable)

## Key Files

- `frontend/app/index.tsx` — Landing page with video background, ForgeFit logo
- `frontend/app/(tabs)/workouts.tsx` — Workout list with custom create + delete
- `frontend/app/workout/create.tsx` — 3-step custom workout builder
- `frontend/app/workout/edit.tsx` — Edit existing workout (3-tab: details/library/review)
- `frontend/app/workout/[id].tsx` — Workout detail with edit + delete buttons
- `frontend/src/components/ExerciseLibrary.tsx` — Exercise browser (muscle tabs, category chips, equipment filter, AI scan)
- `frontend/src/store/workoutStore.ts` — Workout state + API calls
- `frontend/src/store/authStore.ts` — Auth + profile state
- `backend/server.py` — FastAPI server (all routes, exercise DB, workout generation)
- `frontend/.env` — `EXPO_PUBLIC_BACKEND_URL`

## Exercise Library (backend/server.py)

`EXERCISE_DATABASE` contains 150+ exercises with:
- `id` — stable string ID (e.g. `"chest_001"`)
- `name`, `muscle_group`, `secondary_muscles`
- `categories` — array: `push | pull | compound | bodyweight | isolation`
- `equipment_required` — list of equipment names
- `difficulty` — `beginner | intermediate | advanced`
- `instructions` — brief coaching cue

Muscle groups: `chest, back, shoulders, legs, arms, core, glutes, full_body`

## Backend API Endpoints (key)

- `GET /api/exercises?muscle_group=&category=&equipment_only=true` — filtered exercise library
- `POST /api/exercises/analyze-equipment` — AI/keyword analysis of custom equipment
- `POST /api/workouts` — create workout
- `PUT /api/workouts/{id}` — update workout
- `DELETE /api/workouts/{id}` — delete workout
- `POST /api/workouts/generate` — AI/rule-based workout generation

## Workflows

- **Start Backend**: MongoDB (port 27017) + uvicorn (port 5000)
- **Start Frontend**: Expo Metro on port 8081 with `--tunnel --clear`

## Dev Admin Account

- Email: `admin@forgefit.dev` / Password: `ForgeFit@2026`
- **Recreate after MongoDB restart** using the Python script with full `PYTHONPATH`
- MongoDB data at `/home/runner/data/mongodb` (volatile — lost on container restart)

## Color Scheme / Brand

- Background: `#0A0A0A`
- Primary accent (lime green): `#76FF00`
- Button text on green: `#000`
- Secondary text: `#888`, `#666`
- Danger: `#FF6B6B`
- Accent blue-green: `#4ECDC4`

## Weight / Height Conversions

- kg → lbs: `× 2.20462` | lbs → kg: `× 0.453592`
- kg → stone: `÷ 6.35029` | stone → kg: `× 6.35029`
- Profile stores everything in kg (weight) and cm (height) internally
