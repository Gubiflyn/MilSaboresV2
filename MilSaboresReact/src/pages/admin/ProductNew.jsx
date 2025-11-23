import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPastel, getCategorias } from "../../services/api";

const CLP = (n) => "$ " + (parseInt(n, 10) || 0).toLocaleString("es-CL");

export default function ProductNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    precio: 0,
    stock: 0,
    imagen: "",
    descripcion: "",
  });

  // ===============================
  // Cargar categorías desde backend
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (e) {
        console.error("Error cargando categorías", e);
        alert("No se pudieron cargar las categorías.");
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "precio" || name === "stock" ? Number(value || 0) : value,
    }));
  };

  // ===============================
  // Guardar pastel
  // ===============================
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.codigo || !form.nombre || !form.categoria) {
      alert("Código, nombre y categoría son obligatorios.");
      return;
    }

    // Buscar categoría seleccionada
    const categoriaObj = categorias.find(
      (c) => c.nombre.toLowerCase() === form.categoria.toLowerCase()
    );

    if (!categoriaObj) {
      alert("La categoría seleccionada no existe.");
      return;
    }

    // 🔹 NO mandamos id (Spring genera el ID nuevo)
    const payload = {
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
      await createPastel(payload);
      alert("Producto creado correctamente.");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Nuevo producto</h1>
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

              {/* Categoría desde SELECT */}
              <div className="col-md-4">
                <label className="form-label">Categoría</label>
                <select
                  name="categoria"
                  className="form-control"
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
                  Precio ({CLP(form.precio)})
                </label>
                <input
                  type="number"
                  name="precio"
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

              <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                <Link className="btn btn-secondary" to="/admin/products">
                  Cancelar
                </Link>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Creando..." : "Crear producto"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
