import React, { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductForm from "../../components/admin/ProductForm";


export default function ProductNew() {
  const navigate = useNavigate();

  const handleSubmit = useCallback((producto) => {
    const key = "productos_nuevos";
    const actuales = JSON.parse(localStorage.getItem(key) || "[]");
    const existe = actuales.some(p => p.codigo === producto.codigo);

    if (existe) {
      alert("Ya existe un borrador con ese código.");
      return;
    }

    const nuevos = [{ ...producto, creadoEn: new Date().toISOString() }, ...actuales];
    localStorage.setItem(key, JSON.stringify(nuevos));
    alert("Producto guardado como borrador (localStorage).");
    navigate("/admin/productos");
  }, [navigate]);

  const header = useMemo(() => (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="m-0">Nuevo Producto</h2>
      <div className="d-flex gap-2">
        <Link to="/admin/productos" className="btn btn-secondary">Volver</Link>
        <Link to="/admin/criticos" className="btn btn-outline-secondary">Críticos</Link>
      </div>
    </div>
  ), []);

  return (
    <div className="p-3">
      {header}
      <div className="alert alert-info">
        Este formulario <strong>no altera</strong> tus datos actuales. Guarda en <code>localStorage</code> como
        <code> "productos_nuevos"</code> para que luego los integres a tu flujo oficial cuando tú quieras.
      </div>

      <ProductForm onSubmit={handleSubmit} submitText="Guardar borrador" />

      <div className="mt-3 small text-muted">
        Tip: puedes inspeccionar en el navegador <code>Application &gt; Local Storage</code> y ver <code>productos_nuevos</code>.
      </div>
    </div>
  );
}
