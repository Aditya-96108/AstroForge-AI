// src/components/MetricCard.js (already provided, but ensuring export)
export default function MetricCard({ label, value, sub, color = "#a78bfa", icon }) {
  return (
    <div className="metric-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span className="badge badge-violet" style={{ fontSize: 11 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Syne', sans-serif", color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}