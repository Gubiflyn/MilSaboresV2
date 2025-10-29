import React, { useMemo, useState } from "react";
import { publicUrl } from "../utils/publicUrl";

const useNoticias = () =>
  useMemo(
    () => [
      {
        id: 1,
        title: "Beneficios de hornear",
        excerpt:
          "Te enseñamos y te damos la receta paso a paso de nuestra torta más popular para que la puedas disfrutar en casa.",
        content:
          "Madrid, 6 de septiembre de 2025 — Un estudio realizado por investigadores de la Universidad Europea de Ciencias Gastronómicas reveló que la práctica de la repostería no solo genera placer al paladar, sino que también puede tener beneficios para la salud mental. El equipo analizó a 150 voluntarios que participaron en talleres de repostería durante tres meses. Los resultados mostraron que quienes horneaban regularmente presentaban una reducción del 32% en los niveles de estrés y una mejora del 18% en la memoria a corto plazo. Según la doctora a cargo, Elena Martín, el efecto se debe a la combinación de concentración, creatividad y estimulación sensorial que implica preparar masas, batir cremas y decorar postres. “Cuando una persona hornea, no solo crea alimentos, también activa zonas cerebrales relacionadas con la atención plena y la satisfacción personal”, explicó. Los investigadores adelantaron que planean profundizar en cómo ciertas recetas, como las que incluyen chocolate y frutos secos, potencian aún más estos beneficios.",
        image: "/img/hornear.jpg",
      },
      {
        id: 2,
        title: "Récord mundial: el pastel más grande del planeta se horneó en Chile",
        excerpt:
          "¡Adivina donde se hizo la torta más grande del planeta :O! Lee la noticia completa aquí.",
        content:
          " Valparaíso, 22 de septiembre de 2025 — Más de 300 reposteros y voluntarios de distintas regiones de Chile unieron fuerzas para preparar el pastel más grande del mundo, alcanzando una longitud de dos kilómetros a lo largo de la costanera de Valparaíso. El evento, organizado como parte de las celebraciones del Día Internacional de la Repostería, utilizó más de 20 mil huevos, 8 toneladas de harina y 5 mil litros de crema pastelera. El gigantesco pastel fue dividido en más de 100 mil porciones, distribuidas gratuitamente entre los asistentes y enviadas a hospitales y hogares de ancianos de la región. Inspectores del Libro Guinness de los Récords certificaron la hazaña en vivo, declarando oficialmente a Chile como el nuevo poseedor del récord del pastel más largo del mundo. “Más que un récord, este pastel simboliza la unión y la alegría que puede dar la repostería”, señaló el chef coordinador del evento, Rodrigo Menares.",
        image: "/img/rumpy.png",
      },
    ],
    []
  );

const Noticias = () => {
  const noticias = useNoticias();
  const [abierta, setAbierta] = useState(null);
  const activa = noticias.find((n) => n.id === abierta) || null;

  return (
    <div className="noticias-page d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <section className="container py-5">
          <h1 className="titulo-noticias text-center mb-4">
            Noticias y blogs
          </h1>

          <div className="d-flex flex-column gap-4">
            {noticias.map((n) => (
              <article
                key={n.id}
                className="card border-0 shadow-sm rounded-4 overflow-hidden"
              >
                <div className="row g-0 align-items-stretch">
                  <div className="col-12 col-md-6 p-4 p-md-5 d-flex flex-column">
                    <h2 className="h4 fw-bold mb-2">{n.title}</h2>
                    <p className="text-secondary mb-4">{n.excerpt}</p>
                    <div className="mt-auto">
                      <button
                        className="btn btn-dark px-4"
                        onClick={() => setAbierta(n.id)}
                      >
                        Leer más
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="ratio ratio-16x9 ratio-md-4x3 h-100">
                      <img
                        src={n.image}
                        alt={n.title}
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {activa && (
        <div
          className="modal-backdrop-custom"
          onClick={() => setAbierta(null)}
        >
          <div
            className="modal-card card border-0 shadow-lg rounded-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-sm btn-outline-secondary ms-auto me-2 mt-2"
              onClick={() => setAbierta(null)}
            >
              ✕
            </button>

            <div className="modal-body-custom">
              <div className="mb-3">
                <img
                  src={activa.image}
                  alt={activa.title}
                  className="w-100 rounded-3 object-fit-cover"
                />
              </div>
              <h3 className="h4 fw-bold mb-2">{activa.title}</h3>
              <p>{activa.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticias;
