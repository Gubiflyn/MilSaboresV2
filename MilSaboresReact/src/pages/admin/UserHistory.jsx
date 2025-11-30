// src/pages/admin/UserHistory.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUsuarioByCorreo, getBoletasByUsuarioId } from "../../services/api";

const CLP = (n) => (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function UserHistory() {
  const { id } = useParams();
  const correo = decodeURIComponent(id || "");

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
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

        // 1) Obtener usuario por correo
        const usuario = await getUsuarioByCorreo(correo);
        if (!usuario || !usuario.id) {
          setError("Usuario no encontrado");
          setUser(null);
          setOrders([]);
          return;
        }
        setUser(usuario);

        // 2) Obtener boletas de ese usuario por ID
        const boletas = await getBoletasByUsuarioId(usuario.id);
        setOrders(Array.isArray(boletas) ? boletas : []);
      } catch (err) {
        console.error("Error cargando historial:", err);
        setError("Usuario no encontrado");
        setUser(null);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [correo]);

  const totalGastado = useMemo(
    () =>
      orders.reduce((acc, o) => {
        const t = o.total ?? 0;
        return acc + (parseInt(t, 10) || 0);
      }, 0),
    [orders]
  );

  if (loading) {
    return <div className="alert alert-info">Cargando historial...</div>;
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
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="mb-0">Historial de compras</h4>
        <div className="text-muted">
          <strong>{user.nombre}</strong> · {user.correo}
        </div>
      </div>

      <div className="card p-3">
        {orders.length === 0 ? (
          <div className="text-muted">
            No hay registros en el historial de este usuario.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID Boleta</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o.id || `ord-${idx}`}>
                    <td>{o.id || idx + 1}</td>
                    <td>
                      {o.fechaEmision
                        ? new Date(o.fechaEmision).toLocaleString("es-CL")
                        : "—"}
                    </td>
                    <td>${CLP(o.total ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="text-end">
                    <strong>Total gastado:</strong>
                  </td>
                  <td>
                    <strong>${CLP(totalGastado)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div>
        <Link
          to={`/admin/usuarios/${encodeURIComponent(user.correo)}`}
          className="btn btn-outline-secondary btn-sm"
        >
          Volver al usuario
        </Link>
      </div>
    </div>
  );
}
