export default function Admin() {
  return (
    <div className="container py-5">
      <h2 className="mb-3">Panel de Administración</h2>
      <p className="text-muted">Solo usuarios con rol <strong>admin</strong> pueden ver esta página.</p>
      {/* Aquí irán Productos, Pedidos, Perfiles, etc. */}
    </div>
  );
}
