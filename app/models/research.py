"""
Micro-SaaS Validator — Research Models
"""

from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON

class ValidationRecord(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    idea_raw: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Store complex data as JSON
    competitors: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    market_verdict: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    pain_points: List[str] = Field(default=[], sa_column=Column(JSON))
    
    blue_ocean_idea: Optional[str] = Field(default=None)

    # Relationships
    canvases: List["BusinessCanvas"] = Relationship(back_populates="validation")
    chat_logs: List["ChatLog"] = Relationship(back_populates="validation")


class BusinessCanvas(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    validation_id: UUID = Field(foreign_key="validationrecord.id")
    
    content: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))

    validation: ValidationRecord = Relationship(back_populates="canvases")


class ChatLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    validation_id: UUID = Field(foreign_key="validationrecord.id")
    
    role: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    validation: ValidationRecord = Relationship(back_populates="chat_logs")
