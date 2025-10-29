import React from "react";


export default function KPIStat({ label, value, subLabel, icon, color }) {
  return (
    <div className={`kpi ${color ? `kpi-${color}` : ""}`}>
      <div className="kpi-header" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {icon ? <span style={{ fontSize: "1.4rem" }}>{icon}</span> : null}
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {subLabel ? <div className="muted" style={{ fontSize: "0.85rem" }}>{subLabel}</div> : null}
    </div>
  );
}
