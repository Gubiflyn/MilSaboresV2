// src/pages/Pago.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { applyPromotions } from "../utils/promotions";

const CLP = (n) => (parseInt(n, 10) || 0).toLocaleString("es-CL");

// ➕ ADD: helper para guardar órdenes en localStorage (ordenes_v1)
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

  // Totales base a partir del carrito (con precios ya aplicados por detalle/oferta)
  const subtotalItems = useMemo(
    () => carrito.reduce((a, t) => a + (t.precio || 0) * (t.cantidad || 1), 0),
    [carrito]
  );

  // Ahorro por ofertas de producto (requiere precioOriginal en el item si vino desde Home->Detalle con oferta)
  const ahorroOfertas = useMemo(
    () =>
      carrito.reduce((acc, t) => {
        const po = Number(t.precioOriginal || 0);
        const p = Number(t.precio || 0);
        const q = Number(t.cantidad || 1);
        if (po > p) return acc + (po - p) * q;
        return acc;
      }, 0),
    [carrito]
  );

  // “Subtotal precio normal estimado” = lo que costaría sin ofertas de producto
  const subtotalNormalEstimado = useMemo(
    () => subtotalItems + ahorroOfertas,
    [subtotalItems, ahorroOfertas]
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

  // Formulario
  const [form, setForm] = useState({
    nombre: "",
    numero: "",
    expiracion: "",
    cvv: "",
    fechaEntrega: "",
    correo: ""
  });
  const [errors, setErrors] = useState({});

  // Prefill formulario con datos del usuario autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        correo: prev.correo?.trim() ? prev.correo : (user.email || ""),
        nombre: prev.nombre?.trim() ? prev.nombre : (user.nombre || "")
      }));
    }
  }, [isAuthenticated, user]);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa el nombre en la tarjeta.";
    if (!/^\d{16}$/.test(form.numero)) e.numero = "Número de 16 dígitos.";

    // Exp MM/AA y no vencida
    const expTrim = (form.expiracion || "").trim();
    const expOK = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expTrim);
    if (!expOK) {
      e.expiracion = "Formato MM/AA (ej: 08/27).";
    } else {
      const [mm, aa] = expTrim.split("/");
      // Fecha: primer día del mes siguiente al de expiración
      const year = 2000 + Number(aa);
      const monthIndexNext = Number(mm); // mes siguiente como índice (0-based +1)
      const expDate = new Date(year, monthIndexNext, 1); // primer día del mes siguiente
      const now = new Date();
      now.setDate(1); // comparar mes/año
      now.setHours(0, 0, 0, 0);
      if (expDate <= now) e.expiracion = "Tarjeta vencida.";
    }

    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = "CVV de 3 o 4 dígitos.";

    if (
      !form.fechaEntrega ||
      form.fechaEntrega < dateLimits.min ||
      form.fechaEntrega > dateLimits.max
    ) {
      e.fechaEntrega = "Selecciona una fecha válida.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((form.correo || "").trim())) {
      e.correo = "Correo electrónico inválido.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Promos/cupones (sobre el subtotal actual de items)
  const promoPreview = useMemo(
    () =>
      applyPromotions({
        items: carrito,
        customerEmail: (form.correo || "").trim()
      }),
    [carrito, form.correo]
  );

  useEffect(() => {
    console.debug("Pago -> promoPreview:", promoPreview);
  }, [promoPreview]);

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    // Simulación de pago fallido (tarjeta "0000" o ?fail=1)
    const urlParams = new URLSearchParams(window.location.search);
    const forceFail = urlParams.get("fail") === "1";
    const startsWithZeros = (form.numero || "").startsWith("0000");
    const shouldFail = forceFail || startsWithZeros;

    if (shouldFail) {
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
          },
          items: carrito.map((t) => ({
            id: t.id,
            nombre: t.nombre,
            precio: t.precio || 0,
            cantidad: t.cantidad || 1,
            imagen: t.imagen
          })),
          total: promoPreview.total
        }
      });
      return;
    }

    // Aplicar promociones reales al confirmar
    const promo = applyPromotions({
      items: carrito,
      customerEmail: (form.correo || "").trim()
    });

    console.debug("Pago -> confirmar pago, promo:", promo);

    // Generar boleta
    const orderId =
      "ORD-" + new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

    const receipt = {
      orderId,
      numeroBoleta: "B-" + orderId.slice(-6),
      fechaEmision: new Date().toISOString(),
      emisor: { razonSocial: "Mil Sabores SPA", rut: "76.123.456-7" },
      receptor: {
        nombre: form.nombre.trim(),
        email: form.correo.trim(),
        userId: isAuthenticated ? user?.id : null,
        guest: !isAuthenticated
      },
      items: carrito.map((t) => ({
        nombre: t.nombre,
        qty: t.cantidad || 1,
        precioUnit: t.precio || 0,
        total: (t.precio || 0) * (t.cantidad || 1),
        mensaje: t.mensaje || ""
      })),
      // Montos (ya incluyen ofertas en precio de cada item)
      subtotal: promo.subtotal,
      descuento: promo.descuento,
      total: promo.total,
      moneda: "CLP",
      notasPromo: {
        porcentajeAplicado: promo.breakdown?.porcentaje,
        descuentoPorcentaje: promo.breakdown?.percDiscount,
        // 👇 corregido: guardar el descuento de torta gratis real
        descuentoCumpleDuoc: promo.breakdown?.cakeDiscount,
        detalles: promo.breakdown?.detalles || []
      }
    };

    // Guardar boleta
    const map = JSON.parse(localStorage.getItem("receipts_v1") || "{}");
    map[orderId] = receipt;
    localStorage.setItem("receipts_v1", JSON.stringify(map));

    //Guardar también un registro compacto para el historial del Admin
    try {
      const orderRecord = {
        id: orderId,
        userEmail: (
          (isAuthenticated ? (user?.email || user?.correo) : form.correo) || ""
        ).toLowerCase(),
        items: carrito.map((t, i) => ({
          codigo: t.codigo ?? t.id ?? t.sku ?? `SKU-${i + 1}`,
          nombre: t.nombre || "Producto",
          cantidad: t.cantidad || 1,
          precio: t.precio || 0,
        })),
        total: receipt.total,                // total final (con promos)
        date: new Date().toISOString(),     // ISO para ordenar
        estado: "pagado",
      };

      // Persistir en localStorage["ordenes_v1"]
      saveOrderToHistory(orderRecord);
    } catch (err) {
      console.warn("No se pudo registrar la orden en historial:", err);
    }


    

    // Limpiar
    clear();
    localStorage.removeItem("totalCompra");

    // Ir a boleta
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
      <h2 className="mb-4 text-center">Pago de tu Compra</h2>

      {!isAuthenticated && (
        <div className="alert alert-info" role="alert">
          Estás comprando como <strong>invitado</strong>. Si inicias sesión,
          podrás guardar tu historial de compras.
        </div>
      )}

      {/* Resumen de montos con desglose claro */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Resumen</h5>

          <div className="d-flex justify-content-between">
            <span>Subtotal precio normal (estimado)</span>
            <span>${CLP(subtotalNormalEstimado)}</span>
          </div>

          <div className="d-flex justify-content-between text-success">
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
            {/* 👇 corregido: si total es 0, que se muestre 0 y no el subtotal */}
            <span>${CLP(promoPreview?.total ?? subtotalItems)}</span>
          </div>

          {(promoPreview?.breakdown?.detalles || []).length > 0 && (
            <ul className="small text-muted mt-2 mb-0">
              {(promoPreview.breakdown.detalles || []).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Formulario de pago */}
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
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de expiración</label>
          <input
            className={`form-control ${errors.expiracion ? "is-invalid" : ""}`}
            value={form.expiracion}
            onChange={(e) => setForm({ ...form, expiracion: e.target.value })}
            placeholder="MM/AA"
            required
          />
          {errors.expiracion && (
            <div className="invalid-feedback d-block">{errors.expiracion}</div>
          )}
        </div>
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
            className={`form-control ${errors.fechaEntrega ? "is-invalid" : ""}`}
            value={form.fechaEntrega}
            onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })}
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
