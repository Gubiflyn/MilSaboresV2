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
import Ofertas from "./pages/Ofertas";
import Categorias from "./pages/Categorias";

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
import UserHistory from "./pages/admin/UserHistory";
import UserView from "./pages/admin/UserView";
import UserEdit from "./pages/admin/UserEdit";
import UserNew from "./pages/admin/UserNew";

import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";

/* ======== Guards ======== */
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isSeller } = useAuth();

  // Solo pueden entrar al área /admin los ADMIN o VENDEDORES
  if (!isAuthenticated || (!isAdmin && !isSeller)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// SOLO ADMIN (dentro del área /admin)
function AdminOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito, add, clear, remove } = useCart();
  const { isAuthenticated } = useAuth();

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
          <Route path="/ofertas" element={<Ofertas />} />
          <Route
            path="/productos"
            element={<Productos agregarAlCarrito={agregarAlCarrito} />}
          />
          <Route path="/categorias" element={<Categorias />} />
          <Route
            path="/detalle/:codigo"
            element={<Detalle agregarAlCarrito={agregarAlCarrito} />}
          />
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
            {/* Dashboard: SOLO ADMIN */}
            <Route
              index
              element={
                <AdminOnlyRoute>
                  <DashboardAdmin />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <AdminOnlyRoute>
                  <DashboardAdmin />
                </AdminOnlyRoute>
              }
            />

            {/* Productos: ADMIN y VENDEDOR (lista + detalle) */}
            <Route path="productos" element={<ProductsAdmin />} />
            <Route path="productos/:id" element={<ProductDetail />} />

            {/* Crear / editar producto: SOLO ADMIN */}
            <Route
              path="productos/nuevo"
              element={
                <AdminOnlyRoute>
                  <ProductNew />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="productos/:id/editar"
              element={
                <AdminOnlyRoute>
                  <ProductEdit />
                </AdminOnlyRoute>
              }
            />

            {/* Categorías: SOLO ADMIN */}
            <Route
              path="categorias"
              element={
                <AdminOnlyRoute>
                  <CategoriesAdmin />
                </AdminOnlyRoute>
              }
            />

            {/* Pedidos / Órdenes: ADMIN y VENDEDOR (lista + boleta) */}
            <Route path="pedidos" element={<OrdersAdmin />} />
            <Route
              path="pedidos/:orderId/boleta"
              element={<OrderReceipt />}
            />

            {/* Usuarios: SOLO ADMIN */}
            <Route
              path="usuarios"
              element={
                <AdminOnlyRoute>
                  <UsersAdmin />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="usuarios/nuevo"
              element={
                <AdminOnlyRoute>
                  <UserNew />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="usuarios/:id"
              element={
                <AdminOnlyRoute>
                  <UserView />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="usuarios/:id/editar"
              element={
                <AdminOnlyRoute>
                  <UserEdit />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="usuarios/:id/historial"
              element={
                <AdminOnlyRoute>
                  <UserHistory />
                </AdminOnlyRoute>
              }
            />

            {/* Perfil y reportes: SOLO ADMIN */}
            <Route
              path="perfil"
              element={
                <AdminOnlyRoute>
                  <ProfileAdmin />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="reportes"
              element={
                <AdminOnlyRoute>
                  <ReportsAdmin />
                </AdminOnlyRoute>
              }
            />

            {/* Redirección criticos: SOLO ADMIN */}
            <Route
              path="criticos"
              element={
                <AdminOnlyRoute>
                  <Navigate to="productos" replace />
                </AdminOnlyRoute>
              }
            />
          </Route>
        </Routes>
      </main>

      {!isAdminArea && <Footer />}
    </>
  );
};

export default App;
