import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { carrito } = useCart(); // ⬅ usamos carrito directamente
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const cantidadTotal = carrito.reduce((sum, t) => sum + (t.cantidad || 1), 0);

  const handleLogout = () => {
    logout();
    navigate("/"); // vuelve al home después de cerrar sesión
  };

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg header__nav py-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link className="navbar-brand header__brand" to="/">
            <img
              src="/img/icono.png"
              alt="Mil Sabores"
              className="header__icon me-2"
              style={{ height: "32px" }}
            />
            <span className="header__title">Mil Sabores</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav header__menu align-items-lg-center">
              <li className="nav-item"><Link className="nav-link header__menu-link" to="/">Inicio</Link></li>
              <li className="nav-item"><Link className="nav-link header__menu-link" to="/productos">Productos</Link></li>
              <li className="nav-item"><a className="nav-link header__menu-link" href="/#nosotros">Nosotros</a></li>
              <li className="nav-item"><Link className="nav-link header__menu-link" to="/blogs">Blogs</Link></li>
              <li className="nav-item"><Link className="nav-link header__menu-link" to="/contacto">Contacto</Link></li>

              {/* Enlace Admin SOLO si es admin */}
              {isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link header__menu-link text-warning fw-semibold" to="/admin">
                    Admin
                  </Link>
                </li>
              )}

              {/* Auth */}
              {!isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link header__menu-link" to="/login">Iniciar sesión</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link header__menu-link" to="/register">Registrarse</Link>
                  </li>
                </>
              ) : (
                <li className="nav-item dropdown">
                  <button
                    className="btn nav-link dropdown-toggle header__menu-link"
                    id="userMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Hola, {user?.nombre || "Usuario"}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                    <li><span className="dropdown-item-text small text-muted">{user?.email}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </li>
              )}
            </ul>

            {/* Carrito */}
            <button
              onClick={() => navigate("/carrito")}
              className="btn position-relative ms-4 header__cart-icon"
              aria-label="Carrito de compras"
            >
              <i className="fas fa-shopping-cart fa-lg"></i>
              {cantidadTotal > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.7rem" }}
                >
                  {cantidadTotal}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
