// src/pages/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // 👈 ruta corregida
import "./admin.css";

export default function AdminLayout() {
  const { user, logout, isAdmin, isSeller } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img
            src="/img/icono.png"
            alt="Logo Mil Sabores"
            className="admin-logo"
          />
          Mil Sabores
        </div>

        <nav className="admin-nav">
          
          {isAdmin && (
            <>
              <NavLink end to="/admin" className="admin-link">
                Dashboard
              </NavLink>

              <NavLink to="/admin/pedidos" className="admin-link">
                Órdenes
              </NavLink>

             
              <NavLink to="/admin/boletas" className="admin-link">
                Boletas
              </NavLink>

              <NavLink to="/admin/productos" className="admin-link">
                Productos
              </NavLink>
              <NavLink to="/admin/categorias" className="admin-link">
                Categorías
              </NavLink>
              <NavLink to="/admin/usuarios" className="admin-link">
                Usuarios
              </NavLink>
              <NavLink to="/admin/reportes" className="admin-link">
                Reportes
              </NavLink>
            </>
          )}

          {/* VENDEDOR: solo Órdenes y Productos */}
          {isSeller && (
            <>
              <NavLink to="/admin/pedidos" className="admin-link">
                Órdenes
              </NavLink>
              <NavLink to="/admin/productos" className="admin-link">
                Productos
              </NavLink>
            </>
          )}
        </nav>

        <div className="admin-secondary">
          {/* Perfil y Tienda solo para ADMIN */}
          {isAdmin && (
            <>
              <NavLink to="/admin/perfil" className="admin-link muted">
                Perfil
              </NavLink>
              <NavLink to="/" className="admin-link muted">
                Tienda
              </NavLink>
            </>
          )}

          <button className="admin-logout" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1 className="admin-title">
              {isAdmin ? "Dashboard" : "Panel vendedor"}
            </h1>
            <div className="admin-subtitle">
              {isAdmin
                ? "Resumen de las actividades diarias"
                : "Consulta de productos y órdenes"}
            </div>
          </div>
          <div className="admin-user">
            <span className="admin-user-email">
              {user?.correo || user?.email || "admin@mail"}
            </span>
          </div>
        </header>

        <div className="admin-page">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
