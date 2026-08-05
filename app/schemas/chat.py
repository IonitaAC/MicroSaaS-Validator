from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from uuid import UUID

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatInput(BaseModel):
    validation_id: UUID
    message: str = Field(..., description="User's latest message")
    history: List[ChatMessage] = Field(default=[], description="Chat history")
    report_context: Dict[str, Any] = Field(..., description="Full analysis report context")

class ChatResponse(BaseModel):
    response: str
