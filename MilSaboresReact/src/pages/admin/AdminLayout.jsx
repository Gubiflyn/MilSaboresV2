import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './admin.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/img/icono.png" alt="Logo Mil Sabores" className="admin-logo" />
          Mil Sabores
        </div>

        <nav className="admin-nav">
          <NavLink end to="/admin" className="admin-link">Dashboard</NavLink>
          <NavLink to="/admin/pedidos" className="admin-link">Órdenes</NavLink>
          <NavLink to="/admin/productos" className="admin-link">Productos</NavLink>
          <NavLink to="/admin/categorias" className="admin-link">Categorías</NavLink>
          <NavLink to="/admin/usuarios" className="admin-link">Usuarios</NavLink>
          <NavLink to="/admin/reportes" className="admin-link">Reportes</NavLink>
        </nav>

        <div className="admin-secondary">
          <NavLink to="/admin/perfil" className="admin-link muted">Perfil</NavLink>
          <NavLink to="/" className="admin-link muted">Tienda</NavLink>
          <button className="admin-logout" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-title">Dashboard</h1>
            <div className="admin-subtitle">Resumen de las actividades diarias</div>
          </div>
          <div className="admin-user">
            <span className="admin-user-email">{user?.email || 'admin@mail'}</span>
          </div>
        </header>

        <div className="admin-page">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
