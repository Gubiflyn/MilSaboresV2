import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";

const formatCLP = (n) => (n || 0).toLocaleString("es-CL");

export default function Boleta() {
  const { orderId } = useParams();

  const receipt = useMemo(() => {
    try {
      const map = JSON.parse(localStorage.getItem("receipts_v1") || "{}");
      return map[orderId] || null;
    } catch {
      return null;
    }
  }, [orderId]);

  if (!receipt) {
    return (
      <div className="container py-5">
        <h2 className="mb-3">Boleta</h2>
        <div className="alert alert-warning">
          No encontré una boleta con el id <strong>{orderId}</strong>.
        </div>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  const { emisor, receptor, items, subtotal, descuento, total, numeroBoleta, fechaEmision, notasPromo } = receipt;

  const onPrint = () => window.print();

  return (
    <div className="container py-5">
      <div style={{maxWidth: 860, margin: "0 auto", background: "#fff"}} className="p-4 border rounded">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="mb-1">Boleta #{numeroBoleta}</h2>
            <div className="text-muted">Orden: {receipt.orderId}</div>
          </div>
          <div className="text-end">
            <div><strong>{emisor?.razonSocial || "Mil Sabores SPA"}</strong></div>
            <div>RUT: {emisor?.rut || "76.123.456-7"}</div>
            <div>Emitida: {new Date(fechaEmision).toLocaleString("es-CL")}</div>
          </div>
        </div>

        <hr />

        <div className="mb-3">
          <strong>Cliente:</strong> {receptor?.nombre || "Cliente"} {receptor?.rut ? `— RUT: ${receptor.rut}` : ""}<br />
          {receptor?.email ? <><strong>Email:</strong> {receptor.email}</> : null}
        </div>

        {Array.isArray(items) && items.length > 0 && (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-end">Cant.</th>
                  <th className="text-end">Precio</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.nombre}</td>
                    <td className="text-end">{it.qty}</td>
                    <td className="text-end">${formatCLP(it.precioUnit)}</td>
                    <td className="text-end">${formatCLP(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-end">
          <div style={{minWidth: 260}}>
            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>${formatCLP(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className="d-flex justify-content-between text-success">
                <span>Descuento</span>
                <span>- ${formatCLP(descuento)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>${formatCLP(total)}</span>
            </div>
          </div>
        </div>

        {/* Etiquetas de promociones aplicadas (si existen) */}
        <div className="mt-3">
          {notasPromo?.ageDiscount && <span className="badge text-bg-success me-2">50% +50 años</span>}
          {notasPromo?.codeApplied && !notasPromo?.ageDiscount && (
            <span className="badge text-bg-info me-2">Código: {String(notasPromo.codeApplied).toUpperCase()}</span>
          )}
          {notasPromo?.duocBirthday && <span className="badge text-bg-warning">Torta gratis cumpleaños DUOC</span>}
        </div>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-primary" onClick={onPrint}>Imprimir / Guardar PDF</button>
          <Link to="/" className="btn btn-outline-secondary">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
