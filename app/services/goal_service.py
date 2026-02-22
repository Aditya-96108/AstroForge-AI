"""
app/services/goal_service.py

Pure math-based goal feasibility calculator.
No AI needed — deterministic from inputs.
"""
import logging
from typing import List, Dict, Any

from app.models.schemas import GoalRequest, GoalResponse

logger = logging.getLogger("creator_growth_ai")


def calculate_goal(req: GoalRequest) -> GoalResponse:
    logger.info(
        f"[calculate_goal] {req.current_followers} → {req.target_followers} "
        f"over {req.timeline_months} months, posting {req.posting_frequency}x/week"
    )

    needed_followers = req.target_followers - req.current_followers
    monthly_needed   = needed_followers / req.timeline_months
    monthly_rate     = monthly_needed / req.current_followers  # as a decimal

    # ── Feasibility Score ────────────────────────────────────────
    # Base score: 100 if monthly rate ≤ 5%, degrades from there
    if monthly_rate <= 0.05:
        score = 95.0
        label = "Highly Achievable"
    elif monthly_rate <= 0.10:
        score = 80.0
        label = "Achievable"
    elif monthly_rate <= 0.20:
        score = 60.0
        label = "Challenging"
    elif monthly_rate <= 0.40:
        score = 38.0
        label = "Very Challenging"
    else:
        score = 18.0
        label = "Extremely Ambitious"

    # Posting frequency bonuses
    if req.posting_frequency >= 14:
        score = min(100.0, score + 12.0)
    elif req.posting_frequency >= 7:
        score = min(100.0, score + 7.0)
    elif req.posting_frequency >= 5:
        score = min(100.0, score + 3.0)
    elif req.posting_frequency <= 2:
        score = max(5.0, score - 10.0)

    score = round(score, 1)

    # ── Projection ───────────────────────────────────────────────
    # Realistic rate = 85% of needed (accounts for real-world variance)
    realistic_monthly = monthly_rate * 0.85
    projection: List[Dict[str, Any]] = []
    current = float(req.current_followers)
    for month in range(req.timeline_months + 1):
        projection.append({
            "month":     month,
            "followers": int(round(current)),
            "target":    int(req.current_followers + (needed_followers * month / req.timeline_months)),
        })
        current *= (1 + realistic_monthly)

    # ── Recommendations ──────────────────────────────────────────
    recommendations: List[str] = []

    if monthly_rate > 0.30:
        recommendations.append(
            f"Your target requires {monthly_rate*100:.1f}% monthly growth — "
            "consider extending your timeline or lowering the target to avoid burnout."
        )

    if req.posting_frequency < 5:
        recommendations.append(
            f"Posting {req.posting_frequency}x/week is below the recommended minimum of 5x. "
            "Increasing frequency will significantly improve feasibility."
        )

    recommendations += [
        f"Focus 80% of content on proven {req.niche} formats that already perform in your niche.",
        "Run monthly collabs with 2-3 creators at a similar follower count for free cross-exposure.",
        "Invest time in thumbnail and hook quality — the first 3 seconds determine 70% of watch time.",
        "Engage authentically in comments for 30 minutes after each post — this boosts algorithm reach.",
        "Track your top 3 performing posts weekly and double down on those formats.",
    ]

    return GoalResponse(
        feasibility_score=score,
        feasibility_label=label,
        required_growth_rate=round(monthly_rate * 100, 2),
        projection=projection,
        recommendations=recommendations[:6],
    )
