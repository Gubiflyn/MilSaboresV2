import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Compras</div>
          <div className="kpi-number">1,234</div>
          <div className="kpi-footnote">Probabilidad de aumento: 20%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Productos</div>
          <div className="kpi-number">400</div>
          <div className="kpi-footnote">Inventario actual: 500</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Usuarios</div>
          <div className="kpi-number">890</div>
          <div className="kpi-footnote">Nuevos este mes: 120</div>
        </div>
      </div>

      <div className="quick-tiles">
        <Link to="/admin/pedidos" className="quick-tile">
          <h4>Órdenes</h4>
          <p>Seguimiento de compras</p>
        </Link>
        <Link to="/admin/productos" className="quick-tile">
          <h4>Productos</h4>
          <p>Administrar inventario</p>
        </Link>
        <Link to="/admin/categorias" className="quick-tile">
          <h4>Categorías</h4>
          <p>Organizar productos</p>
        </Link>
        <Link to="/admin/usuarios" className="quick-tile">
          <h4>Usuarios</h4>
          <p>Gestión de cuentas</p>
        </Link>
        <Link to="/admin/reportes" className="quick-tile">
          <h4>Reportes</h4>
          <p>Informes detallados</p>
        </Link>
        <Link to="/admin/perfil" className="quick-tile">
          <h4>Perfil</h4>
          <p>Configuraciones de cuenta</p>
        </Link>
      </div>
    </>
  );
}
