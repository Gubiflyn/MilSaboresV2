// src/pages/admin/UserView.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUsuarioByCorreo } from "../../services/api";

export default function UserView() {
  
  const { id } = useParams();
  const correo = decodeURIComponent(id || "");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      if (!correo) {
        setError("Falta el correo del usuario.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getUsuarioByCorreo(correo);
        if (!data || !data.id) {
          setError("Usuario no encontrado");
          setUser(null);
        } else {
          setUser(data);
        }
      } catch (err) {
        console.error("Error cargando usuario:", err);
        setError("Usuario no encontrado");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [correo]);

  if (loading) {
    return <div className="alert alert-info">Cargando usuario...</div>;
  }

  if (error || !user) {
    return (
      <div className="alert alert-danger">
        {error || "Usuario no encontrado"}
        <div className="mt-2">
          <Link
            to="/admin/usuarios"
            className="btn btn-outline-secondary btn-sm"
          >
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
          <div>
            <strong>Nombre:</strong> {user.nombre}
          </div>
          <div>
            <strong>Correo:</strong> {user.correo}
          </div>
        </div>
        <div className="col-md-6">
          <div>
            <strong>Rol:</strong> {user.rol}
          </div>
          <div>
            <strong>Beneficio:</strong> {user.beneficio || "-"}
          </div>
          <div>
            <strong>Fecha Nacimiento:</strong> {user.fechaNacimiento || "-"}
          </div>
          <div>
            <strong>Activo:</strong> {user.activo ? "Sí" : "No"}
          </div>
        </div>
      </div>

      <div className="mt-3 d-flex gap-2">
        <Link
          to={`/admin/usuarios/${encodeURIComponent(user.correo)}/editar`}
          className="btn btn-primary btn-sm"
        >
          Editar
        </Link>
        <Link
          to={`/admin/usuarios/${encodeURIComponent(
            user.correo
          )}/historial`}
          className="btn btn-outline-dark btn-sm"
        >
          Ver historial de compras
        </Link>
        <Link
          to="/admin/usuarios"
          className="btn btn-outline-secondary btn-sm"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
