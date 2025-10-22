import React from 'react';
import { Link } from 'react-router-dom';
import { publicUrl } from '../utils/publicUrl';

const Card = ({ torta, onAgregarCarrito }) => (
  <div className="col">
    <div className="card h-100 shadow-sm border-0">
      <Link to={`/detalle/${torta.codigo}`}>
        <img
          src={publicUrl(torta.imagen)}
          className="card-img-top rounded-top"
          alt={torta.nombre}
          style={{ height: '220px', objectFit: 'cover' }}
        />
      </Link>

      <div className="card-body text-center">
        <h5 className="card-title fw-bold">{torta.nombre}</h5>
        <p className="text-muted mb-1">{torta.categoria}</p>
        <p className="text-secondary small" style={{ minHeight: '50px' }}>
          {torta.descripcion}
        </p>
        <p className="fw-semibold mb-3" style={{ color: '#8B4513' }}>
          ${torta.precio.toLocaleString('es-CL')} CLP
        </p>

        <button
          className="btn btn-success btn-sm px-3"
          onClick={() => onAgregarCarrito(torta)}
        >
          <i className="fas fa-cart-plus me-2"></i> Agregar al carrito
        </button>
      </div>
    </div>
  </div>
);

export default Card;
