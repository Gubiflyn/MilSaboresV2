// src/pages/admin/AdminBoletas.jsx
import React, { useEffect, useState } from "react";
import { getBoletas } from "../../services/api";

function formatFecha(fechaEmision) {
  if (!fechaEmision) return "-";
  try {
    const d = new Date(fechaEmision);
    return d.toLocaleString("es-CL");
  } catch {
    return fechaEmision;
  }
}

export default function AdminBoletas() {
  const [boletas, setBoletas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        setError("");
        const data = await getBoletas(); // GET /api/boletas/listBoletas
        setBoletas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando boletas:", err);
        setError(err.message || "Error al cargar boletas");
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  if (cargando) {
    return <p>Cargando boletas...</p>;
  }

  if (error) {
    return <p className="text-danger">Error: {error}</p>;
  }

  if (!boletas.length) {
    return <p>No hay boletas registradas.</p>;
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h2 className="mb-0">Boletas</h2>
        <span className="badge bg-secondary">Total: {boletas.length}</span>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha emisión</th>
                <th>Total</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {boletas.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{formatFecha(b.fechaEmision)}</td>
                  <td>
                    $
                    {(b.total ?? 0).toLocaleString("es-CL")}
                  </td>
                  {/* nombre del cliente desde el DTO */}
                  <td>{b.nombreUsuario || "Sin nombre"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

    
      </div>
    </div>
  );
}
