import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadFromLocalstorage } from '../utils/localstorageHelper';
import tortasJson from '../data/tortas.json';

const Detalle = () => {
  const { codigo } = useParams();
  const [torta, setTorta] = useState(null);

  useEffect(() => {
    const tortas = loadFromLocalstorage('tortas') || tortasJson;
    const encontrada = tortas.find(t => String(t.codigo) === String(codigo));
    setTorta(encontrada);
  }, [codigo]);

  if (!torta) {
    return (
      <div className="container py-5">
        <h2 className="text-center mb-4">Detalle del Producto</h2>
        <p className="text-center">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">{torta.nombre}</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <img src={torta.imagen} className="img-fluid mb-3" alt={torta.nombre} />
          <p><strong>Categoría:</strong> {torta.categoria}</p>
          <p><strong>Precio:</strong> ${torta.precio} CLP</p>
          {/* Puedes agregar más detalles aquí */}
        </div>
      </div>
    </div>
  );
};

export default Detalle;