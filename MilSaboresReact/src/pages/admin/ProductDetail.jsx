import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import seed from "../../data/tortas.json";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");
const SOURCES = ["tortas_v1", "PRODUCTS", "productos", "productosMilSabores"];

const norm = (v) => String(v ?? "").trim().toLowerCase();

function getAnyParam(obj) {
  if (!obj) return "";
  const keys = ["codigo", "id", "sku", "code", "slug", "param"]; 
  for (const k of keys) if (obj[k] != null) return String(obj[k]);
  const dynamic = Object.values(obj)[0];
  return dynamic != null ? String(dynamic) : "";
}

function getIdCandidates(p) {
  return [p?.codigo, p?.id, p?.sku, p?.code, p?.slug, p?.nombre].filter(Boolean);
}

export default function ProductDetail() {
  const params = useParams();
  const rawParam = getAnyParam(params);
  const searchKey = norm(decodeURIComponent(rawParam));
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loadedFrom, setLoadedFrom] = useState(null);

  function loadAll() {
    const all = [];
    let first = null;
    for (const key of SOURCES) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          all.push(...arr);
          if (!first) first = key;
        }
      } catch {}
    }
    if (all.length) {
      setLoadedFrom(first);
      return all;
    }
    setLoadedFrom("tortas.json");
    return Array.isArray(seed) ? seed.slice() : [];
  }

  function findFlexible(items, param) {
    if (!Array.isArray(items) || !param) return null;

    const exact = items.find((p) => getIdCandidates(p).some((v) => norm(v) === param));
    if (exact) return exact;

    const partial = items.find((p) => norm(p?.nombre).includes(param));
    if (partial) return partial;

    return null;
  }

  useEffect(() => {
    const items = loadAll();
    const found = findFlexible(items, searchKey);
    setProduct(found);
  }, [searchKey]);

  const isCritical = useMemo(() => {
    if (!product) return false;
    const stock = Number(product.stock ?? 0);
    const min = Number(product.minStock ?? 5);
    return stock <= min;
  }, [product]);

  if (!product) {
    return (
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Detalle de producto</h2>
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>

        <div className="alert alert-danger">
          <strong>Producto no encontrado.</strong> Verifica la URL o vuelve al listado.
        </div>
        <div className="text-muted small">
          Buscado por: <code>{decodeURIComponent(rawParam || "") || "(vacío)"}</code> ·
          Fuentes probadas: <code>{SOURCES.join(", ")}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="m-0">{product.nombre || "Producto"}</h2>
          <small className="text-muted">
            ID:{" "}
            <code>
              {product.codigo ?? product.id ?? product.sku ?? product.code ?? product.slug ?? "—"}
            </code>
          </small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-5">
          <div className="card h-100">
            <div className="ratio ratio-4x3">
              <img
                src={product.imagen || "/img/placeholder-cake.png"}
                alt={product.nombre || product.codigo}
                className="card-img-top object-fit-cover"
              />
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary">
                  {product.categoria || "Sin categoría"}
                </span>
                <span className={`badge ${isCritical ? "bg-danger" : "bg-success"}`}>
                  {isCritical ? "Stock crítico" : "Stock OK"}
                </span>
                {product?.activo === false && (
                  <span className="badge bg-warning text-dark">Inactivo</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Información</h5>
              <div className="row g-3">
                <div className="col-6">
                  <div className="text-muted small">Precio</div>
                  <div className="fw-semibold fs-5">{CLP(product.precio)}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Stock</div>
                  <div className="fw-semibold fs-5">
                    {Number(product.stock ?? 0)}
                    {product?.minStock != null && (
                      <span className="text-muted small ms-2">
                        (mín. {Number(product.minStock)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-6">
                  <div className="text-muted small">Estado</div>
                  <div className="fw-semibold">
                    {product?.activo === false ? "Inactivo" : "Activo"}
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Categoría</div>
                  <div className="fw-semibold">{product.categoria || "—"}</div>
                </div>

                {product?.peso && (
                  <div className="col-6">
                    <div className="text-muted small">Peso</div>
                    <div className="fw-semibold">{product.peso}</div>
                  </div>
                )}
                {product?.unidad && (
                  <div className="col-6">
                    <div className="text-muted small">Unidad</div>
                    <div className="fw-semibold">{product.unidad}</div>
                  </div>
                )}

                <div className="col-6">
                  <div className="text-muted small">Creado</div>
                  <div className="fw-semibold">
                    {product.creadoEn
                      ? new Date(product.creadoEn).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Actualizado</div>
                  <div className="fw-semibold">
                    {product.actualizadoEn
                      ? new Date(product.actualizadoEn).toLocaleString()
                      : "—"}
                  </div>
                </div>

                <div className="col-12">
                  <div className="text-muted small mb-1">Descripción</div>
                  <div>{product.descripcion || "Sin descripción."}</div>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
}
