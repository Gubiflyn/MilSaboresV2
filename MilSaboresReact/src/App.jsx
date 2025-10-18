import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import Productos from './pages/Productos';
import Detalle from './pages/Detalle';
import Carrito from './components/Carrito';
import Configuración from './pages/Configuración';
import Contacto from './pages/Contacto';
import Noticias from './pages/Noticias';
import Pago from './pages/Pago';
import { loadCarrito, saveCarrito } from './utils/localstorageHelper';

const App = () => {
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCarrito(loadCarrito() || []);
  }, []);

  useEffect(() => {
    saveCarrito(carrito);
  }, [carrito]);

  const agregarAlCarrito = (torta) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.codigo === torta.codigo);
      if (existe) {
        return prev.map((item) =>
          item.codigo === torta.codigo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...torta, cantidad: 1 }];
    });
  };

  const vaciarCarrito = () => setCarrito([]);
  const eliminarProducto = (codigo) =>
    setCarrito((prev) => prev.filter((t) => t.codigo !== codigo));
  const irAlPago = () => navigate('/pago');

  return (
    <>
      <Navbar carrito={carrito} />
      <main style={{ minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/productos"
            element={<Productos agregarAlCarrito={agregarAlCarrito} />}
          />
          <Route
            path="/detalle/:codigo"
            element={<Detalle agregarAlCarrito={agregarAlCarrito} />}
          />
          <Route
            path="/carrito"
            element={
              <Carrito
                carrito={carrito}
                vaciarCarrito={vaciarCarrito}
                eliminarProducto={eliminarProducto}
                irAlPago={irAlPago}
              />
            }
          />
          <Route path="/configuracion" element={<Configuración />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/blogs" element={<Noticias />} />
          <Route
            path="/pago"
            element={<Pago carrito={carrito} vaciarCarrito={vaciarCarrito} />}
          />
        </Routes>
      </main>

      {/* === MODAL CARRITO === */}
      <div
        className="modal fade"
        id="carritoModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">🧁 Tu carrito</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              {carrito.length === 0 ? (
                <p className="text-center">Tu carrito está vacío.</p>
              ) : (
                <ul className="list-group">
                  {carrito.map((item, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          width="50"
                          height="50"
                          className="rounded me-3"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <strong>{item.nombre}</strong>
                          <div className="small text-muted">
                            x{item.cantidad} — $
                            {item.precio.toLocaleString('es-CL')}
                          </div>
                        </div>
                      </div>
                      <span className="fw-semibold">
                        ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Seguir comprando
              </button>
              <button
                type="button"
                className="btn btn-success"
                data-bs-dismiss="modal"
                onClick={() => navigate('/carrito')}
              >
                Finalizar compra
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === TOAST CONFIRMACIÓN === */}
      <div
        className="toast align-items-center text-bg-success border-0 position-fixed bottom-0 end-0 m-4"
        id="toastAgregado"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">✅ Producto agregado al carrito</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            data-bs-dismiss="toast"
            aria-label="Cerrar"
          ></button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default App;
