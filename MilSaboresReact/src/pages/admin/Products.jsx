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
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const showPermissionError = () => {
    alert(
      "Acción no disponible: sólo los administradores pueden gestionar productos."
    );
  };

  // ====================
  //  CARGA INICIAL (API)
  // ====================
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await getPasteles();
        setList(
          (Array.isArray(data) ? data : []).map((p) => ({
            ...p,
            stock: p?.stock ?? 0,
            // Para mostrar en la tabla dejamos sólo el nombre de la categoría
            categoria:
              typeof p.categoria === "string"
                ? p.categoria
                : p.categoria?.nombre || "",
          }))
        );
      } catch (err) {
        console.error("Error al cargar productos en Admin/Products:", err);
        alert("No se pudieron cargar los productos desde la API.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  // ====================
  //  CARGA CATEGORÍAS (API)
  // ====================
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategoriasApi(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    cargarCategorias();
  }, []);

  // ====================
  //  FILTRO / SEARCH
  // ====================
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return list;
    return list.filter((p) =>
      [p.codigo, p.nombre, p.categoria].some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      )
    );
  }, [q, list]);

  const categoriasDerivadas = useMemo(
    () =>
      Array.from(new Set(list.map((p) => p.categoria)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es")),
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

    // Buscar la categoría completa (con id, nombre, descripcion) por nombre
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
        // NUEVO
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
    setForm(list[idx]);
    setEditIdx(idx);
    setShowForm(true);
  };

  const handleDelete = async (idx) => {
    if (!isAdmin) {
      showPermissionError();
      return;
    }

    const p = list[idx];
    if (
      !window.confirm(
        `¿Eliminar el producto "${p.nombre}"?\nEsta acción no se puede deshacer.`
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
    navigate(`/admin/products/${code}`);
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
            type="search"
            className="form-control"
            placeholder="Buscar por código, nombre o categoría..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleNewClick}>
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="admin-body">
        {loading && (
          <div className="alert alert-info my-2">
            Cargando productos desde la API...
          </div>
        )}

        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th className="text-end">Precio</th>
              <th className="text-end">Stock</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No hay productos que coincidan.
                </td>
              </tr>
            )}
            {filtered.map((p, idx) => (
              <tr key={p.id ?? p.codigo ?? idx}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td className="text-end">{CLP(p.precio)}</td>
                <td className="text-end">{p.stock}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleView(p)}
                  >
                    Ver
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(idx)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(idx)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showForm && (
          <div className="admin-modal-backdrop">
            <div className="admin-modal">
              <h2>{form.id ? "Editar producto" : "Nuevo producto"}</h2>
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
                        precio: Number(e.target.value || 0),
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
                        stock: Number(e.target.value || 0),
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
                      setForm((f) => ({ ...f, descripcion: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="mt-3 d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
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
