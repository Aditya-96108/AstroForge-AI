import { useState } from "react";
import AIThinking from "./AIThinking";
import { GOAL_PROJECTION } from "../constants/mockData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import CustomTooltip from "./CustomTooltip";

export default function Goals({ setSharedData }) {
  const [form, setForm] = useState({ current: 284700, target: 500000, months: 6, niche: "lifestyle", freq: 5 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const niches = ["Lifestyle", "Tech", "Finance", "Fitness", "Food", "Travel", "Education", "Entertainment", "Gaming", "Fashion"];
  const calculate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const resp = await fetch("https://astroforge-ai.onrender.com/calculate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_followers: form.current, target_followers: form.target, timeline_months: form.months, niche: form.niche, posting_frequency: form.freq }),
      });
      const d = await resp.json();
      setResult(d);
      setSharedData(prev => ({ ...prev, goals: d }));
    } catch {
      const mock = {
        feasibility_score: 78.5,
        feasibility_label: "Achievable",
        required_growth_rate: 7.8,
        projection: GOAL_PROJECTION,
        recommendations: ["Inconsistent posting schedule is killing your algorithm reach", "Hook quality in first 3 seconds needs dramatic improvement", "Not leveraging trending audio/hashtags in your niche", "Ignoring community engagement — replies matter"],
      };
      setResult(mock);
      setSharedData(prev => ({ ...prev, goals: mock }));
    }
    setLoading(false);
  };
  const scoreColor = result ? (result.feasibility_score >= 75 ? "#10b981" : result.feasibility_score >= 50 ? "#f59e0b" : "#ef4444") : "#a78bfa";
  return (
    <div style={{ paddingTop: 64 }}>
      <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <div className="badge badge-violet" style={{ marginBottom: 12 }}>Goal Planner</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>Plan Your Path to Dominance</h2>
          <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>Set your targets and get AI-powered feasibility analysis and growth projections.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "rgba(13,13,20,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28, transition: "all 0.3s" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🎯 Set Your Goals</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Current Followers</label>
                <input style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "all 0.2s", outline: "none" }} type="number" value={form.current} onChange={e => setForm(f => ({ ...f, current: +e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Target Followers</label>
                <input style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "all 0.2s", outline: "none" }} type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: +e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Timeline (months)</label>
                <input style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "all 0.2s", outline: "none" }} type="number" min="1" max="24" value={form.months} onChange={e => setForm(f => ({ ...f, months: +e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Your Niche</label>
                <select style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "all 0.2s", outline: "none" }} value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))}>
                  {niches.map(n => <option key={n} value={n.toLowerCase()}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Posting Frequency (posts/week)</label>
                <input style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "all 0.2s", outline: "none" }} type="number" min="1" max="21" value={form.freq} onChange={e => setForm(f => ({ ...f, freq: +e.target.value }))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {[1, 3, 5, 7, 14].map(v => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, freq: v }))} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: form.freq === v ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.freq === v ? "#7c3aed" : "#1e1e2e"}`, color: form.freq === v ? "#a78bfa" : "#6b7280", cursor: "pointer" }}>{v}x</button>
                  ))}
                </div>
              </div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.25s", position: "relative", overflow: "hidden" }} onClick={calculate} disabled={loading}>
                {loading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Calculating…</> : "📊 Calculate Feasibility"}
              </button>
            </div>
          </div>
          <div>
            {loading && (
              <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24, transition: "all 0.3s", padding: 48, textAlign: "center" }}>
                <AIThinking />
              </div>
            )}
            {result && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Score */}
                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24, transition: "all 0.3s", textAlign: "center", padding: 32, background: `linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.05))` }}>
                  <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>FEASIBILITY SCORE</div>
                  <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 16px" }}>
                    <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                      <circle cx="80" cy="80" r="65" fill="none" stroke={scoreColor} strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 65 * result.feasibility_score / 100} ${2 * Math.PI * 65 * (1 - result.feasibility_score / 100)}`}
                        strokeLinecap="round" style={{ transition: "stroke-dasharray 1.5s ease" }} />
                    </svg>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: scoreColor }}>{result.feasibility_score}%</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{result.feasibility_label}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#06b6d4" }}>{result.required_growth_rate}%</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Monthly Growth Needed</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#10b981" }}>{(form.target - form.current).toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>New Followers Needed</div>
                    </div>
                  </div>
                </div>
                {/* Projection chart */}
                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24, transition: "all 0.3s" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📈 Growth Projection</h3>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.projection || GOAL_PROJECTION}>
                        <defs>
                          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={v => `M${v}`} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={v => (v / 1000).toFixed(0) + "K"} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="followers" name="Projected" stroke="#10b981" strokeWidth={2} fill="url(#projGrad)" />
                        <Area type="monotone" dataKey="target" name="Target Path" stroke="#a78bfa" strokeWidth={1.5} fill="url(#targetGrad)" strokeDasharray="4 4" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Recommendations */}
                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24, transition: "all 0.3s" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>💡 To Hit Your Goal</h3>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i === result.recommendations.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!result && !loading && (
              <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24, transition: "all 0.3s", padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                <p style={{ color: "#6b7280" }}>Fill in your goals and click Calculate Feasibility to see your growth projection.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}