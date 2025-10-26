import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const LS_USERS = "usuarios_v1";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "cliente",
    beneficio: "",
    fechaNacimiento: "",
  });

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const found = all.find((u) => encodeURIComponent(u.email) === id);
    if (found) setForm(found);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const all = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const idx = all.findIndex((u) => encodeURIComponent(u.email) === id);
    if (idx !== -1) {
      all[idx] = form;
      localStorage.setItem(LS_USERS, JSON.stringify(all));
      navigate("/admin/usuarios");
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Editar usuario</h5>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Correo</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Rol</label>
              <select
                name="rol"
                className="form-select"
                value={form.rol}
                onChange={handleChange}
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Beneficio</label>
              <input
                type="text"
                name="beneficio"
                className="form-control"
                value={form.beneficio}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Fecha de nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                className="form-control"
                value={form.fechaNacimiento || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/admin/usuarios")}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
