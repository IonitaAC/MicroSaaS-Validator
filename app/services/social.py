"""
Micro-SaaS Validator — Social Listener Agent
Finds qualitative data from Reddit and Hacker News.
"""

import logging
import json
import asyncio
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.services.scout import ScoutAgent
from app.services.spy import SpyAgent
from app.schemas.social import SocialResponse

logger = logging.getLogger(__name__)

class SocialAgent:
    def __init__(self):
        self.settings = get_settings()
        self.scout = ScoutAgent()
        self.spy = SpyAgent()
        self.client = AsyncOpenAI(api_key=self.settings.OPENAI_API_KEY)

    async def find_discussions(self, idea: str) -> list[str]:
        """
        Finds relevant Reddit and HN threads using Serper.
        Uses LLM to generate targeted queries.
        """
        
        # 1. Generate Queries with LLM
        system_prompt = (
            "You are a Market Researcher. "
            "Generate 5 Google search queries to find Reddit and Hacker News discussions "
            "where people are complaining about problems related to the user's idea, "
            "or looking for alternatives.\n"
            "Queries must include 'site:reddit.com' or 'site:news.ycombinator.com'.\n"
            "Return JSON: {'queries': ['query1', 'query2', ...]}"
        )
        
        try:
             completion = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Idea: {idea}"},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
             content = completion.choices[0].message.content
             data = json.loads(content)
             queries = data.get("queries", [])
        except Exception:
             # Fallback
             queries = [
                f'site:reddit.com "{idea}" complaints',
                f'site:reddit.com "{idea}" vs',
                f'site:news.ycombinator.com "{idea}"'
             ]

        logger.info(f"Social Agent Queries: {queries}")
        
        # 2. Run raw searches in parallel
        tasks = [self.scout.search_competitors(q, filter_aggregators=False) for q in queries]
        results_list = await asyncio.gather(*tasks)
        
        # 3. Flatten and filter
        urls = []
        seen = set()
        
        for res_list in results_list:
            for item in res_list:
                link = item.get("link", "")
                if link and link not in seen:
                    if "reddit.com" in link or "news.ycombinator.com" in link:
                        seen.add(link)
                        urls.append(link)
        
        return urls[:5] # Top 5 distinct threads

    async def extract_sentiment(self, urls: list[str]) -> list[str]:
        """
        Scrapes threads and uses LLM to extract quotes.
        """
        if not urls:
            return []

        # Scrape concurrently
        scrape_tasks = [self.spy.scrape_site(url) for url in urls]
        scraped_results = await asyncio.gather(*scrape_tasks)
        
        # Combine content
        combined_text = ""
        for res in scraped_results:
            if res.content:
                combined_text += f"\n--- Thread: {res.url} ---\n{res.content[:4000]}\n"

        if not combined_text:
            return []

        # Analyze with LLM
        system_prompt = (
            "You are a User Researcher. Extract direct quotes where users express frustration, anger, "
            "or a 'willingness to pay' for a solution related to the topic.\n"
            "Return a JSON object with a single key 'quotes' containing a list of strings.\n"
            "Example: {'quotes': ['I hate doing X manually!', 'I would pay $50 for this.']}"
        )

        try:
            completion = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Discussion Content:\n{combined_text}"},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            
            content = completion.choices[0].message.content
            data = json.loads(content)
            return data.get("quotes", [])

        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return []

    async def run_social_scan(self, idea: str) -> SocialResponse:
        logger.info(f"Social Listener running for: {idea}")
        
        # 1. Find Threads
        threads = await self.find_discussions(idea)
        logger.info(f"Found {len(threads)} relevant threads.")
        
        # 2. Extract Quotes
        quotes = await self.extract_sentiment(threads)
        logger.info(f"Extracted {len(quotes)} user quotes.")
        
        return SocialResponse(
            reddit_threads=threads,
            user_quotes=quotes
        )
