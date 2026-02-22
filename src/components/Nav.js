// src/components/Nav.js (already provided, ensuring export)
const NAV_ITEMS = [
  { id: "landing", label: "Home" },
  { id: "analyze", label: "Analyze" },
  { id: "charts", label: "Charts" },
  { id: "astrology", label: "Astrology" },
  { id: "goals", label: "Goals" },
  { id: "insights", label: "Insights" },
];

export default function Nav({ page, setPage }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("landing")} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer" }}>AstroForge AI</div>
      <div className="nav-links">
        {NAV_ITEMS.map(n => (
          <button key={n.id} className={`nav-link ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14 }}>{n.label}</button>
        ))}
        <button className="btn-primary" style={{ padding: "8px 18px", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 600 }} onClick={() => setPage("analyze")}>
          Analyze Now
        </button>
      </div>
    </nav>
  );
}