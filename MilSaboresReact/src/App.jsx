import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
    setCarrito(prev => {
      const existe = prev.find(item => item.codigo === torta.codigo);
      if (existe) {
        return prev.map(item =>
          item.codigo === torta.codigo ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...torta, cantidad: 1 }];
    });
  };

  const vaciarCarrito = () => setCarrito([]);
  const eliminarProducto = (codigo) => setCarrito(prev => prev.filter(t => t.codigo !== codigo));
  const irAlPago = () => navigate('/pago');

  return (
    <>
      <Navbar carrito={carrito} />
      <main style={{ minHeight: '70vh' }}>
        <Routes>

          <Route path="/" element={<Home />} />
          
          {/* Redirige "/" automáticamente a "/productos" */}
          <Route path="/" element={<Navigate to="/productos" replace />} />

          {/* Ruta para productos */}
          <Route path="/productos" element={<Productos agregarAlCarrito={agregarAlCarrito} />} />

          <Route path="/detalle/:codigo" element={<Detalle agregarAlCarrito={agregarAlCarrito} />} />

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
          <Route path="/pago" element={<Pago carrito={carrito} vaciarCarrito={vaciarCarrito} />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
