import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../pages/admin/admin.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className="admin__sidebar">
      <div className="admin__brand">Mil Sabores</div>
      <img src="/img/icono.png" alt="Logo Mil Sabores" className="admin__logo" />
      <nav className="admin__menu">
        <NavLink end to="/admin" className="admin__link">Dashboard</NavLink>
        <NavLink to="/admin/orders" className="admin__link">Órdenes</NavLink>
        <NavLink to="/admin/products" className="admin__link">Productos</NavLink>
        <NavLink to="/admin/categories" className="admin__link">Categorías</NavLink>
        <NavLink to="/admin/users" className="admin__link">Usuarios</NavLink>
        <NavLink to="/admin/reports" className="admin__link">Reportes</NavLink>
      </nav>

      <div className="admin__menu mt-auto">
        <div className="admin__section">Perfil</div>
        <Link to="/" className="admin__link">Tienda</Link>
        <button onClick={handleLogout} className="btn btn-danger w-100 mt-2">Cerrar Sesión</button>
        <div className="admin__user small mt-3 text-muted">
          {user?.email}
        </div>
      </div>
    </aside>
  );
}
