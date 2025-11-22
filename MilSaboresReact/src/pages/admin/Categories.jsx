import { useEffect, useMemo, useState } from "react";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getPasteles,
} from "../../services/api";

export default function Categories() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [modo, setModo] = useState("crear"); // "crear" | "editar"
  const [valor, setValor] = useState("");
  const [catSeleccionada, setCatSeleccionada] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const normalizar = (v) => (v || "").trim();

  // Cargar categorías desde la API
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await getCategorias();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando categorías:", e);
        alert("No se pudieron cargar las categorías desde la API.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Cargar productos para conteo por categoría
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await getPasteles();
        const list = Array.isArray(data)
          ? data.map((p) => ({
              ...p,
              categoria:
                typeof p.categoria === "string"
                  ? p.categoria
                  : p.categoria?.nombre || "",
            }))
          : [];
        setProductos(list);
      } catch (e) {
        console.error("Error cargando productos para conteo:", e);
      }
    };
    cargarProductos();
  }, []);

  const categoriasOrdenadas = useMemo(
    () =>
      [...categorias].sort((a, b) =>
        normalizar(a.nombre).localeCompare(normalizar(b.nombre), "es")
      ),
    [categorias]
  );

  const conteo = useMemo(() => {
    const m = new Map();
    categoriasOrdenadas.forEach((c) => m.set(c.id, 0));
    productos.forEach((p) => {
      const nombreCat =
        typeof p.categoria === "string"
          ? p.categoria
          : p.categoria?.nombre || "";
      const cat = categoriasOrdenadas.find(
        (c) => normalizar(c.nombre) === normalizar(nombreCat)
      );
      if (cat) m.set(cat.id, (m.get(cat.id) || 0) + 1);
    });
    return m;
  }, [categoriasOrdenadas, productos]);

  const abrirCrear = () => {
    setModo("crear");
    setValor("");
    setCatSeleccionada(null);
    setError("");
    setPanelAbierto(true);
  };

  const abrirEditar = (cat) => {
    setModo("editar");
    setValor(cat.nombre || "");
    setCatSeleccionada(cat);
    setError("");
    setPanelAbierto(true);
  };

  const cerrarPanel = () => {
    setPanelAbierto(false);
    setValor("");
    setCatSeleccionada(null);
    setError("");
  };

  const validar = () => {
    const v = normalizar(valor);
    if (!v) {
      setError("La categoría no puede estar vacía.");
      return false;
    }
    const existe = categorias.some(
      (c) =>
        normalizar(c.nombre) === v &&
        (!catSeleccionada || c.id !== catSeleccionada.id)
    );
    if (existe) {
      setError("Ya existe una categoría con ese nombre.");
      return false;
    }
    setError("");
    return true;
  };

  const guardar = async () => {
    if (!validar()) return;

    setSaving(true);
    try {
      if (modo === "crear") {
        const nueva = await createCategoria({ nombre: normalizar(valor) });
        setCategorias((prev) => [...prev, nueva]);
      } else if (modo === "editar" && catSeleccionada) {
        const actualizada = await updateCategoria({
          ...catSeleccionada,
          nombre: normalizar(valor),
        });
        setCategorias((prev) =>
          prev.map((c) => (c.id === actualizada.id ? actualizada : c))
        );
      }
      cerrarPanel();
    } catch (e) {
      console.error("Error guardando categoría:", e);
      alert("No se pudo guardar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (cat) => {
    if (
      !window.confirm(
        `¿Eliminar la categoría "${cat.nombre}"?\nLos productos seguirán existiendo, pero podrían quedar sin categoría.`
      )
    )
      return;

    try {
      await deleteCategoria(cat.id);
      setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (e) {
      console.error("Error eliminando categoría:", e);
      alert("No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Categorías</h1>
        <button className="btn btn-primary" onClick={abrirCrear}>
          Nueva categoría
        </button>
      </div>

      <div className="admin-body">
        {loading && (
          <div className="alert alert-info">Cargando categorías desde la API...</div>
        )}

        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th className="text-end">Productos asociados</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasOrdenadas.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No hay categorías registradas.
                </td>
              </tr>
            )}
            {categoriasOrdenadas.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td className="text-end">{conteo.get(c.id) || 0}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => abrirEditar(c)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminar(c)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {panelAbierto && (
          <div className="admin-modal-backdrop">
            <div className="admin-modal">
              <h2>{modo === "crear" ? "Nueva categoría" : "Editar categoría"}</h2>
              <div className="mb-3">
                <label className="form-label">Nombre de la categoría</label>
                <input
                  className="form-control"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
                {error && <div className="text-danger mt-1">{error}</div>}
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={cerrarPanel} disabled={saving}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={guardar} disabled={saving}>
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
