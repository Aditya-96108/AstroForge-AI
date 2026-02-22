// src/pages/Landing.js (updated to remove useNavigate if not needed, but kept as is since now Router is present)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FEATURES, MOCK_PROFILE, TESTIMONIALS, MOCK_INSIGHTS } from "../constants/mockData";
import { C } from "../constants/colors";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
} from "recharts";

export default function Landing() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const words = ["Instagram.", "YouTube.", "TikTok.", "Your Empire."];
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx];
    const speed = deleting ? 60 : 100;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setTyped(word.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (deleting && charIdx > 0) {
        setTyped(word.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else if (!deleting && charIdx === word.length) {
        setTimeout(() => setDeleting(true), 1800);
      } else {
        setDeleting(false);
        setWordIdx(i => (i + 1) % words.length);
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx]);
  return (
    <div>
      {/* Hero */}
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 64 }}>
        {/* Gradient orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", top: "5%", left: "50%", transform: "translateX(-50%)" }} />
        <div className="orb" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)", top: "20%", right: "-10%" }} />
        <div className="orb" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", bottom: "10%", left: "5%" }} />
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "100px 32px", textAlign: "center" }}>
          <div className="badge badge-violet" style={{ marginBottom: 24, display: "inline-flex", gap: 8, animation: "fadeIn 0.6s ease" }}>
            <span>✦</span> AI-Powered Creator Intelligence Platform
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(48px, 8vw, 84px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 12, animation: "fadeIn 0.7s ease" }}>
            Predict Your Growth.
            <br />
            <span className="grad">Build Your Empire.</span>
          </h1>
          <div style={{ fontSize: "clamp(20px, 3.5vw, 32px)", color: C.textSub, marginTop: 20, marginBottom: 12, fontFamily: "'Syne', sans-serif", fontWeight: 500, minHeight: 48, animation: "fadeIn 0.8s ease", lineHeight: 1.4 }}>
            Dominate{" "}
            <span style={{ color: C.violetLight }} className="typing-cursor">{typed}</span>
          </div>
          <p style={{ color: C.textMuted, fontSize: 18, maxWidth: 640, margin: "20px auto 48px", lineHeight: 1.8, animation: "fadeIn 0.9s ease" }}>
            The world's first platform combining AI growth strategy, deep social analytics, and Vedic astrology to unlock your creator potential.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animation: "fadeIn 1s ease" }}>
            <button className="btn-primary animate-glow" style={{ fontSize: 16, padding: "16px 36px" }} onClick={() => navigate("/analyze")}>
              ⚡ Analyze My Profile
            </button>
            <button className="btn-ghost" style={{ fontSize: 16, padding: "16px 32px" }} onClick={() => navigate("/charts")}>
              View Demo →
            </button>
          </div>
          <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 64, flexWrap: "wrap", animation: "fadeIn 1.1s ease" }}>
            {[["284K+", "Profiles Analyzed"], ["4.8x", "Avg Growth Rate"], ["97%", "Accuracy Score"], ["50K+", "Creators Served"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{v}</div>
                <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Floating preview cards */}
          <div style={{ position: "relative", marginTop: 96 }}>
            <div className="card animate-float" style={{ position: "absolute", left: -48, top: -24, width: 220, padding: 20, textAlign: "left", zIndex: 2, animationDelay: "0s" }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>ENGAGEMENT RATE</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: C.green }}>4.8%</div>
              <div style={{ fontSize: 12, color: C.green }}>↑ +1.2% this week</div>
            </div>
            <div className="card animate-float" style={{ position: "absolute", right: -48, top: 0, width: 230, padding: 20, textAlign: "left", zIndex: 2, animationDelay: "1.5s" }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>GROWTH PREDICTION</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: C.violetLight }}>+142K</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>followers in 6 months</div>
            </div>
            <div style={{ background: "linear-gradient(180deg, transparent 0%, rgba(5,5,8,0.9) 80%)", position: "absolute", inset: 0, borderRadius: 20, zIndex: 3 }} />
            <div style={{ height: 320, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_PROFILE.growth_data.slice(-12)}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.violet} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="followers" stroke={C.violetLight} strokeWidth={2} fill="url(#heroGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {/* Features */}
      <div style={{ background: `linear-gradient(180deg, ${C.bg} 0%, ${C.surface} 100%)` }}>
        <div style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <div className="badge badge-violet" style={{ marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>Everything You Need to Grow</h2>
            <p style={{ color: C.textSub, fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: "12px auto 0" }}>From AI analysis to cosmic insights — one platform to rule your creator journey.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 48 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, transition: "all 0.3s", animation: `fadeIn ${0.5 + i * 0.1}s ease`, display: "flex", gap: 20 }}>
                <div style={{ width: 52, height: 52, background: "rgba(124,58,237,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{f.title}</h3>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "rgba(124,58,237,0.15)", color: C.violetLight, border: "1px solid rgba(124,58,237,0.2)" }}>{f.badge}</span>
                  </div>
                  <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Demo Preview */}
      <div style={{ background: C.surface }}>
        <div style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div className="badge badge-violet" style={{ marginBottom: 16 }}>Live Preview</div>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>Real Insights, Real Results</h2>
            <p style={{ color: C.textSub, fontSize: 16, lineHeight: 1.7, maxWidth: 600 }}>See the kind of intelligence AstroForge AI delivers to 50,000+ creators.</p>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #7c3aed, #ec4899, transparent)", marginBottom: 48 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, transition: "all 0.3s" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, marginBottom: 20 }}>📈 GROWTH TRAJECTORY</div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_PROFILE.growth_data.slice(-8)}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.violet} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 11 }} />
                    <Area type="monotone" dataKey="followers" stroke={C.violetLight} strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, transition: "all 0.3s" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, marginBottom: 20 }}>🤖 AI ANALYSIS SAMPLE</div>
              <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.8 }}>{MOCK_INSIGHTS.profile_analysis}</p>
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #1e1e2e, transparent)", margin: "28px 0" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f472b6", marginBottom: 10 }}>Top Mistake Detected:</div>
              <div style={{ fontSize: 14, color: C.textMuted }}>{MOCK_INSIGHTS.mistakes[0]}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonials */}
      <div style={{ background: C.bg }}>
        <div style={{ padding: "100px 32px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <div className="badge badge-violet" style={{ marginBottom: 16 }}>Social Proof</div>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>Creators Who Grew with AI</h2>
            <p style={{ color: C.textSub, fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: "12px auto 0" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 48 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: "rgba(13,13,20,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 32, transition: "all 0.3s", animation: `fadeIn ${0.5 + i * 0.1}s ease` }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {Array(t.stars).fill(0).map((_, j) => <span key={j} style={{ color: C.amber, fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, color: C.textSub, lineHeight: 1.8, marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.violet}, ${C.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>{t.handle} · {t.followers} on {t.platform}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.1) 100%)`, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "100px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800, marginBottom: 20 }}>
            Ready to <span style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Build Your Empire?</span>
          </h2>
          <p style={{ color: C.textMuted, marginBottom: 40, fontSize: 16, lineHeight: 1.8 }}>Join 50,000+ creators who use AI + astrology to grow faster, work smarter, and build brands that last.</p>
          <button className="btn-primary animate-glow" style={{ fontSize: 17, padding: "18px 44px" }} onClick={() => navigate("/analyze")}>
            ⚡ Start Free Analysis
          </button>
        </div>
      </div>
      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 32px", maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer" }}>AstroForge AI</div>
        <div style={{ display: "flex", gap: 28 }}>
          {["Privacy", "Terms", "API", "Blog"].map(l => (
            <a key={l} href="#" style={{ fontSize: 14, color: C.textMuted, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.textMuted }}>© 2025 AstroForge AI. All rights reserved.</div>
      </footer>
    </div>
  );
}