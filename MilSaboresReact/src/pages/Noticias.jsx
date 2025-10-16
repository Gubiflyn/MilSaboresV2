import { useState } from "react";

export default function Noticias() {
  const [open, setOpen] = useState(null); // controla los modales

  return (
    <main className="blogs-main">
      <section className="blogs-section py-5">
        <div className="container">
          <h1 className="text-center mb-5">Noticias y Blogs</h1>

          {/* Tarjeta 1 */}
          <div className="card blog-card mb-4 shadow-sm">
            <div className="row g-0 align-items-center">
              <div className="col-md-4">
                <img
                  src="/public/img/hornear.jpg"
                  className="blog-card__image"
                  alt="Beneficio de hornear"
                />
              </div>
              <div className="col-md-8 p-4 d-flex flex-column">
                <h5 className="blog-card__title noticia-titulo">
                  Enterate de los beneficios que tiene para la salud el hornear
                </h5>
                <p className="noticia-parrafo mb-3">
                  Te enseñamos y te damos la receta paso a paso de nuestra torta
                  más popular para que la puedas disfrutar en casa.
                </p>
                <button
                  className="btn btn-primary mt-auto align-self-start"
                  onClick={() => setOpen("n1")}
                >
                  Leer más
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="card blog-card mb-4 shadow-sm">
            <div className="row g-0 align-items-center">
              <div className="col-md-4">
                <img
                  src="/public/img/rumpy.png"
                  className="blog-card__image"
                  alt="Récord mundial"
                />
              </div>
              <div className="col-md-8 p-4 d-flex flex-column">
                <h5 className="blog-card__title noticia-titulo">
                  Récord mundial: el pastel más grande del planeta se horneó en
                  Chile
                </h5>
                <p className="noticia-parrafo mb-3">
                  ¡Adivina dónde se hizo la torta más grande del planeta! Lee la
                  noticia completa aquí.
                </p>
                <button
                  className="btn btn-primary mt-auto align-self-start"
                  onClick={() => setOpen("n2")}
                >
                  Leer más
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal 1 */}
      {open === "n1" && (
        <div
          className="modal-backdrop-custom"
          onClick={() => setOpen(null)}
        >
          <div
            className="modal-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h5 className="modal-title">Beneficios de hornear</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setOpen(null)}
              />
            </div>
            <div className="modal-body">
              <img
                src="/Assets/img/hornear.jpg"
                className="img-fluid rounded mb-3"
                alt="Beneficios de hornear"
              />
              <p className="noticia-parrafo">
                Madrid, 6 de septiembre de 2025 — Un estudio realizado por
                investigadores de la Universidad Europea de Ciencias Gastronómicas
                reveló que la práctica de la repostería no solo genera placer al
                paladar, sino que también puede tener beneficios para la salud
                mental. El equipo analizó a 150 voluntarios que participaron en
                talleres de repostería durante tres meses. Los resultados
                mostraron que quienes horneaban regularmente presentaban una
                reducción del 32% en los niveles de estrés y una mejora del 18%
                en la memoria a corto plazo. Según la doctora a cargo, Elena
                Martín, el efecto se debe a la combinación de concentración,
                creatividad y estimulación sensorial que implica preparar masas,
                batir cremas y decorar postres. “Cuando una persona hornea, no
                solo crea alimentos, también activa zonas cerebrales relacionadas
                con la atención plena y la satisfacción personal”, explicó. Los
                investigadores adelantaron que planean profundizar en cómo ciertas
                recetas, como las que incluyen chocolate y frutos secos,
                potencian aún más estos beneficios.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setOpen(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2 */}
      {open === "n2" && (
        <div
          className="modal-backdrop-custom"
          onClick={() => setOpen(null)}
        >
          <div
            className="modal-custom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h5 className="modal-title">
                Récord mundial: el pastel más grande del planeta se horneó en
                Chile
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setOpen(null)}
              />
            </div>
            <div className="modal-body">
              <img
                src="/Assets/img/rumpy.png"
                className="img-fluid rounded mb-3"
                alt="Récord mundial"
              />
              <p className="noticia-parrafo">
                Valparaíso, 22 de septiembre de 2025 — Más de 300 reposteros y
                voluntarios de distintas regiones de Chile unieron fuerzas para
                preparar el pastel más grande del mundo, alcanzando una longitud
                de dos kilómetros a lo largo de la costanera de Valparaíso. El
                evento utilizó más de 20 mil huevos, 8 toneladas de harina y 5
                mil litros de crema pastelera. El gigantesco pastel fue dividido
                en más de 100 mil porciones, distribuidas gratuitamente entre los
                asistentes y enviadas a hospitales y hogares de ancianos de la
                región. Inspectores del Libro Guinness certificaron la hazaña en
                vivo. “Más que un récord, este pastel simboliza la unión y la
                alegría que puede dar la repostería”, señaló el chef coordinador,
                Rodrigo Menares.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setOpen(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
