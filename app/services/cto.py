"""
Micro-SaaS Validator — CTO Service
Generates a technical execution plan for the MVP.
"""

import logging
import json
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.schemas.blueprint import ExecutionPlan

logger = logging.getLogger(__name__)

class CTOAgent:
    def __init__(self):
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.OPENAI_API_KEY)

    async def draft_blueprint(self, opportunity_context: str) -> ExecutionPlan:
        """
        Generates a lean MVP execution plan.
        """
        system_prompt = (
            "You are a pragmatic CTO of a lean startup. The user has found a market gap: "
            f"[ {opportunity_context} ].\n\n"
            "Outline the absolute minimum MVP to test this. Do not over-engineer. "
            "Output valid JSON matching the following schema:\n"
            "{\n"
            '  "core_features": ["Must Have 1", ...],\n'
            '  "nice_to_haves": ["Nice to Have 1", ...],\n'
            '  "tech_stack": "Next.js + Supabase",\n'
            '  "database_schema": "```sql\\nCREATE TABLE...```",\n'
            '  "first_steps": ["Step 1", "Step 2", "Step 3"]\n'
            "}"
        )

        try:
            completion = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": system_prompt}],
                response_format={"type": "json_object"},
                temperature=0.5,
            )
            
            content = completion.choices[0].message.content
            data = json.loads(content)
            return ExecutionPlan(**data)

        except Exception as e:
            logger.error(f"CTO Blueprint generation failed: {e}")
            # Return a fallback plan if error
            return ExecutionPlan(
                core_features=["User Auth", "Core Functionality", "Payment Integration"],
                nice_to_haves=["Advanced Analytics", "Dark Mode", "Mobile App"],
                tech_stack="Next.js + Supabase (Fallback)",
                database_schema="```sql\n-- Error generating schema\n```",
                first_steps=["Define Data Model", "Setup Auth", "Build UI"]
            )
