"""
app/services/ai_service.py

ALL AI responses come from OpenAI only.
No mock data, no silent fallbacks.
If OPENAI_API_KEY is missing or the call fails, a clear HTTPException is raised
so the frontend receives a proper error message instead of fake data.
"""
import os
import json
import logging
import base64
from typing import Optional

import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

# Load .env file — must be present at project root
load_dotenv()

logger = logging.getLogger("creator_growth_ai")

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL:   str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL      = "https://api.openai.com/v1/chat/completions"

if not OPENAI_API_KEY:
    logger.warning(
        "⚠️  OPENAI_API_KEY is not set. "
        "All AI endpoints will return HTTP 503 until the key is configured in .env"
    )


def _require_key() -> str:
    """Return the API key or raise a clear 503 error."""
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail=(
                "OpenAI API key is not configured. "
                "Add OPENAI_API_KEY=sk-... to your .env file and restart the server."
            ),
        )
    return OPENAI_API_KEY


async def _call_openai(
    messages: list,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    require_json: bool = True,
) -> dict:
    """
    Make a single OpenAI chat completion call.
    Returns the parsed JSON dict (when require_json=True) or raises HTTPException.
    """
    api_key = _require_key()

    payload: dict = {
        "model":       OPENAI_MODEL,
        "messages":    messages,
        "temperature": temperature,
        "max_tokens":  max_tokens,
    }
    if require_json:
        payload["response_format"] = {"type": "json_object"}

    logger.info(f"[OpenAI] calling model={OPENAI_MODEL} messages={len(messages)}")

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(
                OPENAI_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type":  "application/json",
                },
                json=payload,
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="OpenAI request timed out (>90s). Try again.")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Network error contacting OpenAI: {exc}")

    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid OpenAI API key. Check your .env file.")
    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="OpenAI rate limit hit. Wait a moment and retry.")
    if resp.status_code == 402:
        raise HTTPException(status_code=402, detail="OpenAI quota exceeded. Check your billing.")
    if not resp.is_success:
        body = resp.text[:300]
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI returned HTTP {resp.status_code}: {body}",
        )

    try:
        data = resp.json()
        raw_content = data["choices"][0]["message"]["content"]
        logger.info(f"[OpenAI] response length={len(raw_content)} chars")
    except (KeyError, IndexError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected OpenAI response structure: {exc}",
        )

    if not require_json:
        return {"text": raw_content}

    # Strip markdown code fences if model wrapped the JSON anyway
    cleaned = raw_content.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI returned invalid JSON: {exc}. Raw: {raw_content[:200]}",
        )


# ─────────────────────────────────────────────────────────────
# GROWTH INSIGHTS
# ─────────────────────────────────────────────────────────────

_INSIGHTS_PROMPT = """\
You are a brutally honest but highly intelligent content growth strategist.

Creator profile:
- Username: {username}
- Platform: {platform}
- Followers: {followers:,}
- Engagement Rate: {engagement_rate}%
- Niche: {niche}
- Goals: {goals}
- Target Followers: {target_followers}
- Timeline: {timeline_months} months

Respond ONLY with a single valid JSON object matching this exact structure (no extra keys, no markdown):
{{
  "profile_analysis": "<2-3 sentence honest analysis of this profile>",
  "mistakes": ["<mistake 1>", "<mistake 2>", "<mistake 3>", "<mistake 4>", "<mistake 5>"],
  "daily_plan": [
    "8:00 AM — <specific action>",
    "9:30 AM — <specific action>",
    "11:00 AM — <specific action>",
    "1:00 PM — <specific action>",
    "3:00 PM — <specific action>",
    "7:00 PM — <specific action>"
  ],
  "content_ideas": [
    "<idea 1>", "<idea 2>", "<idea 3>", "<idea 4>", "<idea 5>",
    "<idea 6>", "<idea 7>", "<idea 8>", "<idea 9>", "<idea 10>"
  ],
  "hook_ideas": [
    "<hook 1>", "<hook 2>", "<hook 3>", "<hook 4>", "<hook 5>",
    "<hook 6>", "<hook 7>", "<hook 8>", "<hook 9>", "<hook 10>"
  ],
  "posting_schedule": {{
    "Monday":    ["10:00 AM", "7:00 PM"],
    "Tuesday":   ["12:00 PM"],
    "Wednesday": ["9:00 AM", "6:30 PM"],
    "Thursday":  ["11:00 AM"],
    "Friday":    ["10:00 AM", "8:00 PM"],
    "Saturday":  ["2:00 PM", "7:00 PM"],
    "Sunday":    ["5:00 PM"]
  }},
  "growth_prediction": {{
    "month_1":  <integer followers in 1 month>,
    "month_3":  <integer followers in 3 months>,
    "month_6":  <integer followers in 6 months>,
    "month_12": <integer followers in 12 months>,
    "confidence": "high" | "medium" | "low"
  }}
}}

Rules:
- Be direct, specific, and actionable — no generic advice
- Base all numbers on the creator's actual stats above
- Content ideas and hooks must be niche-specific, not generic
- Daily plan must include specific times in "H:MM AM/PM — action" format
"""

