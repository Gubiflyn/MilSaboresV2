// App.jsx
import React from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  useMatch,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Productos from "./pages/Productos";
import Detalle from "./pages/Detalle";
import Carrito from "./components/Carrito";
import Configuracion from "./pages/Configuracion";
import Contacto from "./pages/Contacto";
import Noticias from "./pages/Noticias";
import Pago from "./pages/Pago";
import Boleta from "./pages/Boleta";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PagoError from "./pages/PagoError";
import Ofertas from "./pages/Ofertas"; // ✅ nueva página

// ADMIN
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardAdmin from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/Products";
import ProductEdit from "./pages/admin/ProductEdit";
import ProductNew from "./pages/admin/ProductNew";
import ProductDetail from "./pages/admin/ProductDetail";
import CategoriesAdmin from "./pages/admin/Categories";
import OrdersAdmin from "./pages/admin/Orders";
import OrderReceipt from "./pages/admin/OrderReceipt";
import UsersAdmin from "./pages/admin/Users";
import ProfileAdmin from "./pages/admin/Profile";
import ReportsAdmin from "./pages/admin/Reports";
import CriticalProducts from "./pages/admin/CriticalProducts";
import UserHistory from "./pages/admin/UserHistory";

import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import { publicUrl } from "./utils/publicUrl";

/* ======== Guards ======== */
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.rol === "admin";
  if (!isAdmin) return <Navigate to="/login" replace />;
  return children;
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito, add, clear, remove } = useCart();
  const { isAuthenticated, user } = useAuth();

  const agregarAlCarrito = (torta) => add({ ...torta, cantidad: 1 });
  const vaciarCarrito = () => clear();
  const eliminarProducto = (codigo) => remove(codigo);
  const irAlPago = () => navigate("/pago");

  const isAdminArea = !!useMatch("/admin/*");

  return (
    <>
      {!isAdminArea && <Navbar carrito={carrito} />}

      <main style={{ minHeight: "70vh" }}>
        <Routes>
          {/* PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/ofertas" element={<Ofertas />} /> {/* ✅ nueva ruta */}
          <Route path="/productos" element={<Productos agregarAlCarrito={agregarAlCarrito} />} />
          <Route path="/detalle/:codigo" element={<Detalle agregarAlCarrito={agregarAlCarrito} />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/blogs" element={<Noticias />} />

          {/* AUTENTICACIÓN */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* BOLETA Y PAGO */}
          <Route path="/boleta/:orderId" element={<Boleta />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/pago/error" element={<PagoError />} />

          {/* CARRITO */}
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

          {/* PRIVADAS */}
          <Route
            path="/configuracion"
            element={
              <PrivateRoute>
                <Configuracion />
              </PrivateRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardAdmin />} />
            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="productos" element={<ProductsAdmin />} />
            <Route path="productos/nuevo" element={<ProductNew />} />
            <Route path="productos/:id" element={<ProductDetail />} />
            <Route path="productos/:id/editar" element={<ProductEdit />} />
            <Route path="categorias" element={<CategoriesAdmin />} />
            <Route path="pedidos" element={<OrdersAdmin />} />
            <Route path="pedidos/:orderId/boleta" element={<OrderReceipt />} />
            <Route path="usuarios" element={<UsersAdmin />} />
            <Route path="usuarios/:id/historial" element={<UserHistory />} />
            <Route path="perfil" element={<ProfileAdmin />} />
            <Route path="reportes" element={<ReportsAdmin />} />
            <Route path="criticos" element={<CriticalProducts />} />
          </Route>
        </Routes>
      </main>

      {!isAdminArea && <Footer />}
    </>
  );
};

export default App;
