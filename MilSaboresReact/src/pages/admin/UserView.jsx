// src/pages/admin/UserView.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const LS_USERS = "usuarios_v1";

export default function UserView() {
  const { id } = useParams(); // aquí 'id' es el email
  const [user, setUser] = useState(null);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    setUser(lista.find((u) => u.email === id) || null);
  }, [id]);

  if (!user) {
    return (
      <div>
        <p>No se encontró el usuario.</p>
        <Link to="/admin/usuarios">Volver</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Detalle usuario</h2>
      <p><b>Email (ID):</b> {user.email}</p>
      <p><b>Nombre:</b> {user.nombre}{user.apellidos ? ` ${user.apellidos}` : ""}</p>
      <p><b>Rol:</b> {user.rol || "cliente"}</p>
      <p><b>Beneficio:</b> {user.beneficio || "—"}</p>
      <p><b>Fecha Nac.:</b> {user.fechaNacimiento || "—"}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Link to={`/admin/usuarios/${encodeURIComponent(id)}/editar`}><button>Editar</button></Link>
        <Link to={`/admin/usuarios/${encodeURIComponent(id)}/historial`}><button>Historial</button></Link>
        <Link to="/admin/usuarios"><button>Volver</button></Link>
      </div>
    </div>
  );
}
