"""
Micro-SaaS Validator — Strategy/Canvas Schemas
"""

from pydantic import BaseModel, Field
from uuid import UUID
from typing import List

class CanvasInput(BaseModel):
    validation_id: UUID
    idea: str
    scraped_data: list[dict] # Simplified for brevity, could reuse ScrapedPage

class BusinessModelCanvas(BaseModel):
    key_partners: List[str]
    key_activities: List[str]
    key_resources: List[str]
    value_propositions: List[str]
    customer_relationships: List[str]
    channels: List[str]
    customer_segments: List[str]
    cost_structure: List[str]
    revenue_streams: List[str]

class CanvasResponse(BaseModel):
    canvas: BusinessModelCanvas
