"""
Micro-SaaS Validator — Scrape-related Pydantic schemas.
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ── Request ──────────────────────────────────────────────────
class ScrapeInput(BaseModel):
    """Body for the step-2 scraping endpoint."""

    urls: list[str] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="List of URLs to scrape (max 3).",
        examples=[["https://example.com/pricing", "https://competitor.com"]],
    )

    @field_validator("urls")
    @classmethod
    def validate_urls(cls, v: list[str]) -> list[str]:
        if len(v) > 3:
            raise ValueError("Maximum 3 URLs allowed per request.")
        return v


# ── Domain objects ───────────────────────────────────────────
class ScrapedPage(BaseModel):
    """Result of a single scraped URL."""

    url: str
    content: str = Field(description="Markdown content (truncated).")
    error: Optional[str] = Field(
        None, description="Error message if scraping failed."
    )


# ── Response ─────────────────────────────────────────────────
class ScrapeResponse(BaseModel):
    """Full response for the step-2 scraping endpoint."""

    scraped_data: list[ScrapedPage]
