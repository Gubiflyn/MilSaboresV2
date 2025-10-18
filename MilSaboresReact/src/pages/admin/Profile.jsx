import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Si tienes AuthContext, se usará; si no, el código sigue funcionando con localStorage.
let useAuthSafe = null;
try {
  // eslint-disable-next-line global-require
  useAuthSafe = require("../../context/AuthContext").useAuth;
} catch (_) {
  // sin AuthContext, operamos solo con localStorage
}

const LS_PROFILE_KEY = "ADMIN_PROFILE";
const LS_PREF_THEME = "PREF_ADMIN_THEME"; // 'light' | 'dark' | 'system'

function readProfileFromLS() {
  try {
    const raw = localStorage.getItem(LS_PROFILE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object") return p;
    }
  } catch (_) {}
  return null;
}

function saveProfileToLS(p) {
  localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(p));
}

function readThemePref() {
  try {
    const v = localStorage.getItem(LS_PREF_THEME);
    return v || "system";
  } catch (_) {
    return "system";
  }
}

function saveThemePref(v) {
  localStorage.setItem(LS_PREF_THEME, v);
}

function applyThemePreference(pref) {
  // Pref aplica data-theme en <html>. Tu admin.css usa prefers-color-scheme,
  // pero esto te deja la puerta abierta para personalizar si quieres.
  const root = document.documentElement;
  if (!root) return;
  if (pref === "light") {
    root.setAttribute("data-theme", "light");
  } else if (pref === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme"); // sistema
  }
}

const emptyProfile = {
  nombre: "",
  apellido: "",
  displayName: "",
  email: "",
  telefono: "",
  avatarUrl: "",
  role: "admin",
};

