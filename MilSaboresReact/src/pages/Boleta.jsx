import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CLP = (n) => Number(n || 0).toLocaleString("es-CL");

export default function Boleta() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    try {
      const map = JSON.parse(localStorage.getItem("receipts_v1") || "{}");
      setReceipt(map?.[orderId] || null);
    } catch {
      setReceipt(null);
    }
  }, [orderId]);

  const notFound = !receipt;

  const totales = useMemo(() => {
    if (!receipt) return { subtotal: 0, descuento: 0, total: 0 };
    return {
      subtotal: receipt.subtotal ?? 0,
      descuento: receipt.descuento ?? 0,
      total: receipt.total ?? 0,
    };
  }, [receipt]);

  const handlePrint = () => window.print();
  const handleVolver = () => navigate("/");

  if (notFound) {
    return (
      <section className="container py-5 text-center">
        <h2>Boleta no encontrada</h2>
        <p className="text-muted">No se encontró la boleta para el id: <code>{orderId}</code>.</p>
        <button className="btn btn-primary mt-3" onClick={handleVolver}>Volver al inicio</button>
      </section>
    );
  }

  return (
    <section className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">

          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div className="mb-2">
              <h4 className="mb-0">Boleta electrónica</h4>
              <small className="text-muted">
                N° {receipt.numeroBoleta} · Orden {receipt.orderId}
              </small>
            </div>
            <div className="text-end mb-2">
              <div className="fw-semibold">{receipt.emisor?.razonSocial || "Mil Sabores SPA"}</div>
              <div className="text-muted">RUT: {receipt.emisor?.rut || "76.123.456-7"}</div>
              <div className="text-muted">
                Fecha: {new Date(receipt.fechaEmision).toLocaleString("es-CL")}
              </div>
            </div>
          </div>

          <hr />

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <h6 className="mb-2">Datos del cliente</h6>
              <div className="small">
                <div><strong>Cliente:</strong> {receipt.receptor?.guest ? "Invitado" : (receipt.receptor?.nombre || "-")}</div>
                <div><strong>Correo:</strong> {receipt.receptor?.email || "-"}</div>
              </div>
            </div>
            <div className="col-md-6">
              <h6 className="mb-2">Moneda</h6>
              <div className="small"> {receipt.moneda || "CLP"} </div>
            </div>
          </div>

          <div className="table-responsive mb-3">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-center" style={{width: 90}}>Cant.</th>
                  <th className="text-end" style={{width: 140}}>Precio</th>
                  <th className="text-end" style={{width: 160}}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(receipt.items || []).map((it, i) => (
                  <tr key={i}>
                    <td>
                      {it.nombre}
                      {it.mensaje && (
                        <div className="small text-muted">“{it.mensaje}”</div>
                      )}
                    </td>
                    <td className="text-center">{it.qty}</td>
                    <td className="text-end">${CLP(it.precioUnit)}</td>
                    <td className="text-end">${CLP(it.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-end">Subtotal</td>
                  <td className="text-end">${CLP(totales.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-end">Descuento</td>
                  <td className="text-end">-${CLP(totales.descuento)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-end fw-semibold">Total</td>
                  <td className="text-end fw-semibold">${CLP(totales.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {receipt.notasPromo?.detalles?.length > 0 && (
            <div className="mb-3">
              <h6>Promociones aplicadas</h6>
              <ul className="small text-muted mb-0">
                {receipt.notasPromo.detalles.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-outline-secondary" onClick={handleVolver}>
              Volver al inicio
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              Imprimir / Guardar PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
