import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addUsuario, getUsuarios } from "../../services/api";

export default function UserNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    rol: "cliente", // admin / vendedor / cliente, etc.
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
      // 1) Validar que no exista ya el email
      try {
        const lista = await getUsuarios();
        const dup = (Array.isArray(lista) ? lista : []).some(
          (u) =>
            (u.email || u.correo || "").toLowerCase() ===
            form.email.toLowerCase()
        );
        if (dup) {
          alert("Ya existe un usuario con ese email.");
          setSaving(false);
          return;
        }
      } catch (e) {
        console.warn("No se pudo validar duplicados, continúo igual:", e);
      }

      // 2) Armar payload
      const payload = {
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        rol: form.rol || "cliente",
        beneficio: form.beneficio,
        fechaNacimiento: form.fechaNacimiento || null,
      };

      const creado = await addUsuario(payload);

      const emailFinal =
        creado?.email || creado?.correo || form.email || "";

      alert("Usuario creado correctamente.");
      navigate(`/admin/usuarios/${encodeURIComponent(emailFinal)}`);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      alert("No se pudo crear el usuario. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Nuevo usuario</h2>
      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 480 }}
      >
        <label>
          Nombre
          <input
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Apellidos
          <input
            name="apellidos"
            value={form.apellidos}
            onChange={onChange}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Rol
          <select name="rol" value={form.rol} onChange={onChange}>
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </label>
        <label>
          Beneficio
          <input
            name="beneficio"
            value={form.beneficio}
            onChange={onChange}
            placeholder="Ej: Descuento, convenio, etc."
          />
        </label>
        <label>
          Fecha Nac.
          <input
            name="fechaNacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={onChange}
          />
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
