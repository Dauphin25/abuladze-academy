# Abuladze Academy

A landing / marketing website for a **Programming & IT academy**, with a built-in
admin panel that doubles as a lightweight CMS.

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** FastAPI (Python) + SQLAlchemy 2.0 + SQLite (PostgreSQL-ready)
- **Auth:** JWT-based admin login

## What it does

**Languages**
- **Georgian (ქართული) is the primary language**, with an **English** toggle (ქარ / ENG) in the header.
- UI text is translated in `frontend/src/i18n.tsx`; editable marketing copy is stored bilingually in the backend and edited per-language in the admin.

**Public pages**
- `/` — landing page: hero, stats, about, courses, lecturers, enrollment CTA, contact form
- `/lecturers` — list of all lecturers
- `/lecturers/:id` — **dedicated lecturer profile**: photo, full biography, specialties, books/publications, and external links
- `/register` — **dedicated full-page registration/application form**
- All text and listings are pulled live from the backend

**Admin panel** (`/admin`) — protected by login
- **Dashboard** – at-a-glance counts
- **Courses** – create / edit / delete programs
- **Instructors / Lecturers** – manage profiles incl. full biography, books, and links
- **Site content** – edit landing-page copy in **both Georgian and English** (language tabs)
- **Email** – configure SMTP credentials, edit email templates, and send a test email

**Automatic emails**
- Configure SMTP (host, port, username, password, from address) under **Admin → Email**.
- Editable templates with `{{ variable }}` placeholders are sent automatically on events:
  - `registration` → confirmation to the applicant after they register
  - `admin_new_application` → notification to the admin
  - `contact_confirmation` → confirmation to whoever submits the contact form
  - `admin_new_message` → notification to the admin
- Sending happens in the background; if email is disabled or misconfigured, the forms still work.
- The SMTP password is write-only — it is stored server-side and never returned by the API.
- **Applications** – view enrollment submissions, change their status (new → contacted → enrolled)
- **Messages** – read contact-form messages
- **Site content** – edit landing-page copy (mini CMS), changes go live instantly

## Project structure

```
abuladze-academy/
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── main.py         # App entrypoint + CORS + routers
│   │   ├── config.py       # Settings (.env)
│   │   ├── database.py     # SQLAlchemy engine/session
│   │   ├── models.py       # ORM models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── security.py     # Password hashing + JWT
│   │   ├── deps.py         # Auth dependency
│   │   ├── seed.py         # Default admin + demo data
│   │   └── routers/        # auth, courses, professors, students, contact, content
│   ├── requirements.txt
│   └── .env.example
└── frontend/               # React + Vite + TS app
    └── src/
        ├── api.ts          # API client
        ├── auth.tsx        # Auth context
        ├── pages/          # LandingPage + admin/*
        └── components/     # Shared UI
```

## Getting started

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env          # then edit values (especially SECRET_KEY)

uvicorn app.main:app --reload --port 8000
```

On first run the database is created and seeded with a default admin and demo data.

- API:        http://127.0.0.1:8000
- Swagger UI:  http://127.0.0.1:8000/docs

**Default admin login:** `admin` / `admin123` (change via `.env`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- Site:  http://localhost:5173
- Admin: http://localhost:5173/admin

The Vite dev server proxies `/api` to the backend on port 8000, so no CORS setup is
needed during development.

## Configuration

Backend settings live in `backend/.env` (see `.env.example`):

| Variable | Purpose | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing secret — **change in production** | placeholder |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `720` |
| `DATABASE_URL` | DB connection | `sqlite:///./abuladze.db` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173,...` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Seeded admin account | `admin` / `admin123` |

### Using PostgreSQL instead of SQLite
Set `DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/abuladze`
and `pip install "psycopg[binary]"`.

## Run with Docker (full stack)

The repo ships a Docker setup that runs **PostgreSQL + the FastAPI backend + the
nginx-served frontend** together.

```bash
docker compose up --build
```

Then open **http://localhost:8080** (admin at `/admin`, default `admin` / `admin123`).

- `frontend/` is built and served by **nginx**, which also proxies `/api` to the backend
  (same-origin, so no CORS issues).
- `backend/` runs under uvicorn and connects to the **Postgres** service; tables are created
  and demo data seeded automatically on first start. Data persists in the `pgdata` volume.
- **Before deploying for real**, change `SECRET_KEY` and `ADMIN_PASSWORD` in
  `docker-compose.yml` (or supply them via an `.env` / your orchestrator's secrets).

To stop and remove everything (including the database volume):

```bash
docker compose down -v
```

## Production build

```bash
cd frontend && npm run build      # outputs static files to frontend/dist
```

Serve `frontend/dist` from any static host / CDN and run the FastAPI backend behind
a production server (e.g. `uvicorn` workers under nginx). Remember to set a strong
`SECRET_KEY`, change the default admin password, and restrict `CORS_ORIGINS` to your
real domain.

## API overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | public | Get JWT token |
| GET | `/api/content` | public | All site content |
| PUT | `/api/content/{key}` | admin | Update a content block |
| GET | `/api/courses` | public | List courses |
| POST/PUT/DELETE | `/api/courses/...` | admin | Manage courses |
| GET | `/api/professors` | public | List instructors |
| POST/PUT/DELETE | `/api/professors/...` | admin | Manage instructors |
| POST | `/api/students` | public | Submit enrollment application |
| GET/PATCH/DELETE | `/api/students/...` | admin | Manage applications |
| POST | `/api/contact` | public | Submit contact message |
| GET/PATCH/DELETE | `/api/contact/...` | admin | Manage messages |

Full interactive docs at `/docs`.
