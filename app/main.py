"""
Micro-SaaS Validator — FastAPI Entry Point
"""

import logging
import asyncio
from datetime import datetime
from uuid import uuid4, UUID

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.config import get_settings
from app.core.db import init_db, get_session
from app.models.research import ValidationRecord, BusinessCanvas, ChatLog
from app.schemas.search import SearchInput, SearchStepResponse
from app.schemas.scrape import ScrapeInput, ScrapeResponse
from app.schemas.analysis import AnalysisInput, AnalystResponse, ValidationSummary
from app.schemas.strategy import CanvasInput, CanvasResponse
from app.schemas.social import SocialInput, SocialResponse
from app.schemas.chat import ChatInput, ChatResponse
from app.schemas.blueprint import BlueprintInput, ExecutionPlan
from app.services.scout import ScoutAgent
from app.services.spy import SpyAgent
from app.services.analyst import AnalystAgent
from app.services.social import SocialAgent
from app.services.coach import CoachAgent
from app.services.cto import CTOAgent

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ──────────────────────────────────────────────────────
settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Validate your Micro-SaaS idea by scouting competitors, "
    "scraping their pages, and generating a competitive analysis.",
)

# ── CORS (wide-open for local dev — tighten in production) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("Startup: Loaded settings.")
    
    # Initialize Database
    await init_db()
    logger.info("Startup: Database tables initialized.")

    key = settings.SERPER_API_KEY
    if key:
        masked = f"{key[:4]}...{key[-4:]}" if len(key) > 8 else "***"
        logger.info(f"SERPER_API_KEY loaded: {masked}")
    else:
        logger.warning("SERPER_API_KEY is missing or empty!")



