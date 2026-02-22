// src/components/LoadingSpinner.js (corrected with className for spinner)
export default function LoadingSpinner({ size = 20, label = "Loading..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: size, height: size, border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <span style={{ color: "#6b7280", fontSize: 13 }}>{label}</span>
    </div>
  );
}