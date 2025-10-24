import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const LS_USERS = "usuarios_v1";

export default function UserView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    setUser(lista.find((u) => u.id === id) || null);
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
      <p><b>ID:</b> {user.id}</p>
      <p><b>Nombre:</b> {user.nombre} {user.apellidos}</p>
      <p><b>Correo:</b> {user.correo}</p>
      <p><b>Rol:</b> {user.rol}</p>
      <p><b>Activo:</b> {user.activo ? "Sí" : "No"}</p>
      <p><b>Creado:</b> {user.creado}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Link to={`/admin/usuarios/${id}/editar`}><button>Editar</button></Link>
        <Link to={`/admin/usuarios/${id}/historial`}><button>Historial</button></Link>
        <Link to="/admin/usuarios"><button>Volver</button></Link>
      </div>
    </div>
  );
}
