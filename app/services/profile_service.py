"""
app/services/profile_service.py

Generates deterministic, realistic-looking profile data from any social URL.
NOTE: Real scraping requires platform API access + auth which is beyond scope.
      This service simulates data that is consistent (same URL = same data)
      and realistic enough for demo/testing purposes.
"""
import random
import logging
from datetime import datetime, timedelta
import requests
import re
import os
from fastapi import HTTPException

from app.models.schemas import Platform, TopPost, ProfileAnalysisResponse

logger = logging.getLogger("creator_growth_ai")

def detect_platform(url: str) -> Platform:
    u = url.lower()
    if "instagram" in u:                  return Platform.instagram
    if "youtube" in u or "youtu.be" in u: return Platform.youtube
    if "facebook" in u or "fb.com" in u:  return Platform.facebook
    if "tiktok" in u:                     return Platform.tiktok
    if "twitter" in u or "x.com" in u:   return Platform.twitter
    return Platform.unknown


def extract_username(url: str) -> str:
    """
    Robustly extract handle from any social URL format.
    Examples handled:
      https://instagram.com/cristiano        → cristiano
      https://www.instagram.com/cristiano/   → cristiano
      https://instagram.com/@cristiano       → cristiano
      https://youtube.com/@mkbhd             → mkbhd
      https://tiktok.com/@khaby.lame         → khaby.lame
    """
    cleaned = url.strip()
    for prefix in ("https://", "http://"):
        if cleaned.lower().startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break

    if cleaned.lower().startswith("www."):
        cleaned = cleaned[4:]

    parts = [p for p in cleaned.split("/") if p]
    path_parts = parts[1:] if len(parts) > 1 else []

    # Segments that are never usernames
    skip = {"channel", "c", "user", "watch", "shorts", "reel",
            "p", "tv", "stories", "reels", "hashtag", "explore"}

    username = "creator"
    for segment in reversed(path_parts):
        clean_seg = segment.lstrip("@").split("?")[0].split("#")[0].strip()
        if clean_seg and clean_seg.lower() not in skip and len(clean_seg) > 1:
            username = clean_seg
            break

    logger.info(f"[extract_username] {url!r} → {username!r}")
    return username


def parse_number(text: str) -> int:
    text = text.replace(',', '').replace(' ', '')
    multipliers = {'K': 1000, 'M': 1000000, 'B': 1000000000}
    if text and text[-1].upper() in multipliers:
        num = float(text[:-1])
        return int(num * multipliers[text[-1].upper()])
    try:
        return int(text)
    except ValueError:
        return 0


def _platform_follower_range(platform: Platform) -> tuple[int, int]:
    """Each platform has different typical follower distributions."""
    ranges = {
        Platform.instagram: (5_000,   2_000_000),
        Platform.youtube:   (1_000,   5_000_000),
        Platform.tiktok:    (10_000,  10_000_000),
        Platform.facebook:  (500,     1_000_000),
        Platform.twitter:   (500,     2_000_000),
        Platform.unknown:   (10_000,  500_000),
    }
    return ranges.get(platform, (10_000, 500_000))


def _platform_engagement_rate(platform: Platform, rng: random.Random) -> float:
    """Average engagement rates differ per platform."""
    rates = {
        Platform.instagram: (2.0,  8.0),
        Platform.youtube:   (1.0,  6.0),
        Platform.tiktok:    (4.0, 18.0),
        Platform.facebook:  (0.5,  3.0),
        Platform.twitter:   (0.5,  4.0),
        Platform.unknown:   (1.0,  8.0),
    }
    lo, hi = rates.get(platform, (1.0, 8.0))
    return round(rng.uniform(lo, hi), 2)


