import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import dataFallback from "../../data/tortas.json";

/* ===== Helpers de almacenamiento ===== */
const STORAGE_KEYS = ["PRODUCTS", "productos", "productosMilSabores"];

function readProducts() {
  for (const k of STORAGE_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return { key: k, items: arr };
      } catch {
        /* ignore */
      }
    }
  }
  return { key: STORAGE_KEYS[0], items: Array.isArray(dataFallback) ? dataFallback : [] };
}

function writeProducts(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

const formatNumber = (v) => (v === "" || v === null || v === undefined ? "" : String(v));

export default function ProductEdit() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [storageKey, setStorageKey] = useState(STORAGE_KEYS[0]);
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    stock: "",
    minStock: "",
    imagen: "",
    peso: "",
    unidad: "kg",
    activo: true,
    codigo: "",
    id: "",
    creadoEn: null,
    actualizadoEn: null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleted, setDeleted] = useState(false);

  /* Cargar producto */
  useEffect(() => {
    const { key, items } = readProducts();
    setStorageKey(key);

    const found =
      items.find((p) => String(p.codigo) === String(codigo)) ||
      items.find((p) => String(p.id) === String(codigo)) ||
      items.find((p) => String(p.slug) === String(codigo)) ||
      null;

    if (!found) {
      setInitial(null);
      return;
    }
    setInitial(found);

    setForm({
      nombre: found.nombre ?? "",
      descripcion: found.descripcion ?? "",
      categoria: found.categoria ?? "",
      precio: formatNumber(found.precio ?? ""),
      stock: formatNumber(found.stock ?? ""),
      minStock: formatNumber(
        typeof found.minStock === "number" ? found.minStock : found.minStock ?? ""
      ),
      imagen: found.imagen ?? "",
      peso: formatNumber(found.peso ?? ""),
      unidad: found.unidad ?? "kg",
      activo: found.activo !== false,
      codigo: found.codigo ?? found.id ?? "",
      id: found.id ?? "",
      creadoEn: found.creadoEn ?? null,
      actualizadoEn: found.actualizadoEn ?? null,
    });
  }, [codigo]);

  const notFound = useMemo(() => initial === null, [initial]);

  /* Handlers */
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.categoria?.trim()) e.categoria = "La categoría es obligatoria.";
    if (form.precio === "" || isNaN(Number(form.precio)) || Number(form.precio) < 0)
      e.precio = "Precio inválido.";
    if (form.stock === "" || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = "Stock inválido.";
    if (form.minStock !== "" && (isNaN(Number(form.minStock)) || Number(form.minStock) < 0))
      e.minStock = "Stock mínimo inválido.";
    if (form.peso !== "" && (isNaN(Number(form.peso)) || Number(form.peso) <= 0))
      e.peso = "Peso inválido.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const { items } = readProducts();
    const idx = items.findIndex(
      (p) =>
        String(p.codigo ?? p.id ?? "") === String(codigo) ||
        String(p.slug ?? "") === String(codigo)
    );
    if (idx === -1) {
      setSaving(false);
      alert("No se pudo encontrar el producto a actualizar.");
      return;
    }

    const nowIso = new Date().toISOString();

    const updated = {
      ...items[idx],
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      minStock: form.minStock === "" ? undefined : Number(form.minStock),
      imagen: form.imagen.trim(),
      peso: form.peso === "" ? undefined : Number(form.peso),
      unidad: form.unidad || "kg",
      activo: !!form.activo,
      actualizadoEn: nowIso,
      // conserva el creadoEn existente o crea uno si no hay
      creadoEn: items[idx].creadoEn ?? form.creadoEn ?? nowIso,
    };

    const newItems = [...items];
    newItems[idx] = updated;
    writeProducts(storageKey, newItems);

    setSaving(false);
    navigate(`/admin/products/${updated.codigo ?? updated.id}`, { replace: true });
  };

  const onDelete = () => {
    if (!window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    const { items } = readProducts();
    const newItems = items.filter(
      (p) =>
        !(
          String(p.codigo ?? p.id ?? "") === String(codigo) ||
          String(p.slug ?? "") === String(codigo)
        )
    );
    writeProducts(storageKey, newItems);
    setDeleted(true);
    navigate("/admin/products", { replace: true });
  };

  if (notFound) {
    return (
      <div className="admin-content">
        <div className="card">
          <div className="card-header">
            <strong>Producto no encontrado</strong>
            <div className="admin-actions">
              <button className="btn-admin" onClick={() => navigate(-1)}>Volver</button>
              <Link className="btn-admin btn-primary" to="/admin/products">Ir a Productos</Link>
            </div>
          </div>
          <div className="card-body">
            <p className="muted">No existe un producto con el identificador <code>{codigo}</code>.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!initial) return null;

  return (
    <div className="admin-content">
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div>
            <div className="section-title">Editar producto</div>
            <div className="muted">
              Código: <strong>{initial.codigo ?? initial.id}</strong>
              {initial.categoria ? <> • Categoría actual: <strong>{initial.categoria}</strong></> : null}
            </div>
          </div>
          <div className="admin-actions">
            <button className="btn-admin" onClick={() => navigate(-1)}>Cancelar</button>
            <Link className="btn-admin" to={`/admin/products/${initial.codigo ?? initial.id}`}>Ver detalle</Link>
            <button className="btn-admin btn-primary" onClick={onSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-grid">
              {/* Columna izquierda */}
              <div className="form-col-6">
                <label className="label" htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  name="nombre"
                  className="input"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Torta tres leches"
                />
                {errors.nombre && <div className="badge danger" style={{ marginTop: 6 }}>{errors.nombre}</div>}

                <div className="spacer" />
                <label className="label" htmlFor="categoria">Categoría *</label>
                <input
                  id="categoria"
                  name="categoria"
                  className="input"
                  value={form.categoria}
                  onChange={onChange}
                  placeholder="Tortas, Postres, etc."
                />
                {errors.categoria && <div className="badge danger" style={{ marginTop: 6 }}>{errors.categoria}</div>}

                <div className="spacer" />
                <label className="label" htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  className="textarea"
                  value={form.descripcion}
                  onChange={onChange}
                  placeholder="Descripción breve del producto"
                />
              </div>

              {/* Columna derecha */}
              <div className="form-col-6">
                <div className="form-grid">
                  <div className="form-col-6">
                    <label className="label" htmlFor="precio">Precio CLP *</label>
                    <input
                      id="precio"
                      name="precio"
                      className="input"
                      value={form.precio}
                      onChange={onChange}
                      inputMode="numeric"
                      placeholder="19990"
                    />
                    {errors.precio && <div className="badge danger" style={{ marginTop: 6 }}>{errors.precio}</div>}
                  </div>
                  <div className="form-col-6">
                    <label className="label" htmlFor="stock">Stock *</label>
                    <input
                      id="stock"
                      name="stock"
                      className="input"
                      value={form.stock}
                      onChange={onChange}
                      inputMode="numeric"
                      placeholder="25"
                    />
                    {errors.stock && <div className="badge danger" style={{ marginTop: 6 }}>{errors.stock}</div>}
                  </div>

                  <div className="form-col-6">
                    <label className="label" htmlFor="minStock">Stock mínimo</label>
                    <input
                      id="minStock"
                      name="minStock"
                      className="input"
                      value={form.minStock}
                      onChange={onChange}
                      inputMode="numeric"
                      placeholder="5"
                    />
                    {errors.minStock && <div className="badge danger" style={{ marginTop: 6 }}>{errors.minStock}</div>}
                  </div>

                  <div className="form-col-6">
                    <label className="label" htmlFor="peso">Peso</label>
                    <input
                      id="peso"
                      name="peso"
                      className="input"
                      value={form.peso}
                      onChange={onChange}
                      inputMode="numeric"
                      placeholder="1.5"
                    />
                  </div>

                  <div className="form-col-6">
                    <label className="label" htmlFor="unidad">Unidad</label>
                    <input
                      id="unidad"
                      name="unidad"
                      className="input"
                      value={form.unidad}
                      onChange={onChange}
                      placeholder="kg / g / porciones"
                    />
                  </div>

                  <div className="form-col-12">
                    <label className="label" htmlFor="imagen">URL de imagen</label>
                    <input
                      id="imagen"
                      name="imagen"
                      className="input"
                      value={form.imagen}
                      onChange={onChange}
                      placeholder="/img/torta-chocolate.jpg"
                    />
                    <div className="spacer" />
                    <div className="card" style={{ overflow: "hidden" }}>
                      <div className="card-body" style={{ display: "grid", placeItems: "center" }}>
                        <img
                          src={form.imagen || "/img/placeholder-cake.png"}
                          alt="preview"
                          style={{ maxWidth: "100%", borderRadius: 12, objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.src = "/img/placeholder-cake.png";
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-col-12">
                    <label className="label" htmlFor="activo">Estado</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        id="activo"
                        name="activo"
                        type="checkbox"
                        checked={!!form.activo}
                        onChange={onChange}
                      />
                      {form.activo ? (
                        <span className="badge success">Activo</span>
                      ) : (
                        <span className="badge warn">Inactivo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botonera inferior */}
            <div className="hr" />
            <div className="admin-actions" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn-admin" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button type="button" className="btn-admin" onClick={onDelete}>
                Eliminar
              </button>
              <button type="submit" className="btn-admin btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="quick-tiles">
        <Link className="tile" to={`/admin/products/${initial.codigo ?? initial.id}`}>Ver detalle</Link>
        <Link className="tile" to="/admin/products">Volver al listado</Link>
        <Link className="tile" to="/admin/products/critical">Ver productos críticos</Link>
      </div>
    </div>
  );
}
