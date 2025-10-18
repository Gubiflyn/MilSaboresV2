import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadFromLocalstorage } from '../utils/localstorageHelper';
import tortasJson from '../data/tortas.json';
import { useCart } from '../context/CartContext';
import { publicUrl } from '../utils/publicUrl';

const Detalle = () => {
  const { codigo } = useParams();
  const [torta, setTorta] = useState({});
  const [cantidad, setCantidad] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    const tortasLS =
      loadFromLocalstorage('tortas_v2') ||
      loadFromLocalstorage('tortas') ||
      tortasJson;
    const encontrada = tortasLS.find((t) => String(t.codigo) === String(codigo));
    setTorta(encontrada || {});
  }, [codigo]);

  const handleAgregar = () => {
    if (cantidad > 0 && torta?.codigo) {
      add({ ...torta, cantidad });
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
          />
        </div>

        <div className="col-md-6">
          <h2 className="fw-bold mb-3">{torta.nombre}</h2>
          <p className="text-muted mb-1">
            <strong>Categoría:</strong> {torta.categoria}
          </p>
          <p className="text-muted mb-1">
            <strong>Código:</strong> {torta.codigo}
          </p>
          <p className="text-secondary mt-3" style={{ fontSize: '0.95rem' }}>
            {torta.descripcion}
          </p>

          <h4 className="fw-semibold mt-3" style={{ color: '#8B4513' }}>
            ${torta.precio.toLocaleString('es-CL')} CLP
          </h4>

          <div className="d-flex align-items-center mt-3 mb-3">
            <label className="me-2 fw-bold">Cantidad:</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="form-control w-25"
            />
          </div>

          <button className="btn btn-success px-4" onClick={handleAgregar}>
            <i className="fas fa-cart-plus me-2"></i> Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detalle;
