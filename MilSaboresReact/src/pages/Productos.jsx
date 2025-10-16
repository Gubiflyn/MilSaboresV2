import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { saveLocalstorage, loadFromLocalstorage } from '../utils/localstorageHelper';
import tortasJson from '../data/tortas.json';
import { useCart } from '../context/CartContext';

const categorias = [
  'Todas',
  'Tortas Cuadradas',
  'Tortas Circulares',
  'Postres Individuales',
  'Productos Sin Azúcar',
  'Pastelería Tradicional',
  'Productos Sin Gluten',
  'Productos Veganos',
  'Tortas Especiales',
];

const Productos = () => {
  const [tortas, setTortas] = useState([]);
  const [categoria, setCategoria] = useState('Todas');
  const { add } = useCart();

  useEffect(() => {
    const guardadas = loadFromLocalstorage('tortas');
    if (!guardadas || guardadas.length === 0) {
      setTortas(tortasJson);
      saveLocalstorage('tortas', tortasJson);
    } else {
      setTortas(guardadas);
    }
  }, []);

  const tortasFiltradas = categoria === 'Todas'
    ? tortas
    : tortas.filter(t => t.categoria === categoria);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Nuestros Pasteles</h2>

      <div className="mb-4 text-center">
        <label htmlFor="categoryFilter" className="form-label fw-bold">Filtrar por Categoría:</label>
        <select
          id="categoryFilter"
          className="form-select w-auto d-inline-block"
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {tortasFiltradas.length > 0 ? (
          tortasFiltradas.map(torta => (
            <Card
              key={torta.codigo}
              torta={torta}
              onAgregarCarrito={(t) => add({ ...t, cantidad: 1 })}
            />
          ))
        ) : (
          <p className="text-center">No hay productos disponibles en esta categoría.</p>
        )}
      </div>
    </div>
  );
};

export default Productos;
