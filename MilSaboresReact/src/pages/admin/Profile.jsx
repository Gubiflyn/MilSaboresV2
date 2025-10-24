import React from "react";
import "./admin.css";

export default function Perfil() {
  return (
    <section className="admin-section">
      <div className="card">
        <h2 className="card-title">Perfil del administrador</h2>



        {/* Seguridad */}
        <fieldset className="card-subsection">
          <legend>Seguridad</legend>

          <form className="admin-form">
            <div className="form-row">
              <label htmlFor="pwd-actual">Contraseña actual</label>
              <input id="pwd-actual" type="password" placeholder="••••••••" />
            </div>

            <div className="form-row">
              <label htmlFor="pwd-nueva">Nueva contraseña</label>
              <input id="pwd-nueva" type="password" />
            </div>

            <div className="form-row">
              <label htmlFor="pwd-confirm">Confirmar nueva contraseña</label>
              <input id="pwd-confirm" type="password" />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-primary">
                Actualizar contraseña
              </button>
            </div>
          </form>
        </fieldset>
      </div>
    </section>
  );
}
