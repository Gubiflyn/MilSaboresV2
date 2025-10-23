import { useEffect, useMemo, useState } from "react";
import seed from "../../data/tortas.json";

const LS_TORTAS = "tortas_v1";
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

  // Carga inicial: si LS está vacío/ inválido, cae a seed
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

  // Persistencia: evita guardar [] en el primer render
  useEffect(() => {
    try {
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem(LS_TORTAS, JSON.stringify(list));
      }
    } catch {}
  }, [list]);

  const categorias = useMemo(
    () => Array.from(new Set(list.map((p) => p.categoria))).filter(Boolean).sort(),
    [list]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (p) =>
        p.nombre.toLowerCase().includes(s) ||
        p.codigo.toLowerCase().includes(s) ||
        (p.categoria || "").toLowerCase().includes(s)
    );
  }, [q, list]);

  /** Helpers de formulario */
  const resetForm = () => {
    setForm({
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

  const openNew = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (idx) => {
    setEditIdx(idx);
    setForm(list[idx]);
    setShowForm(true);
  };

  const onDelete = (idx) => {
    if (!confirm("¿Eliminar el producto?")) return;
    setList((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const f = {
      ...form,
      codigo: String(form.codigo || "").trim(),
      nombre: String(form.nombre || "").trim(),
      categoria: String(form.categoria || "").trim(),
      precio: parseInt(form.precio, 10) || 0,
      stock: Math.max(0, parseInt(form.stock, 10) || 0),
      imagen: String(form.imagen || "").trim(),
      descripcion: String(form.descripcion || "").trim(),
    };

    if (!f.codigo || !f.nombre) {
      alert("Código y Nombre son obligatorios.");
      return;
    }
    if (f.precio < 0) {
      alert("El precio no puede ser negativo.");
      return;
    }
    // Código único
    const dup = list.findIndex((p, i) => p.codigo === f.codigo && i !== editIdx);
    if (dup >= 0) {
      alert("Ya existe un producto con ese código.");
      return;
    }

    setList((prev) => {
      const next = [...prev];
      if (editIdx >= 0) next[editIdx] = f;
      else next.push(f);
      return next;
    });
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between">
        <h3 className="mb-0">Productos</h3>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Buscar por nombre, código o categoría…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openNew}>
            + Nuevo producto
          </button>
        </div>
      </div>

      {/* Formulario (Crear/Editar) */}
      {showForm && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>{editIdx >= 0 ? "Editar producto" : "Nuevo producto"}</span>
            <button className="btn btn-sm btn-light" onClick={() => setShowForm(false)}>
              Cerrar
            </button>
          </div>
          <form className="card-body" onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Código</label>
                <input
                  className="form-control"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-8">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                >
                  {categorias.length === 0 && <option value="">Sin categoría</option>}
                  {categorias.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Precio (CLP)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Imagen (ruta pública)</label>
                <input
                  className="form-control"
                  placeholder="/img/archivo.jpg"
                  value={form.imagen}
                  onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editIdx >= 0 ? "Guardar cambios" : "Crear producto"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (editIdx >= 0) setForm(list[editIdx]);
                  else resetForm();
                }}
              >
                Reestablecer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="card">
        <div className="card-header">
          Catálogo ({filtered.length}/{list.length})
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ minWidth: 110 }}>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th style={{ minWidth: 120 }}>Precio</th>
                <th style={{ minWidth: 90 }}>Stock</th>
                <th>Imagen</th>
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Sin resultados.
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const realIdx = list.findIndex((x) => x.codigo === p.codigo);
                const s = p.stock ?? 0;
                return (
                  <tr key={p.codigo}>
                    <td><code>{p.codigo}</code></td>
                    <td className="fw-semibold">{p.nombre}</td>
                    <td>
                      <span className="badge text-bg-light">{p.categoria || "—"}</span>
                    </td>
                    <td>{CLP(p.precio)}</td>
                    <td>
                      <span className={s <= 5 ? "badge text-bg-danger" : "badge text-bg-secondary"}>
                        {s}
                      </span>
                    </td>
                    <td>
                      {p.imagen ? (
                        <code style={{ fontSize: 12 }}>{p.imagen}</code>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => openEdit(realIdx)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onDelete(realIdx)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            const csv = toCSV(list);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "productos.csv"; a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Exportar CSV
        </button>
        {/* Botón "Restaurar desde semilla" eliminado */}
      </div>
    </div>
  );
}

/** Utilidad simple para exportar CSV */
function toCSV(rows) {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replaceAll(`"`, `""`)}"`;
  const lines = [headers.map(esc).join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => esc(r[h])).join(",")));
  return lines.join("\n");
}
