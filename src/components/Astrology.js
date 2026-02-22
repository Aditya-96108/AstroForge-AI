import { useState } from "react";
import AIThinking from "./AIThinking";
import ErrorBox from "./ErrorBox";

const ZODIACS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const ZODIAC_EMOJIS = { Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓" };

export default function Astrology({ setSharedData }) {
  const [form, setForm] = useState({ dob: "", time_of_birth: "", zodiac: "" });
  const [palmFile, setPalmFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [palmLoading, setPalmLoading] = useState(false);
  const [data, setData] = useState(null);
  const [palmData, setPalmData] = useState(null);
  const [error, setError] = useState("");
  const [palmError, setPalmError] = useState("");
  const [tab, setTab] = useState("astro");

  const submit = async () => {
    if (!form.dob || !form.zodiac) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const resp = await fetch("http://localhost:8000/astrology-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${resp.status}`);
      }
      const d = await resp.json();
      setData(d);
      setSharedData(prev => ({ ...prev, astrology: d }));
    } catch (e) {
      setError(e.message || "Failed to fetch astrology analysis. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const submitPalm = async () => {
    if (!palmFile) return;
    setPalmLoading(true);
    setPalmError("");
    setPalmData(null);
    try {
      const formData = new FormData();
      formData.append("image", palmFile);
      const resp = await fetch("http://localhost:8000/palm-analysis", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${resp.status}`);
      }
      const d = await resp.json();
      setPalmData(d);
    } catch (e) {
      setPalmError(e.message || "Failed to analyze palm image. Make sure the backend is running.");
    } finally {
      setPalmLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 64 }}>
      <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <div className="badge badge-violet" style={{ marginBottom: 12 }}>Cosmic Intelligence</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
            Astrology Meets Analytics
          </h2>
          <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>
            Discover your cosmic growth patterns, lucky posting windows, and creator destiny.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 700, marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid #1e1e2e", borderRadius: 12, padding: 4 }}>
            {[["astro", "🔮 Birth Chart Analysis"], ["palm", "✋ Palm Reading"]].map(([id, label]) => (
              <button
                key={id}
                style={{ flex: 1, padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 500, color: tab === id ? "#f0f0f8" : "#6b7280", cursor: "pointer", border: "none", background: tab === id ? "#10101a" : "transparent", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", textAlign: "center" }}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Birth Chart Tab ── */}
        {tab === "astro" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {/* Form card */}
            <div style={{ background: "rgba(13,13,20,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🌟 Your Birth Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Date of Birth</label>
                  <input style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none" }} type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Time of Birth</label>
                  <input style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none" }} type="time" value={form.time_of_birth} onChange={e => setForm(f => ({ ...f, time_of_birth: e.target.value }))} />
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>More accurate analysis with birth time</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Sun Sign / Zodiac</label>
                  <select style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none" }} value={form.zodiac} onChange={e => setForm(f => ({ ...f, zodiac: e.target.value }))}>
                    <option value="">Select your zodiac sign</option>
                    {ZODIACS.map(z => <option key={z} value={z}>{ZODIAC_EMOJIS[z]} {z}</option>)}
                  </select>
                </div>

                {error && <ErrorBox message={error} />}

                <button
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, cursor: loading || !form.dob || !form.zodiac ? "not-allowed" : "pointer", opacity: loading || !form.dob || !form.zodiac ? 0.6 : 1 }}
                  onClick={submit}
                  disabled={loading || !form.dob || !form.zodiac}
                >
                  {loading
                    ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Reading stars…</>
                    : "🔮 Reveal My Cosmic Blueprint"
                  }
                </button>
              </div>
            </div>

            {/* Loading card */}
            {loading && (
              <div style={{ background: "rgba(13,13,20,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 4s linear infinite", display: "inline-block" }}>🔮</div>
                  <AIThinking />
                </div>
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08))", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 36 }}>{ZODIAC_EMOJIS[data.sun_sign]}</span>
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>{data.sun_sign}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>Your Creator Archetype</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7 }}>{data.personality_insights}</p>
                </div>

                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 10 }}>⏰ LUCKY POSTING WINDOWS</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {data.lucky_posting_times.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ["#10b981", "#7c3aed", "#f59e0b"][i] }} />
                        <span style={{ fontSize: 13, color: "#9ca3af" }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: "#10b981", marginBottom: 10 }}>✅ STRENGTHS</h4>
                  {data.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i === data.strengths.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                      <span>⚡</span>
                      <span style={{ fontSize: 13, color: "#9ca3af" }}>{s}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 10 }}>⚠️ AREAS TO WATCH</h4>
                  {data.weaknesses.map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i === data.weaknesses.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                      <span>🎯</span>
                      <span style={{ fontSize: 13, color: "#9ca3af" }}>{w}</span>
                    </div>
                  ))}
                </div>

                {data.best_content_types && (
                  <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", marginBottom: 10 }}>🎬 BEST CONTENT TYPES</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {data.best_content_types.map((t, i) => (
                        <span key={i} style={{ padding: "4px 12px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 100, fontSize: 12, color: "#a78bfa" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.monthly_forecast && (
                  <div style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.06), rgba(124,58,237,0.06))", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 16, padding: 24 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "#06b6d4", marginBottom: 8 }}>🌙 MONTHLY FORECAST</h4>
                    <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7 }}>{data.monthly_forecast}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Palm Reading Tab ── */}
        {tab === "palm" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <div style={{ background: "rgba(13,13,20,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>✋ Palm Reading</h3>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, lineHeight: 1.6 }}>Upload a clear photo of your dominant hand's palm. Our AI will analyze life lines, mount elevations, and energy patterns to reveal your creator potential.</p>

              <div
                style={{ border: `2px dashed ${palmFile ? "#7c3aed" : "#1e1e2e"}`, borderRadius: 12, padding: 40, textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: 16, background: palmFile ? "rgba(124,58,237,0.05)" : "transparent" }}
                onClick={() => document.getElementById("palmInput").click()}
              >
                {palmFile ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 13, color: "#a78bfa" }}>{palmFile.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{(palmFile.size / 1024).toFixed(0)}KB</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>✋</div>
                    <div style={{ fontSize: 14, color: "#9ca3af" }}>Click to upload palm image</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>JPG, PNG up to 10MB</div>
                  </div>
                )}
              </div>
              <input id="palmInput" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { setPalmFile(e.target.files[0]); setPalmError(""); }} />

              {palmError && <div style={{ marginBottom: 12 }}><ErrorBox message={palmError} /></div>}

              <button
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, cursor: !palmFile || palmLoading ? "not-allowed" : "pointer", width: "100%", opacity: !palmFile || palmLoading ? 0.6 : 1 }}
                onClick={submitPalm}
                disabled={!palmFile || palmLoading}
              >
                {palmLoading
                  ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Analyzing palm…</>
                  : "🔍 Read My Palm"
                }
              </button>
            </div>

            {palmData && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "rgba(13,13,20,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🧠 Creator Scores</h4>
                  {[["Creativity", palmData.creativity_score, "#7c3aed"], ["Leadership", palmData.leadership_score, "#ec4899"], ["Communication", palmData.communication_score, "#06b6d4"]].map(([label, score, color]) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}/100</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg, ${color}, ${color}88)`, width: score + "%", transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#10101a", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
                  <h4 style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, marginBottom: 10 }}>✨ PERSONALITY TRAITS</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {palmData.personality_traits.map((t, i) => (
                      <span key={i} style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: `rgba(124,58,237,${0.08 + i * 0.03})`, color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.05))", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 16, padding: 24 }}>
                  <h4 style={{ fontSize: 13, color: "#10b981", fontWeight: 600, marginBottom: 8 }}>📜 READING SUMMARY</h4>
                  <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7 }}>{palmData.summary}</p>
                  <div style={{ marginTop: 10 }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                      background: palmData.risk_profile === "aggressive" ? "rgba(236,72,153,0.12)" : palmData.risk_profile === "conservative" ? "rgba(6,182,212,0.12)" : "rgba(245,158,11,0.12)",
                      color: palmData.risk_profile === "aggressive" ? "#ec4899" : palmData.risk_profile === "conservative" ? "#06b6d4" : "#f59e0b",
                      border: palmData.risk_profile === "aggressive" ? "1px solid rgba(236,72,153,0.2)" : palmData.risk_profile === "conservative" ? "1px solid rgba(6,182,212,0.2)" : "1px solid rgba(245,158,11,0.2)",
                    }}>
                      Risk Profile: {palmData.risk_profile}
                    </span>
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
