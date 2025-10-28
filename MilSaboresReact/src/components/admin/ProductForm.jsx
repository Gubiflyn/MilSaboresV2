import React, { useState, useEffect } from "react"; 

const initial = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoria: "",
  imagenUrl: ""
};

export default function ProductForm({ initialValues = initial, onSubmit, submitText = "Guardar" }) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

  
  const [catOptions, setCatOptions] = useState([]);            
  const LS_CATS = "categorias_v1";                            
  const loadCats = () => {                                     
    try {
      const raw = localStorage.getItem(LS_CATS);
      const arr = raw ? JSON.parse(raw) : [];
      const clean = Array.from(new Set((arr || []).map(s => (s || "").trim()).filter(Boolean)))
        .sort((a,b) => a.localeCompare(b, "es"));
      setCatOptions(clean);
    } catch {
      setCatOptions([]);
    }
  };
  useEffect(() => {                                          
    loadCats(); 
    const handler = () => loadCats();
    window.addEventListener("categorias:updated", handler);
    return () => window.removeEventListener("categorias:updated", handler);
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.codigo?.trim()) e.codigo = "Código es requerido";
    if (!form.nombre?.trim()) e.nombre = "Nombre es requerido";
    if (!form.precio || isNaN(Number(form.precio))) e.precio = "Precio numérico";
    if (!form.stock || isNaN(Number(form.stock))) e.stock = "Stock numérico";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length === 0) {
      onSubmit?.({
        ...form,
        precio: Number(form.precio),
        stock: Number(form.stock)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded">
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Código</label>
          <input name="codigo" className={`form-control ${errors.codigo ? "is-invalid" : ""}`}
                 value={form.codigo} onChange={handleChange} />
          {errors.codigo && <div className="invalid-feedback">{errors.codigo}</div>}
        </div>

        <div className="col-md-5">
          <label className="form-label">Nombre</label>
          <input name="nombre" className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                 value={form.nombre} onChange={handleChange} />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        </div>

        <div className="col-md-2">
          <label className="form-label">Precio</label>
          <input name="precio" type="number" className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                 value={form.precio} onChange={handleChange} />
          {errors.precio && <div className="invalid-feedback">{errors.precio}</div>}
        </div>

        <div className="col-md-2">
          <label className="form-label">Stock</label>
          <input name="stock" type="number" className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                 value={form.stock} onChange={handleChange} />
          {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Categoría</label>
          <input
            name="categoria"
            className="form-control"
            value={form.categoria}
            onChange={handleChange}
            list="cat-options"      
            onFocus={loadCats}      
          />
          <datalist id="cat-options">  
            {catOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="col-md-6">
          <label className="form-label">Imagen (URL)</label>
          <input name="imagenUrl" className="form-control"
                 value={form.imagenUrl} onChange={handleChange} />
        </div>

        <div className="col-12">
          <label className="form-label">Descripción</label>
          <textarea name="descripcion" className="form-control" rows={3}
                    value={form.descripcion} onChange={handleChange} />
        </div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button type="submit" className="btn btn-primary">{submitText}</button>
        <button type="reset" className="btn btn-outline-secondary" onClick={() => setForm(initialValues)}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
