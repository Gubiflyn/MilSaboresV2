import { useEffect, useMemo, useState } from "react";
import tortasSeed from "../../data/tortas.json";

const LS_RCPTS = "receipts_v1";
const LS_TORTAS = "tortas_v1";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

function toCSV(rows) {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replaceAll(`"`, `""`)}"`;
  const lines = [headers.map(esc).join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => esc(r[h])).join(",")));
  return lines.join("\n");
}

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [productos, setProductos] = useState([]);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState("");     // YYYY-MM-DD

  // Carga inicial y auto-refresh de órdenes
  useEffect(() => {
    const load = () => {
      const raw = JSON.parse(localStorage.getItem(LS_RCPTS) || "{}");
      const arr = Object.values(raw || {});
      setOrders(arr);
    };
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  // Cargar productos (para categorías)
  useEffect(() => {
    const p = JSON.parse(localStorage.getItem(LS_TORTAS) || "null") || tortasSeed;
    setProductos(p);
  }, []);

  // Índice rápido nombreProducto → categoría
  const categoriaByNombre = useMemo(() => {
    const map = new Map();
    productos.forEach((p) => map.set((p.nombre || "").toLowerCase(), p.categoria || "Otros"));
    return map;
  }, [productos]);

  // Filtro por texto (boleta/cliente) y rango de fechas
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;

    return orders.filter((o) => {
      // texto
      const matchText =
        !s ||
        (o.numeroBoleta || "").toLowerCase().includes(s) ||
        (o.receptor?.nombre || "").toLowerCase().includes(s);

      // fecha
      const d = new Date(o.fechaEmision);
      const matchFrom = !fromDate || d >= fromDate;
      const matchTo = !toDate || d <= toDate;

      return matchText && matchFrom && matchTo;
    }).sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
  }, [orders, q, from, to]);

  // KPIs
  const kpis = useMemo(() => {
    const n = filtered.length;
    const total = filtered.reduce((a, o) => a + (o.total || 0), 0);
    const items = filtered.reduce((a, o) => a + (o.items?.reduce((x, i) => x + (i.qty || 0), 0) || 0), 0);
    const avg = n ? Math.round(total / n) : 0;
    return { n, total, items, avg };
  }, [filtered]);

  // Resumen por categoría
  const resumenCategorias = useMemo(() => {
    const acc = new Map(); // cat -> { items, total }
    filtered.forEach((o) => {
      o.items?.forEach((it) => {
        const name = (it.nombre || "").toLowerCase();
        const cat = categoriaByNombre.get(name) || "Otros";
        const qty = it.qty || 0;
        const line = (it.precioUnit || 0) * qty; // si tienes precioUnit; si no, solo qty
        if (!acc.has(cat)) acc.set(cat, { items: 0, total: 0 });
        const cur = acc.get(cat);
        cur.items += qty;
        cur.total += line;
      });
    });
    // a falta de precioUnit en items, es común que total por categoría no cuadre exactamente con o.total;
    // si tus items no tienen precioUnit, puedes repartir usando proporcion de qty o mostrar solo "items".
    // Este ejemplo usa precioUnit si existe; si no, el total será 0 y quedará como contador de ítems.
    return Array.from(acc.entries())
      .map(([cat, v]) => ({ categoria: cat, items: v.items, total: v.total }))
      .sort((a, b) => b.items - a.items);
  }, [filtered, categoriaByNombre]);

  // Exportar CSV de órdenes filtradas
  const exportOrders = () => {
    const rows = filtered.map((o) => ({
      orderId: o.orderId,
      numeroBoleta: o.numeroBoleta,
      fecha: o.fechaEmision,
      cliente: o.receptor?.nombre || "",
      rut: o.receptor?.rut || "",
      email: o.receptor?.email || "",
      items: o.items?.reduce((a, i) => a + `${i.nombre} x${i.qty}; `, "") || "",
      total: o.total,
    }));
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ordenes_filtradas.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Exportar CSV de categorías (resumen)
  const exportCategorias = () => {
    const rows = resumenCategorias.map((r) => ({
      categoria: r.categoria,
      items: r.items,
      total: r.total,
    }));
    const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "resumen_categorias.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Header + filtros */}
      <div className="card">
        <div className="card-header">Reportes</div>
        <div className="card-body d-flex flex-wrap gap-2 align-items-end">
          <div>
            <label className="form-label mb-1">Buscar</label>
            <input
              className="form-control"
              placeholder="Boleta o cliente…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label mb-1">Desde</label>
            <input
              type="date"
              className="form-control"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label mb-1">Hasta</label>
            <input
              type="date"
              className="form-control"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={exportOrders}>
              Exportar órdenes (CSV)
            </button>
            <button className="btn btn-outline-secondary" onClick={exportCategorias}>
              Exportar categorías (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3">
        <div className="col-md-3">
          <div className="kpi kpi--blue">
            <div className="kpi__title">Órdenes</div>
            <div className="kpi__num">{kpis.n.toLocaleString("es-CL")}</div>
            <div className="small opacity-75">Filtradas por rango</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi">
            <div className="kpi__title">Ventas (CLP)</div>
            <div className="kpi__num">{CLP(kpis.total)}</div>
            <div className="small opacity-75">Suma de boletas</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi kpi--green">
            <div className="kpi__title">Ticket promedio</div>
            <div className="kpi__num">{CLP(kpis.avg)}</div>
            <div className="small opacity-75">Total / órdenes</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi kpi--yellow">
            <div className="kpi__title">Ítems vendidos</div>
            <div className="kpi__num">{kpis.items.toLocaleString("es-CL")}</div>
            <div className="small opacity-75">Suma de cantidades</div>
          </div>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="card">
        <div className="card-header">Órdenes filtradas ({filtered.length})</div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Boleta</th>
                <th>Cliente</th>
                <th>Ítems</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">Sin registros en el rango.</td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.orderId}>
                  <td>{new Date(o.fechaEmision).toLocaleString()}</td>
                  <td>{o.numeroBoleta}</td>
                  <td>{o.receptor?.nombre || "—"}</td>
                  <td>{o.items?.reduce((a, i) => a + (i.qty || 0), 0)}</td>
                  <td>{CLP(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen por categoría */}
      <div className="card">
        <div className="card-header">Resumen por categoría</div>
        <div className="table-responsive">
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Ítems</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {resumenCategorias.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-3">Sin datos para el rango.</td>
                </tr>
              )}
              {resumenCategorias.map((r) => (
                <tr key={r.categoria}>
                  <td>{r.categoria}</td>
                  <td>{r.items}</td>
                  <td>{CLP(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
