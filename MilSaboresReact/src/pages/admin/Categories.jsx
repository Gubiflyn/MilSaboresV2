import { useEffect, useMemo, useState } from "react";
import seed from "../../data/tortas.json";

const LS_TORTAS = "tortas_v1";

export default function Categories() {
  const [productos, setProductos] = useState([]);
  const [nueva, setNueva] = useState("");

  // Carga inicial: semilla o localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LS_TORTAS) || "null") || seed;
    setProductos(data);
  }, []);

  // Persistencia
  const persist = (next) => {
    setProductos(next);
    try { localStorage.setItem(LS_TORTAS, JSON.stringify(next)); } catch {}
  };

  // Listado de categorías con conteo
  const categorias = useMemo(() => {
    const counts = new Map();
    productos.forEach((p) => {
      const cat = (p.categoria || "Sin categoría").trim();
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [productos]);

  const existeCategoria = (name) =>
    categorias.some((c) => c.nombre.toLowerCase() === name.toLowerCase());

  // Crear
  const agregar = () => {
    const v = (nueva || "").trim();
    if (!v) return;
    if (existeCategoria(v)) return alert("La categoría ya existe.");
    // Creamos la categoría “vacía” agregando un placeholder opcional (no obligatorio).
    // En vez de crear placeholder, basta con permitir asignar productos a esa etiqueta.
    alert(`Categoría "${v}" creada. Ahora puedes mover productos a esta categoría desde Productos.`);
    setNueva("");
  };

  // Renombrar (con opción de fusionar)
  const renombrar = (oldName) => {
    const nuevo = prompt('Nuevo nombre para la categoría:', oldName);
    if (!nuevo || nuevo.trim() === oldName) return;
    const target = nuevo.trim();

    if (existeCategoria(target)) {
      // Fusionar categorías
      if (!confirm(`La categoría "${target}" ya existe. ¿Fusionar "${oldName}" → "${target}"?`)) return;
      const next = productos.map((p) =>
        (p.categoria || "Sin categoría") === oldName ? { ...p, categoria: target } : p
      );
      persist(next);
      return;
    }

    const next = productos.map((p) =>
      (p.categoria || "Sin categoría") === oldName ? { ...p, categoria: target } : p
    );
    persist(next);
  };

  // Eliminar (reubica productos a "Sin categoría" o a otra elegida)
  const eliminar = (cat) => {
    if (!confirm(`¿Eliminar la categoría "${cat}"? Sus productos se moverán a "Sin categoría".`)) return;
    const next = productos.map((p) =>
      (p.categoria || "Sin categoría") === cat ? { ...p, categoria: "Sin categoría" } : p
    );
    persist(next);
  };

  // Mover todos los productos de una categoría a otra
  const moverA = (from) => {
    const opciones = categorias.map((c) => c.nombre).filter((n) => n !== from);
    const dest = prompt(
      `Mover todos los productos de "${from}" a...\n\nOpciones: ${opciones.join(", ")}\n\n(Deja vacío para cancelar)`
    );
    if (!dest) return;
    if (!existeCategoria(dest)) return alert(`La categoría destino "${dest}" no existe.`);
    const next = productos.map((p) =>
      (p.categoria || "Sin categoría") === from ? { ...p, categoria: dest } : p
    );
    persist(next);
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Categorías</span>
        <div className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="Nueva categoría…"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
          />
          <button className="btn btn-primary" onClick={agregar}>Agregar</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th style={{ width: 140 }}>Productos</th>
              <th style={{ width: 280 }}></th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted py-4">Sin categorías.</td>
              </tr>
            )}
            {categorias.map((c) => (
              <tr key={c.nombre}>
                <td>
                  <span className="badge text-bg-light">{c.nombre}</span>
                </td>
                <td>{c.count}</td>
                <td className="text-end d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => renombrar(c.nombre)}
                  >
                    Renombrar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => moverA(c.nombre)}
                    disabled={categorias.length <= 1 || c.count === 0}
                    title={categorias.length <= 1 ? "No hay otra categoría" : (c.count === 0 ? "No hay productos para mover" : "")}
                  >
                    Mover a…
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminar(c.nombre)}
                    disabled={c.nombre === "Sin categoría"}
                    title={c.nombre === "Sin categoría" ? "No se puede eliminar" : ""}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
