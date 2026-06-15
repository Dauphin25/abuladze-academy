# STEM ინგა აბულაძის აკადემია — სრული ტექნიკური დოკუმენტაცია

> **ვისთვისაა ეს დოკუმენტი?**
> ეს დოკუმენტი განკუთვნილია პროგრამის ლექტორისთვის, რომელიც სტუდენტებს ასწავლის ამ პროექტის ტექნიკურ არქიტექტურას, კოდის სტრუქტურას და ყველა ფუნქციის მუშაობის პრინციპს. დოკუმენტი მოიცავს ყველა ფუნქციას, ფაილს, API ენდფოინტს და მათ ურთიერთკავშირს.

---

## სარჩევი

1. [პროექტის მიმოხილვა](#1-პროექტის-მიმოხილვა)
2. [ტექნიკური სტეკი](#2-ტექნიკური-სტეკი)
3. [ფაილების სტრუქტურა](#3-ფაილების-სტრუქტურა)
4. [გაშვება ლოკალურად](#4-გაშვება-ლოკალურად)
5. [ბექენდი — FastAPI](#5-ბექენდი--fastapi)
6. [მონაცემთა ბაზა — მოდელები](#6-მონაცემთა-ბაზა--მოდელები)
7. [API ენდფოინტები](#7-api-ენდფოინტები)
8. [ფრონტენდი — React](#8-ფრონტენდი--react)
9. [საჯარო გვერდები](#9-საჯარო-გვერდები)
10. [ადმინ პანელი](#10-ადმინ-პანელი)
11. [CMS სისტემა — რედაქტირებადი კონტენტი](#11-cms-სისტემა--რედაქტირებადი-კონტენტი)
12. [ელ. ფოსტის სისტემა](#12-ელ-ფოსტის-სისტემა)
13. [ავთენტიფიკაცია და უსაფრთხოება](#13-ავთენტიფიკაცია-და-უსაფრთხოება)
14. [ორენოვანი სისტემა](#14-ორენოვანი-სისტემა)
15. [სრული ნაკადები (Flows)](#15-სრული-ნაკადები-flows)
16. [Docker — გამართვა Production-ისთვის](#16-docker--გამართვა-production-ისთვის)
17. [ხშირად დასმული კითხვები](#17-ხშირად-დასმული-კითხვები)

---

## 1. პროექტის მიმოხილვა

**STEM ინგა აბულაძის აკადემია** არის სრული (full-stack) ვებ-აპლიკაცია — საიტი და ადმინ პანელი — Python-ის სასწავლო აკადემიისთვის.

### რა შეუძლია სისტემას:

| ფუნქცია | აღწერა |
|---------|--------|
| **Landing page** | Python-ის თემატიკის მქონე მარკეტინგული გვერდი |
| **კურსების კატალოგი** | `/courses` — ფილტრებიანი სია; `/courses/:id` — დეტალური გვერდი |
| **ლექტორების პროფილი** | `/lecturers` — სია; `/lecturers/:id` — ბიოგრაფია, წიგნები, ბმულები |
| **რეგისტრაციის ფორმა** | `/register` — განაცხადი ონლაინ |
| **კონტაქტის ფორმა** | Landing page-ზე |
| **ადმინ პანელი** | `/admin` — მთელი საიტის მართვა |
| **CMS** | ტექსტები პირდაპირ admin-იდან იცვლება, კოდის ხელახლა გამართვა არ სჭირდება |
| **ელ. ფოსტა** | ავტომატური ემაილები — SMTP, შაბლონები `{{ცვლადებით}}` |
| **ორი ენა** | ქართული (ძირითადი) + ინგლისური (გადამრთველი) |

---

## 2. ტექნიკური სტეკი

### ბექენდი (`backend/`)

| ტექნოლოგია | ვერსია | დანიშნულება |
|------------|--------|-------------|
| **Python** | 3.11+ | ძირითადი ენა |
| **FastAPI** | 0.115 | REST API ფრეიმვორკი |
| **SQLAlchemy** | 2.0 | ORM (ბაზასთან მუშაობა) |
| **SQLite** | ჩაშენებული | ბაზა development-ში |
| **PostgreSQL** | 16 | ბაზა Docker/production-ში |
| **PyJWT** | 2.10 | JWT ტოკენების გენერაცია |
| **bcrypt** | 4.2 | პაროლების hash |
| **smtplib** | ჩაშენებული | ელ. ფოსტის გაგზავნა |
| **Pydantic** | 2.x | მონაცემების ვალიდაცია |

### ფრონტენდი (`frontend/`)

| ტექნოლოგია | ვერსია | დანიშნულება |
|------------|--------|-------------|
| **React** | 18 | UI ბიბლიოთეკა |
| **TypeScript** | 5 | ტიპიზებული JavaScript |
| **Vite** | 5 | build tool + dev server |
| **Tailwind CSS** | 3 | CSS ფრეიმვორკი |
| **React Router** | 6 | კლიენტური მარშრუტიზაცია |

### ინფრასტრუქტურა

| ტექნოლოგია | დანიშნულება |
|------------|-------------|
| **Docker Compose** | მთელი სტეკის ერთად გაშვება |
| **nginx** | ფრონტენდის სერვი + API proxy production-ში |

---

## 3. ფაილების სტრუქტურა

```
abuladze-academy/
│
├── backend/                        ← FastAPI სერვერი
│   ├── app/
│   │   ├── main.py                 ← აპლიკაციის entry point; CORS; router-ების დარეგისტრირება
│   │   ├── config.py               ← .env ფაილის წაკითხვა (Settings კლასი)
│   │   ├── database.py             ← SQLAlchemy engine, SessionLocal, Base
│   │   ├── models.py               ← ყველა ORM მოდელი (ცხრილები)
│   │   ├── schemas.py              ← Pydantic სქემები (request/response)
│   │   ├── security.py             ← hash_password(), verify_password(), create_token()
│   │   ├── deps.py                 ← get_current_admin() dependency
│   │   ├── seed.py                 ← პირველადი მონაცემები (admin, კურსები, ლექტორები, CMS)
│   │   ├── email_service.py        ← SMTP, შაბლონების render, ღონისძიებების გაგზავნა
│   │   └── routers/
│   │       ├── auth.py             ← POST /api/auth/login, GET /api/auth/me
│   │       ├── courses.py          ← CRUD /api/courses
│   │       ├── professors.py       ← CRUD /api/professors
│   │       ├── students.py         ← POST /api/students (განაცხადი), admin CRUD
│   │       ├── contact.py          ← POST /api/contact, admin CRUD
│   │       ├── content.py          ← GET/PUT /api/content (CMS)
│   │       └── email.py            ← /api/email/settings, /templates, /test
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                       ← React + Vite აპლიკაცია
│   ├── src/
│   │   ├── main.tsx                ← ReactDOM root; Provider-ების გახვევა
│   │   ├── App.tsx                 ← Routes (ყველა მარშრუტი)
│   │   ├── api.ts                  ← API კლიენტი (ყველა HTTP request)
│   │   ├── auth.tsx                ← AuthContext (ტოკენი, login, logout)
│   │   ├── i18n.tsx                ← I18nContext (ქართ/ინგ სტრიქონები)
│   │   ├── types.ts                ← TypeScript ინტერფეისები
│   │   │
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     ← მთავარი გვერდი (Hero, Stats, About, Courses, Lecturers, Enroll, Contact)
│   │   │   ├── CoursesPage.tsx     ← /courses — კურსების სია
│   │   │   ├── CourseDetailPage.tsx← /courses/:id — კურსის დეტალები
│   │   │   ├── LecturersPage.tsx   ← /lecturers — ლექტორების სია
│   │   │   ├── LecturerDetailPage.tsx ← /lecturers/:id — ლექტორის პროფილი
│   │   │   ├── RegisterPage.tsx    ← /register — რეგისტრაციის ფორმა
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx  ← /admin/login
│   │   │       ├── AdminLayout.tsx ← გვერდითი მენიუ + header (ყველა admin გვერდის გარსი)
│   │   │       ├── DashboardPage.tsx ← /admin — სტატისტიკის ბარათები
│   │   │       ├── CoursesAdmin.tsx  ← /admin/courses
│   │   │       ├── ProfessorsAdmin.tsx ← /admin/professors
│   │   │       ├── StudentsAdmin.tsx   ← /admin/students
│   │   │       ├── MessagesAdmin.tsx   ← /admin/messages
│   │   │       ├── ContentAdmin.tsx    ← /admin/content (CMS)
│   │   │       └── EmailAdmin.tsx      ← /admin/email
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.tsx          ← ზედა ნავიგაცია (ლოგო, ბმულები, ენა, რეგ. ღილაკი)
│   │   │   ├── Footer.tsx          ← ქვედა footer
│   │   │   ├── Icon.tsx            ← SVG ხატულები სახელით
│   │   │   ├── Modal.tsx           ← გამოდმავალი ფანჯარა (admin ფორმებში)
│   │   │   ├── Reveal.tsx          ← Scroll-reveal ანიმაცია (IntersectionObserver)
│   │   │   ├── CountUp.tsx         ← რიცხვების ანიმაცია სტატისტიკისთვის
│   │   │   ├── TypingCode.tsx      ← Python კოდის ტაიპინგ ეფექტი (Hero-ში)
│   │   │   ├── TechMarquee.tsx     ← გადამოძრავებელი ტექ-სტრიქი
│   │   │   └── PyBadge.tsx         ← Python-ის ლოგო (Hero-ში)
│   │   │
│   │   └── layouts/
│   │       └── PublicLayout.tsx    ← Navbar + Outlet + Footer (საჯარო გვერდების გარსი)
│   │
│   ├── tailwind.config.js          ← Python ფერები, JetBrains Mono, keyframes
│   ├── vite.config.ts              ← /api proxy → localhost:8000
│   ├── nginx.conf                  ← Production nginx კონფიგი
│   └── Dockerfile
│
├── docker-compose.yml              ← PostgreSQL + backend + nginx-frontend
├── CLAUDE.md                       ← AI ასისტენტის სახელმძღვანელო
└── DOKUMENTATSIA.md                ← ეს ფაილი
```

---

## 4. გაშვება ლოკალურად

### წინაპირობები

- Python 3.11 ან უფრო ახალი
- Node.js 18 ან უფრო ახალი
- Git

### ბექენდის გაშვება

```bash
# 1. გადადი backend საქაღალდეში
cd backend

# 2. შექმენი virtual environment
python -m venv .venv

# 3. ჩართე virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# 4. დააინსტალირე dependencies
pip install -r requirements.txt

# 5. გაუშვი სერვერი
uvicorn app.main:app --reload --port 8000
```

პირველ გაშვებაზე ავტომატურად:
- შეიქმნება `abuladze.db` SQLite ფაილი
- `seed()` ფუნქცია შექმნის ადმინს, demo კურსებს, ლექტორებს და CMS კონტენტს

**API მისამართები:**
- `http://127.0.0.1:8000` — API
- `http://127.0.0.1:8000/docs` — Swagger UI (ყველა ენდფოინტი ინტერაქტიულად)

### ფრონტენდის გაშვება

```bash
# 1. გადადი frontend საქაღალდეში
cd frontend

# 2. დააინსტალირე packages
npm install

# 3. გაუშვი dev server
npm run dev
```

**საიტი:** `http://localhost:5173`
**ადმინი:** `http://localhost:5173/admin`
**Default login:** `admin` / `admin123`

> **მნიშვნელოვანი (Windows):** Vite-ის dev სერვერის შეჩერება ყოველთვის არ კლავს node.exe პროცესს. თუ ცვლილებები არ გამოჩნდა, შეამოწმე პორტი 5173 — კლავი ყველა node პროცესს და ახლიდან გაუშვი სერვერი.

---

## 5. ბექენდი — FastAPI

### `app/main.py` — Entry Point

```python
app = FastAPI(title="Abuladze Academy API")

# CORS — რომელი origin-ებიდან დაუშვებს browser-ი request-ებს
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, ...)

# Lifespan — გაშვებაზე seed() გამოიძახება
@asynccontextmanager
async def lifespan(app):
    seed()        # ← ბაზა + demo მონაცემები
    yield

# ყველა router დარეგისტრირებულია
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(professors_router)
# ... და ა.შ.
```

### `app/config.py` — კონფიგურაცია

`.env` ფაილიდან იკითხება შემდეგი ცვლადები:

| ცვლადი | მნიშვნელობა | Default |
|--------|-------------|---------|
| `SECRET_KEY` | JWT ხელმოწერის გასაღები | placeholder |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ტოკენის სიცოცხლე | 720 (12 სთ.) |
| `DATABASE_URL` | ბაზის კავშირი | `sqlite:///./abuladze.db` |
| `CORS_ORIGINS` | დაშვებული origin-ები | localhost:5173 |
| `ADMIN_USERNAME` | სათესლე ადმინი | `admin` |
| `ADMIN_PASSWORD` | სათესლე პაროლი | `admin123` |

### `app/security.py` — უსაფრთხოება

```python
def hash_password(password: str) -> str:
    # bcrypt hash — ერთი მიმართულება, ვერ გაიხსნება
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    # შეადარე შეყვანილი პაროლი hash-თან
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(username: str) -> str:
    # JWT — ინახავს username-ს, იწურება 12 სთ.-ში
    payload = {"sub": username, "exp": datetime.utcnow() + timedelta(minutes=720)}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")
```

### `app/deps.py` — Auth Dependency

```python
def get_current_admin(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    # JWT-ის გახსნა → username-ის მიხედვით ადმინის პოვნა
    # თუ ტოკენი არასწორია → 401 Unauthorized
    ...
```

ეს ფუნქცია გამოიყენება ყველა admin-ოლი ენდფოინტზე:
```python
@router.post("", dependencies=[Depends(get_current_admin)])
def create_course(...):
    ...
```

### `app/seed.py` — სათესლე მონაცემები

`seed()` ფუნქცია **idempotent** (გამეორება უსაფრთხოა):
- ამოწმებს არსებობს თუ არა ადმინი → თუ არა, ქმნის
- ამოწმებს არსებობს თუ არა CMS გასაღები → თუ არა, ამატებს
- ამოწმებს არსებობს თუ არა კურსები → თუ არა, ამატებს demo-ებს
- ელ. ფოსტის შაბლონებს ასევე ამოწმებს key-ის მიხედვით

---

## 6. მონაცემთა ბაზა — მოდელები

ყველა მოდელი `backend/app/models.py`-შია. SQLAlchemy 2.0 სინტაქსი (`Mapped` annotations).

### `Admin`

```
┌─────────────────────────────────┐
│ admins                          │
├─────────────┬───────────────────┤
│ id          │ INTEGER PK        │
│ username    │ VARCHAR(50) UNIQUE│
│ hashed_pass │ VARCHAR(255)      │
│ created_at  │ DATETIME          │
└─────────────┴───────────────────┘
```

### `Professor` (ლექტორი)

```
┌───────────────┬─────────────────┐
│ professors                      │
├───────────────┼─────────────────┤
│ id            │ INTEGER PK      │
│ name          │ VARCHAR(120)    │
│ title         │ VARCHAR(120)    │ ← "სენიორ ინჟინერი"
│ bio           │ TEXT            │ ← მოკლე (ბარათებზე)
│ biography     │ TEXT            │ ← სრული (პროფილ გვერდზე)
│ photo_url     │ VARCHAR(500)    │
│ specialties   │ VARCHAR(300)    │ ← "Python, React" — მძიმით
│ email         │ VARCHAR(255)    │
│ books         │ JSON            │ ← ["წიგნი 1", "წიგნი 2"]
│ links         │ JSON            │ ← [{"label":"LinkedIn","url":"..."}]
│ order         │ INTEGER         │ ← გამოჩენის რიგი
│ is_active     │ BOOLEAN         │ ← false = იმალება საიტზე
│ created_at    │ DATETIME        │
└───────────────┴─────────────────┘
```

### `Course` (კურსი)

```
┌────────────────┬─────────────────┐
│ courses                          │
├────────────────┼─────────────────┤
│ id             │ INTEGER PK      │
│ title          │ VARCHAR(160)    │
│ summary        │ VARCHAR(400)    │ ← მოკლე (ბარათებზე)
│ description    │ TEXT            │ ← სრული აღწერა
│ level          │ VARCHAR(40)     │ ← "დამწყები/საშუალო/მაღალი"
│ duration       │ VARCHAR(60)     │ ← "12 კვირა"
│ price          │ NUMERIC(10,2)   │ ← null = უფასო
│ icon           │ VARCHAR(40)     │ ← "code/globe/server/chart"
│ image_url      │ VARCHAR(500)    │ ← ბანერის სურათი
│ aim            │ TEXT            │ ← კურსის მიზანი
│ target_audience│ TEXT            │ ← ვისთვისაა
│ prerequisites  │ TEXT            │ ← წინასწარი ცოდნა
│ what_you_learn │ JSON            │ ← ["HTML", "CSS", "JS", ...]
│ schedule       │ VARCHAR(200)    │ ← "კვირაში 3-ჯერ, 18:00"
│ start_date     │ VARCHAR(80)     │ ← "15 სექტემბერი 2026"
│ language       │ VARCHAR(40)     │ ← "ქართული"
│ format         │ VARCHAR(40)     │ ← "ოფლაინ/ონლაინ/ჰიბრიდი"
│ min_age        │ INTEGER NULL    │
│ max_age        │ INTEGER NULL    │
│ max_students   │ INTEGER NULL    │
│ certificate    │ BOOLEAN         │ ← გასცემს სერტიფიკატს?
│ order          │ INTEGER         │
│ is_active      │ BOOLEAN         │
│ created_at     │ DATETIME        │
└────────────────┴─────────────────┘
```

### `Student` (განაცხადი)

```
┌─────────────┬──────────────────────────────────┐
│ students                                        │
├─────────────┼──────────────────────────────────┤
│ id          │ INTEGER PK                        │
│ full_name   │ VARCHAR(160)                      │
│ email       │ VARCHAR(255)                      │
│ phone       │ VARCHAR(40)                       │
│ message     │ TEXT                              │
│ status      │ VARCHAR(20)                       │ ← "new/contacted/enrolled"
│ course_id   │ INTEGER FK → courses.id (NULL OK) │
│ created_at  │ DATETIME                          │
└─────────────┴──────────────────────────────────┘
```

### `ContactMessage` (კონტაქტი)

```
┌────────────┬─────────────────┐
│ contact_messages              │
├────────────┼─────────────────┤
│ id         │ INTEGER PK      │
│ name       │ VARCHAR(160)    │
│ email      │ VARCHAR(255)    │
│ subject    │ VARCHAR(200)    │
│ message    │ TEXT            │
│ is_read    │ BOOLEAN         │ ← ადმინმა წაიკითხა?
│ created_at │ DATETIME        │
└────────────┴─────────────────┘
```

### `SiteContent` (CMS)

```
┌──────────────┬─────────────────────────────────┐
│ site_content                                    │
├──────────────┼─────────────────────────────────┤
│ key          │ VARCHAR(80) PK                   │ ← "hero_title"
│ locale       │ VARCHAR(5)  PK                   │ ← "ka" ან "en"
│ value        │ TEXT                             │
│ updated_at   │ DATETIME                         │
└──────────────┴─────────────────────────────────┘
```

> **კომბინირებული Primary Key:** ერთი და იგივე `key` შეიძლება ორჯერ იყოს — ქართული და ინგლისური ვერსია. მაგ: `("hero_title", "ka")` და `("hero_title", "en")`.

### `EmailSettings` (SMTP კონფიგი)

```
┌──────────────┬─────────────────┐
│ email_settings                  │
├──────────────┼─────────────────┤
│ id           │ INTEGER PK=1    │ ← singleton (ერთი სტრიქონი)
│ enabled      │ BOOLEAN         │
│ smtp_host    │ VARCHAR(255)    │
│ smtp_port    │ INTEGER         │
│ use_tls      │ BOOLEAN         │
│ username     │ VARCHAR(255)    │
│ password     │ VARCHAR(255)    │ ← ✗ არასოდეს ბრუნდება API-ზე
│ from_email   │ VARCHAR(255)    │
│ from_name    │ VARCHAR(120)    │
│ admin_email  │ VARCHAR(255)    │
│ updated_at   │ DATETIME        │
└──────────────┴─────────────────┘
```

### `EmailTemplate` (ელ. ფოსტის შაბლონი)

```
┌────────────┬─────────────────┐
│ email_templates               │
├────────────┼─────────────────┤
│ id         │ INTEGER PK      │
│ key        │ VARCHAR(60) UQ  │ ← "registration", "contact_confirmation"
│ name       │ VARCHAR(160)    │ ← ადამიანური სახელი
│ subject    │ TEXT            │ ← ელ. ფოსტის სათაური
│ body       │ TEXT            │ ← ტექსტი {{ცვლადებით}}
│ is_active  │ BOOLEAN         │
│ updated_at │ DATETIME        │
└────────────┴─────────────────┘
```

---

## 7. API ენდფოინტები

> **Base URL:** `http://127.0.0.1:8000`
> **Swagger UI:** `http://127.0.0.1:8000/docs` — ყველა endpoint ინტერაქტიულად

### ავთენტიფიკაცია

| Method | Path | Access | აღწერა |
|--------|------|--------|--------|
| `POST` | `/api/auth/login` | Public | JWT ტოკენის მიღება |
| `GET` | `/api/auth/me` | Admin | მიმდინარე ადმინის info |

**Login request (form-urlencoded):**
```
Content-Type: application/x-www-form-urlencoded
Body: username=admin&password=admin123
```

**Login response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### კურსები

| Method | Path | Access | აღწერა |
|--------|------|--------|--------|
| `GET` | `/api/courses` | Public | ყველა აქტიური კურსი |
| `GET` | `/api/courses?include_inactive=true` | Admin | + დამალული კურსები |
| `GET` | `/api/courses/{id}` | Public | ერთი კურსი ID-ით |
| `POST` | `/api/courses` | Admin | ახალი კურსი |
| `PUT` | `/api/courses/{id}` | Admin | კურსის განახლება |
| `DELETE` | `/api/courses/{id}` | Admin | კურსის წაშლა |

### ლექტორები

| Method | Path | Access | აღწერა |
|--------|------|--------|--------|
| `GET` | `/api/professors` | Public | ყველა აქტიური ლექტორი |
| `GET` | `/api/professors?include_inactive=true` | Admin | + დამალულები |
| `GET` | `/api/professors/{id}` | Public | ერთი ლექტორი |
| `POST` | `/api/professors` | Admin | ახალი ლექტორი |
| `PUT` | `/api/professors/{id}` | Admin | განახლება |
| `DELETE` | `/api/professors/{id}` | Admin | წაშლა |

### განაცხადები (სტუდენტები)

| Method | Path | Access | აღწერა |
|--------|------|--------|--------|
| `POST` | `/api/students` | Public | განაცხადის გაგზავნა |
| `GET` | `/api/students` | Admin | ყველა განაცხადი |
| `PATCH` | `/api/students/{id}` | Admin | სტატუსის შეცვლა |
| `DELETE` | `/api/students/{id}` | Admin | წაშლა |

### კონტაქტი

| Method | Path | Access | აღწერა |
|--------|------|--------|--------|
| `POST` | `/api/contact` | Public | შეტყობინების გაგზავნა |
| `GET` | `/api/contact` | Admin | ყველა შეტყობინება |
| `PATCH` | `/api/contact/{id}/read` | Admin | წაკითხულად მონიშვნა |
| `DELETE` | `/api/contact/{id}` | Admin | წაშლა |

### CMS კონტენტი

| Method | Path | Access | აღწერა |
|--------|------|--------|--------|
| `GET` | `/api/content?lang=ka` | Public | ყველა კონტენტი (ქართ.) |
| `GET` | `/api/content?lang=en` | Public | ყველა კონტენტი (ინგლ.) |
| `PUT` | `/api/content/{key}?lang=ka` | Admin | ერთი გასაღების განახლება |

**Content GET response:**
```json
{
  "hero_title": "გახდი პროგრამისტი პრაქტიკული გზით",
  "hero_subtitle": "პრაქტიკული პროგრამირება...",
  "academy_name": "STEM ინგა აბულაძის აკადემია",
  "contact_email": "hello@academy.ge",
  ...
}
```

### ელ. ფოსტა (ადმინი)

| Method | Path | Access | აღწერა |
|--------|------|--------|--------|
| `GET` | `/api/email/settings` | Admin | SMTP პარამეტრები (პაროლის გარეშე) |
| `PUT` | `/api/email/settings` | Admin | SMTP პარამეტრების განახლება |
| `GET` | `/api/email/events` | Admin | ღონისძიებების სია + ცვლადები |
| `GET` | `/api/email/templates` | Admin | ყველა შაბლონი |
| `PUT` | `/api/email/templates/{key}` | Admin | შაბლონის განახლება |
| `POST` | `/api/email/test` | Admin | ტესტ ელ. ფოსტის გაგზავნა |

---

## 8. ფრონტენდი — React

### `src/main.tsx` — Application Root

```tsx
<BrowserRouter>
  <I18nProvider>        ← ენის კონტექსტი (ქართ/ინგლ)
    <AuthProvider>      ← JWT ტოკენის კონტექსტი
      <App />           ← Route-ების ხე
    </AuthProvider>
  </I18nProvider>
</BrowserRouter>
```

### `src/App.tsx` — მარშრუტიზაცია

```
/                    → LandingPage
/courses             → CoursesPage
/courses/:id         → CourseDetailPage
/lecturers           → LecturersPage
/lecturers/:id       → LecturerDetailPage
/register            → RegisterPage
/admin/login         → AdminLogin
/admin               → RequireAuth → AdminLayout
  /admin/            → DashboardPage
  /admin/courses     → CoursesAdmin
  /admin/professors  → ProfessorsAdmin
  /admin/students    → StudentsAdmin
  /admin/messages    → MessagesAdmin
  /admin/content     → ContentAdmin
  /admin/email       → EmailAdmin
/*                   → redirect /
```

**`RequireAuth`** კომპონენტი ამოწმებს ტოკენს — თუ ადმინი შესული არ არის, გადამისამართებს `/admin/login`-ზე.

### `src/api.ts` — API კლიენტი

ყველა HTTP request ერთ ფაილში. ამარტივებს სხვა ფაილებიდან გამოძახებას:

```typescript
import { api } from "../api";

// გამოყენება
const courses = await api.getCourses();
const course = await api.getCourse(1);
await api.createCourse({ title: "ახალი კურსი", ... });
```

**Login-ის სპეციალური შემთხვევა:**
```typescript
// FastAPI login-ი მოითხოვს application/x-www-form-urlencoded, არა JSON!
login: async (username, password) => {
  const body = new URLSearchParams({ username, password });
  // URLSearchParams ავტომატურად სწორ Content-Type-ს ადის
  ...
}
```

### `src/auth.tsx` — ავთენტიფიკაციის კონტექსტი

```typescript
const { isAuthenticated, username, login, logout } = useAuth();

// ტოკენი ინახება localStorage-ში
// login() → POST /api/auth/login → ინახავს ტოკენს
// logout() → შლის ტოკენს
// isAuthenticated → ტოკენი + server-ზე ვალიდაციის შემოწმება
```

### `src/i18n.tsx` — ორენოვანი სისტემა

```typescript
const { t, lang, setLang } = useI18n();

t("nav.courses")     // → "კურსები" (ka) ან "Courses" (en)
t("common.loading")  // → "იტვირთება…" ან "Loading…"
setLang("en")        // → ენის შეცვლა (ინახება localStorage-ში)
```

---

## 9. საჯარო გვერდები

### `/` — Landing Page (`LandingPage.tsx`)

Landing page 7 სექციისგან შედგება:

```
┌─────────────────────┐
│    Hero             │ ← TypingCode, PyBadge, CTA ღილაკი, hero_badge_1/2
├─────────────────────┤
│    TechMarquee      │ ← გადამოძრავებელი tech_marquee CMS-იდან
├─────────────────────┤
│    Stats            │ ← CountUp ანიმაცია, stat_students/courses/rate
├─────────────────────┤
│    About            │ ← about_title, about_text + 4 bullet point
├─────────────────────┤
│    Courses          │ ← 3 კურსი ბარათებად, link → /courses/:id
├─────────────────────┤
│    Lecturers        │ ← ლექტორების ბარათები, link → /lecturers/:id
├─────────────────────┤
│    Enroll + Form    │ ← სარეგისტრაციო ფორმა + CTA
├─────────────────────┤
│    Contact          │ ← კონტაქტის ფორმა
└─────────────────────┘
```

**CMS-ის გამოყენება Landing-ში:**
```typescript
const [content, setContent] = useState<SiteContent>({});
const c = (key: string, fallback = "") => content[key] ?? fallback;

// შემდეგ ტემპლეიტში:
<h1>{c("hero_title")}</h1>
<p>{c("hero_subtitle")}</p>
```

---

### `/courses` — კურსების სია (`CoursesPage.tsx`)

- იტვირთება `GET /api/courses`
- **ფილტრები:** დონის მიხედვით (დამწყები / საშუალო / მაღალი)
- თითოეულ ბარათზე: სურათი ან ხატი, ბეიჯები (დონე, ფორმატი, სერტიფიკატი), სათაური, მოკლე აღწერა, ხანგრძლივობა, გრაფიკი, ფასი
- ბარათზე კლიკი → `/courses/:id`

---

### `/courses/:id` — კურსის დეტალები (`CourseDetailPage.tsx`)

- იტვირთება `GET /api/courses/{id}`
- **Hero სექცია:** სათაური, badge-ები, სწრაფი ფაქტები (ხანგრძლივობა, ენა, ჯგუფი, ასაკი)
- **Enroll card (მარჯვნივ):** ფასი, დაწყება, გრაფიკი, ადგილების შეზღუდვა, ღილაკი → `/register?course=ID`
- **ძირითადი სექციები:**
  - კურსის მიზანი (`aim`)
  - რას ისწავლი (`what_you_learn`) — bullet list-ად
  - კურსის შესახებ (`description`)
  - ვისთვისაა (`target_audience`)
  - წინასწარი ცოდნა (`prerequisites`) — ყვითელ ბოქსში
- **Sidebar (desktop):** ყველა დეტალი ცხრილად + რეგ. ღილაკი

---

### `/lecturers` — ლექტორების სია (`LecturersPage.tsx`)

- `GET /api/professors` → ყველა `is_active=true` ლექტორი
- ბარათები: ფოტო (ან ინიციალები), სახელი, თანამდებობა, მოკლე ბიო
- ბარათზე კლიკი → `/lecturers/:id`

---

### `/lecturers/:id` — ლექტორის პროფილი (`LecturerDetailPage.tsx`)

```
┌──────────────┬─────────────────────────┐
│   Sidebar    │   Main content          │
│   ─────────  │   ─────────────────     │
│   ფოტო       │   ბიოგრაფია (სრული)     │
│   სახელი     │                         │
│   თანამდ.    │   წიგნები/პუბლ.         │
│   ელ. ფოსტა  │   📘 წიგნი 1            │
│              │   📘 წიგნი 2            │
│   სპეც-ები   │                         │
│   [Python]   │   [დარეგ. ღილაკი]       │
│   [React]    │                         │
│              │                         │
│   ბმულები    │                         │
│   LinkedIn ↗ │                         │
│   GitHub ↗   │                         │
└──────────────┴─────────────────────────┘
```

---

### `/register` — რეგისტრაციის გვერდი (`RegisterPage.tsx`)

იმავე `EnrollForm` კომპონენტს იყენებს, რომელიც Landing-ზეა. ფორმის ველები:
- სახელი და გვარი (სავალდებულო)
- ელ. ფოსტა (სავალდებულო, ვალიდაცია)
- ტელეფონი
- კურსი (dropdown — კურსების სია)
- შეტყობინება

**Submit → `POST /api/students`** → 2 ემაილი ფონში → Success შეტყობინება

---

## 10. ადმინ პანელი

**URL:** `http://localhost:5173/admin`
**Login:** `admin` / `admin123` (შეიძლება `.env`-ში შეიცვალოს)

### `AdminLayout.tsx` — გარსი

ყველა admin გვერდი ამ კომპონენტში გამოჩნდება:
- **მარცხნივ:** ნავიგაციის sidebar (64px სიგანე)
- **ზედა:** header — ადმინის სახელი + "გასვლა" ღილაკი
- **შიგნით:** `<Outlet />` — მიმდინარე admin გვერდი

### `DashboardPage.tsx` — მთავარი პანელი

4 ბარათი სტატისტიკით:
- კურსები (ჯამური)
- ლექტორები (ჯამური)
- განაცხადები (ჯამური + X ახალი)
- შეტყობინებები (ჯამური + X წაუკითხავი)

სწრაფი ბმულები: კურსების მართვა, ლექტორების მართვა, კონტენტი, განაცხადები.

---

### `CoursesAdmin.tsx` — კურსების მართვა

**სია:** ცხრილი სვეტებით: სათაური, დონე, ფასი, ფორმატი, სტატუსი.

**Modal (ფანჯარა)** სამ სექციად:

1. **ძირითადი ინფო:**
   - სათაური, მოკლე აღწერა, სრული აღწერა
   - სურათის URL (banner)

2. **დეტალები:**
   - დონე (dropdown: დამწყები/საშუალო/მაღალი)
   - ფორმატი (dropdown: ოფლაინ/ონლაინ/ჰიბრიდი)
   - ხანგრძლივობა, ენა, გრაფიკი, დაწყების თარიღი
   - ფასი, მაქს. სტუდ., მინ/მაქს ასაკი
   - ხატი, რიგი
   - ✅ სერტიფიკატი, ✅ საიტზე ჩანს

3. **საგანმანათლებლო შინაარსი:**
   - კურსის მიზანი
   - ვისთვისაა
   - წინასწარი ცოდნა
   - რას ისწავლი (textarea — თითო ახალ სტრიქონზე → JSON list)

---

### `ProfessorsAdmin.tsx` — ლექტორების მართვა

Modal ველები:
- სახელი, თანამდებობა
- მოკლე ბიო (ბარათებზე)
- სრული ბიოგრაფია (პროფილ გვერდზე) — პარაგრაფები ცარიელი სტრიქონებით
- წიგნები — **თითო ახალ სტრიქონზე** (parse → JSON array)
- ბმულები — **"სახელი | https://url"** ფორმატი (parse → JSON array of objects)
- სპეციალიზაციები — მძიმით გამოყოფილი
- ელ. ფოსტა, რიგი, ფოტოს URL
- ✅ საიტზე ჩანს

---

### `StudentsAdmin.tsx` — განაცხადების მართვა

**ფილტრები:** ყველა / ახალი / დაკავშირდა / ჩარიცხული

**თითო ბარათზე:**
- სახელი + სტატუსის badge (ფერად)
- ელ. ფოსტა + ტელეფონი
- მოთხოვნილი კურსი
- შეტყობინება
- სტატუსის ღილაკები: `ახალი` → `დაკავშირდა` → `ჩარიცხული`
- წაშლა

---

### `MessagesAdmin.tsx` — შეტყობინებების მართვა

**თითო ბარათზე:**
- სახელი + "ახალი" badge (წაუკითხავზე)
- ელ. ფოსტა + თარიღი
- თემა + ტექსტი
- ღილაკები: **პასუხი** (mailto: ბმული) | **წაკითხულად მონიშვნა** | **წაშლა**

---

### `ContentAdmin.tsx` — საიტის კონტენტი (CMS)

**ენის გადამრთველი:** ქართული / English

**სექციები:**
1. **საიტის პარამეტრები** — academy_name, academy_logo_url (პრევიუ ჩანს)
2. **Hero სექცია** — eyebrow, title, subtitle, CTA, badge 1 & 2
3. **სტატისტიკა** — students, courses, rate
4. **ჩვენ შესახებ** — title, body
5. **ტექ-სტრიქი** — tech_marquee (multiline)
6. **კურსების სექცია** — title, subtitle
7. **ლექტორების სექცია** — title, subtitle
8. **კონტაქტი** — title, email, phone, address

თითოეული ველის გვერდით "შენახვა" ღილაკი → `PUT /api/content/{key}?lang=ka/en`

---

### `EmailAdmin.tsx` — ელ. ფოსტის მართვა

#### SMTP პარამეტრები ჩანართი

| ველი | დანიშნულება |
|------|-------------|
| ჩართვა/გამორთვა | ✅ = ემაილები იგზავნება |
| SMTP სერვერი | `smtp.gmail.com` |
| პორტი | 587 (STARTTLS) ან 465 (SSL) |
| STARTTLS | ✅ 587 პორტისთვის |
| მომხმარებელი | Gmail მისამართი |
| პაროლი | App Password (16 სიმბოლო) |
| From Email | გამომგზავნის ელ. ფოსტა |
| From Name | "STEM ინგა აბულაძის აკადემია" |
| ადმინის ელ. ფოსტა | შენი მისამართი — სადაც ადმინ-შეტყობინებები მოდის |

> პაროლი ** არასოდეს ბრუნდება** API-ზე — `has_password: true/false` ნიშნავს შენახულია თუ არა.

#### ტესტ ემაილი

შეიყვანე ელ. ფოსტა → "ტესტის გაგზავნა" → შეამოწმე inbox.

#### შაბლონები ჩანართი

4 შაბლონი, თითოეული მოიცავს:
- სათაური (subject) — შეიძლება `{{ცვლადი}}` შეიცავდეს
- ტექსტი (body) — multiline, `{{ცვლადებით}}`
- ✅ აქტიური (გამორთვა = ეს ემაილი არ გაიგზავნება)
- ხელმისაწვდომი ცვლადების სია

---

## 11. CMS სისტემა — რედაქტირებადი კონტენტი

### როგორ მუშაობს

```
Admin ცვლის ტექსტს    →   PUT /api/content/hero_title?lang=ka
                             ↓
                      SiteContent ცხრილი (DB)
                             ↓
Frontend GET /api/content?lang=ka
                             ↓
content["hero_title"] = "ახალი სათაური"
                             ↓
<h1>{c("hero_title")}</h1>
```

### ka fallback სისტემა

```python
# content.py router
base = {all ka values}
if lang == "ka":
    return base
localized = {all en values}
return {**base, **localized}  # en override-ს ka-ს სადაც ითარგმნა
```

ეს ნიშნავს: თუ ინგლ. ვერსია არ შევსებულა, ქართული ჩანს.

### ახალი CMS გასაღების დამატება

1. `backend/app/seed.py` → `CONTENT` dict-ში დაამატე:
```python
"my_new_key": {
    "ka": "ქართული ტექსტი",
    "en": "English text",
},
```

2. Frontend-ში გამოიყენე:
```typescript
<p>{c("my_new_key", "fallback text")}</p>
```

3. `ContentAdmin.tsx`-ში დაამატე GROUPS-ში:
```typescript
{ title: "ჩემი სექცია", fields: [["my_new_key", "ლეიბელი"]] }
```

4. **წაშალე `backend/abuladze.db`** და გაუშვი backend — seed-ი ახალ key-ს დაამატებს.

---

## 12. ელ. ფოსტის სისტემა

### `email_service.py` — ლოგიკა

#### 1. render() — შაბლონის render

```python
def render(text: str, context: dict) -> str:
    # "გამარჯობა {{name}}" + {"name": "ნინო"} → "გამარჯობა ნინო"
    return re.sub(r"\{\{\s*(\w+)\s*\}\}", lambda m: context.get(m.group(1), ""), text)
```

#### 2. send_raw() — SMTP გაგზავნა

```python
def send_raw(settings, to, subject, body):
    if settings.smtp_port == 465:
        # SSL (port 465)
        with smtplib.SMTP_SSL(host, port) as server:
            server.login(username, password)
            server.send_message(msg)
    else:
        # STARTTLS (port 587)
        with smtplib.SMTP(host, port) as server:
            server.starttls()
            server.login(username, password)
            server.send_message(msg)
```

#### 3. send_event_email() — მთავარი ფუნქცია (უსაფრთხო)

```python
def send_event_email(event_key, context, to_email) -> bool:
    try:
        # 1. გახსენი DB
        # 2. შეამოწმე enabled=True
        # 3. იპოვე template key-ით
        # 4. render subject + body
        # 5. გაგზავნე
        return True
    except Exception as exc:
        print(f"[email] Failed: {exc}")
        return False  # ← ყოველთვის False-ს აბრუნებს შეცდომისას
    finally:
        db.close()
```

> **კრიტიკული პრინციპი:** ემაილის წარუმატებლობა **არასოდეს ამტვრევს** API request-ს. ფორმა ყოველთვის 201-ს აბრუნებს.

### 4 ღონისძიება (Events)

| Key | ვინ იღებს | ცვლადები |
|-----|-----------|----------|
| `registration` | აპლიკანტი (სტუდენტი) | name, email, phone, course, message |
| `admin_new_application` | ადმინი | name, email, phone, course, message |
| `contact_confirmation` | კონტაქტის გამომგზავნი | name, email, subject, message |
| `admin_new_message` | ადმინი | name, email, subject, message |

### ფონური გაგზავნა (BackgroundTasks)

```python
# students.py router
@router.post("")
def create_student(payload, background_tasks: BackgroundTasks, db):
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()

    # ← ეს ფუნქციები response-ის გაგზავნის შემდეგ გაიშვება
    background_tasks.add_task(send_event_email, "registration", ctx, student.email)
    background_tasks.add_task(send_event_email, "admin_new_application", ctx, None)

    return student  # ← მომხმარებელი დაუყოვნებლივ 201-ს იღებს
```

---

## 13. ავთენტიფიკაცია და უსაფრთხოება

### JWT ნაკადი

```
Browser                    FastAPI
  │                           │
  │── POST /api/auth/login ──▶│
  │   (username, password)    │ verify_password() + create_token()
  │◀── {access_token: "..."} ─│
  │                           │
  │── GET /api/students ─────▶│
  │   Authorization: Bearer   │ get_current_admin():
  │   eyJhbGci...             │   decode JWT → username → DB lookup
  │◀── [{id:1, ...}] ────────│
```

### პაროლის უსაფრთხოება

```
Plain: "admin123"
   ↓ bcrypt.hashpw()
Hash: "$2b$12$XkQ8..."   ← ინახება DB-ში

Login-ზე:
"admin123" + "$2b$12$XkQ8..." → bcrypt.checkpw() → True/False
```

### SMTP პაროლის დაცვა

```python
class EmailSettingsOut(BaseModel):
    has_password: bool = False  # ← True = პაროლი დაყენებულია
    # password ველი საერთოდ არ არის!
```

API ერ არასოდეს გამოაქვს პაროლი — მხოლოდ ეუბნება "დაყენებულია" თუ "არა".

---

## 14. ორენოვანი სისტემა

### 2 სფეროა

| სფერო | რა ინახება | სად |
|-------|-----------|-----|
| **UI სტრიქონები** | ღილაკები, ლეიბელები, სისტემური ტექსტი | `frontend/src/i18n.tsx` |
| **მარკეტინგული ტექსტი** | hero, about, კურსების სათაურები | `SiteContent` DB |

### `i18n.tsx` — UI სტრიქონები

```typescript
const dict = {
  ka: {
    "nav.courses": "კურსები",
    "enroll.submit": "განაცხადის გაგზავნა",
    // ~50+ სტრიქონი
  },
  en: {
    "nav.courses": "Courses",
    "enroll.submit": "Submit Application",
  }
}

// t() ფუნქცია
t("nav.courses")  // → "კურსები" (ka) ან "Courses" (en)
                  // თუ en-ში არ არის, ka fallback
```

### ენის შეცვლა

```typescript
const { lang, setLang } = useI18n();

setLang("en")  // → localStorage-ში ინახება → გვერდის refresh-ზეც რჩება
               // → document.documentElement.lang = "en"
               // → Content API ხელახლა გამოიძახება lang=en-ით
```

### ადმინი — ქართული-ოლი

ადმინ პანელი **მხოლოდ ქართულია** — `i18n` hook-ს არ იყენებს. ყველა ლეიბელი hardcode-ირებულია ქართულად.

---

## 15. სრული ნაკადები (Flows)

### ნაკადი 1: სტუდენტი ვებ-საიტზე

```
1. სტუდენტი გახსნის  http://localhost:5173
2. PublicLayout → Navbar + LandingPage
3. LandingPage:
   - GET /api/content?lang=ka   → CMS ტექსტები
   - GET /api/courses           → კურსების სია
   - GET /api/professors        → ლექტორების სია
   → React state-ი განახლდება → UI-ი render-დება
4. სტუდენტი კლიკავს "კურსები" → /courses
5. CoursesPage:
   - GET /api/courses           → ფილტრებიანი სია
   → კლიკი ბარათზე → /courses/2
6. CourseDetailPage:
   - GET /api/courses/2         → დეტალური ინფო
   → "რეგისტრაცია" → /register?course=2
7. RegisterPage → EnrollForm → Submit:
   - POST /api/students {full_name, email, course_id: 2, ...}
   → ← 201 Created
   → Background: send_event_email("registration", ctx, student_email)
   → Background: send_event_email("admin_new_application", ctx, None)
   → UI: "განაცხადი მიღებულია!" ✓
```

---

### ნაკადი 2: ადმინი კურსს ამატებს

```
1. ადმინი გახსნის  http://localhost:5173/admin
2. AuthProvider: localStorage-ში ტოკენი? → GET /api/auth/me → ✓
3. AdminLayout → DashboardPage
4. ადმინი კლიკავს "კურსები" → /admin/courses
5. CoursesAdmin:
   - GET /api/courses?include_inactive=true
   → ცხრილი გამოჩნდება
6. "+ ახალი კურსი" → Modal იხსნება
7. ადმინი ავსებს ველებს → "შენახვა":
   - POST /api/courses {title, aim, what_you_learn: [...], ...}
   → Authorization: Bearer {jwt_token}
   → get_current_admin() ✓
   → ← 201 Created
   → Modal იხურება → სია განახლდება
8. კურსი მაშინვე ჩნდება /courses-ზე
```

---

### ნაკადი 3: ადმინი ტექსტს ცვლის (CMS)

```
1. /admin/content → ContentAdmin
2. "ქართული" ჩანართი (default)
3. ადმინი ცვლის "Hero სათაური" → ახალი ტექსტი
4. "შენახვა":
   - PUT /api/content/hero_title?lang=ka {"value": "ახალი სათაური"}
   → SiteContent DB: UPDATE WHERE key="hero_title" AND locale="ka"
   → ← 200 {"key": "hero_title", "locale": "ka", "value": "..."}
5. საიტზე:
   - GET /api/content?lang=ka → ახალი სათაური
   → LandingPage: c("hero_title") = "ახალი სათაური"
   → <h1>ახალი სათაური</h1>
```

---

### ნაკადი 4: ელ. ფოსტა

```
სტუდენტი → POST /api/students
               ↓
         FastAPI → DB.add(student) → commit()
               ↓
         background_tasks.add_task(send_event_email, "registration", ctx, email)
               ↓
         return 201 Created  ← მომხმარებელს 201 მაშინვე მიდის
               ↓ (ფონში)
         send_event_email():
           1. DB: get EmailSettings (enabled=True, smtp_host=...)
           2. DB: get EmailTemplate WHERE key="registration"
           3. render(template.subject, ctx)  → "თქვენი განაცხადი მიღებულია"
           4. render(template.body, ctx)     → "გამარჯობა ნინო, ..."
           5. SMTP: connect smtp.gmail.com:587
           6. STARTTLS
           7. login(username, app_password)
           8. send_message(msg)
           ← True (ან False + print error)
```

---

## 16. Docker — გამართვა Production-ისთვის

### `docker-compose.yml` სერვისები

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│   db         │    │   backend    │    │   frontend       │
│   ─────────  │    │   ─────────  │    │   ─────────────  │
│ postgres:16  │◀───│  FastAPI     │◀───│  nginx:alpine    │
│              │    │  uvicorn     │    │                  │
│ port: 5432   │    │ port: 8000   │    │  port: 8080:80   │
│ pgdata volume│    │              │    │  /api → backend  │
└──────────────┘    └──────────────┘    └──────────────────┘
```

### nginx-ის ლოგიკა (production)

```nginx
location /api/ {
    proxy_pass http://backend:8000;  ← /api/courses → FastAPI
}
location / {
    try_files $uri $uri/ /index.html;  ← SPA routing
}
```

### გაშვება

```bash
# პირველ გაშვებამდე შეცვალე docker-compose.yml-ში:
# SECRET_KEY: change-me-to-a-long-random-string
# ADMIN_PASSWORD: შენი_პაროლი

docker compose up --build
```

გახსენი: `http://localhost:8080`

---

## 17. ხშირად დასმული კითხვები

**Q: ახალი ლექტორი დავამატე მაგრამ საიტზე არ ჩანს.**
A: შეამოწმე ✅ "საიტზე ჩანს" checkbox — ამოიყვანება მხოლოდ `is_active=True` ლექტორები.

**Q: CMS-ში ტექსტი შევცვალე მაგრამ ნავიგაციაში ძველი სახელი ჩანს.**
A: Navbar ლოდინობს `academy_name` გასაღებს. ასევე შეამოწმე `hero_eyebrow`.

**Q: ემაილი არ მოდის მაგრამ ფორმა ამბობს "განაცხადი მიღებულია".**
A: ეს ნორმალურია — ემაილი ფონში გაიგზავნება, ფორმა ყოველთვის Success-ს აჩვენებს. შეამოწმე ადმინში SMTP პარამეტრები და ტესტ ემაილი გაგზავნე.

**Q: `models.py`-ში ველი დავამატე მაგრამ სერვერი crash-ობს.**
A: SQLAlchemy-ის `create_all()` ახალ სვეტებს **ვერ ამატებს** არსებულ ცხრილებში. წაშალე `backend/abuladze.db` და გაუშვი ხელახლა.

**Q: ადმინი ქართულ ტექსტს ვერ ინახავს — `UnicodeEncodeError`.**
A: Windows console-ი ხვდება. გამართვისთვის: `$env:PYTHONIOENCODING = "utf-8"` PowerShell-ში.

**Q: `/admin`-ზე გადასვლა `/admin/login`-ზე გადამისამართდება.**
A: ტოკენი localStorage-ში ვადაგასულია ან არარსებობს. ნახე `auth.tsx` — `useAuth()` hook `GET /api/auth/me`-ს გამოიძახებს ვალიდაციისთვის.

**Q: production-ში `/api`-ის request-ები 404-ს აბრუნებს.**
A: nginx-ის კონფიგი (`nginx.conf`) უნდა იყოს Docker image-ში. შეამოწმე `frontend/Dockerfile` — `COPY nginx.conf /etc/nginx/conf.d/default.conf`.

---

## დამატებითი რესურსები

| რესურსი | URL |
|---------|-----|
| FastAPI დოკუმენტაცია | https://fastapi.tiangolo.com |
| SQLAlchemy 2.0 | https://docs.sqlalchemy.org/en/20/ |
| React Router 6 | https://reactrouter.com/en/main |
| Tailwind CSS | https://tailwindcss.com/docs |
| Swagger UI (local) | http://127.0.0.1:8000/docs |
| Pydantic v2 | https://docs.pydantic.dev/latest/ |

---

*დოკუმენტი შეიქმნა: 2026 წელი | STEM ინგა აბულაძის აკადემია*
