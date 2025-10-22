import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const LS_RCPTS = "receipts_v1";
const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function Orders() {
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = () =>
      setOrders(Object.values(JSON.parse(localStorage.getItem(LS_RCPTS) || "{}")));
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  const filtered = orders
    .filter((o) => {
      const s = q.toLowerCase();
      return (
        (o.numeroBoleta || "").toLowerCase().includes(s) ||
        (o.receptor?.nombre || "").toLowerCase().includes(s)
      );
    })
    .sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Órdenes</span>
        <input
          className="form-control w-auto"
          placeholder="Buscar…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Boleta</th>
              <th>Cliente</th>
              <th>Ítems</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Sin registros.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.orderId}>
                <td>{new Date(o.fechaEmision).toLocaleString()}</td>
                <td>{o.numeroBoleta}</td>
                <td>{o.receptor?.nombre || "—"}</td>
                <td>{o.items?.reduce((a, i) => a + (i.qty || 0), 0)}</td>
                <td>{CLP(o.total)}</td>
                <td className="text-end">
                  <Link
                    className="btn btn-sm btn-outline-primary"
                    to={`/boleta/${o.orderId}`}
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