from app.models.schemas import AIInsightsRequest, AIInsightsResponse


async def generate_insights(req: AIInsightsRequest) -> AIInsightsResponse:
    logger.info(f"[generate_insights] @{req.username} on {req.platform}, {req.followers:,} followers")

    prompt = _INSIGHTS_PROMPT.format(
        username=req.username,
        platform=req.platform,
        followers=req.followers,
        engagement_rate=req.engagement_rate,
        niche=req.niche or "general",
        goals=req.goals or "grow audience",
        target_followers=req.target_followers or req.followers * 2,
        timeline_months=req.timeline_months or 6,
    )

    data = await _call_openai([{"role": "user", "content": prompt}])

    # Validate all required keys are present
    required = ["profile_analysis", "mistakes", "daily_plan", "content_ideas",
                "hook_ideas", "posting_schedule", "growth_prediction"]
    missing = [k for k in required if k not in data]
    if missing:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI response missing required fields: {missing}",
        )

    # Calculate feasibility score if goal data provided
    feasibility_score: Optional[float] = None
    if req.target_followers and req.timeline_months and req.followers:
        needed_ratio = (req.target_followers - req.followers) / req.followers
        monthly_rate = needed_ratio / req.timeline_months
        # Score: 100 = easy (5% monthly), decreases as rate increases
        raw = 100 - max(0, (monthly_rate * 100 - 5) * 3)
        feasibility_score = round(max(5.0, min(100.0, raw)), 1)

    return AIInsightsResponse(**data, feasibility_score=feasibility_score)


# ─────────────────────────────────────────────────────────────
# ASTROLOGY ANALYSIS
# ─────────────────────────────────────────────────────────────

_ASTROLOGY_PROMPT = """\
You are an expert Vedic astrology consultant specializing in content creator success patterns.

Input:
- Date of Birth: {dob}
- Time of Birth: {time_of_birth}
- Sun Sign: {zodiac}

Respond ONLY with a single valid JSON object (no markdown, no extra text):
{{
  "sun_sign": "{zodiac}",
  "personality_insights": "<3-4 sentences about this creator's personality, communication style, and audience magnetism based on their {zodiac} traits>",
  "growth_patterns": "<2-3 sentences about how {zodiac} creators typically grow — burst pattern, steady, viral-prone, etc.>",
  "lucky_posting_times": [
    "<time window 1, e.g. '8:00–10:00 AM (Jupiter hour)'>",
    "<time window 2>",
    "<time window 3>"
  ],
  "strengths": [
    "<creator strength 1>",
    "<creator strength 2>",
    "<creator strength 3>",
    "<creator strength 4>"
  ],
  "weaknesses": [
    "<creator weakness 1>",
    "<creator weakness 2>",
    "<creator weakness 3>"
  ],
  "best_content_types": [
    "<content type 1>",
    "<content type 2>",
    "<content type 3>"
  ],
  "monthly_forecast": "<2-3 sentence forecast for this creator's next 30 days based on current planetary positions and {zodiac} energy>"
}}

Make responses specific to {zodiac} — do not give generic advice that applies to all signs.
"""

