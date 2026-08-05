"""
Micro-SaaS Validator — Coach Service
Chat interface context-aware of the report.
"""

import logging
import json
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.schemas.chat import ChatInput, ChatResponse

logger = logging.getLogger(__name__)

class CoachAgent:
    def __init__(self):
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.OPENAI_API_KEY)

    async def chat(self, user_message: str, history: list, report_context: dict) -> str:
        """
        Generates a Mentor-like response based on the analysis report.
        """
        # Construct the context prompt
        context_str = json.dumps(report_context, indent=2)
        
        system_prompt = (
            "You are a pragmatic Startup Mentor. You have just analyzed the user's idea "
            "and found the following report:\n\n"
            f"{context_str}\n\n"
            "The user is asking for advice. Help them pivot to a 'Blue Ocean' niche. "
            "Be constructive but realistic. Keep answers concise (max 3-4 sentences unless detailed explanation is needed)."
        )

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history (convert Pydantic models to dict if needed, or assume list of dicts)
        # Input history is List[ChatMessage], so we need to convert to format expected by OpenAI
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
            
        # Add latest user message
        messages.append({"role": "user", "content": user_message})

        try:
            completion = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.7,
            )
            return completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Coach chat failed: {e}")
            return "I'm having trouble connecting to my mentor brain. Please try again."

    async def run_chat(self, chat_input: ChatInput) -> ChatResponse:
        response = await self.chat(
            chat_input.message, 
            chat_input.history, 
            chat_input.report_context
        )
        return ChatResponse(response=response)
