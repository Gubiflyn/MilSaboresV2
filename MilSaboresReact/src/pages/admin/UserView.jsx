import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const LS_USERS = "usuarios_v1";

export default function UserView() {
  const { id } = useParams(); // normalmente email codificado
  const [user, setUser] = useState(null);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const found = all.find((u) => encodeURIComponent(u.email) === id);
    setUser(found || null);
  }, [id]);

  if (!user) {
    return (
      <div className="text-center text-muted py-5">
        Usuario no encontrado
      </div>
    );
  }

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
                user.rol === "admin" ? "primary" : "secondary"
              }`}
            >
              {user.rol}
            </span>
          </li>
          <li className="list-group-item">
            <strong>Beneficio:</strong> {user.beneficio || "—"}
          </li>
          <li className="list-group-item">
            <strong>Fecha Nacimiento:</strong> {user.fechaNacimiento || "—"}
          </li>
        </ul>
      </div>

      <div className="card-footer text-end">
        <Link
          to={`/admin/usuarios/${id}/editar`}
          className="btn btn-primary btn-sm"
        >
          Editar
        </Link>
      </div>
    </div>
  );
}
