"""Application configuration loaded from environment / .env file."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Security
    secret_key: str = "change-me-to-a-long-random-string"
    access_token_expire_minutes: int = 720
    algorithm: str = "HS256"

    # Database
    database_url: str = "sqlite:///./abuladze.db"

    # CORS
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Default seeded admin
    admin_username: str = "admin"
    admin_password: str = "admin123"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
