import React, { useState } from "react";
import "./admin.css";

export default function Perfil() {
  const [form, setForm] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    const map = {
      "pwd-actual": "actual",
      "pwd-nueva": "nueva",
      "pwd-confirm": "confirmar",
    };
    const key = map[id] || id;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleUpdatePassword = () => {
    const { actual, nueva, confirmar } = form;

    if (!actual || !nueva || !confirmar) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    if (nueva.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (nueva !== confirmar) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }

    alert(" Contraseña actualizada correctamente.");
    setForm({ actual: "", nueva: "", confirmar: "" });
  };

  return (
    <section className="admin-section">
      <div className="card">
        <h2 className="card-title">Perfil del administrador</h2>

        <fieldset className="card-subsection">
          <legend>Seguridad</legend>

          <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <label htmlFor="pwd-actual">Contraseña actual</label>
              <input
                id="pwd-actual"
                type="password"
                placeholder="••••••••"
                value={form.actual}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="pwd-nueva">Nueva contraseña</label>
              <input
                id="pwd-nueva"
                type="password"
                value={form.nueva}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="pwd-confirm">Confirmar nueva contraseña</label>
              <input
                id="pwd-confirm"
                type="password"
                value={form.confirmar}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdatePassword}
              >
                Actualizar contraseña
              </button>
            </div>
          </form>
        </fieldset>
      </div>
    </section>
  );
}
