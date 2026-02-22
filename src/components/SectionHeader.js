// src/components/SectionHeader.js (already provided, ensuring export)
export default function SectionHeader({ eyebrow, title, sub, center = false }) {
  return (
    <div style={{ marginBottom: 40, textAlign: center ? "center" : "left" }}>
      {eyebrow && <div className="badge badge-violet" style={{ marginBottom: 12 }}>{eyebrow}</div>}
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub" style={{ margin: center ? "8px auto 0" : "8px 0 0" }}>{sub}</p>}
    </div>
  );
}