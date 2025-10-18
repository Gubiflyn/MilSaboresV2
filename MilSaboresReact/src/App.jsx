import React from 'react';
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
import Boleta from './pages/Boleta';
import Login from './pages/Login';
import Register from './pages/Register';

// usamos el carrito desde el contexto
import { useCart } from './context/CartContext';
import { publicUrl } from './utils/publicUrl';

const App = () => {
  const navigate = useNavigate();
  const { carrito, add, clear, remove } = useCart();

  const agregarAlCarrito = (torta) => add({ ...torta, cantidad: 1 });
  const vaciarCarrito = () => clear();
  const eliminarProducto = (codigo) => remove(codigo);
  const irAlPago = () => navigate('/pago');

  return (
    <>
      <Navbar carrito={carrito} />

      <main style={{ minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Boleta: ruta para ver boleta por orderId */}
          <Route path="/boleta/:orderId" element={<Boleta />} />

          {/* Productos / Detalle */}
          <Route
            path="/productos"
            element={<Productos agregarAlCarrito={agregarAlCarrito} />}
          />
          <Route
            path="/detalle/:codigo"
            element={<Detalle agregarAlCarrito={agregarAlCarrito} />}
          />

          {/* Carrito */}
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

          {/* Otras páginas */}
          <Route path="/configuracion" element={<Configuración />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/blogs" element={<Noticias />} />

          {/* Pago */}
          <Route path="/pago" element={<Pago />} />
        </Routes>
      </main>

      {/* === MODAL CARRITO (global) === */}
      <div className="modal fade" id="carritoModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">🧁 Tu carrito</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
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
                          src={publicUrl(item.imagen)}
                          alt={item.nombre}
                          width="50"
                          height="50"
                          className="rounded me-3"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <strong>{item.nombre}</strong>
                          <div className="small text-muted">
                            x{item.cantidad} — ${ (item.precio || 0).toLocaleString('es-CL') }
                          </div>
                        </div>
                      </div>
                      <span className="fw-semibold">
                        ${ ((item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-CL') }
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
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

      {/* === TOAST CONFIRMACIÓN (global) === */}
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