# ── Health check ─────────────────────────────────────────────
@app.get("/health", tags=["ops"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}


# ── Step 1 — Competitor Search ───────────────────────────────
@app.post(
    "/api/validate/step1-search",
    response_model=SearchStepResponse,
    tags=["validation"],
    summary="Scout for competitors of a SaaS idea",
)
async def step1_search(body: SearchInput) -> SearchStepResponse:
    logger.info("Step 1 — idea received: %s", body.idea)
    try:
        scout = ScoutAgent()
        result = await scout.run_search_step(body.idea)
        logger.info("Step 1 — done, returning %d results", len(result.results))
        return result
    except Exception as e:
        logger.exception("CRITICAL ERROR in step1_search")
        raise e


# ── Step 2 — Scrape Competitors ──────────────────────────────
@app.post(
    "/api/validate/step2-scrape",
    response_model=ScrapeResponse,
    tags=["validation"],
    summary="Scrape competitor websites for content",
)
async def step2_scrape(body: ScrapeInput) -> ScrapeResponse:
    logger.info("Step 2 — scraping %d URLs", len(body.urls))
    spy = SpyAgent()
    tasks = [spy.scrape_site(url) for url in body.urls]
    results = await asyncio.gather(*tasks)
    logger.info("Step 2 — done, scraped %d pages", len(results))
    return ScrapeResponse(scraped_data=list(results))


# ── Step 3 — Analyze Market ──────────────────────────────────
@app.post(
    "/api/validate/step3-analyze",
    response_model=AnalystResponse,
    tags=["validation"],
    summary="Analyze market saturation and opportunity (VC Persona)",
)
async def step3_analyze(
    body: AnalysisInput, 
    session: AsyncSession = Depends(get_session)
) -> AnalystResponse:
    """
    Accepts an idea and scraped competitor data.
    Uses GPT-4o to generate a skeptical VC analysis.
    Saves the result to the database.
    """
    logger.info("Step 3 — analyzing idea: %s", body.idea)
    analyst = AnalystAgent()
    
    # Generate Analysis
    result = await analyst.analyze_market(body.idea, body.scraped_data)
    
    # Create DB Record
    new_record = ValidationRecord(
        idea_raw=body.idea,
        competitors=[c.dict() for c in result.competitor_analysis],
        market_verdict=result.verdict.dict(),
        pain_points=result.voice_of_customer.pain_points,
        blue_ocean_idea=result.verdict.blue_ocean_opportunity
    )
    
    session.add(new_record)
    await session.commit()
    await session.refresh(new_record)
    
    logger.info("Step 3 — analysis complete. Saved Record ID: %s", new_record.id)
    
    # Attach validation_id to response
    result.validation_id = new_record.id
    return result


# ── Step 4 — Strategy Canvas ─────────────────────────────────
@app.post(
    "/api/strategy/canvas",
    response_model=CanvasResponse,
    tags=["strategy"],
    summary="Generate Business Model Canvas (Strategy Module)",
)
async def strategy_canvas(
    body: CanvasInput,
    session: AsyncSession = Depends(get_session)
) -> CanvasResponse:
    """
    Generates Canvas and saves to DB linked to validation_id.
    """
    logger.info("Strategy Module — generating canvas for: %s", body.idea)
    analyst = AnalystAgent()
    
    # Check if record exists (optional check, but good for data integrity)
    # record = await session.get(ValidationRecord, body.validation_id)
    # if not record: raise 404...
    
    result = await analyst.generate_strategic_canvas(body.idea, body.scraped_data)
    
    # Save Canvas
    canvas_db = BusinessCanvas(
        validation_id=body.validation_id,
        content=result.canvas.dict()
    )
    session.add(canvas_db)
    await session.commit()
    
    return result


# ── Step 5 — Social Listener ─────────────────────────────────
@app.post(
    "/api/validate/step4-social",
    response_model=SocialResponse,
    tags=["validation"],
    summary="Social Listener: Find qualitative data from Reddit/HN",
)
async def step4_social(body: SocialInput) -> SocialResponse:
    logger.info("Social Listener — scanning for: %s", body.idea)
    social = SocialAgent()
    result = await social.run_social_scan(body.idea)
    return result

# ── Step 6 — Pivot Coach ─────────────────────────────────────
@app.post(
    "/api/validate/chat",
    response_model=ChatResponse,
    tags=["validation"],
    summary="Pivot Coach: Chat with the analyst about the report",
)
async def validate_chat(
    body: ChatInput,
    session: AsyncSession = Depends(get_session)
) -> ChatResponse:
    """
    Chat interface. Saves logs to DB.
    """
    # 1. Save User Message
    user_log = ChatLog(
        validation_id=body.validation_id,
        role="user",
        message=body.message
    )
    session.add(user_log)
    await session.commit()
    
    # 2. Generate Response
    coach = CoachAgent()
    response_text = await coach.chat(body.message, body.history, body.report_context)
    
    # 3. Save Assistant Message
    bot_log = ChatLog(
        validation_id=body.validation_id,
        role="assistant",
        message=response_text
    )
    session.add(bot_log)
    await session.commit()
    
    return ChatResponse(response=response_text)

# ── Step 7 — Technical Blueprint ───────────────────────────────
@app.post(
    "/api/blueprint/generate",
    response_model=ExecutionPlan,
    tags=["validation"],
    summary="CTO Agent: Generate MVP Technical Blueprint",
)
async def generate_blueprint(body: BlueprintInput) -> ExecutionPlan:
    logger.info("CTO Agent — drafting blueprint...")
    cto = CTOAgent()
    result = await cto.draft_blueprint(body.opportunity_context)
    return result

# ── History & Persistence ──────────────────────────────────────
from sqlmodel import select, desc

@app.get(
    "/api/history",
    response_model=list[ValidationSummary],
    tags=["history"],
    summary="Get list of past validations",
)
async def get_history(session: AsyncSession = Depends(get_session)):
    statement = select(ValidationRecord).order_by(desc(ValidationRecord.created_at))
    results = await session.execute(statement)
    records = results.scalars().all()
    
    summary_list = []
    for r in records:
        score = r.market_verdict.get("saturation_score", 0) if r.market_verdict else 0
        summary_list.append(ValidationSummary(
            id=r.id,
            idea=r.idea_raw,
            created_at=r.created_at,
            saturation_score=score,
            blue_ocean_opportunity=r.blue_ocean_idea
        ))
    return summary_list

@app.get(
    "/api/validate/{validation_id}",
    response_model=AnalystResponse,
    tags=["history"],
    summary="Get a specific validation report",
)
async def get_validation(
    validation_id: UUID, 
    session: AsyncSession = Depends(get_session)
) -> AnalystResponse:
    record = await session.get(ValidationRecord, validation_id)
    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Validation not found")
    
    return AnalystResponse(
        validation_id=record.id,
        competitor_analysis=record.competitors,
        voice_of_customer={"pain_points": record.pain_points},
        verdict=record.market_verdict
    )

