import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const LS_PRIMARY = "usuarios_v1";
const LS_FALLBACKS = ["perfiles", "usuarios", "USERS"]; 

function readUsers() {
  const keys = [LS_PRIMARY, ...LS_FALLBACKS];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return { key: k, list: arr };
    } catch {
    }
  }
  return { key: LS_PRIMARY, list: [] };
}

function writeUsers(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

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
  const [storageKey, setStorageKey] = useState(LS_PRIMARY);
  const [notFound, setNotFound] = useState(false);

  const idDecoded = useMemo(() => {
    try {
      return decodeURIComponent(id || "");
    } catch {
      return id || "";
    }
  }, [id]);

  useEffect(() => {
    const { key, list } = readUsers();
    setStorageKey(key);

    const found = list.find(
      (u) =>
        encodeURIComponent(String(u?.email || "")) === String(id) ||
        String(u?.email || "") === idDecoded
    );

    if (found) {
      setForm({
        nombre: found.nombre || "",
        email: found.email || "",
        rol: found.rol || "cliente",
        beneficio: found.beneficio || "",
        fechaNacimiento: found.fechaNacimiento || "",
      });
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  }, [id, idDecoded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { key, list } = readUsers();
    const idx = list.findIndex(
      (u) =>
        encodeURIComponent(String(u?.email || "")) === String(id) ||
        String(u?.email || "") === idDecoded
    );

    if (idx === -1) {
      alert("No se encontró el usuario a editar. Vuelve al listado e inténtalo nuevamente.");
      return;
    }

    const updated = [...list];
    updated[idx] = {
      ...updated[idx],
      ...form,
    };

    writeUsers(key, updated);
    navigate("/admin/usuarios");
  };

  if (notFound) {
    return (
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Editar usuario</h5>
          <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
            ← Volver
          </Link>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            No se encontró el usuario con id <code>{id}</code>
            {id !== idDecoded ? (
              <>
                {" "}
                (email decodificado: <code>{idDecoded}</code>)
              </>
            ) : null}
            . Revisa el listado e intenta nuevamente.
          </div>
        </div>
      </div>
    );
  }

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
