// src/pages/admin/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import seed from "../../data/usuarios.json";

const LS_USERS = "usuarios_v1";

export default function Users() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");

  // Carga inicial desde localStorage o semilla
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LS_USERS) || "null") || seed;
    setList(saved);
  }, []);

  // Persistencia local
  const persist = (next) => {
    localStorage.setItem(LS_USERS, JSON.stringify(next));
    setList(next);
  };

  // Búsqueda por nombre o email
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (u) =>
        (u.nombre || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s)
    );
  }, [q, list]);

  // Alternar rol admin/cliente
  const toggleRol = (idx) => {
    const next = [...list];
    next[idx].rol = next[idx].rol === "admin" ? "cliente" : "admin";
    persist(next);
  };

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

          {/* Importante: usar Link para que navegue a la página de nuevo usuario */}
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
                filtered.map((u) => {
                  const index = list.findIndex((x) => x.email === u.email);
                  const id = encodeURIComponent(u.email || "");

                  return (
                    <tr key={u.email || u.nombre}>
                      <td>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td>{u.rol || "cliente"}</td>
                      <td>{u.beneficio || "—"}</td>
                      <td>{u.fechaNacimiento || "—"}</td>
                      <td>
                        {/* Grupo de acciones: NO cambiamos handlers ni rutas; solo agrupamos */}
                        <div className="admin-actions">
                          <Link
                            to={`/admin/usuarios/${id}`}
                            className="btn btn-outline-primary btn-sm text-nowrap"
                            title="Ver usuario"
                          >
                            Ver
                          </Link>

                          <Link
                            to={`/admin/usuarios/${id}/editar`}
                            className="btn btn-outline-secondary btn-sm text-nowrap"
                            title="Editar usuario"
                          >
                            Editar
                          </Link>

                          <Link
                            to={`/admin/usuarios/${id}/historial`}
                            className="btn btn-outline-dark btn-sm text-nowrap"
                            title="Ver historial"
                          >
                            Historial
                          </Link>

                          <button
                            type="button"
                            className="btn btn-outline-warning btn-sm text-nowrap"
                            onClick={() => toggleRol(index)}
                            title="Alternar rol (admin/cliente)"
                          >
                            Alternar rol
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
