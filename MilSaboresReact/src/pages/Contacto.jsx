import React, { useState } from 'react';

const Contacto = () => {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Aquí puedes agregar lógica para enviar el mensaje
    alert('Mensaje enviado. ¡Gracias por contactarnos!');
    setForm({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Contacto</h2>
      <form className="mx-auto" style={{ maxWidth: 400 }} onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          className="form-control mb-2"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          className="form-control mb-2"
          placeholder="Tu correo"
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="mensaje"
          className="form-control mb-2"
          placeholder="Tu mensaje"
          value={form.mensaje}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn-primary w-100">Enviar</button>
      </form>
    </div>
  );
};

export default Contacto;