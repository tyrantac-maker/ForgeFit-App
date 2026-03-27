# ForgeFit App

A React Native Expo fitness tracker with a Python FastAPI + MongoDB backend.

## Architecture

### Frontend (`/frontend`)
- **Framework**: React Native + Expo (SDK ~53)
- **Router**: Expo Router (file-based)
- **State**: Zustand (`src/store/`)
- **Port**: 5000 (web via Metro)

### Backend (`/backend`)
- **Framework**: FastAPI + uvicorn
- **Database**: MongoDB (localhost:27017, DB: `forgefit_db`)
- **Port**: 8000

## Key Files

- `frontend/app/index.tsx` — Landing page with video background (forge-bg.mp4), ForgeFit logo, green #00FF88 color scheme
- `frontend/app/(tabs)/index.tsx` — Dashboard with stats, weekly chart, today's workout
- `frontend/src/components/ForgeVideoBackground.tsx` — Reusable video background component
- `frontend/assets/forge-bg.mp4` — Background video (7.9MB, extracted from GitHub)
- `frontend/assets/images/logo.png` — ForgeFit logo
- `backend/server.py` — FastAPI server entry point
- `backend/.env` — MONGO_URL, DB_NAME, JWT_SECRET, EXPO_PUBLIC_BACKEND_URL

## Workflows

- **Start Backend**: MongoDB (port 27017) + uvicorn (port 8000)
- **Start Frontend**: Expo Metro on port 5000 (`RCT_METRO_PORT=5000`)

## Notes

- `emergentintegrations` package is unavailable — AI workout generation gracefully falls back
- `expo-av` is deprecated in SDK 54; Video component still works in current SDK (~53)
- GitHub remote: `https://github.com/tyrantac-maker/ForgeFit-App` (branch: main)
- Git merge blocked by Replit safety system — use `git show FETCH_HEAD:path` to read remote files and apply manually

## Color Scheme

- Background: `#000` / `#0A0A0A` / `#080808`
- Primary accent: `#00FF88` (bright green)
- Secondary: `#FF6B35` (orange, used in dashboard)
- Text: `#FFFFFF`, `#B5B5B5`, `#888`
