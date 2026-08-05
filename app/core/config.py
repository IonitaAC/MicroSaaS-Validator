"""
Micro-SaaS Validator — Application Settings
Loads environment variables from .env via pydantic-settings.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── API Keys ──────────────────────────────────────────────
    SERPER_API_KEY: str = ""
    FIRECRAWL_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # ── App Meta ──────────────────────────────────────────────
    APP_NAME: str = "Micro-SaaS Validator"
    DEBUG: bool = False


@lru_cache
def get_settings() -> Settings:
    """Cached singleton — call this everywhere instead of instantiating."""
    return Settings()
