import React from "react";
import { Link } from "react-router-dom";


export default function QuickTiles({ tiles = [] }) {
  if (!tiles.length) return null;

  return (
    <div className="quick-tiles">
      {tiles.map((t, idx) => (
        <Link key={idx} className="tile" to={t.to}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {t.icon ? <span style={{ fontSize: "1.3rem" }}>{t.icon}</span> : null}
            <span>{t.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
