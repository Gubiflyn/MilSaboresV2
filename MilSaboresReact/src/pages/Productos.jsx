import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import FormularioTorta from '../components/FormularioTorta';
import { saveLocalstorage, loadFromLocalstorage, saveCarrito, loadCarrito } from '../utils/localstorageHelper';
import tortasJson from '../data/tortas.json';

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
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const guardadas = loadFromLocalstorage('tortas');
    setTortas(guardadas || tortasJson);
    setCarrito(loadCarrito());
  }, []);

  useEffect(() => {
    saveLocalstorage('tortas', tortas);
  }, [tortas]);

  useEffect(() => {
    saveCarrito(carrito);
  }, [carrito]);

  const agregarTorta = (nuevaTorta) => {
    setTortas([...tortas, { ...nuevaTorta, codigo: Date.now() }]);
  };

  const agregarAlCarrito = (torta) => {
    setCarrito([...carrito, torta]);
  };

  const tortasFiltradas = categoria === 'Todas'
    ? tortas
    : tortas.filter(t => t.categoria === categoria);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Nuestros Pasteles</h2>
      <FormularioTorta agregarTorta={agregarTorta} />
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
        {tortasFiltradas.map(torta => (
          <Card key={torta.codigo} torta={torta} onAgregarCarrito={agregarAlCarrito} />
        ))}
      </div>
    </div>
  );
};

export default Productos;