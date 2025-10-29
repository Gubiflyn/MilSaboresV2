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

  const qs = new URLSearchParams(location.search);
  const isOferta = qs.get('oferta') === '1';
  const pctParam = parseFloat(qs.get('pct') || '0');
  const pct = Number.isFinite(pctParam)
    ? Math.min(0.9, Math.max(0, pctParam)) 
    : 0;
  const ofertaTag = qs.get('tag') || null;

  useEffect(() => {
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

  const esTorta = useMemo(() => {
    const n = (torta?.nombre || '').toLowerCase();
    const c = (torta?.categoria || '').toLowerCase();
    return n.includes('torta') || c.includes('torta');
  }, [torta]);

  const precioBase = Number(torta?.precio || 0);
  const precioFinal = isOferta
    ? Math.max(0, Math.round(precioBase * (1 - pct)))
    : precioBase;

  const handleAgregar = () => {
    if (cantidad > 0 && torta?.codigo) {
      add({
        ...torta,
        precio: precioFinal,
        ...(isOferta ? { precioOriginal: precioBase } : {}),
        cantidad,
        mensaje: esTorta ? (mensaje || '') : undefined,
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
