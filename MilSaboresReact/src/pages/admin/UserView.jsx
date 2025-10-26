// src/pages/admin/UserView.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import seed from "../../data/usuarios.json"; // ⚠️ misma semilla que usa el listado

const LS_USERS = "usuarios_v1";

// Carga usuarios: primero localStorage; si está vacío, usa seed y sincroniza
function loadUsersAndSync() {
  const saved = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  if (Array.isArray(saved) && saved.length > 0) return saved;

  // Si no hay nada en LS, usa la semilla y persístela para unificar criterio
  if (Array.isArray(seed) && seed.length > 0) {
    localStorage.setItem(LS_USERS, JSON.stringify(seed));
    return seed;
  }
  return [];
}

function findUser(users, rawParam) {
  if (!rawParam) return null;

  const raw = String(rawParam);
  const lower = raw.toLowerCase();

  // decodificado
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  const decodedLower = decoded.toLowerCase();

  // 1) por email (minúsculas)
  let found =
    users.find((u) => String(u.email || "").toLowerCase() === decodedLower) ||
    null;
  if (found) return found;

  // 2) por email codificado
  found =
    users.find(
      (u) =>
        encodeURIComponent(String(u.email || "").toLowerCase()) === lower
    ) || null;
  if (found) return found;

  // 3) por email exacto (por si quedó casing raro)
  found = users.find((u) => String(u.email || "") === decoded) || null;
  if (found) return found;

  // 4) por índice numérico (si en algún lugar usan index)
  const asNumber = Number(decoded);
  if (
    Number.isInteger(asNumber) &&
    asNumber >= 0 &&
    asNumber < users.length
  ) {
    return users[asNumber];
  }

  // 5) último recurso: por nombre (no recomendado, sólo para robustez)
  found =
    users.find(
      (u) => String(u.nombre || "").toLowerCase() === decodedLower
    ) || null;

  return found;
}

export default function UserView() {
  const params = useParams();
  // Acepta cualquier nombre de param (id, email, idx, userId…)
  const param =
    params.id ??
    params.email ??
    params.idx ??
    params.userId ??
    Object.values(params)[0];

  const users = useMemo(() => loadUsersAndSync(), []);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(findUser(users, param));
  }, [users, param]);

  if (!user) {
    return (
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Detalle del usuario</h5>
          <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
            ← Volver
          </Link>
        </div>
        <div className="card-body">
          <p className="text-muted mb-0">Usuario no encontrado.</p>
        </div>
      </div>
    );
  }

  const idForLinks = encodeURIComponent(String(user.email || ""));

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Detalle del usuario</h5>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
          ← Volver
        </Link>
      </div>

      <div className="card-body">
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <strong>Nombre:</strong> {user.nombre || "—"}
          </li>
          <li className="list-group-item">
            <strong>Correo:</strong> {user.email || "—"}
          </li>
          <li className="list-group-item">
            <strong>Rol:</strong>{" "}
            <span
              className={`badge bg-${
                (user.rol || "cliente") === "admin" ? "primary" : "secondary"
              }`}
            >
              {user.rol || "cliente"}
            </span>
          </li>
          <li className="list-group-item">
            <strong>Beneficio:</strong> {user.beneficio || "—"}
          </li>
          <li className="list-group-item">
            <strong>Fecha de nacimiento:</strong> {user.fechaNacimiento || "—"}
          </li>
        </ul>
      </div>

      <div className="card-footer d-flex justify-content-end gap-2">
        <Link
          to={`/admin/usuarios/${idForLinks}/editar`}
          className="btn btn-primary btn-sm"
        >
          Editar
        </Link>
      </div>
    </div>
  );
}
