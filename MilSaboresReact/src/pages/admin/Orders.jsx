import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getBoletas } from "../../services/api";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

function mapBoleta(b) {
  const fecha =
    b.fechaEmision || b.fecha || b.fechaBoleta || b.createdAt || null;

  const numeroBoleta = b.numeroBoleta || b.numero || b.idBoleta || b.id;

  const receptorNombre =
    b.receptor?.nombre ||
    b.cliente?.nombre ||
    b.usuario?.nombre ||
    b.nombreCliente ||
    "—";

  const items =
    b.items || b.detalles || b.detallesBoleta || [];

  const total = b.total || b.montoTotal || b.totalBoleta || 0;

  const id = b.id || b.idBoleta || b.orderId || numeroBoleta;

  return {
    raw: b,
    orderId: id,
    fecha,
    numeroBoleta,
    receptorNombre,
    items,
    total,
  };
}

export default function Orders() {
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getBoletas();
        const mapped = Array.isArray(data) ? data.map(mapBoleta) : [];
        setOrders(mapped);
      } catch (e) {
        console.error("Error cargando boletas:", e);
        alert("No se pudieron cargar las boletas desde la API.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return orders;

    return orders.filter((o) => {
      const num = String(o.numeroBoleta ?? "").toLowerCase();
      const nombre = String(o.receptorNombre ?? "").toLowerCase();
      return num.includes(term) || nombre.includes(term);
    });
  }, [q, orders]);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Boletas / Órdenes</h1>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por número o cliente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="admin-body">
        {loading && (
          <div className="alert alert-info">
            Cargando boletas desde la API...
          </div>
        )}

        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>N° boleta</th>
              <th>Cliente</th>
              <th className="text-end">Items</th>
              <th className="text-end">Total</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Sin registros.
                </td>
              </tr>
            )}
            {filtered.map((o, idx) => (
              <tr key={o.orderId ?? idx}>
                <td>
                  {o.fecha ? new Date(o.fecha).toLocaleString() : "—"}
                </td>
                <td>{o.numeroBoleta || "—"}</td>
                <td>{o.receptorNombre}</td>
                <td className="text-end">
                  {o.items?.reduce(
                    (a, i) => a + (i.qty || i.cantidad || i.cant || 0),
                    0
                  )}
                </td>
                <td className="text-end">{CLP(o.total)}</td>
                <td className="text-end">
                  {o.orderId && (
                    <Link
                      className="btn btn-sm btn-outline-primary"
                      to={`/boleta/${o.orderId}`}
                    >
                      Ver
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
