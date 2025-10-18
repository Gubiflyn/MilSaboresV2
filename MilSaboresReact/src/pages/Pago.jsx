// src/pages/Pago.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { applyPromotions } from "../utils/promotions";

const formatCLP = (n) => (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function Pago() {
  const { carrito, clear } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Total base SIN IVA ni promociones (compat con tu HTML antiguo)
  const subtotalBase = useMemo(
    () => carrito.reduce((a, t) => a + (t.precio || 0) * (t.cantidad || 1), 0),
    [carrito]
  );

  // Fechas válidas (mañana a +30 días)
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

  // Form
  const [form, setForm] = useState({
    nombre: "",
    numero: "",
    expiracion: "",
    cvv: "",
    fechaEntrega: "",
    correo: ""
  });

  // Errores simples
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    if (!form.nombre.trim()) e.nombre = "Ingresa el nombre en la tarjeta.";

    if (!/^\d{16}$/.test(form.numero)) e.numero = "Número de 16 dígitos.";

    // Exp MM/AA y no vencida
    const expOK = /^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiracion.trim());
    if (!expOK) {
      e.expiracion = "Formato MM/AA (ej: 08/27).";
    } else {
      const [mm, aa] = form.expiracion.split("/");
      const expDate = new Date(`20${aa}`, parseInt(mm, 10)); // primer día del mes siguiente
      const now = new Date();
      now.setDate(1); // comparar mes/año
      if (expDate <= now) e.expiracion = "Tarjeta vencida.";
    }

    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = "CVV de 3 o 4 dígitos.";

    if (
      !form.fechaEntrega ||
      form.fechaEntrega < dateLimits.min ||
      form.fechaEntrega > dateLimits.max
    )
      e.fechaEntrega = "Selecciona una fecha válida.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim()))
      e.correo = "Correo electrónico inválido.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Previsualización de promos según correo + carrito
  const promoPreview = useMemo(
    () =>
      applyPromotions({
        items: carrito,
        customerEmail: form.correo.trim()
      }),
    [carrito, form.correo]
  );

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    // Simulación de pago fallido:
    //  - Si la tarjeta empieza con "0000" o si pasas ?fail=1 en la URL, falla.
    const urlParams = new URLSearchParams(window.location.search);
    const forceFail = urlParams.get("fail") === "1";
    const startsWithZeros = form.numero.startsWith("0000");
    const shouldFail = forceFail || startsWithZeros;

    if (shouldFail) {
      // Pasamos datos a la página de error para que muestre el resumen
      navigate("/pago/error", {
        state: {
          attemptId: `ERR-${Date.now()}`,
          mensaje: startsWithZeros
            ? "Tu banco rechazó la transacción. Verifica los datos o intenta con otro medio de pago."
            : "No pudimos procesar tu pago. Inténtalo nuevamente en unos minutos.",
          customer: {
            nombre: form.nombre.trim(),
            apellido: "",
            correo: form.correo.trim()
          },
          address: {
            calle: "",
            depto: "",
            region: "",
            comuna: "",
            instrucciones: ""
          }, // opcional, si luego agregas campos
          items: carrito.map((t) => ({
            id: t.id,
            nombre: t.nombre,
            precio: t.precio || 0,
            cantidad: t.cantidad || 1,
            imagen: t.imagen
          })),
          total: promoPreview.total // mostramos el total con promo pre-aplicada
        }
      });
      return; // importante: NO limpiar carrito ni generar boleta
    }

    // Aplicar promociones reales al momento de generar la boleta
    const promo = applyPromotions({
      items: carrito,
      customerEmail: form.correo.trim()
    });

    // 1) Generar ID y armar boleta (usando promo aplicada)
    const orderId =
      "ORD-" +
      new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

    const receipt = {
      orderId,
      numeroBoleta: "B-" + orderId.slice(-6),
      fechaEmision: new Date().toISOString(),
      emisor: { razonSocial: "Mil Sabores SPA", rut: "76.123.456-7" },
      receptor: {
        nombre: form.nombre.trim(),
        email: form.correo.trim(),
        userId: isAuthenticated ? user?.id : null, // invitado vs usuario
        guest: !isAuthenticated
      },
      items: carrito.map((t) => ({
        nombre: t.nombre,
        qty: t.cantidad || 1,
        precioUnit: t.precio || 0,
        total: (t.precio || 0) * (t.cantidad || 1),
         mensaje: t.mensaje || ""
      })),

      // montos con promos
      subtotal: promo.subtotal,
      descuento: promo.descuento,
      total: promo.total,
      moneda: "CLP",

      notasPromo: {
        porcentajeAplicado: promo.breakdown.porcentaje, // 0 | 0.1 | 0.5
        descuentoPorcentaje: promo.breakdown.percDiscount, // $
        descuentoCumpleDuoc: promo.breakdown.birthdayDiscount, // $
        detalles: promo.breakdown.detalles // textos descriptivos
      }
    };

    // 2) Guardar en localStorage (receipts_v1 como mapa por id)
    const map = JSON.parse(localStorage.getItem("receipts_v1") || "{}");
    map[orderId] = receipt;
    localStorage.setItem("receipts_v1", JSON.stringify(map));

    // 3) Limpiar carrito y compat antiguo
    clear();
    localStorage.removeItem("totalCompra");

    // 4) Navegar a la boleta
    navigate(`/boleta/${orderId}`);
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
      <h2 className="mb-3 text-center">Pago de tu Compra</h2>

      {/* Banner invitado */}
      {!isAuthenticated && (
        <div className="alert alert-info" role="alert">
          Estás comprando como <strong>invitado</strong>. Si inicias sesión,
          podrás guardar tu historial de compras.
        </div>
      )}

      {/* Previsualización de totales con promos (según correo ingresado) */}
      <div className="mb-3">
        <div>
          Subtotal: <strong>${promoPreview.subtotal.toLocaleString("es-CL")}</strong>
        </div>
        <div>
          Descuento:{" "}
          <strong>-$
            {promoPreview.descuento.toLocaleString("es-CL")}
          </strong>
        </div>
        <div>
          Total: <strong>${promoPreview.total.toLocaleString("es-CL")}</strong>
        </div>
        {promoPreview.breakdown.detalles.length > 0 && (
          <ul className="small text-muted mt-2">
            {promoPreview.breakdown.detalles.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate>
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
                numero: e.target.value.replace(/\D/g, "").slice(0, 16)
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
          <div className="form-text">
            Tip prueba: usa una tarjeta que empiece con <code>0000</code> o
            agrega <code>?fail=1</code> a la URL para simular error.
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de expiración</label>
          <input
            className={`form-control ${
              errors.expiracion ? "is-invalid" : ""
            }`}
            value={form.expiracion}
            onChange={(e) => setForm({ ...form, expiracion: e.target.value })}
            placeholder="MM/AA"
            required
          />
        </div>
        {errors.expiracion && (
          <div className="invalid-feedback d-block">{errors.expiracion}</div>
        )}
        <div className="form-text">Ej: 08/27 (mes/año)</div>

        <div className="mb-3">
          <label className="form-label">CVV</label>
          <input
            className={`form-control ${errors.cvv ? "is-invalid" : ""}`}
            value={form.cvv}
            onChange={(e) =>
              setForm({
                ...form,
                cvv: e.target.value.replace(/\D/g, "").slice(0, 4)
              })
            }
            placeholder="3 o 4 dígitos"
            inputMode="numeric"
            maxLength={4}
            required
          />
          {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
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
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            required
          />
          {errors.correo && (
            <div className="invalid-feedback">{errors.correo}</div>
          )}
        </div>

        <button className="btn btn-success" type="submit">
          Pagar ahora
        </button>
      </form>
    </div>
  );
}
