import React from "react";
import { Link } from "react-router-dom";
import tortas from "../data/tortas.json";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero-section py-5" id="inicio">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-md-7 text-and-button">
              <h1 className="hero-section__title display-4 fw-bold mb-3">Mil Sabores</h1>
              <p className="hero-section__text fs-5 mb-4">
                Pastelería artesanal: tortas, postres y sabores hechos con cariño. Pide online o visita nuestra tienda.
              </p>
              <Link to="/productos" className="btn btn--primary">Ver Productos</Link>
            </div>
            <div className="col-md-5 d-none d-md-block text-center">
              <img src="/public/img/Tindex.webp" className="img-fluid rounded-3 shadow-lg" alt="Pastel destacado" />
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS (primeros 3 del JSON) */}
      <section className="products-section py-5" id="productos">
        <div className="container">
          <h2 className="section-heading text-center mb-5">Destacados de la Semana</h2>
          <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
            {Array.isArray(tortas) && tortas.slice(0, 3).map((t) => {
              const resolveImg = (imagen) => {
                if (!imagen) return '/img/placeholder.png';
                if (imagen.startsWith('/')) {
                  // normaliza rutas que vengan como /Assets/img/xxx o /public/img/xxx => /img/xxx
                  return imagen.replace(/^\/(?:public\/)?(?:Assets\/img|img)/, '/img');
                }
                return `/img/${imagen}`;
              };
              const imgSrc = resolveImg(t.imagen);
              return (
                <div className="col" key={t.codigo ?? t.nombre}>
                  <Link to={`/detalle/${t.codigo ?? ""}`} className="text-decoration-none text-reset">
                    <div className="card product-card h-100">
                      <img
                        src={imgSrc}
                        className="card-img-top product-card__image"
                        alt={t.nombre || "Producto"}
                        style={{ objectFit: "cover", height: 220 }}
                      />
                      <div className="card-body text-center">
                        <h5 className="card-title">{t.nombre || "Producto"}</h5>
                        {t.precio != null && <p className="product-card__price">${Number(t.precio).toLocaleString('es-CL')} CLP</p>}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section py-5" id="nosotros">
        <div className="container">
          <h2 className="section-heading text-center mb-5">Sobre Nosotros</h2>
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="fs-5">Mil Sabores nació con la pasión de crear postres que no solo son deliciosos, sino una experiencia memorable.</p>
              <p className="fs-5">Ingredientes de la más alta calidad y recetas tradicionales con un toque moderno.</p>
            </div>
            <div className="col-md-6 text-center">
              <img src="/public/img/pasteleros.jpg" className="img-fluid rounded shadow" alt="Equipo" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}