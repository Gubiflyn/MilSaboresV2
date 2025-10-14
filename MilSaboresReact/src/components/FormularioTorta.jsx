import React, { useState } from 'react';

const categorias = [
  'Tortas Cuadradas',
  'Tortas Circulares',
  'Postres Individuales',
  'Productos Sin Azúcar',
  'Pastelería Tradicional',
  'Productos Sin Gluten',
  'Productos Veganos',
  'Tortas Especiales',
];

const FormularioTorta = ({ agregarTorta }) => {
  const [form, setForm] = useState({
    nombre: '',
    categoria: categorias[0],
    precio: '',
    imagen: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (form.nombre && form.precio && form.imagen) {
      agregarTorta({ ...form, precio: Number(form.precio) });
      setForm({
        nombre: '',
        categoria: categorias[0],
        precio: '',
        imagen: '',
      });
    }
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit}>
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        className="form-control mb-2"
        value={form.nombre}
        onChange={handleChange}
        required
      />
      <select
        name="categoria"
        className="form-select mb-2"
        value={form.categoria}
        onChange={handleChange}
      >
        {categorias.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <input
        type="number"
        name="precio"
        placeholder="Precio"
        className="form-control mb-2"
        value={form.precio}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="imagen"
        placeholder="URL de la imagen"
        className="form-control mb-2"
        value={form.imagen}
        onChange={handleChange}
        required
      />
      <button type="submit" className="btn btn-primary">Agregar Torta</button>
    </form>
  );
};

export default FormularioTorta;