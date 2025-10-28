// src/pages/admin/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../utils/usersRepo";

export default function Users() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");

  // Carga inicial desde el repositorio unificado (localStorage + seed)
  useEffect(() => {
    setList(getAllUsers());
  }, []);

  // Filtro de búsqueda por nombre/correo
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (u) =>
        (u.nombre || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s)
    );
  }, [q, list]);

  return (
    <div className="d-flex flex-column gap-3">
      {/* Encabezado */}
      <div className="d-flex align-items-center justify-content-between">
        <h3 className="mb-0">Usuarios</h3>

        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Buscar por nombre o correo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <Link to="/admin/usuarios/nuevo" className="btn btn-primary">
            + Nuevo
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Beneficio</th>
                <th>Fecha Nacimiento</th>
                <th style={{ width: 420 }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((u, i) => (
                  <tr key={`usr-${(u.email || "").toLowerCase()}-${i}`}>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{u.rol}</td>
                    <td>{u.beneficio}</td>
                    <td>{u.fechaNacimiento}</td>
                    <td>
                      <div className="admin-actions d-flex flex-wrap gap-1">
                        <Link
                          to={`/admin/usuarios/${encodeURIComponent(u.email || "")}`}
                          className="btn btn-outline-primary btn-sm text-nowrap"
                        >
                          Ver
                        </Link>

                        <Link
                          to={`/admin/usuarios/${encodeURIComponent(u.email || "")}/editar`}
                          className="btn btn-outline-secondary btn-sm text-nowrap"
                        >
                          Editar
                        </Link>

                        <Link
                          to={`/admin/usuarios/${encodeURIComponent(u.email || "")}/historial`}
                          className="btn btn-outline-dark btn-sm text-nowrap"
                        >
                          Historial
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No hay usuarios para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
