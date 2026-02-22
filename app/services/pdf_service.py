"""
app/services/pdf_service.py

Generates a styled HTML report and optionally converts it to PDF using WeasyPrint.
Falls back to returning HTML bytes if WeasyPrint is not installed.
"""
import logging
from datetime import datetime
from app.models.schemas import ReportRequest

logger = logging.getLogger("creator_growth_ai")


def _build_html(req: ReportRequest) -> str:
    p  = req.profile   or {}
    i  = req.insights  or {}
    a  = req.astrology or {}
    g  = req.goals     or {}

    def section(title: str, content: str) -> str:
        return f"""
        <div class="section">
          <h2>{title}</h2>
          {content}
        </div>"""

    def metric(value: str, label: str) -> str:
        return f'<div class="metric"><div class="value">{value}</div><div class="label">{label}</div></div>'

    def bullet_list(items: list) -> str:
        return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"

    # Profile section
    profile_html = ""
    if p:
        profile_html = section("📊 Profile Overview", f"""
          <div class="metrics">
            {metric(f"{p.get('followers', 0):,}", 'Followers')}
            {metric(f"{p.get('engagement_rate', 0)}%", 'Engagement Rate')}
            {metric(str(p.get('platform', '')).title(), 'Platform')}
            {metric(f"{p.get('total_posts', 0):,}", 'Total Posts')}
          </div>
          <p>Username: <strong>@{p.get('username', '')}</strong></p>
          <p>Average Likes per Post: <strong>{p.get('avg_likes', 0):,}</strong></p>
          <p>Average Comments per Post: <strong>{p.get('avg_comments', 0):,}</strong></p>
        """)

    # AI Insights section
    insights_html = ""
    if i:
        mistakes = bullet_list(i.get("mistakes", []))
        daily    = bullet_list(i.get("daily_plan", []))
        ideas    = bullet_list(i.get("content_ideas", []))
        hooks    = bullet_list(i.get("hook_ideas", []))
        gp       = i.get("growth_prediction", {})
        growth_pred = f"""
          <table>
            <tr><th>Timeline</th><th>Projected Followers</th></tr>
            <tr><td>1 Month</td><td>{gp.get('month_1', 0):,}</td></tr>
            <tr><td>3 Months</td><td>{gp.get('month_3', 0):,}</td></tr>
            <tr><td>6 Months</td><td>{gp.get('month_6', 0):,}</td></tr>
            <tr><td>12 Months</td><td>{gp.get('month_12', 0):,}</td></tr>
          </table>
          <p>Confidence: <strong>{gp.get('confidence', 'N/A')}</strong></p>
        """ if gp else ""

        insights_html = (
            section("🤖 AI Analysis", f"<p>{i.get('profile_analysis', '')}</p>")
            + section("⚠️ What You're Doing Wrong", mistakes)
            + section("📅 Daily Action Plan", daily)
            + section("💡 Content Ideas", ideas)
            + section("🎣 Hook Ideas", hooks)
            + (section("📊 Growth Prediction", growth_pred) if growth_pred else "")
        )

    # Astrology section
    astrology_html = ""
    if a:
        astrology_html = section(f"🔮 Astrology — {a.get('sun_sign', '')}", f"""
          <p>{a.get('personality_insights', '')}</p>
          <h3>Growth Patterns</h3>
          <p>{a.get('growth_patterns', '')}</p>
          <h3>Lucky Posting Times</h3>
          {bullet_list(a.get('lucky_posting_times', []))}
          <h3>Strengths</h3>
          {bullet_list(a.get('strengths', []))}
          <h3>Weaknesses</h3>
          {bullet_list(a.get('weaknesses', []))}
          <h3>Best Content Types</h3>
          {bullet_list(a.get('best_content_types', []))}
          <h3>Monthly Forecast</h3>
          <p>{a.get('monthly_forecast', '')}</p>
        """)

    # Goals section
    goals_html = ""
    if g:
        goals_html = section("🎯 Goal Analysis", f"""
          <div class="metrics">
            {metric(f"{g.get('feasibility_score', 0):.1f}%", 'Feasibility Score')}
            {metric(g.get('feasibility_label', 'N/A'), 'Label')}
            {metric(f"{g.get('required_growth_rate', 0):.1f}%/mo", 'Monthly Growth Needed')}
          </div>
          <h3>Recommendations</h3>
          {bullet_list(g.get('recommendations', []))}
        """)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AstroForge AI — Report for @{req.username}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    font-family: 'Inter', sans-serif;
    background: #0a0a0f;
    color: #e8e8f0;
    padding: 40px;
    line-height: 1.6;
  }}
  .header {{
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid #2a2a3a;
  }}
  .header h1 {{
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, #a78bfa, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }}
  .header p {{ color: #6b7280; font-size: 14px; }}
  .section {{
    background: #13131f;
    border: 1px solid #2a2a3a;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }}
  .section h2 {{
    font-size: 18px;
    font-weight: 700;
    color: #a78bfa;
    margin-bottom: 16px;
  }}
  .section h3 {{
    font-size: 14px;
    font-weight: 600;
    color: #9ca3af;
    margin: 16px 0 8px;
  }}
  .section p {{
    font-size: 13px;
    color: #c8c8d8;
    margin-bottom: 8px;
  }}
  .section strong {{ color: #f0f0f8; }}
  ul {{ padding-left: 20px; margin-top: 4px; }}
  li {{ font-size: 13px; color: #c8c8d8; margin: 6px 0; }}
  .metrics {{
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }}
  .metric {{
    background: #1e1e2e;
    border-radius: 10px;
    padding: 14px 20px;
    text-align: center;
    min-width: 120px;
  }}
  .metric .value {{
    font-size: 22px;
    font-weight: 800;
    color: #a78bfa;
  }}
  .metric .label {{
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }}
  th, td {{
    padding: 10px 14px;
    text-align: left;
    font-size: 13px;
    border-bottom: 1px solid #2a2a3a;
  }}
  th {{ color: #a78bfa; font-weight: 600; }}
  td {{ color: #c8c8d8; }}
  .footer {{
    text-align: center;
    color: #4b5563;
    font-size: 11px;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #2a2a3a;
  }}
</style>
</head>
<body>
  <div class="header">
    <h1>AstroForge AI — Growth Plan</h1>
    <p>Report for @{req.username} · Generated {datetime.now().strftime("%B %d, %Y at %H:%M")}</p>
  </div>
  {profile_html}
  {insights_html}
  {astrology_html}
  {goals_html}
  <div class="footer">
    Creator Growth AI · AI-powered creator analytics & astrology platform · {datetime.now().year}
  </div>
</body>
</html>"""


def generate_pdf_report(req: ReportRequest) -> bytes:
    logger.info(f"[generate_pdf_report] generating for @{req.username}")
    html = _build_html(req)

    try:
        from weasyprint import HTML as WeasyHTML
        pdf = WeasyHTML(string=html).write_pdf()
        logger.info(f"[generate_pdf_report] ✅ PDF generated ({len(pdf)} bytes)")
        return pdf
    except ImportError:
        logger.warning("[generate_pdf_report] WeasyPrint not installed — returning HTML")
        return html.encode("utf-8")
    except Exception as exc:
        logger.error(f"[generate_pdf_report] WeasyPrint error: {exc} — returning HTML fallback")
        return html.encode("utf-8")
