import { useEffect, useMemo, useState } from "react";
import seed from "../../data/tortas.json";

const LS_TORTAS = "tortas_v1";
const LS_CATS   = "categorias_v1";

export default function Categories() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // UI panel
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [modo, setModo] = useState("crear"); // crear | editar
  const [valor, setValor] = useState("");
  const [catOriginal, setCatOriginal] = useState("");
  const [error, setError] = useState("");

  // ===== carga inicial =====
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LS_TORTAS) || "null") || seed;
    setProductos(data);

    const catsLS = JSON.parse(localStorage.getItem(LS_CATS) || "null");
    if (Array.isArray(catsLS) && catsLS.length) {
      setCategorias(normalizarLista(catsLS));
    } else {
      const deducidas = Array.from(new Set(data.map(p => (p.categoria || "Sin categoría").trim())))
        .sort((a,b) => a.localeCompare(b));
      setCategorias(deducidas);
      try { localStorage.setItem(LS_CATS, JSON.stringify(deducidas)); } catch {}
    }
  }, []);

  // ===== helpers =====
  const normalizar = (s) => (s || "").trim();
  const normalizarLista = (arr) =>
    arr
      .map(normalizar)
      .filter(Boolean)
      .filter((v,i,a) => a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i)
      .sort((a,b) => a.localeCompare(b));

  const persistCategorias = (next) => {
    setCategorias(next);
    try { localStorage.setItem(LS_CATS, JSON.stringify(next)); } catch {}
  };
  const persistProductos = (next) => {
    setProductos(next);
    try { localStorage.setItem(LS_TORTAS, JSON.stringify(next)); } catch {}
  };

  // Conteo por categoría
  const conteo = useMemo(() => {
    const m = new Map();
    categorias.forEach(c => m.set(c, 0));
    productos.forEach(p => {
      const c = normalizar(p.categoria || "Sin categoría");
      m.set(c, (m.get(c) || 0) + 1);
    });
    return m;
  }, [productos, categorias]);

  // Validaciones
  const existeCat = (name) =>
    categorias.some(c => c.toLowerCase() === name.toLowerCase());

  const validar = (name, esEdicion=false, original="") => {
    const n = normalizar(name);
    if (!n) return "La categoría no puede estar vacía.";
    if (n.length > 40) return "Máximo 40 caracteres.";
    if (esEdicion && n.toLowerCase() === original.toLowerCase()) return "";
    if (existeCat(n)) return "Ya existe una categoría con ese nombre.";
    return "";
  };

  // Acciones
  const abrirCrear = () => {
    setModo("crear"); setValor(""); setCatOriginal(""); setError(""); setPanelAbierto(true);
  };
  const abrirEditar = (cat) => {
    setModo("editar"); setValor(cat); setCatOriginal(cat); setError(""); setPanelAbierto(true);
  };
  const cerrarPanel = () => {
    setPanelAbierto(false); setError(""); setValor(""); setCatOriginal("");
  };
  const resetForm = () => { setValor(""); setError(""); };

  const onSubmit = (e) => {
    e.preventDefault();

    if (modo === "crear") {
      const msg = validar(valor);
      if (msg) return setError(msg);
      const next = normalizarLista([...categorias, valor]);
      persistCategorias(next);
      cerrarPanel();
      return;
    }

    // editar
    const msg = validar(valor, true, catOriginal);
    if (msg) return setError(msg);

    const nuevo = normalizar(valor);

    // 1) renombrar en lista de categorías
    const nextCats = normalizarLista(categorias.map(c => (c === catOriginal ? nuevo : c)));
    persistCategorias(nextCats);

    // 2) actualizar productos que tenían la categoría original
    const nextProds = productos.map(p => {
      const cat = normalizar(p.categoria || "Sin categoría");
      return (cat === catOriginal) ? { ...p, categoria: nuevo } : p;
    });
    persistProductos(nextProds);

    cerrarPanel();
  };

  return (
    <div className="container-fluid">
      {/* header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Categorías</h2>
        <button className="btn btn-primary" onClick={panelAbierto ? cerrarPanel : abrirCrear}>
          {panelAbierto ? "Cerrar" : "Nuevo +"}
        </button>
      </div>

      {/* panel al estilo ProductForm.jsx */}
      {panelAbierto && (
        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>{modo === "crear" ? "Nueva categoría" : "Editar categoría"}</strong>
            <button className="btn btn-link text-decoration-none p-0" onClick={cerrarPanel}>
              Cerrar
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                {/* SOLO nombre, para que sea simple y consistente */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Pastelería Tradicional"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>

                {/* espacio para mantener el look de dos columnas */}
                <div className="col-12 col-md-6 d-flex align-items-end">
                  {error ? (
                    <div className="text-danger small">{error}</div>
                  ) : (
                    <div className="text-muted small">
                      Usa un nombre único (máx. 40 caracteres).
                    </div>
                  )}
                </div>

                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {modo === "crear" ? "Crear categoría" : "Actualizar"}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                    Reestablecer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* tabla de categorías */}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th style={{width: 56}}>#</th>
              <th>Categoría</th>
              <th style={{width: 140}}>Productos</th>
              <th style={{width: 140}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c, i) => (
              <tr key={c}>
                <td>{i + 1}</td>
                <td>{c}</td>
                <td>{conteo.get(c) || 0}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => abrirEditar(c)}>
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">No hay categorías aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

