import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addAdministrador,
  addCliente,
  addVendedor,
  getUsuarios,
} from "../../services/api";

// ====== Helpers para hashear contraseña con scrypt ======
import { scrypt } from "scrypt-js";

const N = 16384; 
const r = 8;
const p = 1;
const KEY_LENGTH = 32;

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(plainPassword) {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(plainPassword);


  const saltBytes = encoder.encode("milsabores_salt_demo");

  const hashBytes = await scrypt(passwordBytes, saltBytes, N, r, p, KEY_LENGTH);
  return toHex(hashBytes);
}

export default function UserNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    contrasena: "",
    rol: "cliente",
    fechaNacimiento: "",
    beneficio: "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.nombre || !form.contrasena) {
      alert("Nombre, correo y contraseña son obligatorios.");
      return;
    }

    if (form.contrasena.length < 4 || form.contrasena.length > 15) {
      alert("La contraseña debe tener entre 4 y 15 caracteres.");
      return;
    }

    
    if (form.fechaNacimiento) {
      const hoy = new Date().toISOString().split("T")[0];
      if (form.fechaNacimiento > hoy) {
        alert("La fecha de nacimiento no puede ser una fecha futura.");
        return;
      }
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

      // Hashear la contraseña
      const hashedPassword = await hashPassword(form.contrasena);

      let payload;
      let creado;

      
      if (form.rol === "admin") {
        payload = {
          nombre: form.nombre,
          apellido: form.apellidos,
          correo: form.email,
          contrasena: hashedPassword,
          comuna: "",
          region: "",
          activo: true,
          fechaContratacion: "2025-01-01",
          rol: "ADMIN",
          beneficio: form.beneficio || "",
          fechaNacimiento: form.fechaNacimiento || null,
        };
        creado = await addAdministrador(payload);
      }

      if (form.rol === "vendedor") {
        payload = {
          nombre: form.nombre,
          apellido: form.apellidos,
          correo: form.email,
          contrasena: hashedPassword,
          comuna: "",
          region: "",
          telefono: "",
          activo: true,
          fechaContratacion: "2025-01-01",
          beneficio: form.beneficio || "",
          fechaNacimiento: form.fechaNacimiento || null,
        };
        creado = await addVendedor(payload);
      }

      if (form.rol === "cliente") {
        payload = {
          nombre: form.nombre,
          apellido: form.apellidos,
          correo: form.email,
          contrasena: hashedPassword,
          comuna: "",
          region: "",
          telefono: "",
          direccion: "",
          beneficio: form.beneficio || "",
          fechaNacimiento: form.fechaNacimiento || null,
        };
        creado = await addCliente(payload);
      }

      console.log("Usuario creado:", creado);
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
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header d-flex justify-content-between align-items-center">
        <div>
          <h1 className="mb-1">Nuevo usuario</h1>
          <div className="text-muted small">
            Crea un nuevo cliente, vendedor o administrador.
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/admin/usuarios")}
        >
          ← Volver
        </button>
      </div>

      {/* Body */}
      <div className="admin-body">
        <div className="row justify-content-start">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Datos del usuario</h5>

                <form onSubmit={onSubmit}>
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={onChange}
                      className="form-control"
                      placeholder="Ej: Ana"
                      required
                    />
                  </div>

                  {/* Apellidos */}
                  <div className="mb-3">
                    <label className="form-label">Apellidos</label>
                    <input
                      name="apellidos"
                      value={form.apellidos}
                      onChange={onChange}
                      className="form-control"
                      placeholder="Ej: Pérez González"
                    />
                  </div>

                  {/* Fecha de nacimiento */}
                  <div className="mb-3">
                    <label className="form-label">Fecha de nacimiento</label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={onChange}
                      className="form-control"
                    />
                  </div>

                  {/* Beneficio */}
                  <div className="mb-3">
                    <label className="form-label">
                      Beneficio (afecta promociones)
                    </label>
                    <input
                      name="beneficio"
                      value={form.beneficio}
                      onChange={onChange}
                      className="form-control"
                      placeholder='Ej: "MAYOR50", "50%", "CLIENTE_DUOC"...'
                    />
                    <small className="text-muted">
                      Para 50% permanente puedes usar por ejemplo{" "}
                      <strong>MAYOR50</strong> o <strong>50%</strong>.
                    </small>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className="form-control"
                      placeholder="usuario@correo.com"
                      required
                    />
                  </div>

                  {/* Contraseña */}
                  <div className="mb-3">
                    <label className="form-label">
                      Contraseña <span className="text-danger">*</span>
                    </label>
                    <input
                      name="contrasena"
                      type="password"
                      value={form.contrasena}
                      onChange={onChange}
                      className="form-control"
                      placeholder="Entre 4 y 15 caracteres"
                      required
                    />
                  </div>

                  {/* Rol */}
                  <div className="mb-4">
                    <label className="form-label">Rol</label>
                    <select
                      name="rol"
                      value={form.rol}
                      onChange={onChange}
                      className="form-select"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  {/* Botones */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? "Creando..." : "Crear usuario"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/admin/usuarios")}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <p className="text-muted small mt-3">
              Los campos marcados con{" "}
              <span className="text-danger">*</span> son obligatorios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
