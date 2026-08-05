"""
Micro-SaaS Validator — Search-related Pydantic schemas.
"""

from pydantic import BaseModel, Field


# ── Request ──────────────────────────────────────────────────
class SearchInput(BaseModel):
    """Body for the step-1 search endpoint."""

    idea: str = Field(
        ...,
        min_length=2,
        max_length=200,
        examples=["habit tracker app"],
        description="The SaaS idea to validate.",
    )


# ── Domain objects ───────────────────────────────────────────
class CompetitorResult(BaseModel):
    """A single organic competitor found via search."""

    title: str
    link: str
    snippet: str
    position: int


# ── Response ─────────────────────────────────────────────────
class SearchStepResponse(BaseModel):
    """Full response for the step-1 search endpoint."""

    queries: list[str] = Field(
        description="The search query variations that were executed."
    )
    results: list[CompetitorResult] = Field(
        description="Top unique competitor results (aggregators filtered out)."
    )
