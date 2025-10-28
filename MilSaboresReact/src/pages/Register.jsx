// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    contrasena: "",
    fechaNacimiento: "",
    telefono: "",
    direccion: "",
    region: "",
    comuna: "",
    codigoDescuento: ""
  });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // Validaciones básicas
    const oblig = [
      "nombres",
      "apellidos",
      "correo",
      "contrasena",
      "fechaNacimiento",
      "direccion",
      "region",
      "comuna"
    ];
    for (const k of oblig) {
      if (!String(form[k] || "").trim()) {
        setErr("Por favor completa los campos obligatorios (*).");
        return;
      }
    }
    if (form.contrasena.length < 4 || form.contrasena.length > 15) {
      setErr("La contraseña debe tener entre 4 y 15 caracteres.");
      return;
    }

    // ===== Normalización de cupón/beneficio =====
    const codigoRegistro = (form.codigoDescuento || "").trim().toUpperCase();
    const isDuoc = /@(duocuc|duoc)\.cl$/i.test(form.correo);

    // calcular edad para el beneficio 50%
    let edad = 0;
    if (form.fechaNacimiento) {
      const d = new Date(form.fechaNacimiento);
      const now = new Date();
      edad = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) edad--;
    }

    // Resolución de beneficio PRIORITARIO según tu lógica global:
    // 1) 50% si edad >= 50
    // 2) Si no, FELICES50 (10%) si ingresó el cupón
    // 3) Si no, TORTA GRATIS (marcador para DUOC; el regalo se valida por cumpleaños en promotions.js)
    // 4) Si nada, "Sin beneficio"
    let beneficio = "Sin beneficio";
    if (edad >= 50) {
      beneficio = "50%";
    } else if (codigoRegistro === "FELICES50") {
      beneficio = "FELICES50";
    } else if (isDuoc) {
      beneficio = "TORTA GRATIS";
    }

    const usuario = {
      nombres: form.nombres,
      apellidos: form.apellidos,
      correo: form.correo,
      contrasena: form.contrasena,
      fechaNacimiento: form.fechaNacimiento,
      telefono: form.telefono,
      direccion: form.direccion,
      region: form.region,
      comuna: form.comuna,
      // ⚠️ claves compatibles con promotions.js
      codigoRegistro, // p.ej. "FELICES50"
      beneficio       // "50%" | "FELICES50" | "TORTA GRATIS" | "Sin beneficio"
    };

    // Guardar en localStorage bajo "perfiles"
    const perfiles = JSON.parse(localStorage.getItem("perfiles") || "[]");
    perfiles.push(usuario);
    localStorage.setItem("perfiles", JSON.stringify(perfiles));

    // Auto-login
    const res = await login(form.correo, form.contrasena);
    if (!res.ok) {
      navigate("/login");
      return;
    }

    // Mensaje amigable
    let msg = "Sin beneficio";
    if (beneficio === "50%") msg = "50% de descuento en todos los productos";
    else if (beneficio === "FELICES50") msg = "10% de descuento de por vida";
    else if (beneficio === "TORTA GRATIS") msg = "Torta gratis en tu cumpleaños (correo DUOC)";

    alert(`Registro exitoso.\nBeneficio asignado: ${msg}`);
    navigate("/");
  };

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="card">
        <div className="card-body">
          <h2 className="mb-4 text-center">Registro de Usuario</h2>
          <form onSubmit={onSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombres *</label>
                <input
                  className="form-control"
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellidos *</label>
                <input
                  className="form-control"
                  value={form.apellidos}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Correo *</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contraseña *</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.contrasena}
                  onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha de nacimiento *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.fechaNacimiento}
                  onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Código de descuento (opcional)</label>
                <input
                  className="form-control"
                  value={form.codigoDescuento}
                  onChange={(e) =>
                    setForm({ ...form, codigoDescuento: e.target.value })
                  }
                  placeholder="FELICES50"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Dirección *</label>
                <input
                  className="form-control"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Región *</label>
                <input
                  className="form-control"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Comuna *</label>
                <input
                  className="form-control"
                  value={form.comuna}
                  onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                  required
                />
              </div>
            </div>

            {err && <div className="alert alert-danger mt-3 py-2">{err}</div>}

            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-primary" type="submit">
                Registrarse
              </button>
              <p className="text-center mb-0">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
