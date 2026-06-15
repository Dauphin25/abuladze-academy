# CLAUDE.md

Guidance for working in this repository.

## Project

**Abuladze Academy** — a bilingual landing/marketing site for a Programming & IT academy
(main subject: **Python**). FastAPI backend + React/Vite/TS frontend, with an admin panel
that doubles as a lightweight CMS, lecturer profiles, a registration flow, and an
SMTP-based email system.

## Stack & layout

- **Backend:** `backend/` — FastAPI, SQLAlchemy 2.0, SQLite (PostgreSQL-ready), JWT auth.
  - `app/main.py` app + routers; `app/models.py`, `app/schemas.py`, `app/security.py`,
    `app/deps.py`; `app/routers/` (auth, courses, professors, students, contact, content, email);
    `app/email_service.py` (SMTP + `{{var}}` templates); `app/seed.py` (default admin + demo data).
- **Frontend:** `frontend/` — React 18, Vite, TypeScript, Tailwind.
  - `src/api.ts` API client; `src/auth.tsx` auth context; `src/i18n.tsx` ka/en UI strings;
    `src/pages/` (LandingPage, LecturersPage, LecturerDetailPage, RegisterPage, `admin/*`);
    `src/components/` shared UI; `src/layouts/PublicLayout.tsx`.

## Run locally

```bash
# Backend
cd backend && python -m venv .venv && .venv\Scripts\Activate.ps1
pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
# Frontend
cd frontend && npm install && npm run dev      # http://localhost:5173
```

Default admin: `admin` / `admin123`. The DB is created and seeded on backend startup.
Build/type-check the frontend with `npm run build` (runs `tsc -b` then `vite build`).

## Conventions

- **Bilingual:** Georgian (`ka`) is primary, English (`en`) is a toggle. Static UI strings
  live in `src/i18n.tsx`; marketing copy is bilingual CMS content (`SiteContent`, keyed by
  `(key, locale)`). Course/lecturer free-text is single-language (typed by the admin).
- **Make a landing-page text editable:** add the key to `CONTENT` in `backend/app/seed.py`
  (ka + en), read it on the frontend via `c("key", fallback)`, and add it to a group in
  `src/pages/admin/ContentAdmin.tsx`. Restart the backend to seed new keys (additive — the
  seed only inserts missing rows, so it never wipes data).
- **Auth:** admin endpoints depend on `get_current_admin`. The login endpoint expects
  `application/x-www-form-urlencoded`; the API client must not override that content type.
- **Email:** never let a send break a request — sends run via `BackgroundTasks` and all
  errors are swallowed/logged. The SMTP password is write-only (never returned by the API).

## Gotchas

- **Stale Vite dev server (Windows):** stopping a backgrounded `npm run dev` can leave the
  node process alive holding port 5173, so a new server moves to 5174/5175 and the browser
  serves old code. If frontend changes "don't apply," kill stray Vite node processes and
  start one clean server on 5173. Tailwind config changes also require a fresh dev server.
- After changing `backend/app/models.py`, the SQLite dev DB may need recreating
  (`rm backend/abuladze.db`) since there are no migrations — `create_all` only adds new tables.

## Docker

`docker compose up --build` runs Postgres + backend + the frontend (nginx) — app on
http://localhost:8080. See `README.md` for details.
