// src/pages/admin/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import seed from "../../data/usuarios.json";

// El componente principal
export default function Users() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");

  // Función auxiliar: evita duplicados por correo
  const uniqueByEmail = (arr) => {
    const map = new Map();
    for (const u of arr) {
      if (!u?.email) continue;
      map.set(u.email.toLowerCase(), u);
    }
    return [...map.values()];
  };

  // Carga inicial
  useEffect(() => {
    // 1) Leer perfiles del registro (localStorage)
    const rawPerfiles = JSON.parse(localStorage.getItem("perfiles") || "[]");

    // 2) Normalizar datos para que coincidan con las columnas de admin
    const perfiles = rawPerfiles
      .map((p) => {
        const nombrePlano =
          (p.nombre ?? "").toString().trim() ||
          `${p.nombres || ""} ${p.apellidos || ""}`.trim();

        const emailPlano = (p.email ?? p.correo ?? "").toString().trim().toLowerCase();

        return {
          nombre: nombrePlano || "Sin nombre",
          email: emailPlano,
          rol: p.rol || "cliente",
          beneficio: p.beneficio || "—",
          fechaNacimiento: p.fechaNacimiento || "—",
        };
      })
      .filter((u) => !!u.email); // filtra usuarios sin correo

    // 3) Leer usuarios semilla desde el JSON
    const seedUsers = (seed || []).map((u) => ({
      nombre: u.nombre || "Sin nombre",
      email: (u.email || "").toLowerCase(),
      rol: u.rol || "cliente",
      beneficio: u.beneficio || "—",
      fechaNacimiento: u.fechaNacimiento || "—",
    }));

    // 4) Combinar ambos evitando duplicados
    const combined = uniqueByEmail([...seedUsers, ...perfiles]);

    setList(combined);
  }, []);

  // Filtro de búsqueda
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
  const toggleRol = (email) => {
    const next = list.map((u) =>
      u.email === email
        ? { ...u, rol: u.rol === "admin" ? "cliente" : "admin" }
        : u
    );
    setList(next);
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

                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm text-nowrap"
                          onClick={() => toggleRol(u.email)}
                        >
                          Alternar rol
                        </button>
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
