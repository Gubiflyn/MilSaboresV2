import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const LS_USERS = "usuarios_v1";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", apellidos: "", correo: "", rol: "cliente", activo: true });

  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const u = lista.find((x) => x.id === id);
    if (u) {
      setForm({ nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, rol: u.rol, activo: !!u.activo });
    }
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const lista = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const idx = lista.findIndex((x) => x.id === id);
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], ...form };
      localStorage.setItem(LS_USERS, JSON.stringify(lista));
    }
    navigate(`/admin/usuarios/${id}`);
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
          Correo
          <input name="correo" type="email" value={form.correo} onChange={onChange} />
        </label>
        <label>
          Rol
          <select name="rol" value={form.rol} onChange={onChange}>
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input name="activo" type="checkbox" checked={form.activo} onChange={onChange} />
          Activo
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Guardar</button>
          <Link to={`/admin/usuarios/${id}`}><button type="button">Cancelar</button></Link>
        </div>
      </form>
    </div>
  );
}
