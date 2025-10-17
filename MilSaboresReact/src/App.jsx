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
import CarritoPage from './pages/Carrito';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import Admin from './pages/admin/Admin';
import Boleta from './pages/Boleta';


const App = () => {
  const navigate = useNavigate();
  const irAlPago = () => navigate('/pago');

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '70vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/detalle/:codigo" element={<Detalle />} />
          <Route path="/carrito" element={<CarritoPage irAlPago={irAlPago} />} />
          <Route path="/configuracion" element={<Configuración />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/blogs" element={<Noticias />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/boleta/:orderId" element={<Boleta />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin-only */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<Admin />} />
            {/* Ejemplo: <Route path="/admin/productos" element={<AdminProductos />} /> */}
          </Route>
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
