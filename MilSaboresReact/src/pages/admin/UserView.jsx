// src/pages/admin/UserView.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { findUserByEmail } from "../../utils/usersRepo";

export default function UserView() {
  const { id } = useParams(); // id es el email codificado
  const email = decodeURIComponent(id || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(findUserByEmail(email));
  }, [email]);

  if (!email) {
    return <div className="alert alert-warning">Falta el identificador del usuario.</div>;
  }

  if (!user) {
    return (
      <div className="alert alert-danger">
        Usuario no encontrado
        <div className="mt-2">
          <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
            Volver a Usuarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-3">
      <h4 className="mb-3">Detalles de usuario</h4>
      <div className="row g-3">
        <div className="col-md-6">
          <div><strong>Nombre:</strong> {user.nombre}</div>
          <div><strong>Correo:</strong> {user.email}</div>
        </div>
        <div className="col-md-6">
          <div><strong>Rol:</strong> {user.rol}</div>
          <div><strong>Beneficio:</strong> {user.beneficio}</div>
          <div><strong>Fecha Nacimiento:</strong> {user.fechaNacimiento}</div>
        </div>
      </div>

      <div className="mt-3 d-flex gap-2">
        <Link to={`/admin/usuarios/${encodeURIComponent(user.email)}/editar`} className="btn btn-primary btn-sm">
          Editar
        </Link>
        <Link to={`/admin/usuarios/${encodeURIComponent(user.email)}/historial`} className="btn btn-outline-dark btn-sm">
          Ver historial de compras
        </Link>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
          Volver
        </Link>
      </div>
    </div>
  );
}
