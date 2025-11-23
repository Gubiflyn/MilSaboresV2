import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  addAdministrador,
  addCliente,
  addVendedor,
  getUsuarios,
} from "../../services/api";

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
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.nombre) {
      alert("Nombre y correo son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const usuarios = await getUsuarios();
      const existe = usuarios.some(
        (u) =>
          (u.correo || u.email || "").toLowerCase() ===
          form.email.toLowerCase()
      );
      if (existe) {
        alert("Ya existe un usuario con ese correo.");
        setSaving(false);
        return;
      }

      let payload;
      let creado;

      // ===============================
      //  RUTEO SEGÚN ROL ✔✔✔
      // ===============================
      if (form.rol === "admin") {
        payload = {
          nombre: form.nombre,
          apellido: form.apellidos,
          correo: form.email,
          contrasena: "123", // o lo que quieras
          comuna: "",
          region: "",
          activo: true,
          fechaContratacion: "2025-01-01",
          rol: "ADMIN",
        };
        creado = await addAdministrador(payload);
      }

      if (form.rol === "vendedor") {
        payload = {
          nombre: form.nombre,
          apellido: form.apellidos,
          correo: form.email,
          contrasena: "123",
          comuna: "",
          region: "",
          telefono: "",
          activo: true,
          fechaContratacion: "2025-01-01",
        };
        creado = await addVendedor(payload);
      }

      if (form.rol === "cliente") {
        payload = {
          nombre: form.nombre,
          apellido: form.apellidos,
          correo: form.email,
          contrasena: "123",
          comuna: "",
          region: "",
          telefono: "",
          direccion: "",
        };
        creado = await addCliente(payload);
      }

      alert("Usuario creado correctamente.");
      navigate("/admin/usuarios");
    } catch (e) {
      console.error("Error al crear usuario:", e);
      alert("No se pudo crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Nuevo usuario</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={onChange} required />
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
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving}>
            {saving ? "Creando..." : "Crear"}
          </button>
          <Link to="/admin/usuarios">
            <button type="button">Cancelar</button>
          </Link>
        </div>
      </form>
    </div>
  );
}
