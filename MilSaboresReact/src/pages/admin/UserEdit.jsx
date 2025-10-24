// src/pages/admin/UserEdit.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const LS_USERS = "usuarios_v1";

export default function UserEdit() {
  const { id } = useParams(); // email
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", apellidos: "", email: "", rol: "cliente", beneficio: "", fechaNacimiento: "" });

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const u = lista.find((x) => x.email === id);
    if (u) {
      setForm({
        nombre: u.nombre || "",
        apellidos: u.apellidos || "",
        email: u.email || id,
        rol: u.rol || "cliente",
        beneficio: u.beneficio || "",
        fechaNacimiento: u.fechaNacimiento || ""
      });
    }
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const lista = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const idx = lista.findIndex((x) => x.email === id);
    if (idx >= 0) {
      // si cambió el email, úsalo como nueva clave
      const nextEmail = form.email || id;
      lista[idx] = { ...lista[idx], ...form, email: nextEmail };
      localStorage.setItem(LS_USERS, JSON.stringify(lista));
      return navigate(`/admin/usuarios/${encodeURIComponent(nextEmail)}`);
    }
    navigate(`/admin/usuarios`);
  };

  return (
    <div>
      <h2>Editar usuario</h2>
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
          <input name="email" type="email" value={form.email} onChange={onChange} />
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
          <button type="submit">Guardar</button>
          <Link to={`/admin/usuarios/${encodeURIComponent(id)}`}><button type="button">Cancelar</button></Link>
        </div>
      </form>
    </div>
  );
}
