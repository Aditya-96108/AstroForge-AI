"""
app/models/schemas.py
All Pydantic request/response models for Creator Growth AI.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Dict
from enum import Enum


class Platform(str, Enum):
    instagram = "instagram"
    youtube   = "youtube"
    facebook  = "facebook"
    tiktok    = "tiktok"
    twitter   = "twitter"
    unknown   = "unknown"


class Zodiac(str, Enum):
    aries       = "Aries"
    taurus      = "Taurus"
    gemini      = "Gemini"
    cancer      = "Cancer"
    leo         = "Leo"
    virgo       = "Virgo"
    libra       = "Libra"
    scorpio     = "Scorpio"
    sagittarius = "Sagittarius"
    capricorn   = "Capricorn"
    aquarius    = "Aquarius"
    pisces      = "Pisces"


# ─────────────────────────────────────────────
# Profile Analysis
# ─────────────────────────────────────────────

class ProfileAnalysisRequest(BaseModel):
    social_url: str = Field(..., min_length=3, description="Full social media profile URL")

    @field_validator("social_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("URL cannot be empty")
        if not v.startswith(("http://", "https://")):
            v = "https://" + v
        return v


class TopPost(BaseModel):
    title:      str
    likes:      int
    comments:   int
    thumbnail:  str
    platform:   str
    engagement: float


class ProfileAnalysisResponse(BaseModel):
    platform:        Platform
    username:        str
    followers:       int
    following:       int
    engagement_rate: float
    total_posts:     int
    avg_likes:       int
    avg_comments:    int
    top_posts:       List[TopPost]
    growth_data:     List[Dict[str, Any]]


# ─────────────────────────────────────────────
# AI Insights
# ─────────────────────────────────────────────

class AIInsightsRequest(BaseModel):
    username:         str
    platform:         str
    followers:        int
    engagement_rate:  float
    niche:            Optional[str] = "general"
    goals:            Optional[str] = "grow audience"
    target_followers: Optional[int] = None
    timeline_months:  Optional[int] = None


class AIInsightsResponse(BaseModel):
    profile_analysis:  str
    mistakes:          List[str]
    daily_plan:        List[str]
    content_ideas:     List[str]
    hook_ideas:        List[str]
    posting_schedule:  Dict[str, List[str]]
    growth_prediction: Dict[str, Any]
    feasibility_score: Optional[float] = None


# ─────────────────────────────────────────────
# Astrology
# ─────────────────────────────────────────────

class AstrologyRequest(BaseModel):
    dob:           str = Field(..., description="Date of birth YYYY-MM-DD")
    time_of_birth: str = Field(default="12:00", description="HH:MM 24h format")
    zodiac:        Zodiac


class AstrologyResponse(BaseModel):
    sun_sign:             str
    personality_insights: str
    growth_patterns:      str
    lucky_posting_times:  List[str]
    strengths:            List[str]
    weaknesses:           List[str]
    best_content_types:   List[str]
    monthly_forecast:     str


# ─────────────────────────────────────────────
# Palm Analysis
# ─────────────────────────────────────────────

class PalmAnalysisResponse(BaseModel):
    personality_traits:  List[str]
    risk_profile:        str   # "conservative" | "moderate" | "aggressive"
    creativity_score:    int   # 0-100
    leadership_score:    int   # 0-100
    communication_score: int   # 0-100
    summary:             str


# ─────────────────────────────────────────────
# Goal Planner
# ─────────────────────────────────────────────

class GoalRequest(BaseModel):
    current_followers: int = Field(..., gt=0)
    target_followers:  int = Field(..., gt=0)
    timeline_months:   int = Field(..., gt=0, le=60)
    niche:             str
    posting_frequency: int = Field(default=5, ge=1, le=21,
                                   description="Posts per week")

    @field_validator("target_followers")
    @classmethod
    def target_must_exceed_current(cls, v: int, info) -> int:
        current = info.data.get("current_followers", 0)
        if v <= current:
            raise ValueError("target_followers must be greater than current_followers")
        return v


class GoalResponse(BaseModel):
    feasibility_score:    float
    feasibility_label:    str
    required_growth_rate: float
    projection:           List[Dict[str, Any]]
    recommendations:      List[str]


# ─────────────────────────────────────────────
# PDF Report
# ─────────────────────────────────────────────

class ReportRequest(BaseModel):
    profile:   Optional[Dict[str, Any]] = None
    insights:  Optional[Dict[str, Any]] = None
    astrology: Optional[Dict[str, Any]] = None
    goals:     Optional[Dict[str, Any]] = None
    username:  str = "Creator"
