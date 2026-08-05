"""
Micro-SaaS Validator — Analyst Service
Uses OpenAI GPT-4o to analyze competitor data as a skeptical VC.
"""

import json
import logging

from openai import AsyncOpenAI
from pydantic import ValidationError

from app.core.config import get_settings
from app.schemas.analysis import AnalystResponse
from app.schemas.strategy import BusinessModelCanvas, CanvasResponse

logger = logging.getLogger(__name__)


class AnalystAgent:
    """Agent responsible for analyzing market saturation and potential."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.OPENAI_API_KEY)

    async def analyze_market(
        self, idea: str, scraped_data: list[dict]
    ) -> AnalystResponse:
        """
        Analyze the market for a given idea using scraped competitor data.
        Returns a structured AnalystResponse.
        """
        if not self.settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set.")

        # Prepare context from scraped data
        competitors_text = ""
        for item in scraped_data:
            url = item.get("url", "Unknown URL")
            content = item.get("content", "")
            error = item.get("error")
            
            if error:
                competitors_text += f"\n--- Competitor: {url} ---\n[Scrape Failed: {error}]\n"
            else:
                # Truncate content slightly
                snippet = content[:5000]
                competitors_text += f"\n--- Competitor: {url} ---\n{snippet}\n"

        schema_desc = """
        {
          "competitor_analysis": [
            {"name": "...", "url": "...", "pricing_model": "...", "value_prop": "..."}
          ],
          "voice_of_customer": {
            "pain_points": ["...", "..."]
          },
          "verdict": {
            "saturation_score": 0-100,
            "explanation": "...",
            "blue_ocean_opportunity": "..."
          }
        }
        """

        system_prompt = (
            "You are a skeptical Venture Capitalist performing due diligence. "
            "Your goal is to find reasons to REJECT this idea. Do not sugarcoat. Be direct.\n\n"
            "Task: Analyze the provided Micro-SaaS idea and the scraped competitor content.\n"
            "1. Extract minimal details for each competitor (Pricing, Value Prop).\n"
            "2. Identify 'Voice of Customer' pain points or missing features based on the text.\n"
            "3. Calculate a 'Saturation Score' (0-100).\n"
            "   - High Score (70-100): Many competitors, identical features, crowded market.\n"
            "   - Low Score (0-30): Unique angle, few competitors, blue ocean.\n"
            "4. Provide a brutal 'Verdict' explanation and one concrete 'Blue Ocean Opportunity' if any exists.\n"
            "\n"
            f"Return valid JSON matching this schema:\n{schema_desc}"
        )

        user_prompt = f"Idea: {idea}\n\nCompetitor Data:\n{competitors_text}"

        try:
            completion = await self.client.chat.completions.create(
                model="gpt-4o",  # Using GPT-4o for best reasoning
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            content = completion.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI.")

            # Parse JSON
            data = json.loads(content)
            
            # Validate against Pydantic model
            return AnalystResponse(**data)

        except json.JSONDecodeError as e:
            logger.error("Failed to parse LLM JSON response: %s", e)
            raise ValueError("LLM returned invalid JSON.") from e
        except ValidationError as e:
            logger.error("LLM JSON did not match schema: %s", e)
            raise ValueError("LLM response missing required fields.") from e
        except Exception as e:
            logger.exception("OpenAI API call failed")
            raise RuntimeError(f"Analysis failed: {str(e)}") from e

    async def generate_strategic_canvas(
        self, idea: str, scraped_data: list[dict]
    ) -> CanvasResponse:
        """
        Generate a Business Model Canvas (Strategy Module).
        """
        competitors_text = ""
        for item in scraped_data:
            content = item.get("content", "")
            if content:
                competitors_text += f"\n--- Competitor Data ---\n{content[:3000]}\n"

        schema_desc = """
        {
          "key_partners": ["...", "..."],
          "key_activities": ["...", "..."],
          "key_resources": ["...", "..."],
          "value_propositions": ["...", "..."],
          "customer_relationships": ["...", "..."],
          "channels": ["...", "..."],
          "customer_segments": ["...", "..."],
          "cost_structure": ["...", "..."],
          "revenue_streams": ["...", "..."]
        }
        """

        system_prompt = (
            "You are a Business Strategy Consultant. Create a Business Model Canvas for this Micro-SaaS idea. "
            "Synthesize the provided competitor data to fill the canvas.\n\n"
            "CRITICAL: For 'value_propositions', explicitly contrast your offering against the competitors found. "
            "Example: 'Unlike Competitor X who charges monthly, we utilize a pay-per-use model'.\n\n"
            f"Return valid JSON matching this schema:\n{schema_desc}"
        )

        user_prompt = f"App Idea: {idea}\n\nCompetitor Context:\n{competitors_text}"

        try:
            completion = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            content = completion.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI.")
            
            data = json.loads(content)
            canvas = BusinessModelCanvas(**data)
            return CanvasResponse(canvas=canvas)

        except Exception as e:
            logger.exception("Strategic Canvas generation failed")
            raise RuntimeError(f"Strategy generation failed: {str(e)}") from e
