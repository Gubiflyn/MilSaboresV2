import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { loadFromLocalstorage } from "../utils/localstorageHelper";
import { useCart } from "../context/CartContext";
import { publicUrl } from "../utils/publicUrl";
import { getPastelByCodigo } from "../services/api";

const Detalle = () => {
  const { codigo } = useParams();
  const location = useLocation();
  const { add } = useCart();

  const [torta, setTorta] = useState({});
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const qs = new URLSearchParams(location.search);
  const pctParam = parseFloat(qs.get("pct") || "0");
  const pct = Number.isFinite(pctParam)
    ? Math.min(0.9, Math.max(0, pctParam))
    : 0;
  const ofertaTag = qs.get("tag") || null;

  useEffect(() => {
    const cargarDetalle = async () => {
      // 1) Intentar buscar en la API por código
      try {
        const data = await getPastelByCodigo(codigo);
        if (data) {
          setTorta(data);
          setCantidad(1);
          setMensaje("");
          return;
        }
      } catch (err) {
        console.error("Error al obtener pastel por código desde la API:", err);
      }

      // 2) Fallback: buscar en localStorage (por si ya se cargó antes)
      const tortasLS =
        loadFromLocalstorage("tortas_v3") ||
        loadFromLocalstorage("tortas_v2") ||
        loadFromLocalstorage("tortas") ||
        [];

      const encontrada = Array.isArray(tortasLS)
        ? tortasLS.find((t) => String(t.codigo) === String(codigo))
        : null;

      setTorta(encontrada || {});
      setCantidad(1);
      setMensaje("");
    };

    cargarDetalle();
  }, [codigo]);

  const esTorta = useMemo(() => {
    const n = (torta?.nombre || "").toLowerCase();
    return n.includes("torta");
  }, [torta]);

  const precioBase = Number(torta.precio || 0);
  const precioOferta = Math.max(
    0,
    Math.round(precioBase * (1 - (Number(pct) || 0)))
  );

  const handleAgregar = () => {
    if (!torta || !torta.codigo) return;
    add({ ...torta, cantidad, mensaje });
    setMensaje("");
    setCantidad(1);
  };

  if (!torta || !torta.codigo) {
    return (
      <div className="container py-5">
        <p className="text-center">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-md-6">
          <img
            src={torta.imagen ? publicUrl(torta.imagen) : null}
            alt={torta.nombre}
            className="img-fluid rounded shadow-sm"
          />
        </div>
        <div className="col-md-6">
          <h2>{torta.nombre}</h2>
          <p className="text-muted">{torta.categoria}</p>
          <p>{torta.descripcion}</p>

          {pct > 0 ? (
            <>
              <p className="text-decoration-line-through text-muted mb-1">
                ${precioBase.toLocaleString("es-CL")} CLP
              </p>
              <p className="fs-4 fw-bold text-danger">
                ${precioOferta.toLocaleString("es-CL")} CLP
                {ofertaTag ? <span className="ms-2 badge bg-danger">{ofertaTag}</span> : null}
              </p>
            </>
          ) : (
            <p className="fs-4 fw-bold" style={{ color: "#8B4513" }}>
              ${precioBase.toLocaleString("es-CL")} CLP
            </p>
          )}

          {esTorta && (
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Mensaje personalizado (opcional)
              </label>
              <input
                type="text"
                className="form-control"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                maxLength={80}
                placeholder="Ej: ¡Feliz cumpleaños, Dani!"
              />
            </div>
          )}

          <div className="d-flex align-items-center gap-3 mb-3">
            <label className="form-label m-0 fw-semibold">Cantidad:</label>
            <input
              type="number"
              className="form-control"
              style={{ maxWidth: "100px" }}
              min={1}
              max={torta.stock || 99}
              value={cantidad}
              onChange={(e) =>
                setCantidad(Math.max(1, Math.min(torta.stock || 99, Number(e.target.value) || 1)))
              }
            />
          </div>

          <button className="btn btn-success px-4" onClick={handleAgregar}>
            <i className="fas fa-cart-plus me-2" />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detalle;
