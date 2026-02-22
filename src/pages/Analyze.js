import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#07070f; --s1:#0e0e1c; --s2:#13132a; --s3:#181830;
  --bdr:rgba(255,255,255,0.07); --bdrHi:rgba(255,255,255,0.14);
  --vio:#7c3aed; --vlt:#a78bfa; --pnk:#ec4899;
  --cyn:#22d3ee; --grn:#34d399; --amb:#fbbf24; --red:#f87171;
  --txt:#f1f1fb; --sub:#9ca3af; --mut:#4b5563;
}

body{font-family:'Manrope',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;overflow-x:hidden}

/* noise grain */
body::before{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size:200px 200px;opacity:0.55;
}
/* ambient glow */
body::after{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    radial-gradient(ellipse 65% 55% at 15% 8%,rgba(124,58,237,.09) 0%,transparent 70%),
    radial-gradient(ellipse 55% 45% at 85% 88%,rgba(236,72,153,.06) 0%,transparent 70%);
}

@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 30px rgba(124,58,237,.3)}50%{box-shadow:0 0 65px rgba(124,58,237,.6)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes orbIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
@keyframes cosmicPulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}

.fadeUp{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both}
.d1{animation-delay:.06s}.d2{animation-delay:.14s}.d3{animation-delay:.24s}.d4{animation-delay:.34s}

/* ── FORM ── */
.inp{
  width:100%;padding:13px 16px;
  background:rgba(255,255,255,.035);
  border:1px solid var(--bdr);border-radius:12px;
  color:var(--txt);font-family:'Manrope',sans-serif;
  font-size:14px;font-weight:500;outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.inp:focus{border-color:var(--vio);background:rgba(124,58,237,.06);box-shadow:0 0 0 3px rgba(124,58,237,.15)}
.inp::placeholder{color:var(--mut)}
.inp.err-bdr{border-color:rgba(248,113,113,.6)!important}
textarea.inp{resize:vertical;min-height:90px;line-height:1.65}
select.inp option{background:#13132a}
.lbl{
  display:flex;align-items:center;gap:6px;
  font-size:11px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--mut);margin-bottom:8px;
}
.lbl .req{color:var(--pnk);font-size:13px;line-height:1}

/* ── BUTTONS ── */
.btn-prim{
  display:inline-flex;align-items:center;justify-content:center;gap:9px;
  padding:15px 32px;
  background:linear-gradient(135deg,#7c3aed,#5b21b6);
  border:1px solid rgba(167,139,250,.3);border-radius:14px;
  color:#fff;font-family:'Manrope',sans-serif;font-size:15px;font-weight:700;
  cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;
  position:relative;overflow:hidden;
}
.btn-prim::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .2s}
.btn-prim:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 44px rgba(124,58,237,.5)}
.btn-prim:hover:not(:disabled)::after{opacity:1}
.btn-prim:disabled{opacity:.4;cursor:not-allowed}
.btn-prim.glow{animation:pulseGlow 2.8s ease-in-out infinite}

/* ── PLATFORM PILLS ── */
.plat{
  flex:1;padding:16px 12px;
  border:1.5px solid var(--bdr);border-radius:14px;
  background:transparent;color:var(--sub);
  font-family:'Manrope',sans-serif;font-size:14px;font-weight:600;
  cursor:pointer;transition:all .22s;
  text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px;
}
.plat .ic{font-size:28px;line-height:1}
.plat:hover:not(.on){border-color:var(--bdrHi);color:var(--txt)}
.plat.on{border-color:var(--vio);background:rgba(124,58,237,.11);color:var(--vlt);box-shadow:0 0 0 1px rgba(124,58,237,.3)}

/* ── LAYOUT ── */
.glass{background:rgba(14,14,28,.74);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid var(--bdr);border-radius:22px}
.divider{height:1px;background:linear-gradient(90deg,transparent,var(--bdr),transparent);margin:28px 0}
.spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.15);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
.skel{border-radius:16px;background:linear-gradient(90deg,#0e0e1c 25%,#1a1a35 50%,#0e0e1c 75%);background-size:200% 100%;animation:shimmer 1.6s infinite}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 14px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.badge-v{background:rgba(124,58,237,.14);color:var(--vlt);border:1px solid rgba(124,58,237,.25)}
.badge-g{background:rgba(52,211,153,.12);color:var(--grn);border:1px solid rgba(52,211,153,.22)}
.badge-r{background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.25)}

/* ── PALM UPLOAD ── */
.palm-drop{
  border:2px dashed var(--bdr);border-radius:16px;padding:36px 24px;
  text-align:center;cursor:pointer;transition:all .25s;
  background:transparent;
}
.palm-drop:hover,.palm-drop.has-file{border-color:var(--vio);background:rgba(124,58,237,.06)}
.palm-drop.has-file{border-style:solid}

/* ── STEP HEADER ── */
.step-hdr{
  display:flex;align-items:center;gap:12px;margin-bottom:18px;
}
.step-num{
  width:28px;height:28px;border-radius:50%;
  background:rgba(124,58,237,.18);color:var(--vlt);
  font-size:12px;font-weight:800;display:flex;
  align-items:center;justify-content:center;flex-shrink:0;
}
.step-title{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}

/* ── ERR BOX ── */
.errbox{display:flex;align-items:flex-start;gap:10px;padding:14px 18px;background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.22);border-radius:12px;color:#fca5a5;font-size:13px;line-height:1.65}
.field-err{font-size:11px;color:var(--red);margin-top:5px;font-weight:600}

/* ── RESULT SECTIONS ── */
.rsec{
  background:var(--s1);border:1px solid var(--bdr);border-radius:22px;
  padding:34px;margin-bottom:24px;
  animation:orbIn .54s cubic-bezier(.16,1,.3,1) both;
  position:relative;overflow:hidden;
}
.rsec::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--ab,linear-gradient(90deg,#7c3aed,#ec4899));opacity:.9}
.rsec h3{font-family:'DM Serif Display',serif;font-size:24px;color:var(--txt);margin-bottom:20px;display:flex;align-items:center;gap:12px;line-height:1.2}

/* astrology card special styling */
.astro-card{
  background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.06));
  border:1px solid rgba(124,58,237,.2);border-radius:16px;padding:24px;margin-bottom:16px;
}
.astro-card h4{font-family:'DM Serif Display',serif;font-size:18px;color:var(--vlt);margin-bottom:12px}

