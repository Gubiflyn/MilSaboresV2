// PagoError.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const formatCLP = (n) => Number(n || 0).toLocaleString("es-CL");

export default function PagoError() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Esperamos recibir en state: { orderId, attemptId, mensaje, customer, address, items, total }
  const orderId = state?.orderId || state?.attemptId || `#${(new Date()).toISOString().slice(0,10).replace(/-/g,"")}`;
  const mensaje = state?.mensaje || "No se pudo procesar tu pago.";
  const customer = state?.customer || { nombre: "", apellido: "", correo: "" };
  const address = state?.address || { calle: "", depto: "", region: "", comuna: "", instrucciones: "" };
  const items = state?.items || [];
  const total = state?.total ?? items.reduce((s,it) => s + (it.precio||0) * (it.cantidad||1), 0);

  return (
    <section className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div style={{
              width: 44, height: 44, borderRadius: 24, background: "#ffecec",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#d9534f", fontWeight: 700
            }}>✕</div>

            <div>
              <h4 className="mb-1 text-danger">No se pudo realizar el pago. nro {orderId}</h4>
              <small className="text-muted">Detalle de compra</small>
            </div>

            <div className="ms-auto">
              <button
                className="btn btn-success"
                onClick={() => navigate("/pago")}
              >
                VOLVER A REALIZAR EL PAGO
              </button>
            </div>
          </div>

          <hr />

          {/* Datos comprador */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label small">Nombre</label>
              <input className="form-control" value={customer.nombre || ""} readOnly />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Apellidos</label>
              <input className="form-control" value={customer.apellido || ""} readOnly />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Correo</label>
              <input className="form-control" value={customer.correo || ""} readOnly />
            </div>
          </div>

          {/* Dirección */}
          <div className="mb-3">
            <h6 className="mb-2">Dirección de entrega de los productos</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small">Calle</label>
                <input className="form-control" value={address.calle || ""} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Departamento (opcional)</label>
                <input className="form-control" value={address.depto || ""} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Región</label>
                <input className="form-control" value={address.region || ""} readOnly />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Comuna</label>
                <input className="form-control" value={address.comuna || ""} readOnly />
              </div>
              <div className="col-12">
                <label className="form-label small">Indicaciones para la entrega (opcional)</label>
                <textarea className="form-control" rows={3} value={address.instrucciones || ""} readOnly />
              </div>
            </div>
          </div>

          {/* Tabla resumen */}
          <div className="table-responsive mb-3">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th style={{width: 80}}>Imagen</th>
                  <th>Nombre</th>
                  <th className="text-end">Precio</th>
                  <th className="text-center">Cantidad</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">No hay items en el carrito.</td>
                  </tr>
                ) : (
                  items.map(it => (
                    <tr key={it.id || `${it.nombre}-${Math.random()}`}>
                      <td>
                        <img src={it.imagen || "/img/placeholder-64.png"} alt={it.nombre} style={{width:64, height:48, objectFit:"cover"}} />
                      </td>
                      <td>{it.nombre}</td>
                      <td className="text-end">${formatCLP(it.precio)}</td>
                      <td className="text-center">{it.cantidad}</td>
                      <td className="text-end">${formatCLP((it.precio||0) * (it.cantidad||1))}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-end"><strong>Total:</strong></td>
                  <td className="text-end"><strong>${formatCLP(total)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mensaje de error y acciones */}
          <div className="mb-3">
            <div className="alert alert-warning p-2 mb-2">{mensaje}</div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={() => navigate("/pago")}>Reintentar pago</button>
              <button className="btn btn-outline-secondary" onClick={() => navigate("/carrito")}>Volver al carrito</button>
              <button className="btn btn-outline-danger" onClick={() => navigate("/contacto")}>Contactar soporte</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
