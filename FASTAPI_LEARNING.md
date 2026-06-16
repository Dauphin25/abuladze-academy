# FastAPI — Complete Learning Guide
### Based on the Abuladze Academy project (`backend/app/`)

This guide teaches every FastAPI concept using **real code from this project**.
Every example you see actually runs. Use this for learning, job prep, and interviews.

---

## Table of Contents

1. [What is FastAPI and why it's great](#1-what-is-fastapi-and-why-its-great)
2. [The App Object — `main.py`](#2-the-app-object--mainpy)
3. [Lifespan — startup and shutdown](#3-lifespan--startup-and-shutdown)
4. [Middleware — CORS](#4-middleware--cors)
5. [Routers — organizing endpoints](#5-routers--organizing-endpoints)
6. [Path Operations — the endpoints](#6-path-operations--the-endpoints)
7. [Path params, Query params, Request body](#7-path-params-query-params-request-body)
8. [Pydantic — validation and serialization](#8-pydantic--validation-and-serialization)
9. [Dependencies — `Depends()`](#9-dependencies--depends)
10. [Database — SQLAlchemy + `get_db`](#10-database--sqlalchemy--get_db)
11. [ORM Models — `models.py`](#11-orm-models--modelspy)
12. [CRUD operations](#12-crud-operations)
13. [Authentication — JWT + bcrypt](#13-authentication--jwt--bcrypt)
14. [BackgroundTasks — fire and forget](#14-backgroundtasks--fire-and-forget)
15. [HTTPException and status codes](#15-httpexception-and-status-codes)
16. [The full request lifecycle](#16-the-full-request-lifecycle)
17. [Interview Q&A](#17-interview-qa)

---

## 1. What is FastAPI and why it's great

FastAPI is a modern Python web framework for building APIs. It was released in 2018
and has become one of the most popular Python frameworks. Here's why it's used in
this project (and in real companies at scale):

### Why it's good

| Feature | What it means in practice |
|---|---|
| **Automatic docs** | Visit `/docs` → interactive Swagger UI, zero config |
| **Type hints = validation** | Write `title: str`, FastAPI validates for free |
| **Pydantic integration** | Request/response schemas are Python classes |
| **Async support** | Works with `async def` and regular `def` |
| **Dependency injection** | Auth, DB sessions, reusable logic — all clean |
| **Fast** | One of the fastest Python frameworks (starlette + uvicorn) |
| **Modern Python** | Type hints, dataclasses, Python 3.10+ features |

### How it compares to Flask/Django

```
Flask:   minimal, you wire everything yourself
Django:  batteries included, more opinionated
FastAPI: modern, type-safe, auto-docs, async-ready, REST-first
```

FastAPI is the go-to choice for REST APIs, microservices, and ML model serving today.

---

## 2. The App Object — `main.py`

**File:** `backend/app/main.py`

```python
from fastapi import FastAPI

app = FastAPI(
    title="Abuladze Academy API",
    description="Backend API & mini-CMS for the Abuladze Academy landing site.",
    version="1.0.0",
    lifespan=lifespan,
)
```

`FastAPI()` creates the application. The arguments you pass show up in `/docs`:
- `title` → the page title in Swagger UI
- `description` → shown under the title
- `version` → the API version badge
- `lifespan` → startup/shutdown hook (explained in section 3)

This `app` object is what uvicorn runs:
```bash
uvicorn app.main:app --reload --port 8000
#              ^   ^
#          module  the FastAPI() instance
```

### What uvicorn is

uvicorn is an **ASGI server** — it receives HTTP requests from the internet and
passes them to your FastAPI app. FastAPI is an ASGI application. You never call
`app.run()` — uvicorn does that for you.

---

## 3. Lifespan — startup and shutdown

**File:** `backend/app/main.py`

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Everything BEFORE yield → runs on startup
    seed()      # create DB tables + insert default data
    yield
    # Everything AFTER yield → runs on shutdown (cleanup)
```

The `lifespan` context manager replaces the old `@app.on_event("startup")` pattern.

**Why use it:**
- Run DB migrations or seed data before the first request arrives
- Open connection pools, load ML models, warm up caches
- On shutdown: close connections, flush logs

In our project it calls `seed()` which:
1. Calls `Base.metadata.create_all(engine)` — creates all DB tables if they don't exist
2. Inserts the default admin user and demo data if missing

---

## 4. Middleware — CORS

**File:** `backend/app/main.py`

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],     # GET, POST, PUT, DELETE, PATCH, OPTIONS
    allow_headers=["*"],     # Authorization, Content-Type, etc.
)
```

### What CORS is and why it's needed

When the React frontend (on `localhost:5173`) makes a request to the API
(`localhost:8000`), the browser sees two different **origins** (different ports =
different origin). By default, browsers **block** these cross-origin requests for
security.

CORS middleware adds response headers that tell the browser:
"Yes, this server allows requests from `localhost:5173`."

```
Browser → OPTIONS /api/courses  (preflight check)
          ← 200 + Access-Control-Allow-Origin: http://localhost:5173

Browser → GET /api/courses      (the real request)
          ← 200 + data
```

Without CORS middleware: the browser blocks the response and React gets nothing.

### Middleware concept

Middleware wraps every request. The flow is:

```
Request → Middleware 1 → Middleware 2 → Your endpoint
Response ← Middleware 1 ← Middleware 2 ← Your endpoint
```

You can have multiple middlewares. Each one can:
- Modify the request before it reaches your endpoint
- Modify the response before it goes back to the client
- Short-circuit (return early, like an auth check)

---

## 5. Routers — organizing endpoints

**File:** `backend/app/main.py` + `backend/app/routers/`

```python
from .routers import auth, contact, content, courses, email, professors, students

app.include_router(auth.router)
app.include_router(professors.router)
app.include_router(courses.router)
# ...
```

Each router file defines its own `APIRouter`:

```python
# backend/app/routers/courses.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("")          # → GET /api/courses
@router.get("/{id}")    # → GET /api/courses/1
@router.post("")         # → POST /api/courses
```

**`prefix`** — every route in this router automatically gets this URL prefix.
**`tags`** — groups endpoints together in Swagger UI (`/docs`).

### Why routers instead of one big file?

Without routers, you'd have 40+ endpoints all in `main.py`. That's hard to read
and maintain. Routers let you split by feature (courses, students, auth...) and
each file stays focused and manageable.

In this project:
```
routers/
├── auth.py       → /api/auth/login, /api/auth/me
├── courses.py    → /api/courses (CRUD)
├── professors.py → /api/professors (CRUD)
├── students.py   → /api/students (CRUD + status)
├── contact.py    → /api/contact
├── content.py    → /api/content (CMS)
└── email.py      → /api/email/settings, /api/email/templates
```

---

## 6. Path Operations — the endpoints

**File:** `backend/app/routers/courses.py`

A "path operation" = a function decorated with an HTTP method decorator.

```python
@router.get("", response_model=list[CourseOut])
def list_courses(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
) -> list[Course]:
    stmt = select(Course).order_by(Course.order, Course.id)
    if not include_inactive:
        stmt = stmt.where(Course.is_active.is_(True))
    return list(db.scalars(stmt))
```

Let's break this down piece by piece:

| Part | Meaning |
|---|---|
| `@router.get("")` | This function handles `GET /api/courses` |
| `response_model=list[CourseOut]` | FastAPI filters/validates the return value through this Pydantic model |
| `include_inactive: bool = False` | Query parameter — optional, defaults to False |
| `db: Session = Depends(get_db)` | Dependency injection — FastAPI provides the DB session |
| `-> list[Course]` | Type hint — just for readability, FastAPI uses `response_model` |
| `return list(db.scalars(stmt))` | Returns ORM objects; `response_model` converts them to JSON |

### The five HTTP methods

```python
@router.get("/{course_id}")        # Read one course
@router.get("")                     # Read all courses
@router.post("")                    # Create a course
@router.put("/{course_id}")         # Replace a course (all fields)
@router.patch("/{student_id}")      # Partial update (some fields)
@router.delete("/{course_id}")      # Delete a course
```

### `response_model` — what it does

`response_model` is one of the most important FastAPI features:

1. **Filters the output** — if your ORM model has `hashed_password`, and your
   response schema doesn't include it, FastAPI strips it. This is how we prevent
   leaking sensitive data.
2. **Validates the output** — FastAPI checks that your return value matches the schema.
3. **Generates docs** — Swagger UI shows the exact shape of the response.

In our project, `EmailSettings` has a `password` field in the DB, but
`EmailSettingsOut` (the `response_model`) has `has_password: bool` instead.
The real password is **never** sent to the client.

### `status_code`

```python
@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(...):
    ...
```

Default status code for `GET` is 200. For `POST` creating a resource, the
convention is **201 Created**. For `DELETE`, use **204 No Content** (no body).

```python
from fastapi import status

status.HTTP_200_OK          # 200
status.HTTP_201_CREATED     # 201
status.HTTP_204_NO_CONTENT  # 204
status.HTTP_400_BAD_REQUEST # 400
status.HTTP_401_UNAUTHORIZED # 401
status.HTTP_404_NOT_FOUND   # 404
```

Using `status.HTTP_xxx` instead of raw numbers is a best practice — it's
self-documenting and catches typos at development time.

---

## 7. Path params, Query params, Request body

These are three different ways a client can send data to your endpoint.

### Path parameters — part of the URL

```python
@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)) -> Course:
    #           ^^^^^^^^^^^
    #    matches {course_id} in the decorator
```

URL: `GET /api/courses/42`
FastAPI extracts `42` from the URL, converts it to `int`, and passes it as `course_id`.

If the client sends `GET /api/courses/abc`, FastAPI automatically returns `422 Unprocessable Entity` because `abc` can't be converted to `int`. You don't write this validation yourself — it's free.

### Query parameters — `?key=value` in the URL

```python
@router.get("", response_model=list[CourseOut])
def list_courses(
    include_inactive: bool = False,   # ← query parameter
    db: Session = Depends(get_db),
):
```

URL: `GET /api/courses?include_inactive=true`

Rules:
- Has a default value → **optional** query param
- No default → **required** query param (FastAPI returns 422 if missing)
- Type hint is respected: `bool`, `int`, `str`, `float` all work

In our project, the students endpoint uses query params too:
```python
def list_students(status_filter: str | None = None, db: ...):
# GET /api/students?status_filter=new
```

### Request body — JSON sent in the request

```python
@router.post("", response_model=CourseOut, status_code=201,
             dependencies=[Depends(get_current_admin)])
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    #             ^^^^^^^^^^^^^^^^^
    #    Pydantic model → FastAPI reads JSON body
```

Request: `POST /api/courses` with body:
```json
{
  "title": "Python Basics",
  "level": "დამწყები",
  "price": 400
}
```

FastAPI sees that `payload` is a Pydantic `BaseModel` (not a path/query param),
so it reads the JSON body, validates it against `CourseCreate`, and gives you
a populated Python object. If validation fails → `422` automatically.

### How FastAPI decides which is which

| How you declare it | FastAPI treats it as |
|---|---|
| `course_id: int` (matches `{course_id}` in path) | Path parameter |
| `include_inactive: bool = False` (not in path) | Query parameter |
| `payload: CourseCreate` (is a Pydantic BaseModel) | Request body (JSON) |
| `db: Session = Depends(get_db)` | Dependency |

---

## 8. Pydantic — validation and serialization

**File:** `backend/app/schemas.py`

Pydantic is the validation library FastAPI is built on. Every schema in the project
is a Pydantic `BaseModel`.

### The three schema pattern

This project uses a clean three-class pattern for each resource:

```python
# 1. Base — shared fields between create and response
class CourseBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    summary: str = ""
    price: float | None = None
    what_you_learn: list[str] = Field(default_factory=list)
    is_active: bool = True

# 2. Create — what the client sends to POST
class CourseCreate(CourseBase):
    pass   # same as Base in this case

# 3. Out — what we send BACK to the client
class CourseOut(CourseBase):
    model_config = ConfigDict(from_attributes=True)  # ← allows reading ORM objects
    id: int
    created_at: datetime
```

Why separate? Because:
- `CourseCreate` — client sends this (no `id`, no `created_at` — they don't exist yet)
- `CourseOut` — server returns this (has `id` and `created_at` from DB)

### `model_config = ConfigDict(from_attributes=True)`

This is critical. By default, Pydantic reads data from **dicts**. But SQLAlchemy
returns **ORM objects** (not dicts). With `from_attributes=True`, Pydantic knows
to read attributes from the object:

```python
# Without from_attributes: ❌ fails
course_dict = {"id": 1, "title": "Python"}
CourseOut(**course_dict)   # works

course_orm = db.get(Course, 1)
CourseOut(**course_orm)    # ❌ TypeError - ORM object isn't a dict

# With from_attributes: ✅ works
CourseOut.model_validate(course_orm)  # FastAPI does this internally
```

### `Field()` — validation rules

```python
from pydantic import BaseModel, Field

class StudentCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=160)
    email: EmailStr          # validates it's a real email format
    phone: str = ""
    course_id: int | None = None

class StudentStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|contacted|enrolled)$")
    #                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    #                   regex — only these 3 values allowed
```

If a client sends `status: "deleted"`, FastAPI returns:
```json
{
  "detail": [{
    "type": "string_pattern_mismatch",
    "msg": "String should match pattern '^(new|contacted|enrolled)$'"
  }]
}
```

You wrote zero validation code. Pydantic handled it.

### Update schemas — `exclude_unset`

Look at `CourseUpdate` — every field is `| None`:

```python
class CourseUpdate(BaseModel):
    title: str | None = None
    price: float | None = None
    is_active: bool | None = None
    # ...every field is optional
```

This is the **partial update (PATCH) pattern**. The client only sends the fields
they want to change. In the endpoint:

```python
def update_course(course_id: int, payload: CourseUpdate, db: ...):
    course = db.get(Course, course_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        #                                  ^^^^^^^^^^^^^^^^
        #  Only fields the client actually sent — not None defaults
        setattr(course, field, value)
    db.commit()
```

`exclude_unset=True` is the key. Without it:
```python
# Client sends: {"title": "New Title"}
# payload.model_dump() → {"title": "New Title", "price": None, "is_active": None, ...}
# This would overwrite everything with None! ❌

# payload.model_dump(exclude_unset=True) → {"title": "New Title"}
# Only updates title. ✅
```

---

## 9. Dependencies — `Depends()`

**File:** `backend/app/deps.py`

Dependencies are one of FastAPI's most powerful features. They let you share
reusable logic across endpoints without repeating yourself.

### How `Depends()` works

```python
from fastapi import Depends

@router.get("", response_model=list[CourseOut])
def list_courses(
    db: Session = Depends(get_db),           # DB dependency
):
```

When FastAPI receives a request for this endpoint, it:
1. Calls `get_db()` to get a DB session
2. Passes the session as `db` to `list_courses`
3. After the function returns, FastAPI cleans up (closes the DB session)

You never call `get_db()` yourself. FastAPI manages the whole lifecycle.

### The `get_db` dependency

**File:** `backend/app/database.py`

```python
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db      # ← FastAPI gets the session here
    finally:
        db.close()    # ← always runs, even if the endpoint raises an error
```

This is a **generator dependency** (uses `yield`). The code after `yield` is
the cleanup code — like `try/finally`. It guarantees the DB connection is
always closed, even if the endpoint throws an exception.

### The `get_current_admin` dependency

**File:** `backend/app/deps.py`

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_admin(
    token: str = Depends(oauth2_scheme),   # ← reads the Authorization header
    db: Session = Depends(get_db),          # ← gets a DB session
) -> Admin:
    credentials_error = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )
    username = decode_access_token(token)
    if username is None:
        raise credentials_error

    admin = db.scalar(select(Admin).where(Admin.username == username))
    if admin is None:
        raise credentials_error
    return admin
```

This is a dependency that itself has dependencies — `oauth2_scheme` and `get_db`.
FastAPI resolves this whole chain automatically. This is called **nested dependencies**.

`OAuth2PasswordBearer` reads the `Authorization: Bearer <token>` header from the
request and gives you the raw token string. FastAPI automatically shows a
"Authorize" button in Swagger UI because of this.

### Two ways to require auth on an endpoint

**Method 1: As a parameter** — use when you need the admin object

```python
@router.get("/me", response_model=AdminOut)
def me(current_admin: Admin = Depends(get_current_admin)) -> Admin:
    return current_admin   # you can USE the admin object
```

**Method 2: As a route dependency** — use when you just need to block unauthenticated access

```python
@router.post("", response_model=CourseOut,
             dependencies=[Depends(get_current_admin)])
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    # You don't use current_admin here — just need to block unauth requests
```

Both raise `401 Unauthorized` if the token is missing or invalid.

### Why dependencies are great

```python
# Without dependencies — repeated in every protected endpoint:
def create_course(request: Request, payload: CourseCreate):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth_header.split(" ")[1]
    username = decode_token(token)
    if not username:
        raise HTTPException(401, "Invalid token")
    db = SessionLocal()
    admin = db.query(Admin).filter_by(username=username).first()
    if not admin:
        raise HTTPException(401, "Admin not found")
    # ... finally the actual logic

# With dependencies:
def create_course(payload: CourseCreate, db: Session = Depends(get_db),
                  _: Admin = Depends(get_current_admin)):
    # just the actual logic
```

---

## 10. Database — SQLAlchemy + `get_db`

**File:** `backend/app/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

engine = create_engine(settings.database_url, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass
```

### The three SQLAlchemy concepts

**1. Engine** — the connection to the database

```python
engine = create_engine("sqlite:///./abuladze.db")
# or for PostgreSQL:
engine = create_engine("postgresql+psycopg://user:pass@localhost/dbname")
```

The engine manages the connection pool. You create it once at startup.

**2. Session** — a unit of work with the database

```python
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
```

A session tracks changes to objects. You use it to query and commit. Think of
it like a "shopping cart" — you add items, then commit (pay). If you don't
commit, nothing is saved.

`autocommit=False` means you must call `db.commit()` explicitly. This is what
you want — it means transactions are controlled.

`autoflush=False` means SQLAlchemy won't flush pending changes to DB automatically
before every query. Again, you want control.

**3. Base** — all ORM models inherit from this

```python
class Base(DeclarativeBase):
    pass

class Course(Base):     # ← inherits from Base
    __tablename__ = "courses"
    ...
```

`Base.metadata.create_all(engine)` creates all tables for all classes that inherit
from `Base`. This is called in `seed.py` at startup.

### Why `check_same_thread: False` for SQLite

```python
connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)
```

SQLite by default only allows the same thread that created the connection to use it.
But uvicorn uses multiple threads. Setting `check_same_thread: False` allows any
thread to use the connection. This is safe because FastAPI gives each request its
own `Session` via `get_db`.

PostgreSQL doesn't have this restriction.

---

## 11. ORM Models — `models.py`

**File:** `backend/app/models.py`

SQLAlchemy 2.0 uses a "mapped column" style with Python type hints:

```python
from sqlalchemy.orm import Mapped, mapped_column

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    what_you_learn: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

### `Mapped[T]` vs old style

```python
# Old SQLAlchemy 1.x style:
title = Column(String(160), nullable=False)

# New SQLAlchemy 2.0 style (used in this project):
title: Mapped[str] = mapped_column(String(160))
# Mapped[str] means "not nullable" — the column must have a value
# Mapped[str | None] means nullable
```

The new style is better because:
- IDE understands the types — you get autocompletion
- `Mapped[str | None]` is more readable than `nullable=True`
- Works with Python type checkers (mypy, pyright)

### Column types used in this project

```python
String(160)       # VARCHAR(160) — short text, max length
Text              # TEXT — long text, no limit
Integer           # INTEGER
Numeric(10, 2)    # DECIMAL — for prices (10 digits, 2 decimal places)
Boolean           # BOOLEAN — True/False
DateTime          # DATETIME
JSON              # JSON/TEXT — stores Python lists/dicts as JSON
```

### `default` vs `server_default`

```python
is_active: Mapped[bool] = mapped_column(Boolean, default=True)
# ↑ Python-side default. SQLAlchemy sets this before INSERT.

created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
# ↑ Database-side default. The DB itself sets the timestamp on INSERT.
# func.now() = SQL NOW() function
```

Use `server_default=func.now()` for timestamps — the DB's clock is more reliable.

### Relationships

```python
class Course(Base):
    students: Mapped[list["Student"]] = relationship(back_populates="course")

class Student(Base):
    course_id: Mapped[int | None] = mapped_column(ForeignKey("courses.id"), nullable=True)
    course: Mapped["Course | None"] = relationship(back_populates="students")
```

This defines a **one-to-many** relationship: one Course has many Students.

`ForeignKey("courses.id")` — the `course_id` column references the `id` of the
`courses` table. This is enforced at the DB level.

`relationship(back_populates="students")` — SQLAlchemy links the two sides so:
```python
course = db.get(Course, 1)
course.students      # → list of Student objects for this course

student = db.get(Student, 1)
student.course       # → the Course object this student enrolled in
```

### Composite Primary Key

```python
class SiteContent(Base):
    __tablename__ = "site_content"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    locale: Mapped[str] = mapped_column(String(5), primary_key=True, default="ka")
    value: Mapped[str] = mapped_column(Text, default="")
```

Two columns are both `primary_key=True` → composite PK. This means the
combination of `(key, locale)` must be unique. So you can have:

```
key="hero_title", locale="ka" → "გახდი პროგრამისტი"
key="hero_title", locale="en" → "Become a Developer"
```

Each is a separate row with a unique PK pair.

---

## 12. CRUD Operations

**File:** `backend/app/routers/courses.py`

CRUD = Create, Read, Update, Delete. Here's every pattern from the project:

### Create

```python
@router.post("", response_model=CourseOut, status_code=201,
             dependencies=[Depends(get_current_admin)])
def create_course(payload: CourseCreate, db: Session = Depends(get_db)) -> Course:
    course = Course(**payload.model_dump())  # ① Pydantic → dict → ORM object
    db.add(course)                           # ② Tell session about this new object
    db.commit()                              # ③ Write to DB
    db.refresh(course)                       # ④ Reload from DB (gets auto-generated id)
    return course
```

**`payload.model_dump()`** — converts the Pydantic object to a dict:
```python
{"title": "Python Basics", "level": "დამწყები", "price": 400.0, ...}
```

**`Course(**payload.model_dump())`** — unpacks that dict as keyword arguments
to the `Course` constructor. Equivalent to:
```python
Course(title="Python Basics", level="დამწყები", price=400.0, ...)
```

**`db.refresh(course)`** — after commit, the `course` object in Python may be
"stale" — the DB has generated an `id` and `created_at`, but our Python object
doesn't know yet. `refresh()` re-reads the object from the DB.

### Read all

```python
@router.get("", response_model=list[CourseOut])
def list_courses(include_inactive: bool = False, db: Session = Depends(get_db)):
    stmt = select(Course).order_by(Course.order, Course.id)
    if not include_inactive:
        stmt = stmt.where(Course.is_active.is_(True))
    return list(db.scalars(stmt))
```

`select(Course)` — builds a SELECT query. This is SQLAlchemy Core syntax
(SQLAlchemy 2.0 style). The old style was `db.query(Course)`.

`db.scalars(stmt)` — executes the query and returns a sequence of ORM objects.
`.is_(True)` — use `.is_()` for boolean comparison (not `== True`).

### Read one

```python
@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)) -> Course:
    course = db.get(Course, course_id)   # SELECT WHERE id = course_id
    if course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    return course
```

`db.get(Model, pk)` — get by primary key. Returns `None` if not found.
This is the fastest way to fetch a single row — uses SQLAlchemy's identity map
(checks the session cache first before querying the DB).

### Update (full replace — PUT)

```python
@router.put("/{course_id}", response_model=CourseOut,
            dependencies=[Depends(get_current_admin)])
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(404, "Course not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)   # dynamically set attributes
    db.commit()
    db.refresh(course)
    return course
```

You don't need a new `db.add()` here — the `course` object is already
"tracked" by the session (it was loaded from the DB). Just change its
attributes and call `db.commit()`.

### Delete

```python
@router.delete("/{course_id}", status_code=204,
               dependencies=[Depends(get_current_admin)])
def delete_course(course_id: int, db: Session = Depends(get_db)) -> None:
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(404, "Course not found")
    db.delete(course)
    db.commit()
```

`status_code=204` → **No Content**. The response body is empty. That's why the
return type is `None` and we don't `return` anything.

---

## 13. Authentication — JWT + bcrypt

**Files:** `backend/app/security.py`, `backend/app/routers/auth.py`, `backend/app/deps.py`

### What JWT is

JWT = JSON Web Token. It's a signed string that proves identity.
Format: `header.payload.signature` (three base64 parts separated by dots).

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← header (base64)
.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc...     ← payload (base64)
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_   ← signature
```

The payload contains: `{"sub": "admin", "exp": 1750000000}`.
The signature is made with a secret key. Without the secret key, you can't
forge a valid token.

### Step 1 — Hashing passwords at account creation

**File:** `backend/app/security.py`

```python
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False
```

bcrypt is a **one-way** hash function. You can never reverse it to get the
original password. You can only verify: "does this password match this hash?"

In `seed.py`:
```python
admin = Admin(username="admin", hashed_password=hash_password("admin123"))
db.add(admin)
```

The string `"admin123"` is never stored in the DB — only its bcrypt hash.

### Step 2 — Creating a JWT token at login

**File:** `backend/app/routers/auth.py`

```python
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    admin = db.scalar(select(Admin).where(Admin.username == form_data.username))
    if admin is None or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password",
                            headers={"WWW-Authenticate": "Bearer"})
    return Token(access_token=create_access_token(admin.username))
```

`OAuth2PasswordRequestForm` — a special FastAPI class that reads **form data**
(not JSON). The client must send `Content-Type: application/x-www-form-urlencoded`.
This is the OAuth2 standard for the password grant.

```python
def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")
```

The JWT payload has:
- `"sub"` (subject) — who this token belongs to (the username)
- `"exp"` (expiry) — when the token expires (Unix timestamp)

### Step 3 — Verifying the token on protected requests

**File:** `backend/app/security.py`

```python
def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload.get("sub")   # returns "admin"
    except jwt.PyJWTError:          # expired, invalid signature, malformed
        return None
```

**File:** `backend/app/deps.py`

```python
def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(401, "Could not validate credentials")

    admin = db.scalar(select(Admin).where(Admin.username == username))
    if admin is None:
        raise HTTPException(401, "Could not validate credentials")
    return admin
```

### The full auth flow

```
1. Client: POST /api/auth/login
           username=admin&password=admin123

2. Server: verify_password("admin123", "$2b$12$...")  → True
           create_access_token("admin") → "eyJhbGci..."

3. Client: stores token in localStorage

4. Client: GET /api/courses?include_inactive=true
           Authorization: Bearer eyJhbGci...

5. Server: oauth2_scheme extracts "eyJhbGci..."
           decode_access_token() → "admin"
           db.get(Admin, "admin") → Admin object
           endpoint runs ✅

6. Client: GET /api/courses?include_inactive=true
           (no Authorization header)

7. Server: token is None → 401 Unauthorized ❌
```

### Why not store sessions in DB?

JWT is **stateless** — the server doesn't need to look up a session in the DB
for every request. The token itself contains all the info needed (the username
and expiry). This scales better because there's no shared session store.

The tradeoff: you can't invalidate a JWT before it expires. For this project
(single admin user, 12-hour tokens), that's fine.

---

## 14. BackgroundTasks — fire and forget

**File:** `backend/app/routers/students.py`

```python
from fastapi import BackgroundTasks

@router.post("", response_model=StudentOut, status_code=201)
def create_student(
    payload: StudentCreate,
    background_tasks: BackgroundTasks,    # ← FastAPI provides this
    db: Session = Depends(get_db),
) -> Student:
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)

    context = {"name": student.full_name, "email": student.email, ...}
    background_tasks.add_task(send_event_email, "registration", context, student.email)
    background_tasks.add_task(send_event_email, "admin_new_application", context, None)
    return student   # ← response sent immediately
    # email sends AFTER the response
```

`BackgroundTasks` is a FastAPI built-in. `add_task(func, *args)` schedules
`func(*args)` to run **after** the HTTP response has been sent to the client.

### Why emails are in the background

Sending an email means connecting to an SMTP server over the network. This can
take 1-5 seconds or fail completely. If you do it synchronously:

```python
# ❌ Synchronous — client waits 3 seconds for a form submission
def create_student(payload: StudentCreate, db: ...):
    student = Student(**payload.model_dump())
    db.commit()
    send_email(student.email)   # client is stuck waiting here
    return student              # finally responds after 3s
```

With `BackgroundTasks`:
```python
# ✅ Async — client gets response in <100ms
def create_student(..., background_tasks: BackgroundTasks):
    # ... save to DB
    background_tasks.add_task(send_email, student.email)
    return student   # responds immediately, email sends later
```

The principle from `CLAUDE.md`: "never let a send break a request." In
`email_service.py`, the `send_event_email` function wraps everything in
`try/except` and swallows errors — a failing SMTP server never crashes the
registration endpoint.

```python
def send_event_email(event_key: str, context: dict, to_email: str | None) -> bool:
    try:
        # ... all the email logic
        return True
    except Exception as exc:    # ← catches EVERYTHING
        print(f"[email] Failed: {exc}")
        return False            # ← never raises, never breaks the request
    finally:
        db.close()              # ← always closes the DB session
```

Notice: this function opens its own `db = SessionLocal()` because it runs
**after** the request's `get_db` session has already been closed.

---

## 15. HTTPException and status codes

**File:** `backend/app/routers/courses.py`

```python
from fastapi import HTTPException, status

course = db.get(Course, course_id)
if course is None:
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
```

`HTTPException` stops the endpoint and sends an error response immediately.
FastAPI catches it and returns:
```json
HTTP 404 Not Found
{"detail": "Course not found"}
```

### When to use which status code

| Situation | Code | Constant |
|---|---|---|
| Success, returned data | 200 | `HTTP_200_OK` |
| Created a resource | 201 | `HTTP_201_CREATED` |
| Deleted (no body) | 204 | `HTTP_204_NO_CONTENT` |
| Invalid input (client's fault) | 400 | `HTTP_400_BAD_REQUEST` |
| Not authenticated | 401 | `HTTP_401_UNAUTHORIZED` |
| Authenticated but not allowed | 403 | `HTTP_403_FORBIDDEN` |
| Resource not found | 404 | `HTTP_404_NOT_FOUND` |
| Validation failed (auto) | 422 | `HTTP_422_UNPROCESSABLE_ENTITY` |
| Server error | 500 | `HTTP_500_INTERNAL_SERVER_ERROR` |

FastAPI automatically returns 422 for Pydantic validation errors. You don't
need to write that yourself.

The difference between 401 and 403:
- `401` — "I don't know who you are" (no/invalid token)
- `403` — "I know who you are, but you're not allowed" (e.g., regular user trying admin endpoint)

---

## 16. The full request lifecycle

Let's trace what happens when the React frontend calls:
```
GET /api/courses?include_inactive=true
Authorization: Bearer eyJhbGci...
```

```
1. Uvicorn receives the HTTP request

2. FastAPI matches URL → router.get("") in courses.py

3. FastAPI reads the function signature:
   def list_courses(include_inactive: bool, db: Session = Depends(get_db)):

4. FastAPI resolves dependencies:
   - Calls get_db() → opens a DB Session, yields it
   - Note: get_current_admin is NOT a dependency here (public endpoint)

5. FastAPI reads query param:
   - "?include_inactive=true" → converts "true" string to Python True

6. FastAPI calls list_courses(include_inactive=True, db=<Session>)

7. Function runs:
   - Builds SELECT query
   - Executes against SQLite
   - Returns list of Course ORM objects

8. FastAPI applies response_model=list[CourseOut]:
   - Converts each Course ORM object to CourseOut Pydantic model
   - Serializes to JSON

9. FastAPI sends HTTP 200 response with JSON body

10. get_db() finally block runs → db.close()
```

Now for a protected endpoint: `POST /api/courses`

```
1-2. Same as above

3. FastAPI reads the signature:
   def create_course(payload: CourseCreate,
                     db: Session = Depends(get_db)):
   + dependencies=[Depends(get_current_admin)]

4. FastAPI resolves dependencies (in order):
   a. get_current_admin is resolved first:
      - oauth2_scheme reads Authorization header → "eyJhbGci..."
      - get_db() opens a Session
      - decode_access_token("eyJhbGci...") → "admin"
      - db.scalar(select(Admin).where(...)) → Admin object
      - Returns Admin object ✅
      (If token invalid → raises HTTPException 401 → stops here)

   b. get_db() opens another Session for the main endpoint

5. FastAPI reads JSON body:
   - Parses JSON → creates CourseCreate Pydantic object
   - Validates all fields (min_length, types, etc.)
   - If invalid → 422 response (stops here)

6. FastAPI calls create_course(payload=<CourseCreate>, db=<Session>)

7. Function runs:
   - Course(**payload.model_dump()) → Course ORM object
   - db.add(course) → session tracks this object
   - db.commit() → INSERT INTO courses (...) VALUES (...)
   - db.refresh(course) → SELECT FROM courses WHERE id=?

8. FastAPI applies response_model=CourseOut → JSON

9. HTTP 201 Created sent

10. Both db sessions are closed
```

---

## 17. Interview Q&A

These are real questions asked in Python/FastAPI job interviews. Answers use
this project as examples.

---

**Q: What is FastAPI and how is it different from Flask?**

FastAPI is a modern Python web framework built on top of Starlette and Pydantic.
Compared to Flask:
- FastAPI has **automatic request validation** via Pydantic type hints. Flask requires
  you to validate manually.
- FastAPI generates **automatic Swagger docs** at `/docs`. Flask needs extensions.
- FastAPI has **dependency injection** built in (`Depends()`). Flask doesn't.
- FastAPI supports **async/await** natively. Flask (pre-2.0) was synchronous only.

---

**Q: What is Pydantic and why do we use it?**

Pydantic is a data validation library. You define a class with type-annotated fields
and Pydantic validates, converts, and serializes data automatically.

In this project, `StudentCreate` has `email: EmailStr`. If a client sends
`"email": "not-an-email"`, FastAPI returns `422 Unprocessable Entity` automatically
— we didn't write a single line of validation code.

---

**Q: What is dependency injection in FastAPI? Give an example.**

Dependency injection is when FastAPI automatically calls a function and provides its
return value to your endpoint. You declare what you need, FastAPI figures out how to
provide it.

Example: `db: Session = Depends(get_db)`. FastAPI calls `get_db()`, which opens a
database session and yields it. After the endpoint finishes, FastAPI closes the
session automatically. This way, every endpoint gets a fresh DB connection without
having to manage it themselves.

---

**Q: What is the difference between `response_model` and `-> ReturnType`?**

`-> ReturnType` is just a Python type hint for the developer and type checkers.
FastAPI ignores it for the actual response.

`response_model` is what FastAPI uses to:
1. Filter sensitive fields from the output (e.g., `hashed_password` won't appear)
2. Validate the return value matches the schema
3. Generate the response docs in Swagger

You should always use `response_model` in production code.

---

**Q: What is `exclude_unset=True` and when do you need it?**

When a Pydantic model has optional fields with `None` defaults (like `CourseUpdate`),
calling `model_dump()` includes ALL fields — even the ones the client didn't send —
as `None`.

`model_dump(exclude_unset=True)` only includes the fields the client actually sent.
This is essential for PATCH/partial-update endpoints. Without it, every field you
didn't send would be overwritten with `None` in the database.

---

**Q: How do you secure endpoints in FastAPI?**

Two ways, both used in this project:

1. `Depends(get_current_admin)` as a function parameter — when you need the admin
   object inside the function.
2. `dependencies=[Depends(get_current_admin)]` in the decorator — when you just
   need to block unauthenticated requests.

The `get_current_admin` dependency reads the `Authorization: Bearer` header,
decodes the JWT, looks up the admin in the DB, and either returns the admin or
raises `HTTPException(401)`.

---

**Q: What is the `lifespan` context manager in FastAPI?**

It's a function that runs startup code before the first request and shutdown code
when the server stops. In this project, `lifespan` calls `seed()` which creates
all database tables and inserts default data. It replaces the deprecated
`@app.on_event("startup")` decorator.

---

**Q: Why use BackgroundTasks for emails?**

Sending emails requires a network connection to an SMTP server, which can be slow
or fail. If you send emails synchronously inside the endpoint, the client has to
wait for the email to be sent (3-5 seconds) and if the SMTP server is down, the
registration fails.

With `BackgroundTasks`, the response is sent immediately and the email is sent
after. Errors are caught and logged, so a broken SMTP never breaks form submissions.

---

**Q: What is CORS and why do you need it?**

CORS (Cross-Origin Resource Sharing) is a browser security policy that blocks
requests to a different origin (domain/port) than the page was loaded from.

In development, the React frontend runs on `localhost:5173` and the FastAPI
backend on `localhost:8000`. Without CORS middleware, the browser blocks all
API requests. The `CORSMiddleware` adds response headers that tell the browser
to allow these cross-origin requests.

---

**Q: What is the difference between `db.get()` and `db.scalar(select(...))`?**

`db.get(Model, pk)` — fetches by primary key. Checks the session's identity map
first (cached from previous queries in the same session) before hitting the DB.
Use this when you have the PK.

`db.scalar(select(Model).where(...))` — builds a full SELECT query with conditions.
Use this for any query that isn't just "get by ID" — like filtering by username,
status, or joining tables.

---

**Q: What is `model_config = ConfigDict(from_attributes=True)`?**

By default, Pydantic creates model instances from dicts. SQLAlchemy returns ORM
objects (Python class instances), not dicts. `from_attributes=True` tells Pydantic
to read attribute values from the object (like `course.title`) instead of
expecting a dict key (like `data["title"]`). Without this, FastAPI can't convert
SQLAlchemy ORM objects to Pydantic models.

---

**Q: What is an APIRouter and why use it?**

`APIRouter` is a way to group related endpoints. Each router has its own `prefix`
(URL prefix) and `tags` (for Swagger docs). The router is included in the main app
with `app.include_router(router)`.

Without routers, all 40+ endpoints would be in one giant `main.py`. Routers
split the code by feature (`auth`, `courses`, `students`) and each file stays
small and focused.

---

**Q: How does OAuth2PasswordRequestForm work?**

It's a FastAPI class that reads form-encoded data (`application/x-www-form-urlencoded`)
from the request body and exposes `.username` and `.password` attributes.

The key gotcha: it expects **form data**, not JSON. If the client sends
`Content-Type: application/json` with `{"username": "admin", "password": "..."}`,
FastAPI will return `422`. The client must send it as form-encoded data.

---

*Built with FastAPI 0.115, SQLAlchemy 2.0, Pydantic 2, PyJWT 2.10, bcrypt 4.2*
*Project: STEM Inga Abuladze Academy — `backend/app/`*