export default function Profile() {
  const navigate = useNavigate();
  const useAuth = useAuthSafe;
  const auth = useAuth ? useAuth() : null;

  // Cargar perfil inicial: prioridad AuthContext > localStorage
  const initialProfile = useMemo(() => {
    const fromLS = readProfileFromLS();
    const fromAuth = auth?.user || null;

    // Mapeo flexible de campos que suelen venir en distintos nombres
    const email =
      fromAuth?.email ??
      fromAuth?.correo ??
      fromAuth?.username ??
      fromLS?.email ??
      "";

    const displayName =
      fromAuth?.displayName ??
      fromAuth?.name ??
      fromAuth?.nombreCompleto ??
      fromLS?.displayName ??
      fromLS?.nombre ??
      "";

    const avatarUrl =
      fromAuth?.avatarUrl ??
      fromAuth?.photoURL ??
      fromLS?.avatarUrl ??
      "";

    const telefono = fromAuth?.telefono ?? fromAuth?.phone ?? fromLS?.telefono ?? "";

    const nombre = fromLS?.nombre || "";
    const apellido = fromLS?.apellido || "";
    const role = fromAuth?.role || fromLS?.role || "admin";

    return {
      ...emptyProfile,
      nombre,
      apellido,
      displayName,
      email,
      telefono,
      avatarUrl,
      role,
    };
  }, [auth]);

  const [form, setForm] = useState(initialProfile);
  const [themePref, setThemePref] = useState(readThemePref());
  const [saving, setSaving] = useState(false);

  // Seguridad
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [pwdMsg, setPwdMsg] = useState(null);

  useEffect(() => {
    setForm(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    applyThemePreference(themePref);
  }, [themePref]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateProfile = () => {
    const errors = {};
    if (!form.displayName.trim()) errors.displayName = "El nombre para mostrar es obligatorio.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Email inválido.";
    if (form.telefono && !/^[\d\s+\-()]{6,}$/.test(form.telefono))
      errors.telefono = "Teléfono inválido.";
    return errors;
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    const errs = validateProfile();
    if (Object.keys(errs).length) {
      alert(Object.values(errs).join("\n"));
      return;
    }
    setSaving(true);
    const toSave = { ...form, role: form.role || "admin" };
    try {
      saveProfileToLS(toSave);
      // Si tu AuthContext provee updateProfile, lo intentamos
      if (auth?.updateProfile) {
        await auth.updateProfile({
          displayName: toSave.displayName,
          avatarUrl: toSave.avatarUrl,
          telefono: toSave.telefono,
        });
      }
      alert("Perfil actualizado.");
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el perfil en AuthContext, pero quedó guardado localmente.");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (v) => {
    setThemePref(v);
    saveThemePref(v);
  };

  const validatePassword = () => {
    if (!newPwd || !newPwd2) return "Completa la nueva contraseña y la confirmación.";
    if (newPwd !== newPwd2) return "Las contraseñas no coinciden.";
    // Reglas mínimas sugeridas
    if (newPwd.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-ZÁÉÍÓÚÑ]/.test(newPwd)) return "Incluye al menos una mayúscula.";
    if (!/[a-záéíóúñ]/.test(newPwd)) return "Incluye al menos una minúscula.";
    if (!/\d/.test(newPwd)) return "Incluye al menos un número.";
    return null;
  };

  const handleChangePassword = async () => {
    setPwdMsg(null);
    const err = validatePassword();
    if (err) {
      setPwdMsg({ type: "error", text: err });
      return;
    }
    try {
      if (auth?.changePassword) {
        await auth.changePassword(oldPwd, newPwd);
        setPwdMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
      } else {
        // Sin backend: simulación guardando un sello en localStorage
        localStorage.setItem("ADMIN_PWD_LAST_CHANGE", new Date().toISOString());
        setPwdMsg({
          type: "ok",
          text: "Contraseña simulada como cambiada (no hay backend).",
        });
      }
      setOldPwd("");
      setNewPwd("");
      setNewPwd2("");
    } catch (e) {
      console.error(e);
      setPwdMsg({ type: "error", text: "Error al actualizar la contraseña." });
    }
  };

  return (
    <div className="admin-content">
      {/* Header */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div>
            <div className="section-title">Perfil del administrador</div>
            <div className="muted">
              {form.email ? <>Sesión: <strong>{form.email}</strong></> : "Sin email"}
              {form.role ? <> • Rol: <strong>{form.role}</strong></> : null}
            </div>
          </div>
          <div className="admin-actions">
            <button className="btn-admin" onClick={() => navigate(-1)}>Volver</button>
            <Link className="btn-admin" to="/admin">Dashboard</Link>
            <button className="btn-admin btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </div>

        {/* Datos personales */}
        <div className="card-body">
          <div className="form-grid">
            <div className="form-col-6">
              <label className="label" htmlFor="displayName">Nombre para mostrar *</label>
              <input
                id="displayName"
                name="displayName"
                className="input"
                value={form.displayName}
                onChange={onChange}
                placeholder="Ej: Admin Mil Sabores"
              />

              <div className="spacer" />
              <label className="label" htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                className="input"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej: Felipe"
              />

              <div className="spacer" />
              <label className="label" htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                className="input"
                value={form.apellido}
                onChange={onChange}
                placeholder="Ej: Delgado"
              />

              <div className="spacer" />
              <label className="label" htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                className="input"
                value={form.email}
                onChange={onChange}
                placeholder="admin@ejemplo.cl"
              />

              <div className="spacer" />
              <label className="label" htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                className="input"
                value={form.telefono}
                onChange={onChange}
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div className="form-col-6">
              <label className="label" htmlFor="avatarUrl">Avatar (URL)</label>
              <input
                id="avatarUrl"
                name="avatarUrl"
                className="input"
                value={form.avatarUrl}
                onChange={onChange}
                placeholder="/img/admin-avatar.png"
              />
              <div className="spacer" />
              <div className="card" style={{ overflow: "hidden" }}>
                <div className="card-body" style={{ display: "grid", placeItems: "center" }}>
                  <img
                    src={form.avatarUrl || "/img/placeholder-cake.png"}
                    alt="avatar"
                    style={{ width: 160, height: 160, objectFit: "cover", borderRadius: "50%" }}
                    onError={(e) => { e.currentTarget.src = "/img/placeholder-cake.png"; }}
                  />
                </div>
              </div>

              <div className="spacer" />
              <label className="label">Preferencia de tema</label>
              <div className="admin-actions" style={{ flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`btn-admin ${themePref === "light" ? "btn-primary" : ""}`}
                  onClick={() => handleThemeChange("light")}
                >
                  Claro
                </button>
                <button
                  type="button"
                  className={`btn-admin ${themePref === "dark" ? "btn-primary" : ""}`}
                  onClick={() => handleThemeChange("dark")}
                >
                  Oscuro
                </button>
                <button
                  type="button"
                  className={`btn-admin ${themePref === "system" ? "btn-primary" : ""}`}
                  onClick={() => handleThemeChange("system")}
                >
                  Sistema
                </button>
              </div>
              <p className="muted" style={{ marginTop: 6 }}>
                * Tu <code>admin.css</code> ya soporta <em>prefers-color-scheme</em>. Este ajuste añade <code>data-theme</code> para personalizaciones futuras.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <strong>Seguridad</strong>
          <div className="admin-actions">
            <button className="btn-admin btn-primary" onClick={handleChangePassword}>Actualizar contraseña</button>
          </div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-col-6">
              <label className="label" htmlFor="oldPwd">Contraseña actual</label>
              <input
                id="oldPwd"
                className="input"
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
              />
            </div>
            <div className="form-col-6" />
            <div className="form-col-6">
              <label className="label" htmlFor="newPwd">Nueva contraseña</label>
              <input
                id="newPwd"
                className="input"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
            </div>
            <div className="form-col-6">
              <label className="label" htmlFor="newPwd2">Confirmar nueva contraseña</label>
              <input
                id="newPwd2"
                className="input"
                type="password"
                value={newPwd2}
                onChange={(e) => setNewPwd2(e.target.value)}
              />
            </div>
          </div>
          {pwdMsg ? (
            <div className={`badge ${pwdMsg.type === "ok" ? "success" : "danger"}`} style={{ marginTop: 10 }}>
              {pwdMsg.text}
            </div>
          ) : null}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="quick-tiles">
        <Link className="tile" to="/admin">Volver al Dashboard</Link>
        <Link className="tile" to="/admin/users">Gestión de usuarios</Link>
      </div>
    </div>
  );
}
