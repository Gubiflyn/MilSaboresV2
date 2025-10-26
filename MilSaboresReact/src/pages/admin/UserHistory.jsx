import { Link, useParams } from "react-router-dom";

export default function UserHistory() {
  const { id } = useParams();

  // ejemplo: podrías cargar un historial real si lo guardas
  const history = JSON.parse(localStorage.getItem("usuarios_historial") || "[]")
    .filter((h) => encodeURIComponent(h.email) === id)
    .reverse();

  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Historial del usuario</h5>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
          ← Volver
        </Link>
      </div>

      <div className="card-body">
        {history.length > 0 ? (
          <ul className="list-group list-group-flush">
            {history.map((h, i) => (
              <li
                key={i}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-semibold">{h.accion}</div>
                  <small className="text-muted">Por: {h.admin}</small>
                </div>
                <small className="text-muted">{h.fecha}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">
            No hay registros en el historial de este usuario.
          </p>
        )}
      </div>
    </div>
  );
}
