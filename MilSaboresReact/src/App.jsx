import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Productos from './pages/Productos';
import Detalle from './pages/Detalle';
import Carrito from './pages/Carrito';
import Configuración from './pages/Configuración';
import Contacto from './pages/Contacto';
import Noticias from './pages/Noticias';
import Pago from './pages/Pago';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Productos />} />
      <Route path="/detalle/:codigo" element={<Detalle />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/configuracion" element={<Configuración />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/noticias" element={<Noticias />} />
      <Route path="/pago" element={<Pago />} />
    </Routes>
  </BrowserRouter>
);

export default App;