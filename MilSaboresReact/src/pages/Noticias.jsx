import React, { useMemo, useState } from "react";
import { publicUrl } from "../utils/publicUrl";

const useNoticias = () =>
  useMemo(
    () => [
      {
        id: 1,
        title: "Nueva línea de tortas artesanales",
        excerpt:
          "Lanzamos una colección con ingredientes 100% naturales, manteniendo el sabor tradicional con un toque gourmet.",
        content:
          "Presentamos nuestra nueva línea de tortas artesanales elaboradas con harinas seleccionadas, frutas locales de temporada y cremas montadas al momento. Cada receta fue probada más de 20 veces por nuestro equipo...",
        image: "/img/noticia1.png",
      },
      {
        id: 2,
        title: "Entrevista exclusiva con Rumpy",
        excerpt:
          "El reconocido locutor visitó nuestra pastelería y probó nuestras nuevas tortas personalizadas.",
        content:
          "Rumpy compartió con nuestro equipo su pasión por la repostería y degustó varias de nuestras creaciones. Comentó que le encantaron las combinaciones frutales y las capas crocantes, además de destacar la atención y el ambiente cálido de la tienda.",
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

      {/* Modal */}
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