def simulate_profile(url: str) -> ProfileAnalysisResponse:
    """
    Fetches real data for YouTube and Instagram by parsing HTML DOM.
    Falls back to simulation for other platforms.
    """
    logger.info(f"[simulate_profile] url={url!r}")

    platform = detect_platform(url)
    username = extract_username(url)

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    followers = 0
    following = 0
    total_posts = 0
    total_views = 0

    if platform == Platform.youtube:
        try:
            about_url = url.rstrip('/') + '/about'
            response = requests.get(about_url, headers=headers, timeout=10)
            response.raise_for_status()
            html = response.text

            # Flexible regex for subscribers and videos, allowing characters in between
            sub_match = re.search(r'(\d+(?:\.\d+)?[KMB]?) subscribers.*?(?:• )?(\d+(?:\.\d+)?[KMB]?) videos', html, re.DOTALL)
            if sub_match:
                followers = parse_number(sub_match.group(1))
                total_posts = parse_number(sub_match.group(2))

            # Views regex, allowing for '•'
            views_match = re.search(r'• ([\d,]+) views', html)
            if views_match:
                total_views = int(views_match.group(1).replace(',', ''))

            logger.info(f"[youtube_extract] followers={followers:,} posts={total_posts:,} views={total_views:,}")

            if followers == 0:
                raise ValueError("Failed to extract data")

        except Exception as e:
            logger.error(f"YouTube extraction failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to extract YouTube data")

    elif platform == Platform.instagram:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            html = response.text

            # Updated regex to handle numbers with commas, decimals, and suffixes like M, K
            meta_match = re.search(r'<meta property="og:description" content="([\d,.]+[KMB]?) Followers, ([\d,.]+[KMB]?) Following, ([\d,.]+[KMB]?) Posts', html)
            if meta_match:
                followers = parse_number(meta_match.group(1))
                following = parse_number(meta_match.group(2))
                total_posts = parse_number(meta_match.group(3))

            logger.info(f"[instagram_extract] followers={followers:,} following={following:,} posts={total_posts:,}")

            if followers == 0:
                raise ValueError("Failed to extract data")

        except Exception as e:
            logger.error(f"Instagram extraction failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to extract Instagram data")

    else:
        # Simulation for other platforms
        seed = sum(ord(c) for c in url)
        rng  = random.Random(seed)

        lo, hi    = _platform_follower_range(platform)
        followers = rng.randint(lo, hi)
        following = rng.randint(100, min(5_000, max(101, followers // 10)))
        total_posts     = rng.randint(30, 1_200)

    # Common parts
    seed = sum(ord(c) for c in url)
    rng = random.Random(seed)

    if platform == Platform.youtube:
        following = rng.randint(0, 500)  # YouTube doesn't show following

    engagement_rate = _platform_engagement_rate(platform, rng)

    if total_posts > 0 and total_views > 0:
        avg_views = total_views // total_posts
    else:
        avg_views = int(followers * rng.uniform(2.0, 10.0))

    avg_likes = int(avg_views * rng.uniform(0.05, 0.15)) if avg_views else int(followers * engagement_rate / 100 * rng.uniform(0.7, 1.2))
    avg_comments = int(avg_likes * rng.uniform(0.1, 0.3))

    # Simulate top posts
    thumbnails = [f"https://picsum.photos/seed/{seed % 100 + i}/400/300" for i in range(5)]
    platform_post_types = {
        Platform.instagram: ["Reel", "Carousel", "Story Highlight", "Tutorial", "Collab"],
        Platform.youtube:   ["Tutorial", "Vlog", "Review", "Short", "Podcast Clip"],
        Platform.tiktok:    ["Trend", "Tutorial", "Storytime", "Duet", "POV"],
        Platform.facebook:  ["Video", "Photo Post", "Reel", "Story", "Live"],
        Platform.twitter:   ["Thread", "Video Tweet", "Poll", "Quote Tweet", "Space"],
        Platform.unknown:   ["Post", "Video", "Story", "Collab", "Tutorial"],
    }
    post_types = platform_post_types.get(platform, ["Post", "Video", "Story", "Collab", "Tutorial"])
    top_posts = [
        TopPost(
            title=f"{rng.choice(post_types)} — #{rng.randint(100, 999)}",
            likes=int(avg_likes * rng.uniform(1.8, 6.0)),
            comments=int(avg_comments * rng.uniform(1.5, 5.0)),
            thumbnail=thumbnails[i],
            platform=platform.value,
            engagement=round(rng.uniform(engagement_rate, engagement_rate * 3.5), 2),
        )
        for i in range(5)
    ]

    # Simulate growth data
    base_date = datetime.now() - timedelta(weeks=24)
    growth_data = []
    current = float(followers) * 0.70
    for w in range(25):
        growth_data.append({
            "week":       (base_date + timedelta(weeks=w)).strftime("%b %d"),
            "followers":  int(current),
            "engagement": round(rng.uniform(engagement_rate * 0.6, engagement_rate * 1.4), 2),
            "views":      int(current * rng.uniform(2.0, 7.0)),
        })
        current *= (1 + rng.uniform(0.003, 0.045))

    logger.info(f"[simulate_profile] ✅ returning profile for @{username}")

    return ProfileAnalysisResponse(
        platform=platform,
        username=username,
        followers=followers,
        following=following,
        engagement_rate=engagement_rate,
        total_posts=total_posts,
        avg_likes=avg_likes,
        avg_comments=avg_comments,
        top_posts=top_posts,
        growth_data=growth_data,
    )