"""FastAPI application entrypoint for Abuladze Academy."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, contact, content, courses, email, professors, students
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed default data on startup.
    seed()
    yield


app = FastAPI(
    title="Abuladze Academy API",
    description="Backend API & mini-CMS for the Abuladze Academy landing site.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(professors.router)
app.include_router(courses.router)
app.include_router(students.router)
app.include_router(contact.router)
app.include_router(content.router)
app.include_router(email.router)


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
