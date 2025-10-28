// src/pages/admin/UserHistory.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { findUserByEmail } from "../../utils/usersRepo";
import { getHistoryByEmail } from "../../utils/ordersRepo"; // ➕ ADD

const CLP = (n) => (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function UserHistory() {
  const { id } = useParams();
  const email = decodeURIComponent(id || "");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setUser(findUserByEmail(email));
    setOrders(getHistoryByEmail(email)); // 🔄 usa ordersRepo (ordenes_v1)
  }, [email]);

  const totalGastado = useMemo(
    () =>
      orders.reduce((acc, o) => {
        const t = o.total ?? o.montoTotal ?? o.monto ?? 0;
        return acc + (parseInt(t, 10) || 0);
      }, 0),
    [orders]
  );

  if (!email) {
    return <div className="alert alert-warning">Falta el identificador del usuario.</div>;
  }

  if (!user) {
    return (
      <div className="alert alert-danger">
        Usuario no encontrado
        <div className="mt-2">
          <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">Volver a Usuarios</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="mb-0">Historial de compras</h4>
        <div className="text-muted">
          <strong>{user.nombre}</strong> · {user.email}
        </div>
      </div>

      <div className="card p-3">
        {orders.length === 0 ? (
          <div className="text-muted">No hay registros en el historial de este usuario.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => {
                  const fecha = o.date || o.fecha || o.createdAt || o.created_at;
                  const items = o.items || o.detalle || o.lineas || [];
                  const estado = o.estado || o.status || "—";
                  const total = o.total ?? o.montoTotal ?? o.monto ?? 0;

                  return (
                    <tr key={o.id || o.codigo || `ord-${idx}`}>
                      <td>{o.id || o.codigo || idx + 1}</td>
                      <td>{fecha ? new Date(fecha).toLocaleString("es-CL") : "—"}</td>
                      <td>
                        {Array.isArray(items) && items.length > 0
                          ? items.map((it, i) => {
                              const nombre = it.nombre || it.name || it.titulo || `Item ${i + 1}`;
                              const cantidad = it.cantidad || it.qty || 1;
                              return (
                                <div key={i}>
                                  {nombre} × {cantidad}
                                </div>
                              );
                            })
                          : "—"}
                      </td>
                      <td>${CLP(total)}</td>
                      <td>{estado}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-end"><strong>Total gastado:</strong></td>
                  <td colSpan={2}><strong>${CLP(totalGastado)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div>
        <Link to={`/admin/usuarios/${encodeURIComponent(user.email)}`} className="btn btn-outline-secondary btn-sm">
          Volver al usuario
        </Link>
      </div>
    </div>
  );
}
