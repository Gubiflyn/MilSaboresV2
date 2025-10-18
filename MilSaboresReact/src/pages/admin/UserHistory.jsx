import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/* ===== Helpers ===== */
const STORAGE_KEYS = ["ORDERS", "BOLETAS", "orders", "boletas", "receipts", "LS_RCPTS"];

const formatCLP = (n) =>
  (parseInt(n, 10) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

function parseDateGuess(v) {
  if (!v) return null;
  try {
    // soporta ISO, timestamps numéricos o strings tipo "2025-10-17 14:22"
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d;
    // intento con número
    const num = Number(v);
    if (!isNaN(num)) {
      const d2 = new Date(num);
      if (!isNaN(d2.getTime())) return d2;
    }
  } catch (_) {}
  return null;
}

function readOrders() {
  for (const k of STORAGE_KEYS) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch (_) {}
  }
  return [];
}

function getOrderId(o) {
  return o?.orderId ?? o?.id ?? o?.codigo ?? o?.code ?? null;
}

function getOrderEmail(o) {
  return (
    o?.email ??
    o?.correo ??
    o?.usuarioEmail ??
    o?.clienteEmail ??
    o?.user?.email ??
    o?.buyer?.email ??
    null
  );
}

function getOrderTotal(o) {
  return (
    o?.total ??
    o?.montoTotal ??
    o?.amount ??
    o?.payment?.total ??
    o?.resumen?.total ??
    0
  );
}

function getOrderStatus(o) {
  return (
    o?.estado ??
    o?.status ??
    o?.paymentStatus ??
    "desconocido"
  );
}

function getOrderItems(o) {
  const items =
    o?.items ??
    o?.detalle ??
    o?.cart ??
    o?.lineItems ??
    o?.orderItems ??
    [];
  return Array.isArray(items) ? items : [];
}

function getOrderDate(o) {
  const d =
    parseDateGuess(o?.fecha) ??
    parseDateGuess(o?.date) ??
    parseDateGuess(o?.createdAt) ??
    parseDateGuess(o?.creadoEn) ??
    null;
  return d;
}

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (["pagado", "paid", "aprobado", "success", "completado", "completed"].some((x) => s.includes(x))) {
    return <span className="badge success">Pagado</span>;
  }
  if (["pendiente", "pending", "en proceso", "processing"].some((x) => s.includes(x))) {
    return <span className="badge info">Pendiente</span>;
  }
  if (["fallido", "rechazado", "cancelado", "failed", "rejected", "canceled"].some((x) => s.includes(x))) {
    return <span className="badge danger">Fallido</span>;
  }
  return <span className="badge">{status || "—"}</span>;
}

