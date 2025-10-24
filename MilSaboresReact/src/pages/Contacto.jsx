import React, { useState } from "react";

export default function Contacto() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Mensaje enviado. ¡Gracias por contactarnos!");
    setForm({ nombre: "", email: "", mensaje: "" });
  };

  return (
    <main className="contacto-page d-flex flex-column flex-grow-1">
      {/* Hero */}
      <header className="contacto-hero py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <h1 className="display-5 fw-bold mb-2">Hablemos 🍰</h1>
              <p className="lead mb-0 text-body-secondary">
                Escríbenos para cotizaciones, pedidos especiales o soporte. Te
                responderemos a la brevedad.
              </p>
            </div>
            <div className="col-12 col-lg-5">
              <div className="contacto-stats card shadow-sm border-0">
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <div className="h4 mb-0">+1.500</div>
                    <small className="text-body-secondary">Clientes felices</small>
                  </div>
                  <div>
                    <div className="h4 mb-0">24–48h</div>
                    <small className="text-body-secondary">Tiempo de respuesta</small>
                  </div>
                  <div>
                    <div className="h4 mb-0">100%</div>
                    <small className="text-body-secondary">Hecho en casa</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <section className="py-5 flex-grow-1">
        <div className="container">
          <div className="row g-4">
            {/* Columna: Formulario */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm contacto-card">
                <div className="card-body p-4 p-md-5">
                  <h2 className="h4 fw-semibold mb-3">Envíanos un mensaje</h2>
                  <p className="text-body-secondary mb-4">
                    Cuéntanos qué necesitas y nos pondremos en contacto contigo.
                  </p>

                  {/* === AQUÍ VA TU FORMULARIO ORIGINAL === */}
                  <form className="mx-auto" style={{ maxWidth: 400 }} onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control mb-2"
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      className="form-control mb-2"
                      placeholder="Tu correo"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <textarea
                      name="mensaje"
                      className="form-control mb-2"
                      placeholder="Tu mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      required
                    />
                    <button type="submit" className="btn btn-primary w-100">
                      Enviar
                    </button>
                  </form>
                  {/* === FIN DE TU FORMULARIO === */}
                </div>
              </div>
            </div>

            {/* Columna: Info / Mapa / FAQ */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h3 className="h5 fw-semibold mb-3">Datos de contacto</h3>
                  <ul className="list-unstyled mb-0 contacto-list">
                    <li className="d-flex align-items-start gap-3 mb-3">
                      <span className="contacto-bullet">📍</span>
                      <div>
                        <div className="fw-semibold">Local Mil Sabores</div>
                        <small className="text-body-secondary">Av. Principal 123, Santiago</small>
                      </div>
                    </li>
                    <li className="d-flex align-items-start gap-3 mb-3">
                      <span className="contacto-bullet">📞</span>
                      <div>
                        <a href="tel:+56900000000" className="link-underline-opacity-0">
                          +56 9 5642 1253
                        </a>
                        <div>
                          <small className="text-body-secondary">Lun–Sáb 10:00–19:00</small>
                        </div>
                      </div>
                    </li>
                    <li className="d-flex align-items-start gap-3 mb-0">
                      <span className="contacto-bullet">✉️</span>
                      <div>
                        <a href="mailto:hola@milsabores.cl" className="link-underline-opacity-0">
                          hola@milsabores.cl
                        </a>
                        <div>
                          <small className="text-body-secondary">Respuesta 24–48h</small>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card border-0 shadow-sm mb-4 overflow-hidden">
                <div className="ratio ratio-16x9">
                  <iframe
                    title="Mapa"
                    src="https://maps.google.com/maps?q=Santiago%20de%20Chile&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="h6 fw-semibold mb-3">Preguntas frecuentes</h3>
                  <ul className="mb-0 small text-body-secondary ps-3">
                    <li>¿Con cuánta anticipación debo pedir una torta personalizada?</li>
                    <li>¿Hacen envíos a domicilio y cuál es el costo?</li>
                    <li>¿Puedo pedir opciones sin azúcar o sin gluten?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
