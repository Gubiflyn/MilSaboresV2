import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getPastelByCodigo,
  getPasteles,
  updatePastel,
  deletePastel,
  getCategorias,
} from "../../services/api";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function ProductEdit() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
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
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "precio" || name === "stock") {
      if (value === "") {
        setForm((f) => ({ ...f, [name]: "" }));
        return;
      }

      let num = Number(value);
      if (Number.isNaN(num) || num < 0) {
        num = 0;
      }

      setForm((f) => ({
        ...f,
        [name]: num,
      }));
      return;
    }

    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  // Cargar producto
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let p = null;

        // 1) Intentar por código
        if (code) {
          try {
            p = await getPastelByCodigo(code);
          } catch {
            p = null;
          }
        }

        // 2) Si no se encuentra, buscar en la lista
        if (!p) {
          const lista = await getPasteles();
          if (Array.isArray(lista)) {
            p =
              lista.find(
                (x) =>
                  String(x.codigo ?? "").toLowerCase() ===
                    String(code).toLowerCase() ||
                  String(x.id ?? "").toLowerCase() ===
                    String(code).toLowerCase()
              ) || null;
          }
        }

        if (!p) {
          setError("Producto no encontrado.");
        } else {
          const normalizado = {
            ...p,
            categoria:
              typeof p.categoria === "string"
                ? p.categoria
                : p.categoria?.nombre || "",
            stock: p.stock ?? 0,
          };
          setInitial(normalizado);
          setForm({
            id: normalizado.id ?? null,
            codigo: normalizado.codigo ?? "",
            nombre: normalizado.nombre ?? "",
            categoria: normalizado.categoria ?? "",
            precio: normalizado.precio ?? 0,
            stock: normalizado.stock ?? 0,
            imagen: normalizado.imagen ?? "",
            descripcion: normalizado.descripcion ?? "",
          });
        }
      } catch (e) {
        console.error(e);
        setError("Error cargando producto desde la API.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [code]);

  // Cargar categorías
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategorias();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando categorías:", e);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.codigo) {
      alert("Código y nombre son obligatorios.");
      return;
    }

    const precioNum = Number(form.precio || 0);
    const stockNum = Number(form.stock || 0);

    if (precioNum < 0 || stockNum < 0) {
      alert("El precio y el stock no pueden ser negativos.");
      return;
    }

    const categoriaObj = categorias.find(
      (c) =>
        (c.nombre || "").toLowerCase() === form.categoria.toLowerCase().trim()
    );

    if (!categoriaObj) {
      alert(
        "La categoría seleccionada no existe. Asegúrate de elegir una categoría válida."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...initial,
        ...form,
        precio: precioNum,
        stock: stockNum,
        categoria: {
          id: categoriaObj.id,
          nombre: categoriaObj.nombre,
          descripcion: categoriaObj.descripcion || "",
        },
      };
      await updatePastel(payload);
      alert("Producto actualizado correctamente.");
      navigate(`/admin/productos/${form.codigo || form.id}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!initial?.id) {
      alert("No se puede eliminar: falta el ID del producto.");
      return;
    }
    if (
      !window.confirm(
        `¿Eliminar el producto "${initial.nombre}"? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      await deletePastel(initial.id);
      alert("Producto eliminado.");
      navigate("/admin/productos");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el producto.");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Editar producto</h1>
        </div>
        <p className="text-muted">Cargando datos...</p>
      </div>
    );
  }

  if (error || !initial) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Editar producto</h1>
        </div>
        <div className="alert alert-danger">{error || "Sin datos"}</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/productos")}
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Editar producto</h1>
      </div>

      <div className="admin-body">
        <div className="card">
          <div className="card-body">
            <form onSubmit={onSubmit} className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Código</label>
                <input
                  name="codigo"
                  className="form-control"
                  value={form.codigo}
                  onChange={onChange}
                />
              </div>
              <div className="col-md-9">
                <label className="form-label">Nombre</label>
                <input
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Categoría</label>
                <select
                  name="categoria"
                  className="form-select"
                  value={form.categoria}
                  onChange={onChange}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Precio ({CLP(form.precio || 0)})
                </label>
                <input
                  type="number"
                  name="precio"
                  min="0"
                  className="form-control"
                  value={form.precio}
                  onChange={onChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  className="form-control"
                  value={form.stock}
                  onChange={onChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">URL Imagen</label>
                <input
                  name="imagen"
                  className="form-control"
                  value={form.imagen}
                  onChange={onChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  name="descripcion"
                  className="form-control"
                  rows={3}
                  value={form.descripcion}
                  onChange={onChange}
                />
              </div>

              <div className="col-12 d-flex justify-content-between mt-3">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={onDelete}
                  >
                    Eliminar
                  </button>
                </div>
                <div className="d-flex gap-2">
                  <Link className="btn btn-secondary" to="/admin/productos">
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <Link
            className="btn btn-outline-secondary"
            to={`/admin/productos/${initial.codigo ?? initial.id}`}
          >
            Ver detalle
          </Link>
          <Link className="btn btn-outline-secondary" to="/admin/productos">
            Volver al listado
          </Link>
        </div>
      </div>
    </div>
  );
}
