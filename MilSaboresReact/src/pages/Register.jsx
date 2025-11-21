import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import regionesComunas from "../data/chile-regiones-comunas.json";

export default function Register() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const regiones = useMemo(() => regionesComunas.map((r) => r.region), []);

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    contrasena: "",
    fechaNacimiento: "",
    telefono: "+569",
    direccion: "",
    region: "",
    comuna: "",
    codigoDescuento: "",
  });

  const [err, setErr] = useState("");

  const comunasDeRegion = useMemo(() => {
    const r = regionesComunas.find((x) => x.region === form.region);
    return r ? r.comunas : [];
  }, [form.region]);

  const enforcePhone = (value) => {
    if (!value.startsWith("+569")) {
      value = "+569" + value.replace(/[^0-9]/g, "").replace(/^569/, "");
    }
    value = value.replace(/(?!^\+)[^0-9]/g, "");
    if (value.length > 12) value = value.slice(0, 12);
    return value;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const oblig = [
      "nombres",
      "apellidos",
      "correo",
      "contrasena",
      "fechaNacimiento",
      "direccion",
      "region",
      "comuna",
      "telefono",
    ];

    for (const k of oblig) {
      if (!String(form[k] || "").trim()) {
        setErr("Por favor completa los campos obligatorios (*).");
        return;
      }
    }

    if (!/^\+569\d{8}$/.test(form.telefono)) {
      setErr("El teléfono debe tener el formato +569XXXXXXXX (8 dígitos).");
      return;
    }

    if (form.contrasena.length < 4 || form.contrasena.length > 15) {
      setErr("La contraseña debe tener entre 4 y 15 caracteres.");
      return;
    }

    const codigoRegistro = (form.codigoDescuento || "").trim().toUpperCase();
    const isDuoc = /@(duocuc|duoc)\.cl$/i.test(form.correo);

    let edad = 0;
    if (form.fechaNacimiento) {
      const d = new Date(form.fechaNacimiento);
      const now = new Date();
      if (d > now) {
        setErr("La fecha de nacimiento no puede ser futura.");
        return;
      }
      edad = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) edad--;
    }

    let beneficio = "Sin beneficio";
    if (edad >= 50) beneficio = "50%";
    else if (codigoRegistro === "FELICES50") beneficio = "FELICES50";
    else if (isDuoc) beneficio = "TORTA GRATIS";

    const clientePayload = {
      nombre: `${form.nombres} ${form.apellidos}`.trim(),
      correo: form.correo,
      contrasena: form.contrasena,
      telefono: form.telefono,
      direccion: form.direccion,
      region: form.region,
      comuna: form.comuna,
      beneficio,
      fechaNacimiento: form.fechaNacimiento,
      codigoRegistro,
      puntos: 0,
      activo: true,
    };

    try {
      // 1) Registrar en BD
      await register(clientePayload);

      // 2) Iniciar sesión real
      await login(form.correo, form.contrasena);

      // 3) Mensaje de beneficio
      let msg = "Sin beneficio";
      if (beneficio === "50%") msg = "50% de descuento en todos los productos";
      else if (beneficio === "FELICES50") msg = "10% de descuento de por vida";
      else if (beneficio === "TORTA GRATIS")
        msg = "Torta gratis en tu cumpleaños (correo DUOC)";

      alert(`Registro exitoso.\nBeneficio asignado: ${msg}`);
      navigate("/");

    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo registrar el usuario.");
    }
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
                  onChange={(e) =>
                    setForm({ ...form, nombres: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellidos *</label>
                <input
                  className="form-control"
                  value={form.apellidos}
                  onChange={(e) =>
                    setForm({ ...form, apellidos: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo *</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.correo}
                  onChange={(e) =>
                    setForm({ ...form, correo: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contraseña *</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.contrasena}
                  onChange={(e) =>
                    setForm({ ...form, contrasena: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Fecha de nacimiento *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.fechaNacimiento}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm({ ...form, fechaNacimiento: e.target.value })
                  }
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

              <div className="col-md-8">
                <label className="form-label">Dirección *</label>
                <input
                  className="form-control"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Teléfono *</label>
                <input
                  className="form-control"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: enforcePhone(e.target.value) })
                  }
                  placeholder="+569XXXXXXXX"
                  inputMode="tel"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Región *</label>
                <select
                  className="form-select"
                  value={form.region}
                  onChange={(e) =>
                    setForm({ ...form, region: e.target.value, comuna: "" })
                  }
                  required
                >
                  <option value="" disabled>Selecciona una región</option>
                  {regiones.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Comuna *</label>
                <select
                  className="form-select"
                  value={form.comuna}
                  onChange={(e) =>
                    setForm({ ...form, comuna: e.target.value })
                  }
                  disabled={!form.region}
                  required
                >
                  <option value="" disabled>
                    {form.region ? "Selecciona una comuna" : "Primero elige una región"}
                  </option>
                  {comunasDeRegion.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
