// src/pages/Detalle.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { loadFromLocalstorage } from '../utils/localstorageHelper';
import tortasJson from '../data/tortas.json';
import { useCart } from '../context/CartContext';
import { publicUrl } from '../utils/publicUrl';

const Detalle = () => {
  const { codigo } = useParams();
  const location = useLocation();
  const { add } = useCart();

  const [torta, setTorta] = useState({});
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');

  // --- Lee parámetros de oferta desde el query string ---
  const qs = new URLSearchParams(location.search);
  const isOferta = qs.get('oferta') === '1';
  const pctParam = parseFloat(qs.get('pct') || '0');
  const pct = Number.isFinite(pctParam)
    ? Math.min(0.9, Math.max(0, pctParam)) // entre 0% y 90% por seguridad
    : 0;
  const ofertaTag = qs.get('tag') || null;

  useEffect(() => {
    // Intentamos con varias claves de LS para compatibilidad hacia atrás
    const tortasLS =
      loadFromLocalstorage('tortas_v3') ||
      loadFromLocalstorage('tortas_v2') ||
      loadFromLocalstorage('tortas') ||
      tortasJson;

    const encontrada = Array.isArray(tortasLS)
      ? tortasLS.find((t) => String(t.codigo) === String(codigo))
      : null;

    setTorta(encontrada || {});
    setCantidad(1);
    setMensaje('');
  }, [codigo]);

  // ¿Es torta? (para habilitar el campo mensaje opcional)
  const esTorta = useMemo(() => {
    const n = (torta?.nombre || '').toLowerCase();
    const c = (torta?.categoria || '').toLowerCase();
    return n.includes('torta') || c.includes('torta');
  }, [torta]);

  // Precios
  const precioBase = Number(torta?.precio || 0);
  const precioFinal = isOferta
    ? Math.max(0, Math.round(precioBase * (1 - pct)))
    : precioBase;

  const handleAgregar = () => {
    if (cantidad > 0 && torta?.codigo) {
      add({
        ...torta,
        // usamos el precio final (con o sin descuento)
        precio: precioFinal,
        // guardamos el precio original si viene por oferta (para mostrar ahorro en Pago.jsx)
        ...(isOferta ? { precioOriginal: precioBase } : {}),
        cantidad,
        // mensaje solo si es torta
        mensaje: esTorta ? (mensaje || '') : undefined,
        // etiqueta informativa si viene con oferta
        ...(isOferta ? { etiquetaOferta: `OFERTA ${Math.round(pct * 100)}%` } : {})
      });
    }
  };

  if (!torta?.nombre) {
    return (
      <div className="container py-5 text-center">
        <h3>Producto no encontrado</h3>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center g-4">
        <div className="col-md-5 text-center">
          <img
            src={publicUrl(torta.imagen)}
            className="img-fluid rounded shadow-sm"
            alt={torta.nombre}
            style={{ maxHeight: '350px', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = '/img/placeholder.png'; }}
          />
        </div>

        <div className="col-md-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <h2 className="fw-bold mb-0">{torta.nombre}</h2>
            {isOferta && (
              <span className="badge bg-danger">-{Math.round(pct * 100)}%</span>
            )}
          </div>

          <p className="text-muted mb-1">
            <strong>Categoría:</strong> {torta.categoria}
          </p>
          <p className="text-muted mb-1">
            <strong>Código:</strong> {torta.codigo}
          </p>
          {isOferta && ofertaTag && (
            <p className="text-muted mb-1"><strong>Oferta:</strong> {ofertaTag}</p>
          )}

          <p className="text-secondary mt-3" style={{ fontSize: '0.95rem' }}>
            {torta.descripcion}
          </p>

          {/* Precio con y sin descuento */}
          {isOferta ? (
            <div className="mt-3">
              <div className="small text-decoration-line-through text-muted">
                ${precioBase.toLocaleString('es-CL')} CLP
              </div>
              <h4 className="fw-semibold" style={{ color: '#8B4513' }}>
                ${precioFinal.toLocaleString('es-CL')} CLP
              </h4>
            </div>
          ) : (
            <h4 className="fw-semibold mt-3" style={{ color: '#8B4513' }}>
              ${precioBase.toLocaleString('es-CL')} CLP
            </h4>
          )}

          <div className="d-flex align-items-center mt-3 mb-3">
            <label className="me-2 fw-bold">Cantidad:</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => {
                const val = Math.max(1, Number(e.target.value) || 1);
                setCantidad(val);
              }}
              className="form-control w-25"
            />
          </div>

          {esTorta && (
            <div className="mb-3">
              <label className="form-label">Mensaje en la torta (opcional)</label>
              <input
                className="form-control"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value.slice(0, 50))}
                placeholder="Ej: Feliz cumpleaños"
              />
              <div className="form-text">{mensaje.length}/50</div>
            </div>
          )}

          <button className="btn btn-success px-4" onClick={handleAgregar}>
            <i className="fas fa-cart-plus me-2"></i> Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detalle;
