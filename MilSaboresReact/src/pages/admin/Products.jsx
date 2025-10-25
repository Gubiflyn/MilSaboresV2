import { useEffect, useMemo, useState } from "react";
import seed from "../../data/tortas.json";

const LS_TORTAS = "tortas_v1";
const LS_CATS = "categorias_v1"; // ➕ NUEVO
const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function Products() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    precio: 0,
    stock: 0,
    imagen: "",
    descripcion: "",
  });

  const [catsLS, setCatsLS] = useState([]); // ➕ NUEVO

  // Carga inicial de productos
  useEffect(() => {
    let data = null;
    try {
      const raw = localStorage.getItem(LS_TORTAS);
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }
    if (!Array.isArray(data) || data.length === 0) {
      data = seed;
    }
    setList(data.map((p) => ({ ...p, stock: p?.stock ?? 0 })));
  }, []);

  // Persistencia de productos
  useEffect(() => {
    try {
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(LS_TORTAS, JSON.stringify(list));
      }
    } catch {}
  }, [list]);

  // ➕ NUEVO: cargar categorías desde localStorage
  const loadCatsLS = () => {
    try {
      const raw = localStorage.getItem(LS_CATS);
      const arr = raw ? JSON.parse(raw) : [];
      const clean = Array.from(
        new Set((arr || []).map((s) => (s || "").trim()).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, "es"));
      setCatsLS(clean);
    } catch {
      setCatsLS([]);
    }
  };

  useEffect(() => {
    loadCatsLS(); // al montar
  }, []);

  useEffect(() => {
    if (showForm) loadCatsLS(); // recarga al abrir el form
  }, [showForm]);

  useEffect(() => {
    // escuchar aviso desde Categories.jsx
    const h = () => loadCatsLS();
    window.addEventListener("categorias:updated", h); // ➕ NUEVO
    return () => window.removeEventListener("categorias:updated", h);
  }, []);

  // Búsqueda
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return list;
    return list.filter((p) =>
      [p.codigo, p.nombre, p.categoria].some((v) =>
        String(v ?? "").toLowerCase().includes(term)
      )
    );
  }, [q, list]);

  // Categorías deducidas desde los productos existentes
  const categoriasDerivadas = useMemo(
    () =>
      Array.from(new Set(list.map((p) => p.categoria)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es")),
    [list]
  );

  // ➕ NUEVO: unión de categorías persistidas + deducidas
  const categorias = useMemo(() => {
    const set = new Set(
      [...(catsLS || []), ...(categoriasDerivadas || [])].filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [catsLS, categoriasDerivadas]);

  const resetForm = () => {
    setForm({
      codigo: "",
      nombre: "",
      categoria: categorias[0] || "", // ➕ NUEVO
      precio: 0,
      stock: 0,
      imagen: "",
      descripcion: "",
    });
    setEditIdx(-1);
  };

  const handleSave = () => {
    if (editIdx === -1) {
      setList((prev) => [...prev, form]);
    } else {
      setList((prev) =>
        prev.map((p, i) => (i === editIdx ? { ...form } : p))
      );
    }
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (idx) => {
    setForm(list[idx]);
    setEditIdx(idx);
    setShowForm(true);
  };

  const handleDelete = (idx) => {
    if (window.confirm("¿Eliminar producto?")) {
      setList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="container-fluid">
      {/* header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Productos</h2>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Buscar por nombre, código o categoría…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      {/* formulario */}
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
                {/* recarga categorías al enfocar */}
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
                >
                  Guardar
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={resetForm}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* tabla de productos */}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th style={{ width: 140 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{CLP(p.precio)}</td>
                <td>{p.stock}</td>
                <td>
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
            {filtered.length === 0 && (
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
