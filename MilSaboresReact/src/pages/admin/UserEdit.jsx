import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getUsuarios, updateUsuario, deleteUsuario } from "../../services/api";

const ROLES = [
  { value: "ADMIN", label: "ADMIN" },
  { value: "VENDEDOR", label: "VENDEDOR" },
  { value: "CLIENTE", label: "CLIENTE" },
];

export default function UserEdit() {
  const { id } = useParams(); // viene como correo encodeURIComponent
  const navigate = useNavigate();

  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "CLIENTE",
    beneficio: "",
    fechaNacimiento: "",
  });
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const idDecoded = useMemo(() => {
    try {
      return decodeURIComponent(id || "");
    } catch {
      return id || "";
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await getUsuarios();
        const list = Array.isArray(data) ? data : [];

        const found = list.find((u) => {
          const correoApi = u.correo || u.email || "";
          const encoded = encodeURIComponent(String(correoApi || ""));
          return (
            encoded === String(id) ||
            String(correoApi || "").toLowerCase() ===
              String(idDecoded || "").toLowerCase()
          );
        });

        if (!found) {
          setNotFound(true);
          return;
        }

        setOriginal(found);

        const nombre = found.nombre || "";
        const correo = found.correo || "";

        // si ROL viene nulo, asumimos CLIENTE por defecto
        const rol = (found.rol || "CLIENTE").toUpperCase();

        setForm({
          nombre,
          email: correo,
          rol,
          beneficio: "", // sigue siendo sólo visual
          fechaNacimiento: "",
        });
      } catch (e) {
        console.error("Error al cargar usuario desde API:", e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, idDecoded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.nombre) {
      alert("Nombre y correo son obligatorios.");
      return;
    }
    if (!original) {
      alert("No se pudo determinar el usuario original.");
      return;
    }

    setSaving(true);
    try {
      // DTO que espera el backend
      const payload = {
        id: original.id,
        nombre: form.nombre,
        correo: form.email,
        rol: (form.rol || "CLIENTE").toUpperCase(),
      };

      await updateUsuario(payload);
      alert("Usuario actualizado correctamente.");
      navigate("/admin/usuarios");
    } catch (e) {
      console.error("Error al actualizar usuario:", e);
      alert("No se pudo actualizar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!original) {
      alert("No se encontró el usuario a eliminar.");
      return;
    }
    if (!window.confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await deleteUsuario(original.id);
      alert("Usuario eliminado.");
      navigate("/admin/usuarios");
    } catch (e) {
      console.error("Error al eliminar usuario:", e);
      alert("No se pudo eliminar el usuario.");
    }
  };

  if (loading) {
    return (
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Editar usuario</h5>
          <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
            ← Volver
          </Link>
        </div>
        <div className="card-body text-muted">Cargando usuario…</div>
      </div>
    );
  }

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
          <div className="alert alert-warning mb-0">
            No se encontró el usuario con identificador <code>{id}</code>.
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
              <label className="form-label">Nombre</label>
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
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Beneficio (solo visual)</label>
              <input
                type="text"
                name="beneficio"
                className="form-control"
                value={form.beneficio}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Fecha de nacimiento (solo visual)</label>
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

        <div className="card-footer d-flex justify-content-between gap-2">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleDelete}
          >
            Eliminar usuario
          </button>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/admin/usuarios")}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
