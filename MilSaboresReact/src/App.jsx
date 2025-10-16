import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import Productos from './pages/Productos';
import Detalle from './pages/Detalle';
import Configuración from './pages/Configuración';
import Contacto from './pages/Contacto';
import Noticias from './pages/Noticias';
import Pago from './pages/Pago';
import CarritoPage from './pages/Carrito'; // página adaptadora

const App = () => {
  const navigate = useNavigate();
  const irAlPago = () => navigate('/pago');

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '70vh' }}>
        <Routes>
          {/* "/" muestra Home */}
          <Route path="/" element={<Home />} />

          {/* Productos */}
          <Route path="/productos" element={<Productos />} />
          <Route path="/detalle/:codigo" element={<Detalle />} />

          {/* Carrito */}
          <Route path="/carrito" element={<CarritoPage irAlPago={irAlPago} />} />

          {/* Otras páginas */}
          <Route path="/configuracion" element={<Configuración />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/blogs" element={<Noticias />} /> {/* alias para “Blogs” */}
          <Route path="/pago" element={<Pago />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
