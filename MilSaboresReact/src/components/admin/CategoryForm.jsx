import { useEffect, useState } from "react";

export default function CategoryForm({ initialData, onCancel, onSubmit }) {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });

  useEffect(() => {
    if (initialData) setForm({ nombre: initialData.nombre, descripcion: initialData.descripcion ?? "" });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSubmit({ ...initialData, ...form });
  };

  return (
    <div className="admin-top-form">
      <form onSubmit={handleSubmit} className="admin-form-grid">
        <div>
          <label>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Tortas" />
        </div>
        <div>
          <label>Descripción</label>
          <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="(opcional)" />
        </div>
        <div className="admin-form-actions">
          <button type="submit">{initialData ? "Guardar cambios" : "Crear categoría"}</button>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
