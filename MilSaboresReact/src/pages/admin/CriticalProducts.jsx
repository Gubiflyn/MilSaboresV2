import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dataFallback from "../../data/tortas.json";

/* ===== Helpers de almacenamiento ===== */
const STORAGE_KEYS = ["PRODUCTS", "productos", "productosMilSabores"];

function readProducts() {
  for (const k of STORAGE_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      } catch {
        /* ignore */
      }
    }
  }
  return Array.isArray(dataFallback) ? dataFallback : [];
}

const formatCLP = (n) =>
  (parseInt(n, 10) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

/* ===== Lógica de “crítico” =====
   - Si el producto tiene minStock numérico: stock <= minStock
   - Si NO tiene minStock: stock <= thresholdGlobal
*/
function isCritical(product, thresholdGlobal) {
  const ms =
    typeof product.minStock === "number" && !Number.isNaN(product.minStock)
      ? product.minStock
      : thresholdGlobal;
  const st = Number(product.stock ?? 0);
  return st <= Number(ms ?? 5);
}

export default function CriticalProducts() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState(5); // umbral global por defecto
  const [onlyActive, setOnlyActive] = useState(false);

  const products = useMemo(() => readProducts(), []);
  const critical = useMemo(() => {
    const base = products.filter((p) => isCritical(p, threshold));
    const filtered =
      query.trim().length === 0
        ? base
        : base.filter((p) => {
            const q = query.toLowerCase();
            return (
              String(p.codigo ?? p.id ?? "")
                .toLowerCase()
                .includes(q) ||
              String(p.nombre ?? "").toLowerCase().includes(q) ||
              String(p.categoria ?? "").toLowerCase().includes(q)
            );
          });

    const afterActive = onlyActive ? filtered.filter((p) => p.activo !== false) : filtered;

    // Ordenar por stock asc (más críticos primero), empate por minStock desc y nombre asc
    return [...afterActive].sort((a, b) => {
      const sa = Number(a.stock ?? 0);
      const sb = Number(b.stock ?? 0);
      if (sa !== sb) return sa - sb;
      const ma = Number(
        typeof a.minStock === "number" ? a.minStock : Number.NEGATIVE_INFINITY
      );
      const mb = Number(
        typeof b.minStock === "number" ? b.minStock : Number.NEGATIVE_INFINITY
      );
      if (ma !== mb) return mb - ma;
      return String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""));
    });
  }, [products, query, threshold, onlyActive]);

  const totalCriticos = critical.length;

  return (
    <div className="admin-content">
      {/* Encabezado */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div>
            <div className="section-title">Productos críticos</div>
            <div className="muted">
              Se muestran productos con stock <strong>≤ mínimo</strong>. Si no tienen mínimo definido,
              se usa umbral global&nbsp;
              <strong>{threshold}</strong>.
            </div>
          </div>
          <div className="admin-actions">
            <button className="btn-admin" onClick={() => navigate(-1)}>Volver</button>
            <Link className="btn-admin" to="/admin/products">Listado de productos</Link>
          </div>
        </div>

        <div className="card-body">
          {/* Toolbar / filtros */}
          <div className="toolbar">
            <input
              className="input"
              placeholder="Buscar por código, nombre o categoría..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <label className="label" htmlFor="threshold" style={{ margin: 0 }}>
                Umbral global
              </label>
              <input
                id="threshold"
                className="input"
                type="number"
                min={0}
                value={threshold}
                onChange={(e) => setThreshold(Math.max(0, Number(e.target.value || 0)))}
                style={{ width: 110 }}
              />
            </div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              Solo activos
            </label>
            <span className="badge info">Críticos: {totalCriticos}</span>
          </div>

          {/* Tabla */}
          {totalCriticos === 0 ? (
            <div className="card" style={{ marginTop: 10 }}>
              <div className="card-body">
                <p className="muted" style={{ marginBottom: 10 }}>
                  No hay productos críticos con los filtros actuales.
                </p>
                <div className="quick-tiles">
                  <Link className="tile" to="/admin/products">Volver a productos</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 110 }}>Código</th>
                    <th>Nombre</th>
                    <th style={{ width: 150 }}>Categoría</th>
                    <th style={{ width: 90 }}>Stock</th>
                    <th style={{ width: 110 }}>Mínimo</th>
                    <th style={{ width: 120 }}>Precio</th>
                    <th style={{ width: 110 }}>Estado</th>
                    <th style={{ width: 190 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {critical.map((p) => {
                    const code = p.codigo ?? p.id;
                    const min =
                      typeof p.minStock === "number" && !Number.isNaN(p.minStock)
                        ? p.minStock
                        : threshold;
                    const activo = p.activo !== false;
                    return (
                      <tr key={`crit-${code}`}>
                        <td><code>{code}</code></td>
                        <td>{p.nombre}</td>
                        <td>{p.categoria || "-"}</td>
                        <td>
                          {p.stock ?? 0}{" "}
                          {Number(p.stock ?? 0) <= Number(min) ? (
                            <span className="badge danger">Crítico</span>
                          ) : (
                            <span className="badge success">OK</span>
                          )}
                        </td>
                        <td>{min}</td>
                        <td>{formatCLP(p.precio)}</td>
                        <td>
                          {activo ? (
                            <span className="badge success">Activo</span>
                          ) : (
                            <span className="badge warn">Inactivo</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <Link className="btn-admin" to={`/admin/products/${code}`}>Detalle</Link>
                            <Link className="btn-admin btn-primary" to={`/admin/products/${code}/edit`}>
                              Editar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="quick-tiles">
        <Link className="tile" to="/admin/products">Volver al listado</Link>
        <Link className="tile" to="/admin/reports">Ver reportes</Link>
      </div>
    </div>
  );
}

