import React, { useEffect, useState } from "react";

const LS_TORTAS = "productos";
const CRITICAL_STOCK = 3;

export default function CriticalProducts() {
  const [criticos, setCriticos] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LS_TORTAS) || "[]");
    const soloCriticos = (Array.isArray(data) ? data : []).filter(
      (p) => Number(p.stock) <= CRITICAL_STOCK
    );
    setCriticos(soloCriticos);
  }, []);

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Productos Críticos</h2>
      </div>

      {criticos.length === 0 ? (
        <div className="alert alert-success">
          No hay productos en nivel crítico (≤ {CRITICAL_STOCK}).
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th style={{width:120}}>Código</th>
                <th>Nombre</th>
                <th style={{width:140}}>Precio</th>
                <th style={{width:120}}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {criticos.map((p) => (
                <tr key={p.codigo} className="table-danger">
                  <td>{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td>${Number(p.precio).toLocaleString()}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-muted small mt-2">
        * Se consideran críticos los productos con stock ≤ {CRITICAL_STOCK}.
      </div>
    </div>
  );
}
