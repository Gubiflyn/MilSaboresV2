import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import tortasSeed from "../../data/tortas.json";

const LS_TORTAS = "productos";
const CRITICAL_STOCK = 3;

export default function Products() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState(""); // ← búsqueda

  // ✅ CARGA INICIAL (semilla o datos guardados)
  useEffect(() => {
    const dataLS = JSON.parse(localStorage.getItem(LS_TORTAS) || "null");
    const base = Array.isArray(dataLS) && dataLS.length > 0 ? dataLS : tortasSeed;

    const listaConStock = base.map((p) => ({
      ...p,
      stock:
        p.stock !== undefined
          ? p.stock
          : Math.floor(Math.random() * 16) + 5, // 5–20 si no trae stock
    }));

    setList(listaConStock);
  }, []);

  // ✅ PERSISTENCIA
  useEffect(() => {
    try {
      localStorage.setItem(LS_TORTAS, JSON.stringify(list));
    } catch {}
  }, [list]);

  // 🔎 Filtro por nombre o código (case-insensitive, trim)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((p) => {
      const nombre = String(p.nombre || "").toLowerCase();
      const codigo = String(p.codigo || "").toLowerCase();
      return nombre.includes(term) || codigo.includes(term);
    });
  }, [list, q]);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="m-0">Productos</h2>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* 🔎 Buscador */}
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Buscar por nombre o código..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQ("")}
                type="button"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* ➕ Nuevo producto */}
          <Link to="/admin/productos/nuevo" className="btn btn-primary">
            Nuevo producto
          </Link>
        </div>
      </div>

      {/* Info de conteo */}
      <div className="text-muted small mb-2">
        Mostrando {filtered.length} de {list.length} productos
        {" · "}
        <span>Crítico ≤ {CRITICAL_STOCK}</span>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="alert alert-warning">
          No hay resultados para <strong>{q}</strong>.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Código</th>
                <th>Nombre</th>
                <th style={{ width: 140 }}>Precio</th>
                <th style={{ width: 120 }}>Stock</th>
                <th style={{ width: 120 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const esCritico = Number(p.stock) <= CRITICAL_STOCK;
                return (
                  <tr key={p.codigo} className={esCritico ? "table-danger" : ""}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>${Number(p.precio).toLocaleString()}</td>
                    <td>{p.stock}</td>
                    <td>{esCritico && <span className="badge bg-danger">Crítico</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Nota */}
      <div className="text-muted small mt-2">
        * Los datos se guardan en <code>localStorage</code> con la clave <code>{LS_TORTAS}</code>.
      </div>
    </div>
  );
}
