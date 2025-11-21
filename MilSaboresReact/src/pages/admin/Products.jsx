import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPasteles,
  createPastel,
  updatePastel,
  deletePastel,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const LS_TORTAS = "tortas_v3";
const LS_CATS = "categorias_v1";
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

  const [catsLS, setCatsLS] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const showPermissionError = () => {
    alert("Acción no disponible: permisos insuficientes.");
  };

  // =========================
  //  CARGAR LISTA DESDE API
  // =========================
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      let data = [];
      try {
        const apiData = await getPasteles();
        if (Array.isArray(apiData) && apiData.length) {
          data = apiData;
          localStorage.setItem(LS_TORTAS, JSON.stringify(apiData));
        }
      } catch (err) {
        console.error("Error al cargar productos en Admin/Products:", err);
      }

      if (!data.length) {
        try {
          const raw = localStorage.getItem(LS_TORTAS);
          const lsData = raw ? JSON.parse(raw) : [];
          if (Array.isArray(lsData)) {
            data = lsData;
          }
        } catch {
          data = [];
        }
      }

      setList(
        (Array.isArray(data) ? data : []).map((p) => ({
          ...p,
          stock: p?.stock ?? 0,
          // igual que en Productos.jsx:
          // si viene objeto categoria, lo convertimos a string nombre
          categoria:
            typeof p.categoria === "string"
              ? p.categoria
              : p.categoria?.nombre || "",
        }))
      );
      setLoading(false);
    };

    cargar();
  }, []);

  // Guardar lista en LS como respaldo
  useEffect(() => {
    try {
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(LS_TORTAS, JSON.stringify(list));
      }
    } catch {}
  }, [list]);

  // ====================
  //  CATEGORÍAS (LS)
  // ====================
  const loadCatsLS = () => {
    try {
      const raw = localStorage.getItem(LS_CATS);
      const arr = raw ? JSON.parse(raw) : [];
      const clean = Array.from(
        new Set((arr || []).map((s) => (s || "").trim()).filter(Boolean))
      )
        .sort((a, b) => a.localeCompare(b, "es"));
      setCatsLS(clean);
    } catch {
      setCatsLS([]);
    }
  };

  useEffect(() => {
    loadCatsLS();
  }, []);

  useEffect(() => {
    if (showForm) loadCatsLS();
  }, [showForm]);

  useEffect(() => {
    const h = () => loadCatsLS();
    window.addEventListener("categorias:updated", h);
    return () => window.removeEventListener("categorias:updated", h);
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
      [...(catsLS || []), ...(categoriasDerivadas || [])].filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [catsLS, categoriasDerivadas]);

  // ====================
  //  FORM / CRUD
  // ====================
  const resetForm = () => {
    setForm({
      id: null,
      codigo: "",
      nombre: "",
      categoria: categorias[0] || "",
      precio: 0,
      stock: 0,
      imagen: "",
      descripcion: "",
    });
    setEditIdx(-1);
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showPermissionError();
      return;
    }

    if (!form.codigo || !form.nombre || !form.categoria) {
      alert("Código, nombre y categoría son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      let saved;
      if (form.id) {
        // EDITAR
        saved = await updatePastel(form); // ← importante: pasamos el objeto
        setList((prev) => prev.map((p, i) => (i === editIdx ? saved : p)));
      } else {
        // NUEVO
        saved = await createPastel(form);
        setList((prev) => [...prev, saved]);
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

    const producto = list[idx];
    if (!producto) return;

    if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    try {
      if (producto.id) {
        await deletePastel(producto.id);
      } else {
        console.warn(
          "Producto sin id, sólo se eliminará en el estado local."
        );
      }

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
    navigate(`/admin/productos/${encodeURIComponent(String(code))}`);
  };

  // ====================
  //  RENDER
  // ====================
  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Productos</h2>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Buscar por nombre, código o categoría…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleNewClick}>
            + Nuevo producto
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-muted">Cargando productos desde el servidor...</p>
      )}

      {showForm && (
        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>
              {editIdx === -1 ? "Nuevo producto" : "Editar producto"}
            </strong>
            <button
              className="btn btn-link text-decoration-none p-0"
              onClick={() => setShowForm(false)}
            >
              Cerrar
            </button>
          </div>

          <div className="card-body">
            <div className="row g-3">
              <input type="hidden" value={form.id || ""} readOnly />

              <div className="col-md-3">
                <label className="form-label">Código</label>
                <input
                  className="form-control"
                  value={form.codigo}
                  onChange={(e) =>
                    setForm({ ...form, codigo: e.target.value })
                  }
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  onFocus={loadCatsLS}
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Precio</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.precio}
                  onChange={(e) =>
                    setForm({ ...form, precio: Number(e.target.value) })
                  }
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">Imagen (URL)</label>
                <input
                  className="form-control"
                  value={form.imagen}
                  onChange={(e) =>
                    setForm({ ...form, imagen: e.target.value })
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
                    setForm({ ...form, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="col-12 d-flex gap-2 mt-3">
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  type="button"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th style={{ width: 210 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id ?? i}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{CLP(p.precio)}</td>
                <td>{p.stock}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-info me-1"
                    onClick={() => handleView(p)}
                  >
                    Detalle
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => handleEdit(i)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(i)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No hay productos que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
