import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const LS_USERS = "usuarios_v1";
// Si tienes pedidos reales, cambia por tu clave, p.ej. const LS_ORDERS = "ordenes_v1";
const LS_FAKE_HISTORY = "usuarios_historial_v1";

export default function UserHistory() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [historial, setHistorial] = useState([]);

  // Genera historial ficticio si no existe
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    setUser(users.find((u) => u.id === id) || null);

    let h = JSON.parse(localStorage.getItem(LS_FAKE_HISTORY) || "null");
    if (!h) {
      h = {
        u1: [
          { fecha: "2025-10-01", tipo: "Pedido", detalle: "Orden #1001 - 2 productos" },
          { fecha: "2025-10-05", tipo: "Login",  detalle: "Inicio de sesión" },
        ],
        u2: [{ fecha: "2025-10-02", tipo: "Cambio de rol", detalle: "Cliente → Admin" }],
        u3: [{ fecha: "2025-10-03", tipo: "Pedido", detalle: "Orden #1005 - 1 producto" }],
      };
      localStorage.setItem(LS_FAKE_HISTORY, JSON.stringify(h));
    }
    setHistorial(h[id] || []);
  }, [id]);

  const titulo = useMemo(() => (user ? `${user.nombre} ${user.apellidos}` : id), [user, id]);

  return (
    <div>
      <h2>Historial de {titulo}</h2>

      {historial.length === 0 ? (
        <p>Sin actividades registradas.</p>
      ) : (
        <div className="tabla-responsive">
          <table className="tabla-admin" width="100%">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((ev, i) => (
                <tr key={i}>
                  <td>{ev.fecha}</td>
                  <td>{ev.tipo}</td>
                  <td>{ev.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to={`/admin/usuarios/${id}`}><button>Volver al usuario</button></Link>
      </div>
    </div>
  );
}