/* good/bad timing pills */
.timing-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.timing-col h5{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
.timing-col.good h5{color:var(--grn)}
.timing-col.bad  h5{color:var(--red)}
.tpill{
  display:flex;align-items:center;gap:8px;
  padding:9px 13px;border-radius:10px;
  font-size:13px;color:var(--sub);line-height:1.55;margin-bottom:7px;
}
.tpill.g{background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.16)}
.tpill.b{background:rgba(248,113,113,.07);border:1px solid rgba(248,113,113,.16)}
.tpill .dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.tpill.g .dot{background:var(--grn)}
.tpill.b .dot{background:var(--red)}

/* list items */
.rlist{list-style:none;display:flex;flex-direction:column;gap:10px}
.rlist li{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-radius:12px;font-size:14px;color:var(--sub);line-height:1.8}
.rlist li .ix{min-width:24px;height:24px;background:rgba(124,58,237,.18);color:var(--vlt);border-radius:7px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}

/* schedule */
.sgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:14px}
.sday{text-align:center}
.sdn{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--mut);margin-bottom:8px;display:block}
.sslot{background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.22);border-radius:8px;padding:5px 3px;font-size:10px;font-weight:600;color:var(--vlt);margin-bottom:4px;text-align:center}
.soff{height:32px;background:rgba(255,255,255,.02);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--bdr);font-size:14px}

/* month plan */
.wcard{border:1px solid var(--bdr);border-radius:14px;overflow:hidden;margin-bottom:14px}
.whead{background:rgba(124,58,237,.09);padding:10px 18px;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--vlt);border-bottom:1px solid var(--bdr)}
.wbody{padding:14px 18px;display:flex;flex-direction:column;gap:10px}
.drow{display:flex;gap:12px;align-items:flex-start;font-size:13.5px;color:var(--sub);line-height:1.75}
.dtag{min-width:76px;font-size:11px;font-weight:700;color:var(--txt);padding-top:2px;flex-shrink:0}

/* stat chips */
.schips{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}
.schip{background:var(--s2);border:1px solid var(--bdr);border-radius:14px;padding:18px 16px;text-align:center}
.schip .sv{font-family:'DM Serif Display',serif;font-size:26px;display:block}
.schip .sl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin-top:4px;display:block}

/* palm scores */
.palm-scores{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
.pscore{background:var(--s2);border:1px solid var(--bdr);border-radius:14px;padding:18px 14px;text-align:center}
.pscore .pv{font-family:'DM Serif Display',serif;font-size:28px;display:block}
.pscore .pl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin-top:4px;display:block}
.pbar-wrap{height:6px;background:rgba(255,255,255,.06);border-radius:100px;overflow:hidden;margin-top:6px}
.pbar{height:100%;border-radius:100px;transition:width 1.2s cubic-bezier(.16,1,.3,1)}

.page{position:relative;z-index:1;max-width:920px;margin:0 auto;padding:0 24px 100px}

