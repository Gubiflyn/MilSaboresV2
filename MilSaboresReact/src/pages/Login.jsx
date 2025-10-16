import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const from = location.state?.from || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    const res = await login(email.trim(), password.trim());
    if (!res.ok) {
      setErr(res.error || "Correo o contraseña incorrectos");
      return;
    }
    // Redirección básica (si venía de una ruta protegida, vuelve allí)
    navigate(from, { replace: true });
  };

  return (
    <div className="container py-5" style={{maxWidth:520}}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="mb-4 text-center">Iniciar Sesión</h2>
          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                required
                placeholder="alguien@duocuc.cl / gmail.com"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
              />
            </div>
            {err && <div className="alert alert-danger py-2">{err}</div>}
            <button type="submit" className="btn btn--primary w-100">Iniciar sesión</button>
          </form>
          <p className="text-center mt-3 mb-0">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
