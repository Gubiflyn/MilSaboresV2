// src/pages/PagoError.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PagoError() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Datos que esperamos en state: { errorCode, errorMessage, cartSummary, attemptId, timestamp }
  const {
    errorCode = "UNKNOWN",
    errorMessage = "Hubo un problema al procesar tu pago.",
    cartSummary = null,
    attemptId = null,
    timestamp = null,
  } = state || {};

  useEffect(() => {
    // Registrar localmente el fallo para debugging / analytics.
    const prev = JSON.parse(localStorage.getItem("ms_failed_payments") || "[]");
    prev.push({
      attemptId: attemptId || `local-${Date.now()}`,
      errorCode,
      errorMessage,
      cartSummary,
      timestamp: timestamp || new Date().toISOString(),
    });
    localStorage.setItem("ms_failed_payments", JSON.stringify(prev));
    // opcional: enviar a backend con fetch/axios si existiera una API.
  }, [errorCode, errorMessage, cartSummary, attemptId, timestamp]);

  const handleRetry = () => {
    // Lleva al usuario al flujo de pago nuevamente
    navigate("/pago", { replace: false, state: { retryFrom: "error", previousAttemptId: attemptId } });
  };

  const handleVolverCarrito = () => navigate("/carrito");
  const handleContact = () => {
    // ejemplo: abrir modal o ir a /contacto
    navigate("/contacto");
  };

  return (
    <section className="container py-4">
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-danger mb-2">Pago no realizado</h2>
          <p className="mb-3">
            Lo sentimos — no pudimos procesar tu pago. Si quieres puedes intentar nuevamente o volver al carrito.
          </p>

          <div className="mb-3">
            <strong>Detalle del error:</strong>
            <div className="small text-muted mt-1">
              Código: <span className="me-2">{errorCode}</span>|
              Mensaje: <span className="ms-2">{errorMessage}</span>
            </div>
            {attemptId && <div className="small text-muted">ID intento: {attemptId}</div>}
            {timestamp && <div className="small text-muted">Hora: {new Date(timestamp).toLocaleString("es-CL")}</div>}
          </div>

          {cartSummary && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong>Resumen de tu pedido</strong>
              <ul className="mb-0 mt-2">
                {cartSummary.items?.map((it) => (
                  <li key={it.id}>
                    {it.name} x {it.qty} — ${ (it.price * it.qty).toLocaleString("es-CL") }
                  </li>
                ))}
              </ul>
              <div className="mt-2"><strong>Total:</strong> ${cartSummary.total?.toLocaleString("es-CL")}</div>
            </div>
          )}

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleRetry}>Reintentar pago</button>
            <button className="btn btn-outline-secondary" onClick={handleVolverCarrito}>Volver al carrito</button>
            <button className="btn btn-outline-danger" onClick={handleContact}>Contactar soporte</button>
          </div>

          <hr className="my-3" />

          <details>
            <summary className="small text-muted">¿Qué puedes revisar antes de reintentar?</summary>
            <ul className="small mb-0">
              <li>Verifica los datos de tu tarjeta (número, vencimiento, CVV).</li>
              <li>Revisa que tu banco no haya rechazado la transacción.</li>
              <li>Intenta con otro medio de pago si está disponible.</li>
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}
