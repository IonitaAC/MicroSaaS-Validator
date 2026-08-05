"""
Micro-SaaS Validator — Spy Service
Scrapes competitor websites using Firecrawl API and returns truncated markdown.
"""

import logging

import httpx

from app.core.config import get_settings
from app.schemas.scrape import ScrapedPage

logger = logging.getLogger(__name__)

FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v0/scrape"


class SpyAgent:
    """Agent responsible for scraping and processing external websites."""

    def __init__(self) -> None:
        self.settings = get_settings()

    async def scrape_site(self, url: str) -> ScrapedPage:
        """
        Scrape a single URL using Firecrawl v0 API.
        Returns a ScrapedPage object with markdown content (truncated) or error.
        """
        if not self.settings.FIRECRAWL_API_KEY:
            logger.error("FIRECRAWL_API_KEY is missing.")
            return ScrapedPage(
                url=url, content="", error="Server configuration error: Missing API Key"
            )

        headers = {
            "Authorization": f"Bearer {self.settings.FIRECRAWL_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "url": url,
            "pageOptions": {"onlyMainContent": True},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    FIRECRAWL_ENDPOINT, json=payload, headers=headers
                )
                
                # Handle non-200 responses gracefully
                if response.status_code != 200:
                    logger.warning(
                        "Firecrawl failed for %s: %d %s",
                        url,
                        response.status_code,
                        response.text,
                    )
                    return ScrapedPage(
                        url=url,
                        content="",
                        error=f"Provider Error: {response.status_code}",
                    )

                data = response.json()
                
                if not data.get("success"):
                     logger.warning("Firecrawl success=false for %s: %s", url, data)
                     return ScrapedPage(
                        url=url,
                        content="",
                        error=f"Scrape failed: {data.get('error', 'Unknown error')}",
                    )
                
                # Extract markdown and truncate
                markdown = data.get("data", {}).get("markdown", "")
                truncated = markdown[:5000]
                
                return ScrapedPage(url=url, content=truncated)

        except httpx.RequestError as e:
            logger.warning("Network error scraping %s: %s", url, e)
            return ScrapedPage(url=url, content="", error="Network/Timeout Error")
        except Exception as e:
            logger.exception("Unexpected error scraping %s", url)
            return ScrapedPage(url=url, content="", error="Internal Error")
