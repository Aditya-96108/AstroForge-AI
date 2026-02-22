"""
app/services/creator_analysis_service.py
─────────────────────────────────────────
Single service for POST /creator-analysis
- Accepts multipart form (palm image + all fields)
- Sends palm image to OpenAI Vision
- Sends all data in one massive prompt → full astrologer-POV response
- NO mock data. NO fallbacks. All OpenAI.
"""

import os
import json
import base64
import logging
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException, UploadFile
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("creator_growth_ai")

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL:   str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL      = "https://api.openai.com/v1/chat/completions"

if not OPENAI_API_KEY:
    logger.warning("⚠️  OPENAI_API_KEY not set — all /creator-analysis calls will fail with HTTP 503.")


# ─────────────────────────────────────────────
# Response Schema
# ─────────────────────────────────────────────
class AstroZodiacReading(BaseModel):
    personality:      str
    good_timings:     List[str]   # auspicious posting times/windows
    bad_timings:      List[str]   # inauspicious posting times/windows
    good_days:        List[str]   # lucky days of the week with reason
    bad_days:         List[str]   # unlucky days of the week with reason
    monthly_forecast: str
    remedies:         List[str]   # cosmic remedies / rituals


class PalmReading(BaseModel):
    overall_reading:    str
    creativity_score:   int        # 1–100
    leadership_score:   int        # 1–100
    resilience_score:   int        # 1–100
    difficulties:       List[str]  # challenges revealed by palm lines
    how_to_overcome:    List[str]  # specific guidance per difficulty
    creator_strengths:  List[str]  # strengths visible in the palm


class CreatorAnalysisResponse(BaseModel):
    platform_assessment:  str
    what_went_right:      List[str]
    what_went_wrong:      List[str]
    content_strategy:     str
    astro_zodiac_reading: AstroZodiacReading
    palm_reading:         PalmReading
    best_posting_days:    List[str]
    posting_schedule:     Dict[str, List[str]]
    monthly_plan:         Any
    growth_prediction:    str
    final_blessing:       str


# ─────────────────────────────────────────────
# OpenAI caller — Vision-capable
# ─────────────────────────────────────────────
def _require_key() -> str:
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail=(
                "OpenAI API key is not configured. "
                "Add OPENAI_API_KEY=sk-... to your .env file and restart the server."
            ),
        )
    return OPENAI_API_KEY


async def _call_openai_vision(messages: list, max_tokens: int = 4096) -> dict:
    key = _require_key()

    # gpt-4o-mini supports vision; fall back gracefully if model is text-only
    model = OPENAI_MODEL if "gpt-4o" in OPENAI_MODEL else "gpt-4o-mini"

    payload = {
        "model":           model,
        "messages":        messages,
        "temperature":     0.78,
        "max_tokens":      max_tokens,
        "response_format": {"type": "json_object"},
    }

    logger.info(f"[OpenAI] model={model} max_tokens={max_tokens}")

    try:
        async with httpx.AsyncClient(timeout=150.0) as client:
            resp = await client.post(
                OPENAI_URL,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json=payload,
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="OpenAI timed out (>150s). Try again.")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Network error: {exc}")

    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid OpenAI API key. Check your .env file.")
    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="OpenAI rate limit hit. Wait a moment and retry.")
    if resp.status_code == 402:
        raise HTTPException(status_code=402, detail="OpenAI quota exceeded. Check billing.")
    if not resp.is_success:
        raise HTTPException(status_code=502, detail=f"OpenAI returned {resp.status_code}: {resp.text[:300]}")

    try:
        raw = resp.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise HTTPException(status_code=502, detail=f"Unexpected OpenAI response: {exc}")

    logger.info(f"[OpenAI] response chars={len(raw)}")

    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines   = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI returned invalid JSON: {exc}. Raw: {raw[:300]}")


# ─────────────────────────────────────────────
# Mime detection
# ─────────────────────────────────────────────
def _detect_mime(image_bytes: bytes) -> str:
    if image_bytes[:2] == b"\xff\xd8":
        return "image/jpeg"
    if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