export default function UserHistory() {
  const navigate = useNavigate();
  const { email } = useParams();

  const allOrders = useMemo(() => readOrders(), []);
  const userOrders = useMemo(
    () =>
      allOrders
        .filter((o) => String(getOrderEmail(o) || "").toLowerCase() === String(email || "").toLowerCase())
        .map((o) => ({
          id: getOrderId(o),
          email: getOrderEmail(o),
          total: Number(getOrderTotal(o) || 0),
          status: getOrderStatus(o),
          items: getOrderItems(o),
          date: getOrderDate(o),
          raw: o,
        }))
        .sort((a, b) => {
          const ta = a.date ? a.date.getTime() : 0;
          const tb = b.date ? b.date.getTime() : 0;
          return tb - ta; // desc
        }),
    [allOrders, email]
  );

  // Filtros locales
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(""); // yyyy-mm-dd
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    let arr = userOrders;

    // Rango de fechas (inclusive)
    if (from) {
      const d = new Date(from + "T00:00:00");
      arr = arr.filter((o) => !o.date || o.date >= d);
    }
    if (to) {
      const d = new Date(to + "T23:59:59");
      arr = arr.filter((o) => !o.date || o.date <= d);
    }

    // Buscador: id, estado o producto
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((o) => {
        const byId = String(o.id || "").toLowerCase().includes(q);
        const byStatus = String(o.status || "").toLowerCase().includes(q);
        const byItem =
          o.items?.some(
            (it) =>
              String(it?.nombre || it?.name || it?.title || "")
                .toLowerCase()
                .includes(q)
          ) || false;
        return byId || byStatus || byItem;
      });
    }
    return arr;
  }, [userOrders, query, from, to]);

  const totals = useMemo(() => {
    const count = filtered.length;
    const sum = filtered.reduce((a, o) => a + (o.total || 0), 0);
    return { count, sum };
  }, [filtered]);

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div>
            <div className="section-title">Historial de compras</div>
            <div className="muted">
              Usuario: <strong>{email}</strong> • Órdenes encontradas: <strong>{userOrders.length}</strong>
            </div>
          </div>
          <div className="admin-actions">
            <button className="btn-admin" onClick={() => navigate(-1)}>Volver</button>
            <Link className="btn-admin" to="/admin/users">Listado de usuarios</Link>
          </div>
        </div>

        <div className="card-body">
          {/* KPIs rápidos */}
          <div className="kpi-grid" style={{ marginBottom: 12 }}>
            <div className="kpi">
              <div className="kpi-label">Órdenes filtradas</div>
              <div className="kpi-value">{totals.count}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Monto total</div>
              <div className="kpi-value">{formatCLP(totals.sum)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Ticket promedio</div>
              <div className="kpi-value">
                {totals.count ? formatCLP(Math.round(totals.sum / totals.count)) : "—"}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Última compra</div>
              <div className="kpi-value">
                {filtered[0]?.date ? filtered[0].date.toLocaleString("es-CL") : "—"}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="toolbar">
            <input
              className="input"
              placeholder="Buscar por #orden, estado o producto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <label className="label" htmlFor="from" style={{ margin: 0 }}>Desde</label>
            <input
              id="from"
              className="input"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ width: 160 }}
            />
            <label className="label" htmlFor="to" style={{ margin: 0 }}>Hasta</label>
            <input
              id="to"
              className="input"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ width: 160 }}
            />
            <button className="btn-admin" onClick={() => { setQuery(""); setFrom(""); setTo(""); }}>
              Limpiar filtros
            </button>
          </div>

          {/* Tabla */}
          {filtered.length === 0 ? (
            <div className="card">
              <div className="card-body">
                <p className="muted" style={{ marginBottom: 10 }}>
                  No hay compras que coincidan con los filtros actuales.
                </p>
                <div className="quick-tiles">
                  <Link className="tile" to="/admin/users">Volver a usuarios</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 140 }}># Orden</th>
                    <th style={{ width: 170 }}>Fecha</th>
                    <th>Productos</th>
                    <th style={{ width: 130 }}>Total</th>
                    <th style={{ width: 120 }}>Estado</th>
                    <th style={{ width: 220 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={`ord-${o.id}`}>
                      <td><code>{o.id || "—"}</code></td>
                      <td>{o.date ? o.date.toLocaleString("es-CL") : "—"}</td>
                      <td>
                        {o.items?.length
                          ? o.items.map((it, idx) => {
                              const name = it?.nombre ?? it?.name ?? it?.title ?? `Item ${idx + 1}`;
                              const qty = it?.cantidad ?? it?.qty ?? it?.quantity ?? 1;
                              return (
                                <span key={`it-${idx}`}>
                                  {name} × {qty}
                                  {idx < o.items.length - 1 ? ", " : ""}
                                </span>
                              );
                            })
                          : <span className="muted">Sin detalle</span>}
                      </td>
                      <td>{formatCLP(o.total)}</td>
                      <td>{statusBadge(o.status)}</td>
                      <td>
                        <div className="admin-actions">
                          {o.id ? (
                            <Link className="btn-admin" to={`/boleta/${o.id}`}>Ver boleta</Link>
                          ) : null}
                          <Link className="btn-admin" to="/admin/orders">Ir a órdenes</Link>
                          <Link className="btn-admin" to="/admin/users">Volver a usuarios</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="quick-tiles">
        <Link className="tile" to="/admin/orders">Ver todas las órdenes</Link>
        <Link className="tile" to="/admin/reports">Ir a reportes</Link>
      </div>
    </div>
  );
}
