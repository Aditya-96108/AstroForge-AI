"""
Creator Growth AI - FastAPI Backend
Production-ready, async-first, modular architecture

Run:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from typing import Optional

from fastapi import FastAPI, Form, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import logging
import time
from io import BytesIO
from dotenv import load_dotenv
import os

# Load ENV first
load_dotenv()

# ---- Models ----
from app.models.schemas import (
    ProfileAnalysisRequest, ProfileAnalysisResponse,
    AIInsightsRequest, AIInsightsResponse,
    AstrologyRequest, AstrologyResponse,
    PalmAnalysisResponse,
    GoalRequest, GoalResponse,
    ReportRequest
)

# ---- Services ----
from app.services.profile_service import simulate_profile
from app.services.ai_service import generate_insights, generate_astrology, analyze_palm_image
from app.services.goal_service import calculate_goal
from app.services.pdf_service import generate_pdf_report

# ---- NEW SERVICE ----
from app.services.creator_analysis_service import (
    CreatorAnalysisResponse,
    run_creator_analysis,
)

# ---- Logging ----
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("creator_growth_ai")

# ---- App Init ----
app = FastAPI(
    title="AstroForge AI",
    description="AI-powered creator analytics & growth platform",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # IMPORTANT
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)

# ---- Middleware ----
@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)

    start = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception as exc:
        logger.exception(f"Unhandled error in {request.url.path}")
        return JSONResponse(status_code=500, content={"detail": str(exc)})

    response.headers["X-Process-Time"] = str(round(time.perf_counter() - start, 4))
    return response


# ============================================================
# ---------------------- META -------------------------------
# ============================================================

@app.get("/", tags=["Meta"])
async def root():
    return {
        "app": "AstroForge AI",
        "status": "running",
        "version": "3.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Meta"])
async def health():
    return {
        "status": "ok",
        "openai_key_set": bool(os.getenv("OPENAI_API_KEY", "").strip()),
        "openai_model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    }


# ============================================================
# ------------------ SUPER ENDPOINT --------------------------
# ============================================================

@app.post("/creator-analysis", response_model=CreatorAnalysisResponse, tags=["AI"])
async def creator_analysis(
    palm_image:  UploadFile      = File(...),
    platform:    str             = Form(...),
    name:        str             = Form(...),
    goal:        str             = Form(...),
    zodiac:      str             = Form(...),
    dob:         str             = Form(...),
    followers:   Optional[int]   = Form(None),
    posts:       Optional[int]   = Form(None),
    subscribers: Optional[int]   = Form(None),
    videos:      Optional[int]   = Form(None),
    views:       Optional[int]   = Form(None),
):
    """
    Advanced creator analysis:
    - Palm reading
    - Astrology
    - Growth strategy
    - 30-day plan
    """

    if not palm_image.content_type or not palm_image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"palm_image must be an image. Got: {palm_image.content_type}"
        )

    logger.info(f"[creator-analysis] {name} | {platform} | {goal[:40]}")

    try:
        return await run_creator_analysis(
            palm_image=palm_image,
            platform=platform,
            name=name,
            goal=goal,
            zodiac=zodiac,
            dob=dob,
            followers=followers,
            posts=posts,
            subscribers=subscribers,
            videos=videos,
            views=views,
        )
    except Exception as e:
        logger.error(f"Creator analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ---------------------- CORE APIs ----------------------------
# ============================================================

@app.post("/analyze-profile", response_model=ProfileAnalysisResponse, tags=["Core"])
async def analyze_profile(req: ProfileAnalysisRequest):
    logger.info(f"[analyze-profile] {req.social_url}")
    return simulate_profile(req.social_url)


@app.post("/generate-ai-insights", response_model=AIInsightsResponse, tags=["AI"])
async def ai_insights(req: AIInsightsRequest):
    logger.info(f"[ai-insights] {req.username}")
    return await generate_insights(req)


@app.post("/astrology-analysis", response_model=AstrologyResponse, tags=["AI"])
async def astrology_analysis(req: AstrologyRequest):
    logger.info(f"[astrology] {req.zodiac}")
    return await generate_astrology(req)


@app.post("/palm-analysis", response_model=PalmAnalysisResponse, tags=["AI"])
async def palm_analysis(image: UploadFile = File(...)):
    logger.info(f"[palm-analysis] {image.filename}")

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await image.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 10MB")

    return await analyze_palm_image(image_bytes)


@app.post("/calculate-goals", response_model=GoalResponse, tags=["Core"])
async def goal_planner(req: GoalRequest):
    logger.info(f"[goal] {req.current_followers} -> {req.target_followers}")
    return calculate_goal(req)


@app.post("/generate-report", tags=["Core"])
async def generate_report(req: ReportRequest):
    logger.info(f"[report] {req.username}")

    pdf_bytes = generate_pdf_report(req)

    content_type = "application/pdf" if pdf_bytes[:4] == b"%PDF" else "text/html"
    ext = "pdf" if content_type == "application/pdf" else "html"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type=content_type,
        headers={
            "Content-Disposition": f"attachment; filename=growth_report_{req.username}.{ext}"
        },
    )


# ============================================================
# ---------------------- RUN SERVER ---------------------------
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )