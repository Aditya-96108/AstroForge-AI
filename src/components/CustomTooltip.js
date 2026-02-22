export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}