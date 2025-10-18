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

  // Persistencia
  const persist = (next) => {
    setList(next);
    try { localStorage.setItem(LS_USERS, JSON.stringify(next)); } catch {}
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

  // (Opcional) eliminar usuario — descomentarlo si lo necesitas
  // const onDelete = (idx) => {
  //   if (!confirm("¿Eliminar este usuario?")) return;
  //   const next = list.filter((_, i) => i !== idx);
  //   persist(next);
  // };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Usuarios</span>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Buscar por nombre o email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link to="/admin/users/new" className="btn btn-primary">
            + Nuevo
          </Link>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha Nac.</th>
              <th>Beneficio</th>
              <th style={{ width: 280 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Sin resultados.
                </td>
              </tr>
            )}

            {filtered.map((u, idx) => (
              <tr key={u.email}>
                <td>{u.nombre || "—"}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={
                      "badge " + (u.rol === "admin" ? "text-bg-warning" : "text-bg-light")
                    }
                  >
                    {u.rol}
                  </span>
                </td>
                <td>{u.fechaNacimiento || "—"}</td>
                <td>{u.beneficio || "—"}</td>
                <td className="text-end">
                  <div className="btn-group">
                    <Link
                      to={`/admin/users/${encodeURIComponent(u.email)}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/admin/users/${encodeURIComponent(u.email)}/edit`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Editar
                    </Link>
                    <Link
                      to={`/admin/users/${encodeURIComponent(u.email)}/history`}
                      className="btn btn-sm btn-outline-dark"
                    >
                      Historial
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => toggleRol(list.findIndex(x => x.email === u.email))}
                      title="Alternar rol (admin/cliente)"
                    >
                      Alternar rol
                    </button>
                    {/* <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(list.findIndex(x => x.email === u.email))}
                    >
                      Eliminar
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer small text-muted">
        * Usa “Nuevo” para crear una cuenta rápida (se guarda localmente).<br />
        * “Alternar rol” cambia entre <strong>admin</strong> y <strong>cliente</strong>.
      </div>
    </div>
  );
}
