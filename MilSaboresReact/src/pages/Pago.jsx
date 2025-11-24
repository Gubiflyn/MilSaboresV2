import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { applyPromotions } from "../utils/promotions";
import PayPalCheckout from "../components/PayPalCheckout";
import { createBoleta } from "../services/api"; // ← quitado createDetallesBoletaList

const CLP = (n) => (parseInt(n, 10) || 0).toLocaleString("es-CL");

const saveOrderToHistory = (order) => {
  try {
    const key = "ordenes_v1";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push(order);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.warn("No se pudo guardar el historial de compra:", err);
  }
};

export default function Pago() {
  const { carrito, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const subtotalItems = useMemo(
    () => carrito.reduce((a, t) => a + (t.precio || 0) * (t.cantidad || 1), 0),
    [carrito]
  );

  const ahorroOfertas = useMemo(
    () =>
      carrito.reduce((acc, t) => {
        const po = Number(t.precioOriginal || 0);
        const p = Number(t.precio || 0);
        const q = Number(t.cantidad || 1);
        return po > p ? acc + (po - p) * q : acc;
      }, 0),
    [carrito]
  );

  const subtotalNormalEstimado = useMemo(
    () => subtotalItems + ahorroOfertas,
    [subtotalItems, ahorroOfertas]
  );

  const [dateLimits, setDateLimits] = useState({ min: "", max: "" });
  useEffect(() => {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const max = new Date(hoy);
    max.setDate(hoy.getDate() + 30);
    const toISO = (d) => d.toISOString().split("T")[0];
    setDateLimits({ min: toISO(manana), max: toISO(max) });
  }, []);

  const [metodo, setMetodo] = useState("card");

  const [form, setForm] = useState({
    nombre: "",
    numero: "",
    expiracion: "",
    cvv: "",
    fechaEntrega: "",
    correo: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        correo: prev.correo?.trim() ? prev.correo : user.email || "",
        nombre: prev.nombre?.trim() ? prev.nombre : user.nombre || "",
      }));
    }
  }, [isAuthenticated, user]);

  const promoPreview = useMemo(
    () =>
      applyPromotions({
        items: carrito,
        customerEmail: (form.correo || user?.email || "").trim(),
      }),
    [carrito, form.correo, user?.email]
  );

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa el nombre en la tarjeta.";
    if (!/^\d{16}$/.test(form.numero)) e.numero = "Número de 16 dígitos.";
    const exp = (form.expiracion || "").trim();
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp))
      e.expiracion = "Formato MM/AA (ej: 08/27).";
    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = "CVV de 3 o 4 dígitos.";
    if (
      !form.fechaEntrega ||
      form.fechaEntrega < dateLimits.min ||
      form.fechaEntrega > dateLimits.max
    )
      e.fechaEntrega = "Selecciona una fecha válida.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((form.correo || "").trim()))
      e.correo = "Correo electrónico inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /**
   * Sincroniza la compra con el backend:
   * - Crea la BOLETA junto con sus DETALLES (en un solo endpoint)
   */
  const syncBoletaBackend = async (receipt) => {
    try {
      // Solo guardamos en la BD si hay usuario autenticado con id
      if (!isAuthenticated || !user?.id) {
        console.info("Compra de invitado: no se guarda boleta en BD.");
        return;
      }

      // Construimos el payload que espera el backend (BoletaRequestDTO)
      const detallesDto = (receipt.items || [])
        .map((it) => {
          const pastelId = it.productoId ?? it.idProducto ?? it.id ?? null;
          if (!pastelId) return null;

          return {
            pastelId,                // mapea al ID del producto/pastel
            cantidad: it.qty,
            precioUnitario: it.precioUnit,
          };
        })
        .filter(Boolean);

      const boletaPayload = {
        fechaEmision: receipt.fechaEmision,          // el backend ya lo está recibiendo así
        total: Math.round(receipt.total || 0),
        usuarioId: user.id,
        detalles: detallesDto,                       // ← aquí van los detalles
      };

      // Una sola llamada: el backend guarda BOLETA + DETALLE_BOLETA por cascade
      const boletaCreada = await createBoleta(boletaPayload);
      console.log("Boleta creada en backend con detalles:", boletaCreada);
    } catch (err) {
      console.error("Error al sincronizar boleta/detalles con el backend:", err);
      // No lanzamos el error para no romper el flujo de compra
    }
  };

  /**
   * Finaliza la orden:
   * - Calcula promociones
   * - Genera el "receipt" (boleta para el front)
   * - Guarda en localStorage
   * - Guarda en historial
   * - Sincroniza con backend
   * - Limpia carrito y navega a la boleta
   */
  const finalizarOrden = async ({ orderId, receptorNombre, receptorEmail }) => {
    const promo = applyPromotions({
      items: carrito,
      customerEmail: (receptorEmail || "").trim(),
    });

    const receipt = {
      orderId,
      numeroBoleta: "B-" + orderId.slice(-6),
      fechaEmision: new Date().toISOString(),
      emisor: { razonSocial: "Mil Sabores SPA", rut: "76.123.456-7" },
      receptor: {
        nombre: receptorNombre || "",
        email: receptorEmail || "",
        userId: isAuthenticated ? user?.id : null,
        guest: !isAuthenticated,
      },
      items: carrito.map((t, i) => ({
        productoId: t.id ?? t.codigo ?? null,
        nombre: t.nombre,
        qty: t.cantidad || 1,
        precioUnit: t.precio || 0,
        total: (t.precio || 0) * (t.cantidad || 1),
        mensaje: t.mensaje || "",
      })),
      subtotal: promo.subtotal,
      descuento: promo.descuento,
      total: promo.total,
      moneda: "CLP",
      notasPromo: promo.breakdown || {},
    };

    // Guardar boleta en localStorage (para Boleta.jsx)
    const map = JSON.parse(localStorage.getItem("receipts_v1") || "{}");
    map[orderId] = receipt;
    localStorage.setItem("receipts_v1", JSON.stringify(map));

    // Guardar también en historial simplificado
    saveOrderToHistory({
      id: orderId,
      userEmail: (receptorEmail || "").toLowerCase(),
      items: carrito.map((t, i) => ({
        codigo: t.codigo ?? t.id ?? t.sku ?? `SKU-${i + 1}`,
        nombre: t.nombre || "Producto",
        cantidad: t.cantidad || 1,
        precio: t.precio || 0,
      })),
      total: receipt.total,
      date: new Date().toISOString(),
      estado: "pagado",
    });

    // Sincronizar con backend (boleta + detalles)
    await syncBoletaBackend(receipt);

    // Limpiar carrito y navegar a la boleta
    clear();
    localStorage.removeItem("totalCompra");
    navigate(`/boleta/${orderId}`);
  };

  const onSubmitTarjeta = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Simulación de error: si la tarjeta comienza con 0000 → redirige a PagoError
    if (form.numero.startsWith("0000")) {
      navigate("/pago/error", {
        state: {
          mensaje: "Transacción rechazada: número de tarjeta inválido (0000).",
          customer: { nombre: form.nombre, correo: form.correo },
          items: carrito,
          total: promoPreview?.total ?? subtotalItems,
        },
      });
      return;
    }

    const orderId =
      "ORD-" + new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

    await finalizarOrden({
      orderId,
      receptorNombre: form.nombre.trim(),
      receptorEmail: (form.correo || "").trim(),
    });
  };

  if (carrito.length === 0) {
    return (
      <div className="container py-5">
        <h2 className="text-center mb-4">Pago</h2>
        <p className="text-center">Tu carrito está vacío.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Pago de tu Compra</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Resumen</h5>

          <div className="d-flex justify-content-between">
            <span>Subtotal precio normal (estimado)</span>
            <span>${CLP(subtotalNormalEstimado)}</span>
          </div>

          <div className="d-flex justify-content-between text.success">
            <span>Ahorro por ofertas de producto</span>
            <span>-${CLP(ahorroOfertas)}</span>
          </div>

          <hr className="my-2" />

          <div className="d-flex justify-content-between">
            <span>Subtotal después de ofertas</span>
            <span>${CLP(subtotalItems)}</span>
          </div>

          <div className="d-flex justify-content-between text-success">
            <span>Descuentos adicionales (promociones/cupones)</span>
            <span>-${CLP(promoPreview?.descuento || 0)}</span>
          </div>

          <div className="d-flex justify-content-between fw-semibold fs-5 mt-2">
            <span>Total a pagar</span>
            <span>${CLP(promoPreview?.total ?? subtotalItems)}</span>
          </div>

          {(promoPreview?.breakdown?.detalles || []).length > 0 && (
            <ul className="small text-muted mt-2 mb-0">
              {promoPreview.breakdown.detalles.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Selecciona tu método de pago</h5>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="metodo-card"
                name="metodo"
                value="card"
                checked={metodo === "card"}
                onChange={() => setMetodo("card")}
              />
              <label className="form-check-label" htmlFor="metodo-card">
                Tarjeta de crédito/débito
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="metodo-paypal"
                name="metodo"
                value="paypal"
                checked={metodo === "paypal"}
                onChange={() => setMetodo("paypal")}
              />
              <label className="form-check-label" htmlFor="metodo-paypal">
                PayPal
              </label>
            </div>
          </div>
        </div>
      </div>

      {metodo === "card" && (
        <form onSubmit={onSubmitTarjeta} noValidate>
          <h5 className="mb-3">Pago con Tarjeta</h5>

          <div className="mb-3">
            <label className="form-label">Nombre en la tarjeta</label>
            <input
              className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
            {errors.nombre && (
              <div className="invalid-feedback">{errors.nombre}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Número de tarjeta</label>
            <input
              className={`form-control ${errors.numero ? "is-invalid" : ""}`}
              value={form.numero}
              onChange={(e) =>
                setForm({
                  ...form,
                  numero: e.target.value.replace(/\D/g, "").slice(0, 16),
                })
              }
              placeholder="16 dígitos"
              inputMode="numeric"
              maxLength={16}
              required
            />
            {errors.numero && (
              <div className="invalid-feedback">{errors.numero}</div>
            )}
          </div>

          <div className="mb-3 d-flex gap-2">
            <div className="flex-fill">
              <label className="form-label">Expiración (MM/AA)</label>
              <input
                className={`form-control ${
                  errors.expiracion ? "is-invalid" : ""
                }`}
                value={form.expiracion}
                onChange={(e) =>
                  setForm({ ...form, expiracion: e.target.value })
                }
                placeholder="MM/AA"
                required
              />
              {errors.expiracion && (
                <div className="invalid-feedback d-block">
                  {errors.expiracion}
                </div>
              )}
            </div>
            <div className="flex-fill">
              <label className="form-label">CVV</label>
              <input
                className={`form-control ${errors.cvv ? "is-invalid" : ""}`}
                value={form.cvv}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                placeholder="3 o 4 dígitos"
                inputMode="numeric"
                maxLength={4}
                required
              />
              {errors.cvv && (
                <div className="invalid-feedback d-block">
                  {errors.cvv}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Fecha de entrega</label>
            <input
              type="date"
              className={`form-control ${
                errors.fechaEntrega ? "is-invalid" : ""
              }`}
              value={form.fechaEntrega}
              onChange={(e) =>
                setForm({ ...form, fechaEntrega: e.target.value })
              }
              min={dateLimits.min}
              max={dateLimits.max}
              required
            />
            {errors.fechaEntrega && (
              <div className="invalid-feedback">{errors.fechaEntrega}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Correo para boleta</label>
            <input
              type="email"
              className={`form-control ${errors.correo ? "is-invalid" : ""}`}
              value={form.correo}
              onChange={(e) =>
                setForm({ ...form, correo: e.target.value })
              }
              required
            />
            {errors.correo && (
              <div className="invalid-feedback">{errors.correo}</div>
            )}
          </div>

          <button className="btn btn-success mb-4" type="submit">
            Pagar con Tarjeta
          </button>
        </form>
      )}

      {metodo === "paypal" && (
        <div className="my-4">
          <h5 className="mb-3">Pagar con PayPal</h5>
          <div className="d-flex justify-content-start">
            <div style={{ width: "320px" }}>
              <PayPalCheckout
                customerEmail={(form.correo || user?.email || "").trim()}
                onPaid={(details) => {
                  const orderId = details?.id || `PP-${Date.now()}`;
                  const payerName = details?.payer?.name?.given_name
                    ? `${details.payer.name.given_name} ${
                        details.payer.name?.surname || ""
                      }`.trim()
                    : user?.nombre || "Cliente PayPal";
                  const payerEmail =
                    details?.payer?.email_address ||
                    form.correo ||
                    user?.email ||
                    "";
                  finalizarOrden({
                    orderId,
                    receptorNombre: payerName,
                    receptorEmail: payerEmail,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
