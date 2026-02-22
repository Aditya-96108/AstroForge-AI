// src/components/Skeleton.js (already provided, ensuring export)
export default function Skeleton({ w = "100%", h = 20, r = 8 }) {
  return (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />
  );
}