import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ torta, onAgregarCarrito }) => (
  <div className="col">
    <div className="card h-100">
      <Link to={`/detalle/${torta.codigo}`}>
        <img src={torta.imagen} className="card-img-top" alt={torta.nombre} />
      </Link>
      <div className="card-body text-center">
        <h5 className="card-title">{torta.nombre}</h5>
        <p className="card-text">{torta.categoria}</p>
        <p className="product-card__price">${torta.precio} CLP</p>
        <button
          className="btn btn-success mt-2"
          onClick={() => onAgregarCarrito(torta)}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  </div>
);

export default Card;