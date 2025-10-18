import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import "./admin.css";

export default function AdminLayout() {
  return (
    <div className="admin">
      {/* Sidebar reutilizable */}
      <Sidebar />

      {/* Contenido principal del panel */}
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