# ─────────────────────────────────────────────
# Prompt builder
# ─────────────────────────────────────────────
def _build_prompt(
    name:        str,
    platform:    str,
    goal:        str,
    zodiac:      str,
    dob:         str,
    stats:       dict,
) -> str:

    if platform == "instagram":
        followers = stats.get("followers", 0)
        posts     = stats.get("posts", 0)
        ppw       = round(posts / 52, 1) if posts else "unknown"
        stats_block = (
            f"- Platform: Instagram\n"
            f"- Followers: {int(followers):,}\n"
            f"- Total Posts: {int(posts):,}\n"
            f"- Estimated posts/week: {ppw}"
        )
    else:
        subs   = stats.get("subscribers", 0)
        vids   = stats.get("videos", 0)
        views  = stats.get("views", 0)
        stats_block = (
            f"- Platform: YouTube\n"
            f"- Subscribers: {int(subs):,}\n"
            f"- Total Videos: {int(vids):,}\n"
            f"- Monthly Views: {int(views):,}"
        )

    return f"""
You are simultaneously:
1. A world-class Vedic astrologer with 30 years of experience advising content creators
2. A brutally honest digital growth strategist
3. A certified palmist who reads hands for career and creative potential

The creator {name} has shared their palm image (included in this message), their birth details, and their platform stats.
You must weave ALL THREE perspectives — astrology, palm reading, and growth strategy — into one deeply personalised, large, bulk response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATOR PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {name}
{stats_block}
Goal: {goal}
Zodiac Sign: {zodiac}
Date of Birth: {dob}
Palm Image: PROVIDED (analyse the actual visible lines and features)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPOND WITH ONE VALID JSON OBJECT — exact structure below.
No markdown, no extra keys, no placeholders, no generic advice.
Every sentence must be personalised to {name}, their zodiac, their DOB, their palm, and their stats.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{
  "platform_assessment": "<5-7 sentences of deep honest assessment of {name}'s current standing on {platform}. Reference their exact numbers. Tell them what their follower-to-post ratio truly means, where they rank in the creator ecosystem, what the numbers reveal about their consistency, engagement potential, and monetisation readiness. Do NOT sugarcoat.>",

  "what_went_right": [
    "<Specific strength based on their actual stats — e.g. their posting volume relative to followers indicates consistent effort>",
    "<Another specific positive>",
    "<Another>",
    "<Another>",
    "<Another>"
  ],

  "what_went_wrong": [
    "<Specific mistake or gap deduced from their numbers — be direct and specific>",
    "<Another mistake>",
    "<Another>",
    "<Another>",
    "<Another>",
    "<Another>"
  ],

  "content_strategy": "<Write 4-6 full paragraphs. Cover: (1) what content pillars {name} must build on {platform} based on their goal, (2) exact format recommendations (Reels vs Carousels vs Stories for IG, or Shorts vs long-form vs Live for YT), (3) hook strategy — what the first 3 seconds of every post must do, (4) what they must STOP doing immediately, (5) how to use the algorithm at their follower level specifically, (6) collaboration and distribution tactics. Must be long, detailed, platform-specific.>",

  "astro_zodiac_reading": {{
    "personality": "<4-5 sentences about {name}'s creator personality as a {zodiac}. Describe how {zodiac} energy shapes their content style, their relationship with the audience, their creative rhythm, and their natural magnetism or weaknesses on camera. Be mystical and specific to this zodiac sign — not generic.>",

    "good_timings": [
      "<Auspicious time window with astrological reason — e.g. '9:00 AM–11:00 AM — Venus hour on {zodiac}'s strong days, amplifies reach and engagement'>",
      "<Another auspicious time window with reason>",
      "<Another>",
      "<Another>",
      "<Another>"
    ],

    "bad_timings": [
      "<Inauspicious time window with astrological reason — e.g. 'Avoid posting 2:00 PM–4:00 PM — Saturn's shadow hour suppresses {zodiac} visibility'>",
      "<Another inauspicious window with reason>",
      "<Another>",
      "<Another>"
    ],

    "good_days": [
      "<Lucky day with specific astrological reason for {zodiac} creator — e.g. 'Wednesday — Mercury rules this day and governs communication, ideal for {zodiac} to launch new content'>",
      "<Another lucky day with reason>",
      "<Another>",
      "<Another>"
    ],

    "bad_days": [
      "<Unlucky day for {zodiac} creator with astrological reason>",
      "<Another unlucky day with reason>",
      "<Another>"
    ],

    "monthly_forecast": "<3-4 sentences of monthly cosmic forecast for {name} as a {zodiac}. Reference current planetary positions (as of the birth month and zodiac cycle), what energy this month brings for their creative growth, whether Mercury retrograde or any other planetary event affects them, and what they should focus on or avoid this month specifically. Make it feel like a real astrologer is speaking to them personally.>",

    "remedies": [
      "<Specific Vedic remedy or ritual for {zodiac} to enhance creative success — e.g. 'Light a ghee lamp on Friday evenings facing northeast to invoke Venus and amplify your magnetic pull on {platform}'>",
      "<Another remedy — crystal, mantra, colour, or ritual>",
      "<Another>",
      "<Another>"
    ]
  }},

  "palm_reading": {{
    "overall_reading": "<5-6 sentences written as a real palmist speaking directly to {name}. Describe what you actually see in the palm image — the length and curve of the life line, the heart line's emotional depth, the head line's intellectual orientation, the fate line's clarity, and any distinctive mounts or markings. Translate each feature into what it means for {name} as a content creator. Be specific and personal — not generic palm reading text.>",

    "creativity_score": <integer 1-100 based on actual palm features observed>,
    "leadership_score": <integer 1-100 based on actual palm features observed>,
    "resilience_score": <integer 1-100 based on actual palm features observed>,

    "difficulties": [
      "<Specific difficulty {name} will face, grounded in a palm line observation — e.g. 'Your head line shows a fork mid-way, indicating a period of creative confusion and self-doubt between months 4–8 of your journey'>",
      "<Another palm-based difficulty with timing if visible>",
      "<Another>",
      "<Another>",
      "<Another>"
    ],

    "how_to_overcome": [
      "<Specific remedy or action to overcome the first difficulty above — combine practical advice with spiritual guidance>",
      "<How to overcome the second difficulty>",
      "<How to overcome the third>",
      "<How to overcome the fourth>",
      "<How to overcome the fifth>"
    ],

    "creator_strengths": [
      "<Strength visible in the palm lines — e.g. 'Your Mercury mount is prominently raised, indicating exceptional communication skills and the ability to captivate audiences instinctively'>",
      "<Another palm-based creator strength>",
      "<Another>",
      "<Another>"
    ]
  }},

  "best_posting_days": [
    "<Day + specific astrological AND data-based reason why it is ideal for {name} to post on {platform}>",
    "<Another day with combined reason>",
    "<Another>",
    "<Another>"
  ],

  "posting_schedule": {{
    "Monday":    ["<time if auspicious for {zodiac}, else []>"],
    "Tuesday":   [],
    "Wednesday": ["<time>", "<time>"],
    "Thursday":  [],
    "Friday":    ["<time>", "<time>"],
    "Saturday":  ["<time>"],
    "Sunday":    []
  }},

  "monthly_plan": [
    [
      {{"day": "Day 1",  "task": "<specific, actionable task for {name} on {platform} — personalised to their goal and stats>"}},
      {{"day": "Day 2",  "task": "<specific task>"}},
      {{"day": "Day 3",  "task": "<specific task>"}},
      {{"day": "Day 4",  "task": "<specific task>"}},
      {{"day": "Day 5",  "task": "<specific task>"}},
      {{"day": "Day 6",  "task": "<specific task>"}},
      {{"day": "Day 7",  "task": "<specific task>"}}
    ],
    [
      {{"day": "Day 8",  "task": "<specific task>"}},
      {{"day": "Day 9",  "task": "<specific task>"}},
      {{"day": "Day 10", "task": "<specific task>"}},
      {{"day": "Day 11", "task": "<specific task>"}},
      {{"day": "Day 12", "task": "<specific task>"}},
      {{"day": "Day 13", "task": "<specific task>"}},
      {{"day": "Day 14", "task": "<specific task>"}}
    ],
    [
      {{"day": "Day 15", "task": "<specific task>"}},
      {{"day": "Day 16", "task": "<specific task>"}},
      {{"day": "Day 17", "task": "<specific task>"}},
      {{"day": "Day 18", "task": "<specific task>"}},
      {{"day": "Day 19", "task": "<specific task>"}},
      {{"day": "Day 20", "task": "<specific task>"}},
      {{"day": "Day 21", "task": "<specific task>"}}
    ],
    [
      {{"day": "Day 22", "task": "<specific task>"}},
      {{"day": "Day 23", "task": "<specific task>"}},
      {{"day": "Day 24", "task": "<specific task>"}},
      {{"day": "Day 25", "task": "<specific task>"}},
      {{"day": "Day 26", "task": "<specific task>"}},
      {{"day": "Day 27", "task": "<specific task>"}},
      {{"day": "Day 28", "task": "<specific task>"}},
      {{"day": "Day 29", "task": "<specific task>"}},
      {{"day": "Day 30", "task": "<specific task>"}}
    ]
  ],

  "growth_prediction": "<4-5 sentences of honest, data-based growth prediction for {name}. Give specific projected numbers for 3 months, 6 months, and 12 months from now if they follow the plan above. Factor in their current {platform} metrics, the astrological timing, and their palm's resilience score. Be honest — distinguish between realistic projections and optimistic ones. Close with what will determine whether they hit the higher or lower estimate.>",

  "final_blessing": "<3-4 sentences written as a master Vedic astrologer delivering a final personalised message to {name}. Reference their zodiac's ruling planet, what their palm lines say about their ultimate destiny as a creator, and the cosmic window opening for them this year. Make it personal, moving, grounded, and inspiring. Address them by name. This should feel like a real spiritual advisor's closing words.>"
}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULES:
1. Every field must be fully populated — no empty strings, no placeholder text, no "N/A"
2. monthly_plan: exactly 4 weeks, weeks 1–3 have 7 tasks, week 4 has 9 tasks
3. posting_schedule: all 7 days present — use [] for rest days
4. Times in posting_schedule: "H:MM AM/PM" format only (e.g. "7:00 PM")
5. Palm reading MUST reference actual visible features from the image — not generic text
6. Astrology MUST be specific to {zodiac} — do not write generic content that fits any sign
7. All advice must be personalised to {name}, their exact platform stats, and their specific goal
8. content_strategy must be at minimum 4 full paragraphs
9. final_blessing must address {name} by name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
""".strip()


