export default function AIThinking() {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", animation: `pulse 1.5s ${i * 0.15}s ease-in-out infinite` }} />
        ))}
      </div>
      <p style={{ color: "#6b7280", fontSize: 13 }}>AI is analyzing your profile…</p>
      <p style={{ color: "#4b5563", fontSize: 12, marginTop: 4 }}>This usually takes 5-15 seconds</p>
    </div>
  );
}