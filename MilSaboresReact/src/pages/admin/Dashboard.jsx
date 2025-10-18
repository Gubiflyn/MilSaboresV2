import { useEffect, useMemo, useState } from "react";
import tortasSeed from "../../data/tortas.json";
import usersSeed from "../../data/usuarios.json";
import KPIStat from "../../components/admin/KPIStat";
import QuickTiles from "../../components/admin/QuickTiles";

const LS_TORTAS = "tortas_v1";
const LS_RCPTS = "receipts_v1";
const LS_USERS  = "usuarios_v1";
const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios]   = useState([]);
  const [receipts, setReceipts]   = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    const p = JSON.parse(localStorage.getItem(LS_TORTAS) || "null") || tortasSeed;
    setProductos(p);

    const u = JSON.parse(localStorage.getItem(LS_USERS) || "null") || usersSeed;
    setUsuarios(u);

    const loadReceipts = () =>
      setReceipts(JSON.parse(localStorage.getItem(LS_RCPTS) || "{}"));
    loadReceipts();

    // refresco simple de ventas/boletas
    const t = setInterval(loadReceipts, 2000);
    return () => clearInterval(t);
  }, []);

  // KPIs calculados
  const stats = useMemo(() => {
    const orders = Object.values(receipts || {});
    const compras = orders.length;
    const totalVentas = orders.reduce((a, o) => a + (o?.total || 0), 0);
    const invActual = productos.length;

    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(); // 0-11
    const usuariosTotal = usuarios.length;
    const usuariosMes = usuarios.filter(u => {
      if (!u.createdAt) return false;
      const d = new Date(u.createdAt);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;

    return { compras, totalVentas, invActual, usuariosTotal, usuariosMes };
  }, [productos, usuarios, receipts]);

  const tiles = [
    { to: "/admin", label: "Dashboard", desc: "Visión general de métricas." },
    { to: "/admin/orders", label: "Órdenes", desc: "Gestión y seguimiento." },
    { to: "/admin/products", label: "Productos", desc: "Inventario y detalles." },
    { to: "/admin/categories", label: "Categorías", desc: "Organiza el catálogo." },
    { to: "/admin/users", label: "Usuarios", desc: "Cuentas y roles." },
    { to: "/admin/reports", label: "Reportes", desc: "Informes del sistema." },
    { to: "/admin/products/critical", label: "Críticos", desc: "Stock en mínimo." },
    { to: "/", label: "Tienda", desc: "Ver tienda en tiempo real." },
  ];

  return (
    <>
      <div className="d-flex align-items-baseline justify-content-between mb-2">
        <h3 className="mb-0">Dashboard</h3>
        <div className="text-muted">Resumen de las actividades diarias</div>
      </div>

      {/* KPIs */}
      <div className="row g-3">
        <div className="col-md-3">
          <KPIStat
            title="Compras"
            value={stats.compras.toLocaleString("es-CL")}
            foot="Actualizado en tiempo real"
            variant="blue"
          />
        </div>
        <div className="col-md-3">
          <KPIStat
            title="Ventas (CLP)"
            value={CLP(stats.totalVentas)}
            foot="Suma de boletas"
          />
        </div>
        <div className="col-md-3">
          <KPIStat
            title="Productos"
            value={stats.invActual}
            foot={`Inventario actual: ${stats.invActual}`}
            variant="green"
          />
        </div>
        <div className="col-md-3">
          <KPIStat
            title="Usuarios"
            value={stats.usuariosTotal}
            foot={`Nuevos este mes: ${stats.usuariosMes}`}
            variant="yellow"
          />
        </div>
      </div>

      {/* Mosaicos */}
      <div className="mt-3">
        <QuickTiles items={tiles} />
      </div>
    </>
  );
}