from app.models.schemas import AstrologyRequest, AstrologyResponse


async def generate_astrology(req: AstrologyRequest) -> AstrologyResponse:
    logger.info(f"[generate_astrology] zodiac={req.zodiac.value} dob={req.dob}")

    prompt = _ASTROLOGY_PROMPT.format(
        dob=req.dob,
        time_of_birth=req.time_of_birth or "12:00",
        zodiac=req.zodiac.value,
    )

    data = await _call_openai([{"role": "user", "content": prompt}])

    required = ["sun_sign", "personality_insights", "growth_patterns",
                "lucky_posting_times", "strengths", "weaknesses",
                "best_content_types", "monthly_forecast"]
    missing = [k for k in required if k not in data]
    if missing:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI astrology response missing fields: {missing}",
        )

    # Ensure sun_sign matches what was requested
    data["sun_sign"] = req.zodiac.value
    return AstrologyResponse(**data)


# ─────────────────────────────────────────────────────────────
# PALM ANALYSIS
# ─────────────────────────────────────────────────────────────

_PALM_SYSTEM_PROMPT = """\
You are an expert palmist and creator potential analyst.
The user has uploaded a palm image. Analyze it using palmistry principles and apply insights specifically to content creation potential.

Respond ONLY with a single valid JSON object (no markdown):
{
  "personality_traits": [
    "<trait 1 relevant to content creation>",
    "<trait 2>",
    "<trait 3>",
    "<trait 4>",
    "<trait 5>"
  ],
  "risk_profile": "<exactly one of: conservative | moderate | aggressive>",
  "creativity_score": <integer 1-100>,
  "leadership_score": <integer 1-100>,
  "communication_score": <integer 1-100>,
  "summary": "<2-3 sentences summarizing this creator's palm-based potential, specific to their unique palm features>"
}

Base scores on actual visible palm features: life line length, heart line curve, head line depth, Mercury mount prominence, etc.
If image quality is poor, note this in the summary and still provide scores based on what is visible.
"""

from app.models.schemas import PalmAnalysisResponse


async def analyze_palm_image(image_bytes: bytes) -> PalmAnalysisResponse:
    logger.info(f"[analyze_palm_image] image size={len(image_bytes)} bytes")

    # Detect mime type from magic bytes
    if image_bytes[:2] == b'\xff\xd8':
        mime = "image/jpeg"
    elif image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
        mime = "image/png"
    elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
        mime = "image/webp"
    else:
        mime = "image/jpeg"  # default

    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    logger.info(f"[analyze_palm_image] mime={mime}, b64_len={len(b64_image)}")

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type":      "image_url",
                    "image_url": {
                        "url":    f"data:{mime};base64,{b64_image}",
                        "detail": "high",
                    },
                },
                {
                    "type": "text",
                    "text": _PALM_SYSTEM_PROMPT,
                },
            ],
        }
    ]

    # Vision requires a vision-capable model
    vision_model = OPENAI_MODEL if "vision" in OPENAI_MODEL or "gpt-4o" in OPENAI_MODEL else "gpt-4o-mini"
    logger.info(f"[analyze_palm_image] using vision model: {vision_model}")

    api_key = _require_key()
    payload = {
        "model":          vision_model,
        "messages":       messages,
        "max_tokens":     1000,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(
                OPENAI_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Palm analysis timed out. Try again.")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Network error: {exc}")

    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid OpenAI API key.")
    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="Rate limit hit. Wait a moment.")
    if not resp.is_success:
        raise HTTPException(status_code=502, detail=f"OpenAI returned {resp.status_code}: {resp.text[:200]}")

    try:
        raw = resp.json()["choices"][0]["message"]["content"]
        cleaned = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        data = json.loads(cleaned)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to parse palm analysis response: {exc}")

    # Clamp scores to 1-100
    for field in ("creativity_score", "leadership_score", "communication_score"):
        if field in data:
            data[field] = max(1, min(100, int(data[field])))

    # Ensure risk_profile is valid
    if data.get("risk_profile") not in ("conservative", "moderate", "aggressive"):
        data["risk_profile"] = "moderate"

    return PalmAnalysisResponse(**data)
