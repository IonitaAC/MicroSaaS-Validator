"""
Micro-SaaS Validator — Analysis-related Pydantic schemas.
"""

from typing import Optional

from pydantic import BaseModel, Field


# ── Domain objects ───────────────────────────────────────────
class CompetitorAnalysis(BaseModel):
    """Analysis of a single competitor."""

    name: str = Field(description="Name of the competitor")
    url: str = Field(description="URL of the competitor")
    pricing_model: str = Field(description="Summary of pricing (e.g. 'Freemium, $10/mo')")
    value_prop: str = Field(description="Main value proposition or tagline")


class VoiceOfCustomer(BaseModel):
    """Insights into customer sentiment and needs."""

    pain_points: list[str] = Field(
        description="List of complaints, missing features, or frustrations found in reviews/content"
    )


class Verdict(BaseModel):
    """The Skeptical VC's final judgment."""

    saturation_score: int = Field(
        description="0-100 score. 0-30 = Blue Ocean, 70-100 = Highly Saturated."
    )
    explanation: str = Field(
        description="Direct, no-nonsense justification for the score."
    )
    blue_ocean_opportunity: str = Field(
        description="A specific gap or angle that giants are ignoring (The 'Gap Analysis')."
    )


# ── Response ─────────────────────────────────────────────────
from typing import Optional
from datetime import datetime
from uuid import UUID

class AnalystResponse(BaseModel):
    """Full analysis report."""
    
    validation_id: Optional[UUID] = None
    competitor_analysis: list[CompetitorAnalysis]
    voice_of_customer: VoiceOfCustomer
    verdict: Verdict

class ValidationSummary(BaseModel):
    id: UUID
    idea: str
    created_at: datetime
    saturation_score: int
    blue_ocean_opportunity: Optional[str] = None



# ── Request ──────────────────────────────────────────────────
class AnalysisInput(BaseModel):
    """Body for the step-3 analysis endpoint."""

    idea: str = Field(
        ...,
        min_length=5,
        description="The Micro-SaaS idea to validate.",
    )
    scraped_data: list[dict] = Field(
        ...,
        description="List of scraped content from Step 2 (url, content, error).",
        examples=[[{"url": "https://example.com", "content": "# Markdown..."}]],
    )
