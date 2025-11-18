// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(correo, contrasena);

      if (user.rol === "ADMIN") {
        navigate("/admin"); // o /admin/dashboard, según tu router
      } else {
        navigate("/"); // cliente normal a la home
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo iniciar sesión.");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Iniciar sesión</h2>

              {error && (
                <div className="alert alert-danger py-2">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>
              </form>

              <p className="mt-3 text-center small">
                ¿No tienes cuenta?{" "}
                <Link to="/registro">Regístrate aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