@media(max-width:640px){
  .sgrid{grid-template-columns:repeat(4,1fr)}
  .page{padding:0 16px 80px}
  .timing-grid{grid-template-columns:1fr}
  .palm-scores{grid-template-columns:1fr 1fr}
}
`;

function StyleInject() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   PDF BUILDER
═══════════════════════════════════════════════════════════════ */
function buildPdfHtml(result, form) {
  const { name, platform, followers, subscribers, posts, videos, views, goal, zodiac, dob } = form;
  const now = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const chips = platform === "instagram"
    ? `<div class="chip"><div class="v">${Number(followers||0).toLocaleString()}</div><div class="l">Followers</div></div>
       <div class="chip"><div class="v">${Number(posts||0).toLocaleString()}</div><div class="l">Posts</div></div>`
    : `<div class="chip"><div class="v">${Number(subscribers||0).toLocaleString()}</div><div class="l">Subscribers</div></div>
       <div class="chip"><div class="v">${Number(videos||0).toLocaleString()}</div><div class="l">Videos</div></div>
       ${views ? `<div class="chip"><div class="v">${Number(views).toLocaleString()}</div><div class="l">Monthly Views</div></div>` : ""}`;

  const li = (arr) => (arr||[]).map((x,i) =>
    `<div class="li"><span class="num">${i+1}</span><span>${x}</span></div>`
  ).join("");

  const sched = (s) => {
    if (!s || typeof s !== "object") return "";
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    return `<div class="sg">${days.map(d => {
      const slots = s[d]||[];
      return `<div class="sd"><div class="dn">${d.slice(0,3).toUpperCase()}</div>
        ${slots.length ? slots.map(t=>`<div class="ss">${t}</div>`).join("") : `<div class="so">—</div>`}</div>`;
    }).join("")}</div>`;
  };

  const timingSection = (r) => {
    if (!r.good_timings?.length && !r.bad_timings?.length) return "";
    return `<div class="timing-wrap">
      ${r.good_timings?.length ? `<div class="tcol good"><div class="th">✅ Auspicious Times</div>${r.good_timings.map(t=>`<div class="tp g">🟢 ${t}</div>`).join("")}</div>` : ""}
      ${r.bad_timings?.length ? `<div class="tcol bad"><div class="th">⛔ Inauspicious Times</div>${r.bad_timings.map(t=>`<div class="tp b">🔴 ${t}</div>`).join("")}</div>` : ""}
    </div>`;
  };

  const monthPlan = (plan) => {
    if (!plan) return "";
    if (typeof plan === "string") return `<p>${plan}</p>`;
    const rt = (t) => typeof t === "object" && t!==null
      ? `${t.day?`<b>${t.day}:</b> `:""}${t.task||t.action||t.description||""}`
      : String(t);
    if (Array.isArray(plan)) {
      return plan.map((w,wi)=>`<div class="wk"><div class="wh">WEEK ${wi+1}</div><div class="wb">
        ${Array.isArray(w)?w.map(d=>`<div class="dr">${rt(d)}</div>`).join(""):`<div class="dr">${w}</div>`}
      </div></div>`).join("");
    }
    if (typeof plan === "object") {
      return Object.entries(plan).map(([k,v])=>`<div class="wk"><div class="wh">${k.replace(/_/g," ").toUpperCase()}</div><div class="wb">
        ${Array.isArray(v)?v.map(t=>`<div class="dr">${rt(t)}</div>`).join(""):`<div class="dr">${v}</div>`}
      </div></div>`).join("");
    }
    return "";
  };

  const sec = (title, body) => body ? `<div class="sec"><div class="st">${title}</div>${body}</div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AstroForge AI Blueprint — ${name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Manrope:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Manrope',sans-serif;background:#fff;color:#1a1a2e;
  font-size:13px;line-height:1.8;padding:52px 60px;position:relative;
}
/* diagonal watermark lines */
body::before{
  content:'';position:fixed;inset:0;
  background-image:repeating-linear-gradient(
    -45deg,transparent 0,transparent 60px,
    rgba(124,58,237,.026) 60px,rgba(124,58,237,.026) 62px
  );
  pointer-events:none;z-index:0;
}
/* large text watermark */
body::after{
  content:'AstroForge AI';
  position:fixed;top:50%;left:50%;
  transform:translate(-50%,-50%) rotate(-38deg);
  font-family:'DM Serif Display',serif;font-size:64px;
  color:rgba(124,58,237,.052);white-space:nowrap;
  pointer-events:none;z-index:0;letter-spacing:.14em;
}
.page{position:relative;z-index:1;max-width:720px;margin:0 auto}
.hdr{text-align:center;padding-bottom:28px;border-bottom:2.5px solid #7c3aed;margin-bottom:34px}
.brand{font-size:10px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#7c3aed;margin-bottom:10px}
.hdr h1{font-family:'DM Serif Display',serif;font-size:36px;color:#1a1a2e;margin-bottom:6px}
.hdr .meta{font-size:12px;color:#6b7280}
.chips{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:30px}
.chip{flex:1;min-width:100px;background:#f5f3ff;border:1px solid #ede9fe;border-radius:12px;padding:16px;text-align:center}
.chip .v{font-family:'DM Serif Display',serif;font-size:20px;color:#7c3aed;display:block}
.chip .l{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;margin-top:3px;display:block}
.sec{margin-bottom:28px}
.st{font-family:'DM Serif Display',serif;font-size:20px;color:#1a1a2e;padding-bottom:8px;border-bottom:1px solid #e5e7eb;margin-bottom:14px}
.sec p{color:#374151;margin-bottom:9px}
.li{display:flex;gap:10px;align-items:flex-start;padding:9px 13px;background:#f9fafb;border-radius:9px;margin-bottom:7px;border-left:3px solid #7c3aed}
.num{min-width:20px;height:20px;background:#7c3aed;color:#fff;font-size:10px;font-weight:800;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.timing-wrap{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}
.tcol{}
.th{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}
.tcol.good .th{color:#059669}
.tcol.bad  .th{color:#dc2626}
.tp{padding:7px 10px;border-radius:7px;font-size:12px;margin-bottom:5px;line-height:1.5}
.tp.g{background:#f0fdf4;border:1px solid #bbf7d0;color:#065f46}
.tp.b{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}
.sg{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:10px}
.sd{text-align:center}
.dn{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:5px}
.ss{background:#f3f0ff;border:1px solid #c4b5fd;border-radius:5px;padding:4px 3px;font-size:9px;font-weight:700;color:#7c3aed;margin-bottom:3px;text-align:center}
.so{height:26px;background:#f9fafb;border-radius:5px;display:flex;align-items:center;justify-content:center;color:#d1d5db}
.wk{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:12px}
.wh{background:#f3f0ff;padding:8px 14px;font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#7c3aed;border-bottom:1px solid #e5e7eb}
.wb{padding:12px 14px;display:flex;flex-direction:column;gap:7px}
.dr{font-size:12px;color:#374151;line-height:1.7;padding:3px 0;border-bottom:1px solid #f3f4f6}
.dr:last-child{border:none}
.palm-sec{background:#f5f3ff;border:1px solid #ede9fe;border-radius:12px;padding:20px;margin-top:10px}
.palm-sec h4{font-family:'DM Serif Display',serif;font-size:16px;color:#5b21b6;margin-bottom:10px}
.ftr{margin-top:44px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af;letter-spacing:.05em}
@media print{body{padding:36px 40px}.sec{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="brand">✦ AstroForge AI AI ✦</div>
    <h1>Growth Blueprint for ${name}</h1>
    <div class="meta">
      Platform: <strong>${platform.charAt(0).toUpperCase()+platform.slice(1)}</strong> &nbsp;·&nbsp;
      Zodiac: <strong>${zodiac}</strong> &nbsp;·&nbsp;
      DOB: <strong>${dob}</strong> &nbsp;·&nbsp;
      Generated: <strong>${now}</strong>
    </div>
  </div>

  <div class="chips">${chips}
    <div class="chip"><div class="v">${zodiac}</div><div class="l">Zodiac Sign</div></div>
  </div>

  ${sec("📊 Platform Assessment", result.platform_assessment ? `<p>${result.platform_assessment}</p>` : "")}
  ${sec("✅ What You Did Right", li(result.what_went_right))}
  ${sec("⚠️ Mistakes Made Until Now", li(result.what_went_wrong))}
  ${sec("🎯 Content Strategy", result.content_strategy ? `<p>${result.content_strategy}</p>` : "")}

  ${result.astro_zodiac_reading ? `<div class="sec"><div class="st">🔮 Astrologer's Reading — ${zodiac} Creator</div>
    ${result.astro_zodiac_reading.personality ? `<p><strong>Your Cosmic Creator Personality:</strong> ${result.astro_zodiac_reading.personality}</p>` : ""}
    ${(result.astro_zodiac_reading.good_timings?.length || result.astro_zodiac_reading.bad_timings?.length) ? `
    <div class="timing-wrap">
      ${result.astro_zodiac_reading.good_timings?.length ? `<div class="tcol good"><div class="th">✅ Auspicious Days & Times</div>${result.astro_zodiac_reading.good_timings.map(t=>`<div class="tp g">🟢 ${t}</div>`).join("")}</div>` : ""}
      ${result.astro_zodiac_reading.bad_timings?.length ? `<div class="tcol bad"><div class="th">⛔ Inauspicious Days & Times</div>${result.astro_zodiac_reading.bad_timings.map(t=>`<div class="tp b">🔴 ${t}</div>`).join("")}</div>` : ""}
    </div>` : ""}
    ${result.astro_zodiac_reading.monthly_forecast ? `<p style="margin-top:12px"><strong>Monthly Forecast:</strong> ${result.astro_zodiac_reading.monthly_forecast}</p>` : ""}
    ${result.astro_zodiac_reading.remedies?.length ? `<p style="margin-top:10px"><strong>Cosmic Remedies:</strong></p>${li(result.astro_zodiac_reading.remedies)}` : ""}
  </div>` : ""}

  ${result.palm_reading ? `<div class="sec"><div class="st">✋ Palm Reading Analysis</div>
    <div class="palm-sec">
      <h4>Your Palm Reveals</h4>
      ${result.palm_reading.overall_reading ? `<p>${result.palm_reading.overall_reading}</p>` : ""}
      ${result.palm_reading.difficulties?.length ? `<p style="margin-top:10px"><strong>Challenges Ahead:</strong></p>${li(result.palm_reading.difficulties)}` : ""}
      ${result.palm_reading.how_to_overcome?.length ? `<p style="margin-top:10px"><strong>How to Overcome:</strong></p>${li(result.palm_reading.how_to_overcome)}` : ""}
      ${result.palm_reading.creator_strengths?.length ? `<p style="margin-top:10px"><strong>Creator Strengths in Your Lines:</strong></p>${li(result.palm_reading.creator_strengths)}` : ""}
    </div>
  </div>` : ""}

  ${sec("📅 Best Days to Post", li(result.best_posting_days))}
  ${sec("⏰ Optimal Weekly Schedule", sched(result.posting_schedule))}
  ${sec("📆 Your 30-Day Action Plan", monthPlan(result.monthly_plan))}
  ${sec("📈 Growth Prediction", result.growth_prediction ? `<p>${result.growth_prediction}</p>` : "")}
  ${result.final_blessing ? sec("🌟 Final Cosmic Blessing", `<p><em>"${result.final_blessing}"</em></p>`) : ""}

  <div class="ftr">
    AstroForge AI &nbsp;·&nbsp; AI-Powered Creator Intelligence &nbsp;·&nbsp; ${new Date().getFullYear()}<br>
    Report prepared for <strong>${name}</strong> · This report is AI-generated for strategic and spiritual guidance. Results depend on individual effort and cosmic alignment.
  </div>
</div>
</body>
</html>`;
}

function triggerPDF(result, form) {
  const html = buildPdfHtml(result, form);
  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) win.addEventListener("load", () => setTimeout(() => win.print(), 700));
}

/* ═══════════════════════════════════════════════════════════════
   RESULT RENDERERS
═══════════════════════════════════════════════════════════════ */
const WEEK_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function RList({ items }) {
  return (
    <ul className="rlist">
      {(items||[]).map((item,i) => (
        <li key={i}><span className="ix">{i+1}</span><span>{item}</span></li>
      ))}
    </ul>
  );
}

function SchedGrid({ schedule }) {
  if (!schedule || typeof schedule !== "object") return null;
  return (
    <div className="sgrid">
      {WEEK_DAYS.map(day => {
        const slots = schedule[day] || [];
        return (
          <div className="sday" key={day}>
            <span className="sdn">{day.slice(0,3)}</span>
            {slots.length
              ? slots.map((s,i) => <div className="sslot" key={i}>{s}</div>)
              : <div className="soff">—</div>}
          </div>
        );
      })}
    </div>
  );
}

function MonthPlan({ plan }) {
  if (!plan) return null;
  const rt = (t, i) => {
    if (typeof t === "object" && t !== null) {
      return <div className="drow" key={i}>{t.day && <span className="dtag">{t.day}</span>}<span>{t.task||t.action||t.description||""}</span></div>;
    }
    return <div className="drow" key={i}><span>{t}</span></div>;
  };
  if (typeof plan === "string") return <p style={{fontSize:14.5,color:"var(--sub)",lineHeight:1.85}}>{plan}</p>;
  if (Array.isArray(plan)) return <>{plan.map((week,wi) => (
    <div className="wcard" key={wi}>
      <div className="whead">Week {wi+1}</div>
      <div className="wbody">{Array.isArray(week) ? week.map(rt) : <div className="drow"><span>{week}</span></div>}</div>
    </div>
  ))}</>;
  if (typeof plan === "object") return <>{Object.entries(plan).map(([key,value]) => (
    <div className="wcard" key={key}>
      <div className="whead">{key.replace(/_/g," ").toUpperCase()}</div>
      <div className="wbody">{Array.isArray(value) ? value.map(rt) : <div className="drow"><span>{value}</span></div>}</div>
    </div>
  ))}</>;
  return null;
}

function RSection({ icon, title, accentBar, delay=0, children }) {
  return (
    <div className="rsec" style={{"--ab":accentBar, animationDelay:`${delay}ms`}}>
      <h3><span style={{fontSize:24}}>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}

function TimingBlock({ good, bad }) {
  return (
    <div className="timing-grid">
      <div className="timing-col good">
        <h5>✅ Auspicious Days & Times</h5>
        {(good||[]).map((t,i) => (
          <div className="tpill g" key={i}><span className="dot"/>{t}</div>
        ))}
      </div>
      <div className="timing-col bad">
        <h5>⛔ Inauspicious Days & Times</h5>
        {(bad||[]).map((t,i) => (
          <div className="tpill b" key={i}><span className="dot"/>{t}</div>
        ))}
      </div>
    </div>
  );
}

function PalmSection({ palm }) {
  if (!palm) return null;
  const scores = [
    { label:"Creativity", val: palm.creativity_score||0, color:"#a78bfa" },
    { label:"Leadership",  val: palm.leadership_score||0,  color:"#ec4899" },
    { label:"Resilience",  val: palm.resilience_score||0,  color:"#22d3ee" },
  ];
  return (
    <>
      {scores.some(s=>s.val>0) && (
        <div className="palm-scores">
          {scores.map(s => (
            <div className="pscore" key={s.label}>
              <span className="pv" style={{color:s.color}}>{s.val}<span style={{fontSize:16}}>/100</span></span>
              <span className="pl">{s.label}</span>
              <div className="pbar-wrap">
                <div className="pbar" style={{width:`${s.val}%`, background:`linear-gradient(90deg,${s.color},${s.color}88)`}} />
              </div>
            </div>
          ))}
        </div>
      )}

      {palm.overall_reading && (
        <div className="astro-card" style={{marginBottom:16}}>
          <p style={{fontSize:14.5, color:"var(--sub)", lineHeight:1.9}}>{palm.overall_reading}</p>
        </div>
      )}

      {palm.difficulties?.length > 0 && (
        <>
          <h4 style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:"var(--red)",marginBottom:10,marginTop:4}}>
            ⚠️ Difficulties Your Palm Reveals
          </h4>
          <RList items={palm.difficulties} />
        </>
      )}

      {palm.how_to_overcome?.length > 0 && (
        <>
          <h4 style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:"var(--grn)",marginTop:20,marginBottom:10}}>
            💫 How to Overcome These Challenges
          </h4>
          <RList items={palm.how_to_overcome} />
        </>
      )}

      {palm.creator_strengths?.length > 0 && (
        <>
          <h4 style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:"var(--vlt)",marginTop:20,marginBottom:10}}>
            ✨ Creator Strengths in Your Lines
          </h4>
          <RList items={palm.creator_strengths} />
        </>
      )}
    </>
  );
}

function ResultView({ result, form }) {
  const { name, platform, followers, subscribers, posts, videos, views, zodiac } = form;
  const metricVal = platform==="instagram" ? followers : subscribers;
  const metricLbl = platform==="instagram" ? "Followers" : "Subscribers";
  const actVal    = platform==="instagram" ? posts : videos;
  const actLbl    = platform==="instagram" ? "Posts" : "Videos";

  const chips = [
    {v:Number(metricVal||0).toLocaleString(), l:metricLbl,  c:"var(--vlt)"},
    {v:Number(actVal||0).toLocaleString(),    l:actLbl,      c:"var(--cyn)"},
    ...(platform==="youtube"&&views ? [{v:Number(views).toLocaleString(), l:"Monthly Views", c:"var(--grn)"}] : []),
    {v:zodiac, l:"Zodiac Sign", c:"var(--pnk)"},
  ];

  const astro = result.astro_zodiac_reading;
  const palm  = result.palm_reading;

  return (
    <div style={{marginTop:44}}>
      {/* Stat chips */}
      <div className="schips" style={{marginBottom:32}}>
        {chips.map((c,i) => (
          <div className="schip" key={i}>
            <span className="sv" style={{color:c.c}}>{c.v}</span>
            <span className="sl">{c.l}</span>
          </div>
        ))}
      </div>

      {/* Platform Assessment */}
      {result.platform_assessment && (
        <RSection delay={0} icon="📊" title="Platform Assessment" accentBar="linear-gradient(90deg,#7c3aed,#a78bfa)">
          <p style={{fontSize:15,color:"var(--sub)",lineHeight:1.9}}>{result.platform_assessment}</p>
        </RSection>
      )}

      {/* What went right */}
      {result.what_went_right?.length > 0 && (
        <RSection delay={50} icon="✅" title="What You Did Right" accentBar="linear-gradient(90deg,#34d399,#22d3ee)">
          <RList items={result.what_went_right} />
        </RSection>
      )}

      {/* Mistakes */}
      {result.what_went_wrong?.length > 0 && (
        <RSection delay={100} icon="⚠️" title="Mistakes Made Until Now" accentBar="linear-gradient(90deg,#f87171,#fbbf24)">
          <RList items={result.what_went_wrong} />
        </RSection>
      )}

      {/* Content Strategy */}
      {result.content_strategy && (
        <RSection delay={150} icon="🎯" title="Content Strategy Going Forward" accentBar="linear-gradient(90deg,#22d3ee,#7c3aed)">
          <p style={{fontSize:15,color:"var(--sub)",lineHeight:1.95}}>{result.content_strategy}</p>
        </RSection>
      )}

      {/* ── ASTROLOGY SECTION ── */}
      {astro && (
        <RSection delay={200} icon="🔮" title={`Astrologer's Reading — ${zodiac} Creator`} accentBar="linear-gradient(90deg,#7c3aed,#ec4899)">

          {astro.personality && (
            <div className="astro-card">
              <h4>Your Cosmic Creator Personality</h4>
              <p style={{fontSize:14.5,color:"var(--sub)",lineHeight:1.95,fontStyle:"italic"}}>"{astro.personality}"</p>
            </div>
          )}

          {(astro.good_timings?.length > 0 || astro.bad_timings?.length > 0) && (
            <>
              <h4 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"var(--txt)",marginBottom:14,marginTop:4}}>
                ⏰ When to Post — According to Your Stars
              </h4>
              <TimingBlock good={astro.good_timings} bad={astro.bad_timings} />
            </>
          )}

          {(astro.good_days?.length > 0 || astro.bad_days?.length > 0) && (
            <>
              <h4 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"var(--txt)",marginBottom:14,marginTop:24}}>
                📅 Lucky & Unlucky Days for You
              </h4>
              <TimingBlock good={astro.good_days} bad={astro.bad_days} />
            </>
          )}

          {astro.monthly_forecast && (
            <div className="astro-card" style={{marginTop:20}}>
              <h4>🌙 Monthly Cosmic Forecast</h4>
              <p style={{fontSize:14.5,color:"var(--sub)",lineHeight:1.95}}>{astro.monthly_forecast}</p>
            </div>
          )}

          {astro.remedies?.length > 0 && (
            <>
              <h4 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"var(--amb)",marginBottom:12,marginTop:20}}>
                🪬 Cosmic Remedies & Rituals
              </h4>
              <RList items={astro.remedies} />
            </>
          )}
        </RSection>
      )}

      {/* ── PALM READING ── */}
      {palm && (
        <RSection delay={250} icon="✋" title="Palm Reading Analysis" accentBar="linear-gradient(90deg,#ec4899,#a78bfa)">
          <PalmSection palm={palm} />
        </RSection>
      )}

      {/* Best posting days */}
      {result.best_posting_days?.length > 0 && (
        <RSection delay={300} icon="📅" title="Best Days to Post" accentBar="linear-gradient(90deg,#fbbf24,#f59e0b)">
          <RList items={result.best_posting_days} />
        </RSection>
      )}

      {/* Schedule */}
      {result.posting_schedule && (
        <RSection delay={350} icon="⏰" title="Optimal Weekly Posting Schedule" accentBar="linear-gradient(90deg,#a78bfa,#ec4899)">
          <SchedGrid schedule={result.posting_schedule} />
        </RSection>
      )}

      {/* 30-Day Plan */}
      {result.monthly_plan && (
        <RSection delay={400} icon="📆" title="Your 30-Day Action Plan" accentBar="linear-gradient(90deg,#ec4899,#7c3aed)">
          <MonthPlan plan={result.monthly_plan} />
        </RSection>
      )}

      {/* Growth prediction */}
      {result.growth_prediction && (
        <RSection delay={450} icon="📈" title="Growth Prediction" accentBar="linear-gradient(90deg,#34d399,#22d3ee)">
          <p style={{fontSize:15,color:"var(--sub)",lineHeight:1.95}}>{result.growth_prediction}</p>
        </RSection>
      )}

      {/* Final blessing */}
      {result.final_blessing && (
        <RSection delay={500} icon="🌟" title={`The Stars Speak for ${name}`} accentBar="linear-gradient(90deg,#a78bfa,#fbbf24)">
          <p style={{
            fontFamily:"'DM Serif Display',serif",
            fontSize:20, lineHeight:1.95, color:"var(--sub)",
            fontStyle:"italic",
            background:"linear-gradient(135deg,rgba(124,58,237,.08),rgba(236,72,153,.06))",
            border:"1px solid rgba(124,58,237,.18)",
            borderRadius:14, padding:24,
          }}>
            "{result.final_blessing}"
          </p>
        </RSection>
      )}

      {/* PDF Download */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginTop:56}}>
        <button
          className="btn-prim glow"
          style={{fontSize:16,padding:"18px 54px",background:"linear-gradient(135deg,#7c3aed,#ec4899)"}}
          onClick={() => triggerPDF(result, form)}
        >
          ⬇️ &nbsp;Download Full Blueprint as PDF
        </button>
        <span style={{fontSize:12,color:"var(--mut)"}}>
          Opens print dialog → select "Save as PDF" &nbsp;·&nbsp; Includes watermark
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const ZODIACS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const ZE = {Aries:"♈",Taurus:"♉",Gemini:"♊",Cancer:"♋",Leo:"♌",Virgo:"♍",Libra:"♎",Scorpio:"♏",Sagittarius:"♐",Capricorn:"♑",Aquarius:"♒",Pisces:"♓"};

const PHASES = [
  "Reading your palm lines…",
  "Consulting the cosmic records…",
  "Analysing your zodiac energy…",
  "Building your growth blueprint…",
  "Mapping your 30-day journey…",
  "Aligning planetary influences…",
  "Weaving your cosmic report…",
];

export default function CreatorAnalyzer() {
  const [platform,    setPlatform]    = useState("instagram");
  const [name,        setName]        = useState("");
  const [followers,   setFollowers]   = useState("");
  const [posts,       setPosts]       = useState("");
  const [subscribers, setSubscribers] = useState("");
  const [videos,      setVideos]      = useState("");
  const [views,       setViews]       = useState("");
  const [goal,        setGoal]        = useState("");
  const [zodiac,      setZodiac]      = useState("");
  const [dob,         setDob]         = useState("");
  const [palmFile,    setPalmFile]    = useState(null);
  const [palmPreview, setPalmPreview] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [phaseIdx,    setPhaseIdx]    = useState(0);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState("");
  const [touched,     setTouched]     = useState({});
  const palmInputRef = useRef(null);
  const resultRef    = useRef(null);

  /* Phase ticker during loading */
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setPhaseIdx(p => (p+1) % PHASES.length), 2400);
    return () => clearInterval(iv);
  }, [loading]);

  /* Palm file → base64 preview */
  const handlePalmFile = (file) => {
    if (!file) return;
    setPalmFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPalmPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  /* Validation — ALL fields required */
  const platformValid = () => platform === "instagram"
    ? (followers.trim() !== "" && posts.trim() !== "")
    : (subscribers.trim() !== "" && videos.trim() !== "");

  const isValid = () =>
    name.trim() !== "" &&
    platformValid() &&
    goal.trim() !== "" &&
    zodiac !== "" &&
    dob !== "" &&
    palmFile !== null;

  const missingFields = () => {
    const m = [];
    if (!name.trim())     m.push("Full Name");
    if (!platformValid()) m.push(platform === "instagram" ? "Followers & Posts" : "Subscribers & Videos");
    if (!goal.trim())     m.push("Your Goal");
    if (!zodiac)          m.push("Zodiac Sign");
    if (!dob)             m.push("Date of Birth");
    if (!palmFile)        m.push("Palm Image");
    return m;
  };

  const handleSubmit = async () => {
    setTouched({name:true,platform:true,goal:true,zodiac:true,dob:true,palm:true});
    if (!isValid()) return;
    setError("");
    setResult(null);
    setLoading(true);
    setPhaseIdx(0);

    try {
      /* Build multipart form — palm image + JSON fields */
      const fd = new FormData();
      fd.append("palm_image", palmFile);
      fd.append("platform",    platform);
      fd.append("name",        name.trim());
      fd.append("goal",        goal.trim());
      fd.append("zodiac",      zodiac);
      fd.append("dob",         dob);
      if (platform === "instagram") {
        fd.append("followers", followers);
        fd.append("posts",     posts);
      } else {
        fd.append("subscribers", subscribers);
        fd.append("videos",      videos);
        if (views) fd.append("views", views);
      }

      const resp = await fetch("http://localhost:8000/creator-analysis", {
        method: "POST",
        body: fd,   // multipart — do NOT set Content-Type header manually
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${resp.status}`);
      }

      const data = await resp.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}), 150);
    } catch (e) {
      setError(e.message || "Could not reach backend. Make sure it is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  };

  const formSnap = { name, platform, followers, subscribers, posts, videos, views, goal, zodiac, dob };
  const missing  = touched.name ? missingFields() : [];

  const Step = ({num, title}) => (
    <div className="step-hdr">
      <span className="step-num">{num}</span>
      <span className="step-title">{title}</span>
    </div>
  );

  const Req = () => <span className="req">*</span>;

  /* ── RENDER ── */
  return (
    <>
      <StyleInject />
      <div className="page">

        {/* ── HERO ── */}
        <div style={{textAlign:"center",padding:"80px 0 56px",position:"relative"}}>
          <div style={{
            position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
            width:740,height:480,
            background:"radial-gradient(ellipse,rgba(124,58,237,.1) 0%,transparent 68%)",
            pointerEvents:"none",
          }}/>
          <div className="badge badge-v fadeUp" style={{marginBottom:22,cursor:"default"}}>
            ✦ AI · Astrology · Palm Reading · Creator Intelligence
          </div>
          <h1
            className="fadeUp d1"
            style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(38px,7vw,76px)",lineHeight:1.07,marginBottom:20}}
          >
            Your AstroForge AI
            <br/>
            <span style={{background:"linear-gradient(135deg,#a78bfa,#ec4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              Cosmic Blueprint
            </span>
          </h1>
          <p className="fadeUp d2" style={{color:"var(--sub)",fontSize:16,maxWidth:580,margin:"0 auto",lineHeight:1.8}}>
            Enter your platform stats, birth details, and palm image. Receive a deeply personalised analysis from an AI astrologer — your lucky timings, difficult periods, how to overcome them, and your complete 30-day plan.
          </p>
        </div>

        {/* ── FORM ── */}
        <div className="glass fadeUp d3" style={{padding:"44px 42px 40px"}}>

          {/* ─ Step 1: Personal Details ─ */}
          <Step num="1" title="Personal Details" />
          <div style={{marginBottom:30}}>
            <div>
              <label className="lbl">Full Name <Req/></label>
              <input
                className={`inp${touched.name&&!name.trim()?" err-bdr":""}`}
                type="text" placeholder="e.g. Rahul Sharma"
                value={name} onChange={e=>setName(e.target.value)}
                onBlur={()=>setTouched(t=>({...t,name:true}))}
              />
              {touched.name&&!name.trim()&&<div className="field-err">Name is required</div>}
            </div>
          </div>

          <div className="divider"/>

          {/* ─ Step 2: Platform ─ */}
          <Step num="2" title="Your Platform" />
          <div style={{marginBottom:30}}>
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              {[{id:"instagram",label:"Instagram",icon:"📸"},{id:"youtube",label:"YouTube",icon:"▶️"}].map(p=>(
                <button
                  key={p.id}
                  className={`plat${platform===p.id?" on":""}`}
                  onClick={()=>{setPlatform(p.id);setResult(null);setError("");}}
                >
                  <span className="ic">{p.icon}</span>{p.label}
                </button>
              ))}
            </div>

            {platform==="instagram" ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <label className="lbl">Followers <Req/></label>
                  <input className="inp" type="number" min="0" placeholder="e.g. 25000"
                    value={followers} onChange={e=>setFollowers(e.target.value)}/>
                </div>
                <div>
                  <label className="lbl">Total Posts <Req/></label>
                  <input className="inp" type="number" min="0" placeholder="e.g. 120"
                    value={posts} onChange={e=>setPosts(e.target.value)}/>
                </div>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                <div>
                  <label className="lbl">Subscribers <Req/></label>
                  <input className="inp" type="number" min="0" placeholder="e.g. 15000"
                    value={subscribers} onChange={e=>setSubscribers(e.target.value)}/>
                </div>
                <div>
                  <label className="lbl">Total Videos <Req/></label>
                  <input className="inp" type="number" min="0" placeholder="e.g. 80"
                    value={videos} onChange={e=>setVideos(e.target.value)}/>
                </div>
                <div>
                  <label className="lbl">Monthly Views</label>
                  <input className="inp" type="number" min="0" placeholder="e.g. 500000"
                    value={views} onChange={e=>setViews(e.target.value)}/>
                </div>
              </div>
            )}
          </div>

          <div className="divider"/>

          {/* ─ Step 3: Goal ─ */}
          <Step num="3" title="Your Goal" />
          <div style={{marginBottom:30}}>
            <label className="lbl">What do you want to achieve? Be specific. <Req/></label>
            <textarea
              className={`inp${touched.name&&!goal.trim()?" err-bdr":""}`}
              placeholder={platform==="instagram"
                ?"e.g. Reach 100K followers in 3 months and land fitness brand deals"
                :"e.g. Hit 100K subscribers in 6 months and monetise through AdSense"}
              value={goal} onChange={e=>setGoal(e.target.value)}
            />
            {touched.name&&!goal.trim()&&<div className="field-err">Goal is required</div>}
          </div>

          <div className="divider"/>

          {/* ─ Step 4: Astrology — REQUIRED ─ */}
          <Step num="4" title="Astrology Details — Required" />
          <p style={{fontSize:13,color:"var(--mut)",marginBottom:18,lineHeight:1.65}}>
            Your zodiac sign and birth date are used to generate your personalised cosmic timing analysis — lucky days, inauspicious windows, planetary influences on your creative energy, and monthly forecasts specific to you.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:30}}>
            <div>
              <label className="lbl">Zodiac Sign <Req/></label>
              <select
                className={`inp${touched.name&&!zodiac?" err-bdr":""}`}
                value={zodiac} onChange={e=>setZodiac(e.target.value)}
              >
                <option value="">— Select your zodiac sign —</option>
                {ZODIACS.map(z=><option key={z} value={z}>{ZE[z]} {z}</option>)}
              </select>
              {touched.name&&!zodiac&&<div className="field-err">Zodiac sign is required</div>}
            </div>
            <div>
              <label className="lbl">Date of Birth <Req/></label>
              <input
                className={`inp${touched.name&&!dob?" err-bdr":""}`}
                type="date" value={dob} onChange={e=>setDob(e.target.value)}
              />
              {touched.name&&!dob&&<div className="field-err">Date of birth is required</div>}
            </div>
          </div>

          <div className="divider"/>

          {/* ─ Step 5: Palm Image — REQUIRED ─ */}
          <Step num="5" title="Palm Reading — Required" />
          <p style={{fontSize:13,color:"var(--mut)",marginBottom:18,lineHeight:1.65}}>
            Upload a clear photo of your dominant hand's palm (flat, well-lit). The AI will analyse your life line, heart line, head line, fate line, and mount elevations to reveal your creator potential, challenges ahead, and how to overcome them.
          </p>

          <div
            className={`palm-drop${palmFile?" has-file":""}`}
            onClick={()=>palmInputRef.current?.click()}
            onDragOver={e=>{e.preventDefault();}}
            onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f&&f.type.startsWith("image/"))handlePalmFile(f);}}
            style={{marginBottom:16,borderColor:touched.name&&!palmFile?"rgba(248,113,113,.5)":undefined}}
          >
            {palmFile && palmPreview ? (
              <div style={{display:"flex",alignItems:"center",gap:20}}>
                <img src={palmPreview} alt="palm preview"
                  style={{width:90,height:90,borderRadius:12,objectFit:"cover",border:"2px solid rgba(124,58,237,.3)"}}/>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:14,color:"var(--vlt)",fontWeight:700,marginBottom:4}}>✅ {palmFile.name}</div>
                  <div style={{fontSize:12,color:"var(--mut)"}}>{(palmFile.size/1024).toFixed(0)} KB · Click to change</div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:44,marginBottom:12,animation:"cosmicPulse 3s ease-in-out infinite",display:"inline-block"}}>✋</div>
                <div style={{fontSize:15,color:"var(--sub)",fontWeight:600,marginBottom:4}}>Click or drag your palm image here</div>
                <div style={{fontSize:12,color:"var(--mut)"}}>JPG · PNG · WEBP · Max 10MB · Well-lit, flat palm</div>
              </div>
            )}
          </div>
          <input
            ref={palmInputRef}
            type="file" accept="image/*" style={{display:"none"}}
            onChange={e=>{if(e.target.files[0])handlePalmFile(e.target.files[0]);}}
          />
          {touched.name&&!palmFile&&<div className="field-err" style={{marginBottom:16}}>Palm image is required for reading</div>}

          {/* Missing fields summary */}
          {touched.name && missing.length > 0 && (
            <div className="errbox" style={{marginBottom:20}}>
              <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
              <span>Please complete: <strong>{missing.join(", ")}</strong></span>
            </div>
          )}

          {/* API Error */}
          {error && (
            <div className="errbox" style={{marginBottom:20}}>
              <span style={{fontSize:16,flexShrink:0}}>❌</span>
              <span>{error}</span>
            </div>
          )}

          {/* CTA */}
          <button
            className={`btn-prim${!loading?" glow":""}`}
            style={{width:"100%",fontSize:16,padding:"18px"}}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><div className="spinner"/><span style={{animation:"blink 2.4s ease infinite"}}>{PHASES[phaseIdx]}</span></>
              : "🔮 Generate My Cosmic Creator Blueprint"
            }
          </button>

          {!isValid()&&!loading&&!touched.name&&(
            <p style={{textAlign:"center",fontSize:12,color:"var(--mut)",marginTop:10}}>
              All 5 steps required — name, stats, goal, zodiac + DOB, and palm image
            </p>
          )}
        </div>

        {/* ── SKELETONS ── */}
        {loading && (
          <div style={{marginTop:38,display:"flex",flexDirection:"column",gap:18}}>
            {[200,280,220,380,440,200].map((h,i)=>(
              <div key={i} className="skel" style={{height:h,animationDelay:`${i*110}ms`}}/>
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {result&&!loading&&(
          <div ref={resultRef}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginTop:60,marginBottom:4}}>
              <span className="badge badge-g">✓ Cosmic Analysis Complete</span>
              <span style={{fontSize:12,color:"var(--mut)"}}>
                Prepared for {name} · {new Date().toLocaleDateString("en-IN")}
              </span>
            </div>
            <ResultView result={result} form={formSnap}/>
          </div>
        )}

      </div>
    </>
  );
}
