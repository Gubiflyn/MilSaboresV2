// src/pages/admin/UserNew.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const LS_USERS = "usuarios_v1";

export default function UserNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    rol: "cliente",
    beneficio: "",
    fechaNacimiento: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const lista = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    // Evitar duplicados por email
    if (lista.some((u) => u.email === form.email)) {
      alert("Ya existe un usuario con ese email.");
      return;
    }
    const nuevo = { ...form, rol: form.rol || "cliente" };
    const next = [...lista, nuevo];
    localStorage.setItem(LS_USERS, JSON.stringify(next));
    navigate(`/admin/usuarios/${encodeURIComponent(nuevo.email)}`);
  };

  return (
    <div>
      <h2>Nuevo usuario</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={onChange} />
        </label>
        <label>
          Apellidos
          <input name="apellidos" value={form.apellidos} onChange={onChange} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          Rol
          <select name="rol" value={form.rol} onChange={onChange}>
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label>
          Beneficio
          <input name="beneficio" value={form.beneficio} onChange={onChange} placeholder="p.ej. 10%" />
        </label>
        <label>
          Fecha Nac.
          <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={onChange} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Crear</button>
          <Link to="/admin/usuarios"><button type="button">Cancelar</button></Link>
        </div>
      </form>
    </div>
  );
}
