// src/components/StyleInjector.js (already provided, ensuring export)
import { useEffect } from "react";

export default function StyleInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --bg: #050508;
        --surface: #0d0d14;
        --card: #10101a;
        --border: #1e1e2e;
        --violet: #7c3aed;
        --violet-light: #a78bfa;
        --pink: #ec4899;
        --cyan: #06b6d4;
        --green: #10b981;
        --amber: #f59e0b;
        --text: #f0f0f8;
        --text-muted: #6b7280;
        --text-sub: #9ca3af;
      }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: 'DM Sans', sans-serif;
        min-height: 100vh;
        overflow-x: hidden;
        scroll-behavior: smooth;
      }
      h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--violet); }
      ::selection { background: rgba(124,58,237,0.4); }
      /* Noise texture overlay */
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
        pointer-events: none;
        z-index: 9999;
        opacity: 0.4;
      }
      /* Animations */
      @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes spin { to{transform:rotate(360deg)} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.2)} 50%{box-shadow:0 0 40px rgba(124,58,237,0.5)} }
      @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      @keyframes orbit { from{transform:rotate(0deg) translateX(120px) rotate(0deg)} to{transform:rotate(360deg) translateX(120px) rotate(-360deg)} }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      .animate-in { animation: fadeIn 0.5s ease forwards; }
      .animate-float { animation: float 4s ease-in-out infinite; }
      .animate-glow { animation: glow 3s ease-in-out infinite; }
      .shimmer-bg {
        background: linear-gradient(90deg, #1a1a2e 25%, #252538 50%, #1a1a2e 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      /* Glass effect */
      .glass {
        background: rgba(16,16,26,0.7);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.06);
      }
      /* Nav */
      .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: rgba(5,5,8,0.8);
        backdrop-filter: blur(24px);
        border-bottom: 1px solid var(--border);
        padding: 0 24px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .nav-logo {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 18px;
        background: linear-gradient(135deg, var(--violet-light), var(--pink));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        cursor: pointer;
      }
      .nav-links { display: flex; gap: 8px; align-items: center; }
      .nav-link {
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-sub);
        cursor: pointer;
        transition: all 0.2s;
        background: transparent;
        border: none;
        font-family: 'DM Sans', sans-serif;
      }
      .nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); }
      .nav-link.active { color: var(--violet-light); background: rgba(124,58,237,0.12); }
      /* Buttons */
      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: linear-gradient(135deg, var(--violet), #6d28d9);
        border: none;
        border-radius: 10px;
        color: #fff;
        font-family: 'Syne', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s;
        position: relative;
        overflow: hidden;
      }
      .btn-primary::before {
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);
        opacity:0;
        transition:opacity 0.25s;
      }
      .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(124,58,237,0.4); }
      .btn-primary:hover::before { opacity:1; }
      .btn-primary:active { transform:translateY(0); }
      .btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--text-sub);
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.25s;
      }
      .btn-ghost:hover { border-color: var(--violet-light); color: var(--violet-light); background: rgba(124,58,237,0.06); }
      /* Cards */
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 24px;
        transition: all 0.3s;
      }
      .card:hover { border-color: rgba(167,139,250,0.2); box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
      .card-glass {
        background: rgba(13,13,20,0.6);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 20px;
        padding: 28px;
        transition: all 0.3s;
      }
      .card-glass:hover { border-color: rgba(167,139,250,0.15); }
      /* Inputs */
      .input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255,255,255,0.04);
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--text);
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        transition: all 0.2s;
        outline: none;
      }
      .input:focus { border-color: var(--violet); background: rgba(124,58,237,0.06); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
      .input::placeholder { color: var(--text-muted); }
      .label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      /* Metric cards */
      .metric-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 20px;
        transition: all 0.3s;
      }
      .metric-card:hover { border-color: rgba(167,139,250,0.2); transform: translateY(-2px); }
      /* Skeleton */
      .skeleton {
        border-radius: 8px;
        animation: shimmer 1.5s infinite;
        background: linear-gradient(90deg, #1a1a2e 25%, #252538 50%, #1a1a2e 75%);
        background-size: 200% 100%;
      }
      /* Tag/badge */
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 100px;
        font-size: 11px;
        font-weight: 600;
      }
      .badge-violet { background: rgba(124,58,237,0.15); color: var(--violet-light); border: 1px solid rgba(124,58,237,0.2); }
      .badge-green { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }
      .badge-pink { background: rgba(236,72,153,0.12); color: var(--pink); border: 1px solid rgba(236,72,153,0.2); }
      .badge-amber { background: rgba(245,158,11,0.12); color: var(--amber); border: 1px solid rgba(245,158,11,0.2); }
      .badge-cyan { background: rgba(6,182,212,0.12); color: var(--cyan); border: 1px solid rgba(6,182,212,0.2); }
      /* Section layout */
      .section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
      .section-sm { padding: 48px 24px; max-width: 1100px; margin: 0 auto; }
      .section-title {
        font-size: clamp(24px, 4vw, 36px);
        font-weight: 700;
        margin-bottom: 8px;
        line-height: 1.2;
      }
      .section-sub {
        color: var(--text-sub);
        font-size: 15px;
        line-height: 1.6;
        max-width: 520px;
      }
      .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
      .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
      .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
      /* Gradient text */
      .grad { background: linear-gradient(135deg, var(--violet-light), var(--pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .grad-cyan { background: linear-gradient(135deg, var(--cyan), var(--violet-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      /* Divider */
      .divider { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin: 24px 0; }
      /* Hero gradient orb */
      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        pointer-events: none;
      }
      /* Tab system */
      .tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 4px; }
      .tab {
        flex: 1;
        padding: 8px 16px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
        cursor: pointer;
        border: none;
        background: transparent;
        font-family: 'DM Sans', sans-serif;
        transition: all 0.2s;
        text-align: center;
      }
      .tab.active { background: var(--card); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
      .tab:hover:not(.active) { color: var(--text-sub); }
      /* Progress bar */
      .progress-bar {
        height: 6px;
        background: rgba(255,255,255,0.06);
        border-radius: 100px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        border-radius: 100px;
        background: linear-gradient(90deg, var(--violet), var(--pink));
        transition: width 1s ease;
      }
      /* Loading spinner */
      .spinner {
        width: 20px; height: 20px;
        border: 2px solid rgba(255,255,255,0.1);
        border-top-color: var(--violet-light);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      /* Tooltip */
      .recharts-tooltip-wrapper .recharts-default-tooltip {
        background: #1a1a2e !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 10px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
      }
      /* Post card */
      .post-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s;
      }
      .post-card:hover { border-color: rgba(167,139,250,0.2); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
      /* Feasibility gauge */
      .gauge-ring {
        position: relative;
        width: 160px;
        height: 160px;
        margin: 0 auto;
      }
      /* Hero scroll indicator */
      @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
      .scroll-indicator { animation: scrollBounce 2s ease-in-out infinite; }
      /* Insight item */
      .insight-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .insight-item:last-child { border-bottom: none; }
      /* Schedule grid */
      .schedule-slot {
        background: rgba(124,58,237,0.1);
        border: 1px solid rgba(124,58,237,0.2);
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 12px;
        color: var(--violet-light);
        font-weight: 500;
        text-align: center;
      }
      /* Star rating */
      .stars { display: flex; gap: 2px; }
      .star { color: var(--amber); font-size: 14px; }
      /* Responsive */
      @media (max-width: 768px) {
        .section, .section-sm { padding: 60px 16px; }
        .nav-links .nav-link:not(.nav-cta) { display: none; }
        .hero-heading { font-size: clamp(32px, 8vw, 56px) !important; }
      }
      /* Typing cursor */
      .typing-cursor::after { content: '|'; animation: blink 1s infinite; color: var(--violet-light); }
      /* PDF button animation */
      @keyframes downloadPulse {
        0% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
        70% { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
        100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
      }
      .btn-download-active { animation: downloadPulse 1.5s ease infinite; }
      /* Neon line */
      .neon-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--violet), var(--pink), transparent);
      }
      /* Error state */
      .error-box {
        background: rgba(239,68,68,0.08);
        border: 1px solid rgba(239,68,68,0.2);
        border-radius: 12px;
        padding: 16px 20px;
        color: #fca5a5;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
    `;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}