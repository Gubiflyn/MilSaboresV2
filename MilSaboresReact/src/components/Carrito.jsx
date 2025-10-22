import React, { useMemo } from "react";
import { useCart } from "../context/CartContext";

const CLP = (n) => Number(n || 0).toLocaleString("es-CL");

const esTorta = (it) => {
  const n = (it.nombre || "").toLowerCase();
  const c = (it.categoria || "").toLowerCase();
  return n.includes("torta") || c.includes("torta");
};

const Carrito = ({
  carrito,
  vaciarCarrito,
  irAlPago,
  eliminarProducto,
  setCantidad,     // <- puede venir undefined según tu error
  updateMensaje,
}) => {
  // ✅ Fallback: si no viene la prop, usamos el contexto
  const cartCtx = useCart();
  const safeSetCantidad = useMemo(() => {
    const fn = setCantidad || cartCtx?.setQty;
    if (typeof fn !== "function") {
      // advertencia clara para depurar si vuelve a pasar
      // (no rompe la UI: los botones no harán nada)
      console.error("Carrito.jsx: setCantidad no está definido ni en props ni en contexto.");
      return null;
    }
    return fn;
  }, [setCantidad, cartCtx]);

  const total = (carrito || []).reduce(
    (sum, it) => sum + (it.precio || 0) * (it.cantidad || 1),
    0
  );

  const inc = (codigo, actual) => {
    if (!safeSetCantidad) return;
    safeSetCantidad(codigo, (Number(actual) || 1) + 1);
  };
  const dec = (codigo, actual) => {
    if (!safeSetCantidad) return;
    safeSetCantidad(codigo, Math.max(1, (Number(actual) || 1) - 1));
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Carrito de Compras</h2>

      {!carrito || carrito.length === 0 ? (
        <p className="text-center">Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
            {carrito.map((it) => {
              const subtotal = (it.precio || 0) * (it.cantidad || 1);
              return (
                <div className="col" key={it.codigo}>
                  <div className="card h-100">
                    <img
                      src={it.imagen}
                      className="card-img-top"
                      alt={it.nombre}
                      style={{ objectFit: "cover", height: 180 }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-center">{it.nombre}</h5>
                      <p className="card-text text-center text-muted">{it.categoria}</p>

                      {/* Cantidad + / - */}
                      <div className="d-flex justify-content-center align-items-center gap-2 my-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={(e) => { e.preventDefault(); dec(it.codigo, it.cantidad); }}
                          aria-label="Disminuir cantidad"
                          disabled={!safeSetCantidad}
                        >
                          −
                        </button>
                        <input
                          className="form-control form-control-sm text-center"
                          style={{ width: 64 }}
                          value={it.cantidad || 1}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value || "1", 10));
                            if (!safeSetCantidad) return;
                            safeSetCantidad(it.codigo, val);
                          }}
                          inputMode="numeric"
                          disabled={!safeSetCantidad}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={(e) => { e.preventDefault(); inc(it.codigo, it.cantidad); }}
                          aria-label="Aumentar cantidad"
                          disabled={!safeSetCantidad}
                        >
                          +
                        </button>
                      </div>

                      {/* Mensaje personalizado solo para tortas */}
                      {esTorta(it) && (
                        <div className="mt-2">
                          <label className="form-label small mb-1">Mensaje en la torta</label>
                          <input
                            className="form-control form-control-sm"
                            value={it.mensaje || ""}
                            onChange={(e) => updateMensaje?.(it.codigo, e.target.value)}
                            placeholder="Ej: ¡Feliz Cumple, Nico!"
                            maxLength={50}
                          />
                          <div className="form-text text-end">
                            {(it.mensaje || "").length}/50
                          </div>
                        </div>
                      )}

                      {/* Subtotal + acciones */}
                      <div className="mt-auto pt-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold">Subtotal:</span>
                          <span>${CLP(subtotal)} CLP</span>
                        </div>
                        <div className="d-flex justify-content-center mt-3">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => eliminarProducto?.(it.codigo)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total y acciones */}
          <h4 className="text-end mb-3">Total: ${CLP(total)} CLP</h4>
          <div className="d-flex justify-content-between">
            <button type="button" className="btn btn-secondary" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
            <button type="button" className="btn btn-success" onClick={irAlPago}>
              Ir al pago
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;
