import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import dataFallback from "../../data/tortas.json"; // respaldo si no hay localStorage

// ---- Helpers ----
const formatCLP = (n) =>
  (parseInt(n, 10) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

function readProducts() {
  // intenta distintas llaves comunes
  const keys = ["PRODUCTS", "productos", "productosMilSabores"];
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      } catch (e) {
        // ignore
      }
    }
  }
  return Array.isArray(dataFallback) ? dataFallback : [];
}

function isCritical(p) {
  const crit = typeof p.minStock === "number" ? p.minStock : 5;
  return (p.stock ?? 0) <= crit;
}

export default function ProductDetail() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => {
    const products = readProducts();
    // Buscar por codigo, id o slug
    return (
      products.find((p) => String(p.codigo) === String(codigo)) ||
      products.find((p) => String(p.id) === String(codigo)) ||
      products.find((p) => String(p.slug) === String(codigo)) ||
      null
    );
  }, [codigo]);

  if (!product) {
    return (
      <div className="admin-content">
        <div className="card">
          <div className="card-header">
            <strong>Producto no encontrado</strong>
            <div className="admin-actions">
              <button className="btn-admin" onClick={() => navigate(-1)}>Volver</button>
              <Link className="btn-admin btn-primary" to="/admin/products">Ir a Productos</Link>
            </div>
          </div>
          <div className="card-body">
            <p className="muted">
              No encontramos un producto con el identificador <code>{codigo}</code>. Revisa el enlace o vuelve a la
              lista.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    nombre,
    descripcion,
    categoria,
    precio,
    stock,
    imagen,
    codigo: cod,
    id,
    minStock,
    creadoEn,
    actualizadoEn,
    activo = true,
    peso,
    unidad,
  } = product;

  return (
    <div className="admin-content">
      {/* Encabezado */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div>
            <div className="section-title">{nombre || "Producto"}</div>
            <div className="muted">
              Código: <strong>{cod ?? id}</strong> {categoria ? <>• Categoría: <strong>{categoria}</strong></> : null}
            </div>
          </div>
          <div className="admin-actions">
            <button className="btn-admin" onClick={() => navigate(-1)}>Volver</button>
            <Link className="btn-admin" to="/admin/products">Listado</Link>
            <Link className="btn-admin btn-primary" to={`/admin/products/${cod ?? id}/edit`}>
              Editar
            </Link>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="card-body">
          <div className="form-grid">
            {/* Col izquierda: imagen */}
            <div className="form-col-6">
              <div className="card" style={{ overflow: "hidden" }}>
                <div className="card-body" style={{ display: "grid", placeItems: "center" }}>
                  <img
                    src={imagen || "/img/placeholder-cake.png"}
                    alt={nombre}
                    style={{ maxWidth: "100%", borderRadius: 12, objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder-cake.png";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Col derecha: datos */}
            <div className="form-col-6">
              <div className="table-wrap">
                <table className="table">
                  <tbody>
                    <tr>
                      <th style={{ width: 220 }}>Precio</th>
                      <td>{formatCLP(precio)}</td>
                    </tr>
                    <tr>
                      <th>Stock</th>
                      <td>
                        {stock}{" "}
                        {isCritical(product) ? (
                          <span className="badge danger">Crítico{typeof minStock === "number" ? ` (≤ ${minStock})` : ""}</span>
                        ) : (
                          <span className="badge success">OK</span>
                        )}
                      </td>
                    </tr>
                    {peso ? (
                      <tr>
                        <th>Peso</th>
                        <td>
                          {peso} {unidad || "kg"}
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <th>Estado</th>
                      <td>
                        {activo ? <span className="badge success">Activo</span> : <span className="badge warn">Inactivo</span>}
                      </td>
                    </tr>
                    {creadoEn ? (
                      <tr>
                        <th>Creado</th>
                        <td>{new Date(creadoEn).toLocaleString("es-CL")}</td>
                      </tr>
                    ) : null}
                    {actualizadoEn ? (
                      <tr>
                        <th>Actualizado</th>
                        <td>{new Date(actualizadoEn).toLocaleString("es-CL")}</td>
                      </tr>
                    ) : null}
                    {typeof minStock === "number" ? (
                      <tr>
                        <th>Stock mínimo</th>
                        <td>{minStock}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {descripcion ? (
                <>
                  <div className="spacer" />
                  <div className="card">
                    <div className="card-header"><strong>Descripción</strong></div>
                    <div className="card-body">
                      <p style={{ margin: 0 }}>{descripcion}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="quick-tiles">
        <Link className="tile" to={`/admin/products/${cod ?? id}/edit`}>Editar producto</Link>
        <Link className="tile" to="/admin/products">Volver al listado</Link>
        <Link className="tile" to="/admin/products/critical">Ver productos críticos</Link>
      </div>
    </div>
  );
}
