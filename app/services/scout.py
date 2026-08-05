"""
Micro-SaaS Validator — Scout Service
Searches Google (via Serper.dev) for direct competitors of a SaaS idea.
"""

from __future__ import annotations

import asyncio
import logging
from urllib.parse import urlparse

import httpx

from app.core.config import get_settings
from app.schemas.search import CompetitorResult, SearchStepResponse

logger = logging.getLogger(__name__)

# ── Aggregator / noise domains to filter out ─────────────────
BLOCKED_DOMAINS: set[str] = {
    "capterra.com",
    "g2.com",
    "wikipedia.org",
    "crunchbase.com",
    "yelp.com",
    "trustpilot.com",
    "bbb.org",
    "linkedin.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "youtube.com",
    "reddit.com",
    "quora.com",
    "medium.com",
    "amazon.com",
    "pinterest.com",
    "tiktok.com",
    "instagram.com",
    "getapp.com",
    "softwareadvice.com",
    "sourceforge.net",
    "alternativeto.net",
}

SERPER_ENDPOINT = "https://google.serper.dev/search"


class ScoutAgent:
    """Searches Google via Serper.dev and returns filtered competitor results."""

    def __init__(self) -> None:
        self.settings = get_settings()

    # ── Core search method ───────────────────────────────────
    async def search_competitors(self, query: str, filter_aggregators: bool = True) -> list[dict]:
        """
        Execute a single Google search via Serper and return organic results.
        If filter_aggregators is True, stripped out blocked domains.
        
        Returns a list of dicts:
            {'title': str, 'link': str, 'snippet': str, 'position': int}
        """
        headers = {
            "X-API-KEY": self.settings.SERPER_API_KEY,
            "Content-Type": "application/json",
        }
        payload = {"q": query, "num": 10}

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                SERPER_ENDPOINT, json=payload, headers=headers
            )
            response.raise_for_status()
            data = response.json()

        organic: list[dict] = data.get("organic", [])
        filtered: list[dict] = []

        for idx, item in enumerate(organic, start=1):
            link: str = item.get("link", "")
            domain = urlparse(link).netloc.lower().lstrip("www.")

            if filter_aggregators and any(blocked in domain for blocked in BLOCKED_DOMAINS):
                logger.debug("Filtered aggregator: %s", domain)
                continue

            filtered.append(
                {
                    "title": item.get("title", ""),
                    "link": link,
                    "snippet": item.get("snippet", ""),
                    "position": idx,
                }
            )

        return filtered

    # ── Query generation ─────────────────────────────────────
    @staticmethod
    def generate_queries(idea: str) -> list[str]:
        """Produce 3 search-query variations for the given SaaS idea."""
        idea_clean = idea.strip()
        return [
            f"{idea_clean} software",
            f"{idea_clean} pricing",
            f"{idea_clean} competitors",
        ]

    # ── Orchestrator ─────────────────────────────────────────
    async def run_search_step(self, idea: str) -> SearchStepResponse:
        """
        End-to-end Step 1 pipeline:
        1. Generate 3 query variations.
        2. Execute all searches in parallel.
        3. Deduplicate by URL.
        4. Return the top 5 unique results.
        """
        queries = self.generate_queries(idea)
        logger.info("Scout — generated queries: %s", queries)

        # Fire all searches concurrently
        tasks = [self.search_competitors(q) for q in queries]
        all_results: list[list[dict]] = await asyncio.gather(*tasks)

        # Flatten & deduplicate by URL (keep first occurrence)
        seen_urls: set[str] = set()
        unique: list[CompetitorResult] = []

        for result_batch in all_results:
            for item in result_batch:
                url = item["link"]
                if url in seen_urls:
                    continue
                seen_urls.add(url)
                unique.append(CompetitorResult(**item))

        # Cap at 5
        top_results = unique[:5]
        logger.info("Scout — returning %d unique results", len(top_results))

        return SearchStepResponse(queries=queries, results=top_results)
