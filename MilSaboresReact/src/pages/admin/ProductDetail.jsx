import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPastelByCodigo, getPasteles } from "../../services/api";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function ProductDetail() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        let p = null;

        if (codigo) {
          try {
            // intento directo por código
            p = await getPastelByCodigo(codigo);
          } catch {
            // fallback: buscar en toda la lista
            const all = await getPasteles();
            p =
              (all || []).find(
                (x) =>
                  String(x.codigo ?? "").toLowerCase() ===
                    String(codigo).toLowerCase() ||
                  String(x.id ?? "").toLowerCase() ===
                    String(codigo).toLowerCase()
              ) || null;
          }
        }

        if (!p) {
          setError("Producto no encontrado");
        } else {
          setProduct({
            ...p,
            categoria:
              typeof p.categoria === "string"
                ? p.categoria
                : p.categoria?.nombre || "",
          });
        }
      } catch (e) {
        console.error(e);
        setError("Error al cargar el producto desde la API.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [codigo]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Detalle de producto</h1>
        </div>
        <p className="text-muted">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Detalle de producto</h1>
        </div>
        <div className="alert alert-danger mb-3">
          {error || "Sin datos"}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/productos")}
        >
          Volver al listado
        </button>
      </div>
    );
  }

  // === Datos derivados para la vista ===
  const stockNumber = Number(product.stock ?? 0);
  const isCritical = !Number.isNaN(stockNumber) && stockNumber <= 5;

  const estado = product.activo === false ? "Inactivo" : "Activo";
  const creado =
    product.createdAt ||
    product.fechaCreacion ||
    product.creado ||
    null;
  const actualizado =
    product.updatedAt ||
    product.fechaActualizacion ||
    product.actualizado ||
    null;

  const creadoLabel = creado || "—";
  const actualizadoLabel = actualizado || "—";

  return (
    <div className="admin-page">
      {/* Header como en el diseño: título a la izquierda, volver a la derecha */}
      <div className="admin-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="mb-1">{product.nombre}</h1>
          <div className="text-muted small">
            ID: {product.codigo || "—"}
          </div>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/admin/productos")}
        >
          ← Volver
        </button>
      </div>

      <div className="admin-body">
        <div className="row g-4">
          {/* Columna izquierda: imagen + badges */}
          <div className="col-lg-6">
            <div className="card h-100">
              {product.imagen && (
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="card-img-top"
                />
              )}

              <div className="card-body d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2 flex-wrap">
                  {product.categoria && (
                    <span className="badge rounded-pill bg-light text-dark border">
                      {product.categoria}
                    </span>
                  )}

                  <span
                    className={
                      "badge rounded-pill " +
                      (isCritical ? "bg-danger" : "bg-success")
                    }
                  >
                    {isCritical ? "Stock crítico" : "Stock OK"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: tarjeta de información */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <strong>Información</strong>
              </div>
              <div className="card-body">
                {/* Precio / Stock */}
                <div className="row mb-3">
                  <div className="col-6">
                    <div className="fw-semibold small text-muted">
                      Precio
                    </div>
                    <div>{CLP(product.precio)}</div>
                  </div>
                  <div className="col-6">
                    <div className="fw-semibold small text-muted">
                      Stock
                    </div>
                    <div>{product.stock ?? 0}</div>
                  </div>
                </div>

                {/* Estado / Categoría */}
                <div className="row mb-3">
                  <div className="col-6">
                    <div className="fw-semibold small text-muted">
                      Estado
                    </div>
                    <div>{estado}</div>
                  </div>
                  <div className="col-6">
                    <div className="fw-semibold small text-muted">
                      Categoría
                    </div>
                    <div>{product.categoria || "—"}</div>
                  </div>
                </div>

                {/* Creado / Actualizado */}
                <div className="row mb-3">
                  <div className="col-6">
                    <div className="fw-semibold small text-muted">
                      Creado
                    </div>
                    <div>{creadoLabel}</div>
                  </div>
                  <div className="col-6">
                    <div className="fw-semibold small text-muted">
                      Actualizado
                    </div>
                    <div>{actualizadoLabel}</div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-1 fw-semibold small text-muted">
                  Descripción
                </div>
                <div>
                  {product.descripcion ||
                    "Sin descripción registrada."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
