import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getPastelByCodigo, getPasteles } from "../../services/api";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function ProductDetail() {
  const { code } = useParams(); // espera ruta tipo /admin/products/:code
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

        if (code) {
          try {
            p = await getPastelByCodigo(code);
          } catch {
            // si falla por código, intento buscar en toda la lista
            const all = await getPasteles();
            p =
              (all || []).find(
                (x) =>
                  String(x.codigo ?? "").toLowerCase() ===
                    String(code).toLowerCase() ||
                  String(x.id ?? "").toLowerCase() ===
                    String(code).toLowerCase()
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
  }, [code]);

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
        <div className="alert alert-danger mb-3">{error || "Sin datos"}</div>
        <button className="btn btn-secondary" onClick={() => navigate("/admin/products")}>
          Volver al listado
        </button>
      </div>
    );
  }

  const idForEdit = product.codigo || product.id;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Detalle de producto</h1>
        <div className="d-flex gap-2">
          <Link
            className="btn btn-outline-primary"
            to={`/admin/products/${idForEdit}/edit`}
          >
            Editar
          </Link>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            Volver al listado
          </button>
        </div>
      </div>

      <div className="admin-body">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card">
              {product.imagen && (
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="card-img-top"
                />
              )}
              <div className="card-body">
                <h5 className="card-title mb-1">{product.nombre}</h5>
                <div className="text-muted small mb-2">
                  Código: {product.codigo || "—"}
                </div>
                <div className="fw-bold">{CLP(product.precio)}</div>
                <div className="text-muted">
                  Stock: {product.stock ?? 0} unidades
                </div>
                <div className="text-muted">
                  Categoría: {product.categoria || "Sin categoría"}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <strong>Descripción</strong>
              </div>
              <div className="card-body">
                {product.descripcion || "Sin descripción registrada."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
