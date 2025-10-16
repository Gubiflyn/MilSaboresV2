import React from "react";

const Carrito = ({ carrito, vaciarCarrito, irAlPago, eliminarProducto }) => {
  const total = carrito.reduce(
    (sum, torta) => sum + torta.precio * (torta.cantidad || 1),
    0
  );

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Carrito de Compras</h2>

      {carrito.length === 0 ? (
        <p className="text-center">Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
            {carrito.map((torta) => (
              <div className="col" key={torta.codigo}>
                <div className="card h-100">
                  <img
                    src={torta.imagen}
                    className="card-img-top"
                    alt={torta.nombre}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title">{torta.nombre}</h5>
                    <p className="card-text">{torta.categoria}</p>
                    <p className="product-card__price">
                      ${torta.precio} CLP x {torta.cantidad || 1}
                    </p>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarProducto(torta.codigo)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h4 className="text-end mb-3">Total: ${total} CLP</h4>

          <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
            <button className="btn btn-success" onClick={irAlPago}>
              Ir al pago
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;
