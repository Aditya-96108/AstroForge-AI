import { useState, useEffect } from "react";
import { FEATURES, MOCK_PROFILE, TESTIMONIALS, MOCK_INSIGHTS } from "../constants/mockData";  // Import missing MOCK_INSIGHTS here
import { C } from "../constants/colors";  // Import C from colors.js
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
} from "recharts";

export default function Landing({ setPage }) {
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
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div className="badge badge-violet" style={{ marginBottom: 20, display: "inline-flex", gap: 6, animation: "fadeIn 0.6s ease" }}>
            <span>✦</span> AI-Powered Creator Intelligence Platform
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 8, animation: "fadeIn 0.7s ease", letterSpacing: "-0.02em" }}>
            Predict Your Growth.
            <br />
            <span className="grad">Build Your Empire.</span>
          </h1>
          <div style={{ fontSize: "clamp(18px, 3vw, 28px)", color: C.textSub, marginTop: 16, marginBottom: 8, fontFamily: "'Inter', sans-serif", fontWeight: 500, minHeight: 40, animation: "fadeIn 0.8s ease" }}>
            Dominate{" "}
            <span style={{ color: C.violetLight }} className="typing-cursor">{typed}</span>
          </div>
          <p style={{ color: C.textMuted, fontSize: 16, maxWidth: 560, margin: "16px auto 40px", lineHeight: 1.8, animation: "fadeIn 0.9s ease", fontFamily: "'Inter', sans-serif" }}>
            The world's first platform combining AI growth strategy, deep social analytics, and Vedic astrology to unlock your creator potential.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeIn 1s ease" }}>
            <button className="btn-primary animate-glow" style={{ fontSize: 15, padding: "14px 32px", fontFamily: "'Inter', sans-serif" }} onClick={() => setPage("analyze")}>
              ⚡ Analyze My Profile
            </button>
            
          </div>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 56, flexWrap: "wrap", animation: "fadeIn 1.1s ease" }}>
            {[["284K+", "Profiles Analyzed"], ["4.8x", "Avg Growth Rate"], ["97%", "Accuracy Score"], ["50K+", "Creators Served"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, background: "linear-gradient(135deg, #fff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{v}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Floating preview cards */}
          <div style={{ position: "relative", marginTop: 80 }}>
            <div className="card animate-float" style={{ position: "absolute", left: -40, top: -20, width: 200, padding: 16, textAlign: "left", zIndex: 2, animationDelay: "0s" }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>ENGAGEMENT RATE</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, color: C.green }}>{4.8}%</div>
              <div style={{ fontSize: 11, color: C.green, fontFamily: "'Inter', sans-serif" }}>↑ +1.2% this week</div>
            </div>
            <div className="card animate-float" style={{ position: "absolute", right: -40, top: 0, width: 210, padding: 16, textAlign: "left", zIndex: 2, animationDelay: "1.5s" }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>GROWTH PREDICTION</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, color: C.violetLight }}>+142K</div>
              <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Inter', sans-serif" }}>followers in 6 months</div>
            </div>
            <div style={{ background: "linear-gradient(180deg, transparent 0%, rgba(5,5,8,0.9) 80%)", position: "absolute", inset: 0, borderRadius: 20, zIndex: 3 }} />
            <div style={{ height: 280, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }}>
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
        <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div className="badge badge-violet" style={{ marginBottom: 12 }}>Features</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 8, lineHeight: 1.3, fontFamily: "'Inter', sans-serif" }}>Everything You Need to Grow</h2>
            <p style={{ color: C.textSub, fontSize: 15, lineHeight: 1.6, maxWidth: 520, margin: "8px auto 0", fontFamily: "'Inter', sans-serif" }}>From AI analysis to cosmic insights — one platform to rule your creator journey.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 40 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, transition: "all 0.3s", animation: `fadeIn ${0.5 + i * 0.1}s ease`, display: "flex", gap: 16 }}>
                <div style={{ width: 48, height: 48, background: "rgba(124,58,237,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{f.title}</h3>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "rgba(124,58,237,0.15)", color: C.violetLight, border: "1px solid rgba(124,58,237,0.2)" }}>{f.badge}</span>
                  </div>
                  <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Demo Preview */}
      <div style={{ background: C.surface }}>
        <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div className="badge badge-violet" style={{ marginBottom: 12 }}>Live Preview</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 8, lineHeight: 1.3, fontFamily: "'Inter', sans-serif" }}>Real Insights, Real Results</h2>
            <p style={{ color: C.textSub, fontSize: 15, lineHeight: 1.6, maxWidth: 520, fontFamily: "'Inter', sans-serif" }}>See the kind of intelligence AstroForge AI delivers to 50,000+ creators.</p>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #7c3aed, #ec4899, transparent)", marginBottom: 40 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, transition: "all 0.3s" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>📈 GROWTH TRAJECTORY</div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_PROFILE.growth_data.slice(-8)}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.violet} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 10 }} />
                    <Area type="monotone" dataKey="followers" stroke={C.violetLight} strokeWidth={2} fill="url(#g1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, transition: "all 0.3s" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>🤖 AI ANALYSIS SAMPLE</div>
              <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>{MOCK_INSIGHTS.profile_analysis}</p>
              <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #1e1e2e, transparent)", margin: "24px 0" }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f472b6", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>Top Mistake Detected:</div>
              <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Inter', sans-serif" }}>{MOCK_INSIGHTS.mistakes[0]}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonials */}
      <div style={{ background: C.bg }}>
        <div style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div className="badge badge-violet" style={{ marginBottom: 12 }}>Social Proof</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 8, lineHeight: 1.3, fontFamily: "'Inter', sans-serif" }}>Creators Who Grew with AI</h2>
            <p style={{ color: C.textSub, fontSize: 15, lineHeight: 1.6, maxWidth: 520, margin: "8px auto 0", fontFamily: "'Inter', sans-serif" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 40 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: "rgba(13,13,20,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28, transition: "all 0.3s", animation: `fadeIn ${0.5 + i * 0.1}s ease` }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                  {Array(t.stars).fill(0).map((_, j) => <span key={j} style={{ color: C.amber, fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.violet}, ${C.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Inter', sans-serif" }}>{t.handle} · {t.followers} on {t.platform}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA */}
      <div style={{ background: `linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.1) 100%)`, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 16, lineHeight: 1.2, letterSpacing: "-0.015em" }}>
            Ready to <span style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Build Your Empire?</span>
          </h2>
          <p style={{ color: C.textMuted, marginBottom: 32, fontSize: 15, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>Join 50,000+ creators who use AI + astrology to grow faster, work smarter, and build brands that last.</p>
          <button className="btn-primary animate-glow" style={{ fontSize: 16, padding: "16px 40px", fontFamily: "'Inter', sans-serif" }} onClick={() => setPage("analyze")}>
            ⚡ Start Free Analysis
          </button>
        </div>
      </div>
      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px", maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer" }}>AstroForge AI</div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "API", "Blog"].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: C.textMuted, textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Inter', sans-serif" }}>© 2025 Team AstroForge AI. All rights reserved.</div>
      </footer>
    </div>
  );
}