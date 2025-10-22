import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { saveLocalstorage, loadFromLocalstorage, deleteFromLocalstorage } from '../utils/localstorageHelper';
import tortasJson from '../data/tortas.json';
import { Modal, Toast } from 'bootstrap';
import { useCart } from '../context/CartContext'; // 👈 nuevo import

const categorias = [
  'Todas',
  'Tortas Cuadradas',
  'Tortas Circulares',
  'Postres Individuales',
  'Productos Sin Azúcar',
  'Pastelería Tradicional',
  'Productos Sin Gluten',
  'Productos Vegana',
  'Tortas Especiales',
];

const LS_KEY = 'tortas_v3';

const Productos = () => {
  const [tortas, setTortas] = useState([]);
  const [categoria, setCategoria] = useState('Todas');
  const { add } = useCart(); // 👈 usamos el hook

  useEffect(() => {
    deleteFromLocalstorage('tortas');
    const guardadas = loadFromLocalstorage(LS_KEY);
    if (!guardadas || guardadas.length === 0) {
      saveLocalstorage(LS_KEY, tortasJson);
      setTortas(tortasJson);
    } else {
      setTortas(guardadas);
    }
  }, []);

  const handleAgregar = (torta) => {
    add({ ...torta, cantidad: 1 });

    const toastEl = document.getElementById('toastAgregado');
    if (toastEl) Toast.getOrCreateInstance(toastEl).show();

    const modalEl = document.getElementById('carritoModal');
    if (modalEl) Modal.getOrCreateInstance(modalEl).show();
  };

  const tortasFiltradas =
    categoria === 'Todas'
      ? tortas
      : tortas.filter((t) => t.categoria === categoria);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Nuestros Pasteles</h2>
      <div className="mb-4 text-center">
        <label htmlFor="categoryFilter" className="form-label fw-bold">
          Filtrar por Categoría:
        </label>
        <select
          id="categoryFilter"
          className="form-select w-auto d-inline-block"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {tortasFiltradas.length > 0 ? (
          tortasFiltradas.map((torta) => (
            <Card
              key={torta.codigo}
              torta={torta}
              onAgregarCarrito={handleAgregar}
            />
          ))
        ) : (
          <p className="text-center">
            No hay productos disponibles en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
};

export default Productos;
