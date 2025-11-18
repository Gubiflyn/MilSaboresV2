import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPasteles } from "../services/api";

const LS_KEY = "tortas_v3";
const DESCUENTOS = {
  torta: 0.20,
  postre: 0.15,
  sinAzucar: 0.10,
};

const CLP = (n) => Number(n || 0).toLocaleString("es-CL");
const precioConDescuento = (precio, pct) =>
  Math.max(0, Math.round((Number(precio) || 0) * (1 - pct)));

export default function Home() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      let data = [];
      try {
        const apiData = await getPasteles();
        if (Array.isArray(apiData) && apiData.length) {
          data = apiData;
          localStorage.setItem(LS_KEY, JSON.stringify(apiData));
        }
      } catch (err) {
        console.error("Error al cargar productos en Home:", err);
      }

      if (!data.length) {
        try {
          const guardadas = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
          if (Array.isArray(guardadas) && guardadas.length) {
            data = guardadas;
          }
        } catch {
          data = [];
        }
      }

      setProductos(Array.isArray(data) ? data : []);
    };

    cargar();
  }, []);

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
    <main>
      <section className="hero-section py-5" id="inicio">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-md-7 text-and-button">
              <h1 className="hero-section__title display-4 fw-bold mb-3">Mil Sabores</h1>
              <p className="hero-section__text fs-5 mb-4">
                Pastelería artesanal: tortas, postres y sabores hechos con cariño. Pide online o visita nuestra tienda.
              </p>
              <Link to="/productos" className="btn btn--primary">
                Ver Productos
              </Link>
            </div>
            <div className="col-md-5 d-none d-md-block text-center">
              <img
                src="/public/img/Tindex.webp"
                className="img-fluid rounded-3 shadow-lg"
                alt="Pastel destacado"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="products-section py-5" id="productos">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h2 className="section-heading m-0">Ofertas de la Semana</h2>
            <Link to="/ofertas" className="btn btn-sm btn-outline-primary">
              Ver todas las ofertas
            </Link>
          </div>
          <p className="text-center text-muted mb-5">
            Elegimos una torta, un postre y una opción sin azúcar a precio especial.
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
                            onError={(e) => {
                              e.currentTarget.src = "/img/placeholder.png";
                            }}
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
      </section>

      <section className="about-section py-5" id="nosotros">
        <div className="container">
          <h2 className="section-heading text-center mb-5">Sobre Nosotros</h2>
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="fs-5">
                Mil Sabores nació con la pasión de crear postres que no solo son deliciosos, sino una experiencia memorable.
              </p>
              <p className="fs-5">
                Ingredientes de la más alta calidad y recetas tradicionales con un toque moderno.
              </p>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="/public/img/pasteleros.jpg"
                className="img-fluid rounded shadow"
                alt="Equipo"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
