// src/pages/Ofertas.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import tortasFallback from "../data/tortas.json";

const LS_KEY = "tortas_v3";
const DESCUENTOS = {
  torta: 0.20,     // 20% para torta
  postre: 0.15,    // 15% para Postres Individuales
  sinAzucar: 0.10, // 10% para Productos Sin Azúcar
};

const CLP = (n) => Number(n || 0).toLocaleString("es-CL");
const precioConDescuento = (precio, pct) =>
  Math.max(0, Math.round((Number(precio) || 0) * (1 - pct)));



export default function Ofertas() {
  
  const [productos, setProductos] = useState(Array.isArray(tortasFallback) ? tortasFallback : []);

  useEffect(() => {
    try {
      const guardadas = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      if (Array.isArray(guardadas) && guardadas.length) {
        setProductos(guardadas);
      }
    } catch {
      // si falla el parse, mantenemos el fallback
    }
  }, []);

  // 
  const ofertas = useMemo(() => {
    if (!Array.isArray(productos) || productos.length === 0) return [];

    const pick = (pred) => productos.find(pred);

    const torta =
      pick((p) => (p.categoria || "").toLowerCase().startsWith("tortas ")) ||
      productos.find((p) => (p.nombre || "").toLowerCase().includes("torta"));

    const postre = pick((p) => (p.categoria || "") === "Postres Individuales");
    const sinAzucar = pick((p) => (p.categoria || "") === "Productos Sin Azúcar");

    const base = [torta, postre, sinAzucar].filter(Boolean);
    const unique = [];
    const seen = new Set();

    for (const p of base) {
      const key = p.codigo ?? p.nombre;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    }

    // completar si faltan
    if (unique.length < 3) {
      for (const p of productos) {
        const key = p.codigo ?? p.nombre;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(p);
          if (unique.length >= 3) break;
        }
      }
    }

    // calcular descuento según el tipo (igual que en Home)
    return unique.slice(0, 3).map((p) => {
      let tipo = "torta";
      if ((p.categoria || "") === "Postres Individuales") tipo = "postre";
      if ((p.categoria || "") === "Productos Sin Azúcar") tipo = "sinAzucar";
      const pct = DESCUENTOS[tipo] ?? 0.1;
      return {
        ...p,
        _tipoOferta: tipo,
        _pct: pct,
        _precioOferta: precioConDescuento(p.precio, pct),
      };
    });
  }, [productos]);

  const resolveImg = (imagen) => {
    if (!imagen) return "/img/placeholder.png";
    const nombreArchivo = String(imagen).split("/").pop();
    return `/img/${nombreArchivo}`;
  };

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <h1 className="h4 m-0">Ofertas</h1>
        <Link to="/productos" className="btn btn-sm btn-outline-primary">Ver todos los productos</Link>
      </div>
      <p className="text-muted mb-4">
        Nuestra selección destacada de torta, un postre individual y una opción sin azúcar.
      </p>

      <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
        {ofertas.length === 0 ? (
          <div className="col-12 text-center">
            <p>No hay productos para ofertar por ahora.</p>
          </div>
        ) : (
          ofertas.map((t) => {
            const imgSrc = resolveImg(t.imagen);
            const pctLabel = `-${Math.round((t._pct || 0) * 100)}%`;
            return (
              <div className="col" key={t.codigo ?? t.nombre}>
                <Link
                  to={`/detalle/${t.codigo ?? ""}?oferta=1&pct=${t._pct || 0}&tag=${encodeURIComponent(
                    t._tipoOferta || ""
                  )}`}
                  className="text-decoration-none text-reset"
                >
                  <div className="card product-card h-100 shadow-sm">
                    <div className="position-relative">
                      <img
                        src={imgSrc}
                        onError={(e) => { e.currentTarget.src = "/img/placeholder.png"; }}
                        className="card-img-top product-card__image"
                        alt={t.nombre || "Producto"}
                        style={{ objectFit: "cover", height: 220 }}
                      />
                      <span
                        className="badge bg-danger position-absolute"
                        style={{ top: 10, left: 10, fontSize: 12 }}
                      >
                        {pctLabel}
                      </span>
                    </div>

                    <div className="card-body text-center">
                      <h5 className="card-title mb-1">{t.nombre || "Producto"}</h5>
                      {t.precio != null && (
                        <>
                          <div className="small text-decoration-line-through text-muted">
                            ${CLP(t.precio)} CLP
                          </div>
                          <div className="product-card__price fw-semibold fs-5">
                            ${CLP(t._precioOferta)} CLP
                          </div>
                        </>
                      )}
                      <div className="small text-muted mt-1">
                        {(t.categoria || "").length ? t.categoria : "\u00A0"}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
