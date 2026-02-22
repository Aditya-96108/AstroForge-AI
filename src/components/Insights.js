import { useState, useEffect } from "react";
import AIThinking from "./AIThinking";
import ErrorBox from "./ErrorBox";

// Insights fetches its OWN data from the backend independently.
// It does NOT rely on sharedData from other pages — it calls
// /analyze-profile first to get profile stats, then /generate-ai-insights.
// sharedData is used only as an optional enhancement if already available.

const DEMO_URL = "https://instagram.com/demo";

export default function Insights({ sharedData, setSharedData }) {
  const [loading, setLoading]   = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError]       = useState("");
  const [tab, setTab]           = useState("analysis");

  useEffect(() => {
    generate();
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
    setInsights(null);

    try {
      // Step 1: Get profile data (use sharedData if available, else fetch fresh)
      let profile = sharedData?.profile;

      if (!profile) {
        const profileResp = await fetch("https://astroforge-ai.onrender.com/analyze-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ social_url: DEMO_URL }),
        });
        if (!profileResp.ok) {
          const err = await profileResp.json().catch(() => ({}));
          throw new Error(err.detail || `Profile fetch failed: ${profileResp.status}`);
        }
        profile = await profileResp.json();
      }

      // Step 2: Generate AI insights using the profile
      const insightsResp = await fetch("https://astroforge-ai.onrender.com/generate-ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:        profile.username,
          platform:        profile.platform,
          followers:       profile.followers,
          engagement_rate: profile.engagement_rate,
          niche:           sharedData?.niche  || "general",
          goals:           sharedData?.goals  || "grow audience",
          target_followers: sharedData?.goals?.target_followers || null,
          timeline_months:  sharedData?.goals?.timeline_months  || null,
        }),
      });
      if (!insightsResp.ok) {
        const err = await insightsResp.json().catch(() => ({}));
        throw new Error(err.detail || `Insights fetch failed: ${insightsResp.status}`);
      }
      const d = await insightsResp.json();
      setInsights(d);
      setSharedData(prev => ({ ...prev, insights: d }));
    } catch (e) {
      setError(e.message || "Failed to generate insights. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div style={{ paddingTop: 64 }}>
      <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="badge badge-violet" style={{ marginBottom: 12 }}>AI Brain</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
              Your Growth Intelligence Report
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>
              GPT-4 powered insights fetched live from the backend.
            </p>
          </div>
          <button
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "transparent", border: "1px solid #1e1e2e", borderRadius: 10, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            onClick={generate}
            disabled={loading}
          >
            {loading
              ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Generating…</>
              : "🔄 Regenerate"
            }
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 24 }}>
            <ErrorBox message={error} />
            <button
              onClick={generate}
              style={{ marginTop: 12, padding: "8px 20px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, color: "#a78bfa", fontSize: 13, cursor: "pointer" }}
            >
              🔄 Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 64, textAlign: "center" }}>
            <AIThinking />
            <div style={{ maxWidth: 260, margin: "20px auto 0" }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 100, background: "linear-gradient(90deg, #7c3aed, #ec4899)", width: "60%", animation: "gradientShift 2s ease infinite", backgroundSize: "200% 100%" }} />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {insights && !loading && (
          <div>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid #1e1e2e", borderRadius: 12, padding: 4, marginBottom: 24, maxWidth: 600 }}>
              {[["analysis", "🧠 Analysis"], ["plan", "📅 Daily Plan"], ["content", "💡 Content"], ["schedule", "🗓 Schedule"]].map(([id, label]) => (
                <button
                  key={id}
                  style={{ flex: 1, padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 500, color: tab === id ? "#f0f0f8" : "#6b7280", cursor: "pointer", border: "none", background: tab === id ? "#10101a" : "transparent", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", textAlign: "center" }}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Analysis Tab ── */}
            {tab === "analysis" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.5s ease forwards" }}>
                <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(236,72,153,0.04))", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🤖</div>
                    <div>
                      <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 6 }}>AI ASSESSMENT</div>
                      <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.8 }}>{insights.profile_analysis}</p>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f87171", marginBottom: 16 }}>⚠️ What You're Doing Wrong</h3>
                  {insights.mistakes.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i === insights.mistakes.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>{m}</span>
                    </div>
                  ))}
                </div>

                {insights.growth_prediction && (
                  <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Growth Prediction</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
                      {[["1 Month", insights.growth_prediction.month_1], ["3 Months", insights.growth_prediction.month_3], ["6 Months", insights.growth_prediction.month_6], ["12 Months", insights.growth_prediction.month_12]].map(([label, val]) => (
                        <div key={label} style={{ textAlign: "center", padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#a78bfa" }}>{(val / 1000).toFixed(0)}K</div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                        Confidence: {insights.growth_prediction.confidence}
                      </span>
                    </div>
                  </div>
                )}

                {typeof insights.feasibility_score === "number" && (
                  <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🎯 Goal Feasibility</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: insights.feasibility_score >= 75 ? "#10b981" : insights.feasibility_score >= 50 ? "#f59e0b" : "#ef4444" }}>
                        {insights.feasibility_score}%
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 100, background: insights.feasibility_score >= 75 ? "#10b981" : insights.feasibility_score >= 50 ? "#f59e0b" : "#ef4444", width: insights.feasibility_score + "%", transition: "width 1s ease" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Daily Plan Tab ── */}
            {tab === "plan" && (
              <div style={{ animation: "fadeIn 0.5s ease forwards", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📅 Your Daily Action Plan</h3>
                  {insights.daily_plan.map((step, i) => {
                    const [time, ...rest] = step.split(" — ");
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i === insights.daily_plan.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0, color: "#fff" }}>{time}</div>
                        <span style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>{rest.join(" — ")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Content Tab ── */}
            {tab === "content" && (
              <div style={{ animation: "fadeIn 0.5s ease forwards" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                  <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#06b6d4" }}>💡 Content Ideas</h3>
                    {insights.content_ideas.map((idea, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i === insights.content_ideas.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: 12, color: "#6b7280", width: 20, flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>{idea}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#f59e0b" }}>🎣 Hook Ideas</h3>
                    {insights.hook_ideas.map((hook, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i === insights.hook_ideas.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: 12, color: "#6b7280", width: 20, flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5, fontStyle: i < 3 ? "italic" : "normal" }}>{hook}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Schedule Tab ── */}
            {tab === "schedule" && (
              <div style={{ animation: "fadeIn 0.5s ease forwards" }}>
                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🗓 Optimal Posting Schedule</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
                    {days.map(day => {
                      const slots = insights.posting_schedule?.[day] || [];
                      return (
                        <div key={day} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: slots.length ? "#a78bfa" : "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {day.slice(0, 3)}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {slots.length
                              ? slots.map((slot, j) => (
                                <div key={j} style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 8, padding: "6px 4px", fontSize: 11, color: "#a78bfa", fontWeight: 500, textAlign: "center" }}>{slot}</div>
                              ))
                              : <div style={{ height: 32, background: "rgba(255,255,255,0.02)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span style={{ color: "#2e2e4e", fontSize: 16 }}>—</span>
                                </div>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #1e1e2e, transparent)", margin: "24px 0" }} />
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    💡 All times in your local timezone. Adjust by ±1 hour based on your audience location.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
