export default function ErrorBox({ message }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "16px 20px", color: "#fca5a5", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}