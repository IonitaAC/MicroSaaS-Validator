from pydantic import BaseModel, Field
from typing import List

class BlueprintInput(BaseModel):
    opportunity_context: str = Field(..., description="The context of the Blue Ocean opportunity")

class ExecutionPlan(BaseModel):
    core_features: List[str] = Field(description="Must Haves for MVP")
    nice_to_haves: List[str] = Field(description="Features to skip for v1")
    tech_stack: str = Field(description="Concise tech stack recommendation")
    database_schema: str = Field(description="Markdown formatted SQL or Table definition")
    first_steps: List[str] = Field(description="Exactly 3 actionable starting steps")