# ─────────────────────────────────────────────
# Main service function
# ─────────────────────────────────────────────
async def run_creator_analysis(
    palm_image:  UploadFile,
    platform:    str,
    name:        str,
    goal:        str,
    zodiac:      str,
    dob:         str,
    followers:   Optional[int] = None,
    posts:       Optional[int] = None,
    subscribers: Optional[int] = None,
    videos:      Optional[int] = None,
    views:       Optional[int] = None,
) -> CreatorAnalysisResponse:

    logger.info(f"[creator_analysis] name={name!r} platform={platform} zodiac={zodiac} dob={dob}")

    # ── Read and validate palm image ──
    image_bytes = await palm_image.read()
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > 10:
        raise HTTPException(status_code=400, detail=f"Palm image must be under 10MB. Got {size_mb:.1f}MB.")
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Palm image file is empty.")

    mime     = _detect_mime(image_bytes)
    b64_palm = base64.b64encode(image_bytes).decode("utf-8")
    logger.info(f"[creator_analysis] palm image: mime={mime} size={size_mb:.2f}MB")

    # ── Build stats dict ──
    stats = {}
    if platform == "instagram":
        stats = {"followers": followers or 0, "posts": posts or 0}
    else:
        stats = {"subscribers": subscribers or 0, "videos": videos or 0, "views": views or 0}

    # ── Build prompt ──
    prompt_text = _build_prompt(name, platform, goal, zodiac, dob, stats)

    # ── Build messages — text + palm image in one call ──
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type":      "image_url",
                    "image_url": {
                        "url":    f"data:{mime};base64,{b64_palm}",
                        "detail": "high",
                    },
                },
                {
                    "type": "text",
                    "text": prompt_text,
                },
            ],
        }
    ]

    # ── Call OpenAI Vision ──
    data = await _call_openai_vision(messages, max_tokens=4096)

    # ── Validate required top-level keys ──
    required_keys = [
        "platform_assessment", "what_went_right", "what_went_wrong",
        "content_strategy", "astro_zodiac_reading", "palm_reading",
        "best_posting_days", "posting_schedule", "monthly_plan",
        "growth_prediction", "final_blessing",
    ]
    missing = [k for k in required_keys if k not in data]
    if missing:
        raise HTTPException(
            status_code=502,
            detail=f"OpenAI response missing required fields: {missing}",
        )

    # ── Normalise posting_schedule — ensure all 7 days present ──
    all_days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    sched = data.get("posting_schedule", {})
    for day in all_days:
        if day not in sched:
            sched[day] = []
    data["posting_schedule"] = sched

    # ── Clamp palm scores ──
    pr = data.get("palm_reading", {})
    for field in ("creativity_score", "leadership_score", "resilience_score"):
        v = pr.get(field, 70)
        pr[field] = max(1, min(100, int(v) if isinstance(v, (int, float)) else 70))
    data["palm_reading"] = pr

    logger.info(f"[creator_analysis] ✅ complete for {name!r}")

    try:
        return CreatorAnalysisResponse(**data)
    except Exception as exc:
        logger.error(f"[creator_analysis] schema validation error: {exc}")
        raise HTTPException(status_code=502, detail=f"Response schema mismatch: {exc}")
