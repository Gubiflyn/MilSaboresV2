import React, { useEffect, useState } from 'react';
import { loadCarrito } from '../utils/localstorageHelper';

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    setCarrito(loadCarrito());
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Carrito de Compras</h2>
      {carrito.length === 0 ? (
        <p className="text-center">Tu carrito está vacío.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {carrito.map((torta, idx) => (
            <div className="col" key={idx}>
              <div className="card h-100">
                <img src={torta.imagen} className="card-img-top" alt={torta.nombre} />
                <div className="card-body text-center">
                  <h5 className="card-title">{torta.nombre}</h5>
                  <p className="card-text">{torta.categoria}</p>
                  <p className="product-card__price">${torta.precio} CLP</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carrito;