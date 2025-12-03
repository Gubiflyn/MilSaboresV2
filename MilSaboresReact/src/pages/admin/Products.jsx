import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPasteles,
  createPastel,
  updatePastel,
  deletePastel,
  getCategorias,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function Products() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState({
    id: null,
    codigo: "",
    nombre: "",
    categoria: "",
    precio: 0,
    stock: 0,
    imagen: "",
    descripcion: "",
  });
  const [categoriasApi, setCategoriasApi] = useState([]); // ahora guarda objetos completos
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === "ADMIN";

  const showPermissionError = () => {
    alert(
      "No tienes permisos para realizar esta acción. Solo los administradores pueden gestionar productos."
    );
  };

  // ====================
  //  CARGA INICIAL
  // ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pasteles, categorias] = await Promise.all([
          getPasteles(),
          getCategorias(),
        ]);

        setList(
          (pasteles || []).map((p) => ({
            ...p,
            stock: p?.stock ?? 0,
            categoria:
              typeof p.categoria === "string"
                ? p.categoria
                : p.categoria?.nombre || "",
          }))
        );

        setCategoriasApi(Array.isArray(categorias) ? categorias : []);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        alert(
          "Ocurrió un error al cargar los productos. Revisa la consola para más detalles."
        );
      }
    };

    fetchData();
  }, []);

  // ====================
  //  DERIVADOS
  // ====================
  const categoriasDerivadas = useMemo(
    () =>
      Array.from(
        new Set(
          (list || [])
            .map((p) => (p.categoria || "").trim())
            .filter((c) => !!c)
        )
      ).sort((a, b) => a.localeCompare(b, "es")),
    [list]
  );

  const categorias = useMemo(() => {
    const set = new Set(
      [
        ...(categoriasApi || [])
          .map((c) => (c.nombre || "").trim())
          .filter(Boolean),
        ...(categoriasDerivadas || []),
      ].filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [categoriasApi, categoriasDerivadas]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return list;

    return (list || []).filter((p) => {
      const codigo = (p?.codigo || "").toLowerCase();
      const nombre = (p?.nombre || "").toLowerCase();
      const categoria = (p?.categoria || "").toLowerCase();
      return (
        codigo.includes(query) ||
        nombre.includes(query) ||
        categoria.includes(query)
      );
    });
  }, [q, list]);

  // ====================
  //  FORM / CRUD
  // ====================
  const resetForm = () =>
    setForm({
      id: null,
      codigo: "",
      nombre: "",
      categoria: "",
      precio: 0,
      stock: 0,
      imagen: "",
      descripcion: "",
    });

  const handleSave = async () => {
    if (!isAdmin) {
      showPermissionError();
      return;
    }

    if (!form.codigo || !form.nombre || !form.categoria) {
      alert("Código, nombre y categoría son obligatorios.");
      return;
    }

    
    if (Number(form.precio) < 0 || Number(form.stock) < 0) {
      alert("El precio y el stock no pueden ser negativos.");
      return;
    }

   
    const categoriaObj = categoriasApi.find(
      (c) =>
        (c.nombre || "").toLowerCase() === form.categoria.toLowerCase().trim()
    );

    if (!categoriaObj) {
      alert(
        "La categoría seleccionada no existe en la base de datos. Refresca la página o revisa las categorías."
      );
      return;
    }

    const payload = {
      id: form.id || 0,
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock),
      imagen: form.imagen,
      categoria: {
        id: categoriaObj.id,
        nombre: categoriaObj.nombre,
        descripcion: categoriaObj.descripcion || "",
      },
    };

    setSaving(true);
    try {
      let saved;
      if (form.id) {
        // EDITAR
        saved = await updatePastel(payload);
        const normalizado = {
          ...saved,
          stock: saved?.stock ?? 0,
          categoria:
            typeof saved.categoria === "string"
              ? saved.categoria
              : saved.categoria?.nombre || "",
        };
        setList((prev) =>
          prev.map((p, i) => (i === editIdx ? normalizado : p))
        );
      } else {
        // CREAR NUEVO
        saved = await createPastel(payload);
        const normalizado = {
          ...saved,
          stock: saved?.stock ?? 0,
          categoria:
            typeof saved.categoria === "string"
              ? saved.categoria
              : saved.categoria?.nombre || "",
        };
        setList((prev) => [...prev, normalizado]);
      }

      setShowForm(false);
      setEditIdx(-1);
      resetForm();
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert("Ocurrió un error al guardar el producto. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewClick = () => {
    if (!isAdmin) {
      showPermissionError();
      return;
    }
    resetForm();
    setEditIdx(-1);
    setShowForm(true);
  };

  const handleEdit = (idx) => {
    if (!isAdmin) {
      showPermissionError();
      return;
    }

    const p = filtered[idx];
    if (!p) return;

    setForm({
      id: p.id ?? null,
      codigo: p.codigo ?? "",
      nombre: p.nombre ?? "",
      categoria: p.categoria ?? "",
      precio: p.precio ?? 0,
      stock: p.stock ?? 0,
      imagen: p.imagen ?? "",
      descripcion: p.descripcion ?? "",
    });
    setEditIdx(idx);
    setShowForm(true);
  };

  const handleDelete = async (idx) => {
    if (!isAdmin) {
      showPermissionError();
      return;
    }

    const p = filtered[idx];
    if (!p) return;

    if (
      !window.confirm(
        `¿Eliminar el producto "${p.nombre}"? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      await deletePastel(p.id);
      setList((prev) => prev.filter((_, i) => i !== idx));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      alert("No se pudo eliminar el producto. Revisa la consola.");
    }
  };

  const handleView = (p) => {
    const code =
      p?.codigo ?? p?.id ?? p?.sku ?? p?.code ?? p?.slug ?? p?.nombre;
    if (!code) {
      alert("Este producto no tiene identificador para ver el detalle.");
      return;
    }
    navigate(`/admin/productos/${code}`);
  };

  // ====================
  //  RENDER
  // ====================
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Productos</h1>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por código, nombre o categoría..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleNewClick}>
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="admin-body">
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id ?? p.codigo ?? idx}>
                    <td>{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td>{CLP(p.precio)}</td>
                    <td>{p.stock}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleView(p)}
                        >
                          Ver
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(idx)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(idx)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No hay productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Crear/Editar */}
        {showForm && (
          <div className="modal-backdrop-custom">
            <div className="modal-custom card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {form.id ? "Editar producto" : "Nuevo producto"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowForm(false);
                    setEditIdx(-1);
                    resetForm();
                  }}
                  disabled={saving}
                />
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Código</label>
                    <input
                      className="form-control"
                      value={form.codigo}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, codigo: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      value={form.nombre}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nombre: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Categoría</label>
                    <select
                      className="form-select"
                      value={form.categoria}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, categoria: e.target.value }))
                      }
                    >
                      <option value="">Seleccione...</option>
                      {categorias.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Precio</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.precio}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          precio: Math.max(
                            0,
                            Number(e.target.value || 0)
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          stock: Math.max(
                            0,
                            Number(e.target.value || 0)
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Imagen (URL)</label>
                    <input
                      className="form-control"
                      value={form.imagen}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, imagen: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.descripcion}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          descripcion: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditIdx(-1);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
