import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadFromLocalstorage } from '../utils/localstorageHelper';
import tortasJson from '../data/tortas.json';

const Detalle = ({ agregarAlCarrito }) => {
  const { codigo } = useParams();
  const [torta, setTorta] = useState({});
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const tortas = loadFromLocalstorage('tortas') || tortasJson;
    const encontrada = tortas.find(t => String(t.codigo) === String(codigo));
    setTorta(encontrada || {});
  }, [codigo]);

  const handleAgregar = () => {
    if (cantidad > 0) {
      agregarAlCarrito({ ...torta, cantidad });
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">{torta.nombre}</h2>
      <div className="row justify-content-center align-items-center">
        <div className="col-md-6 text-center">
          <img src={torta.imagen} className="img-fluid mb-3 rounded" alt={torta.nombre} />
        </div>
        <div className="col-md-6">
          <p><strong>Categoría:</strong> {torta.categoria}</p>
          <p><strong>Precio:</strong> ${torta.precio} CLP</p>

          <div className="d-flex align-items-center mb-3">
            <label className="me-2 fw-bold">Cantidad:</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
              className="form-control w-25"
            />
          </div>

          <button className="btn btn-success" onClick={handleAgregar}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detalle;
