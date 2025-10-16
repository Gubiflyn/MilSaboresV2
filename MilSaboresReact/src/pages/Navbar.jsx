import { Link, useNavigate } from "react-router-dom";

function Navbar({ carrito }) {
  const navigate = useNavigate();
  const cantidadTotal = carrito.reduce((sum, t) => sum + (t.cantidad || 1), 0);

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg header__nav py-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link className="navbar-brand headerbrand" to="/">
            <img
              src="/img/icono.png"
              alt="Mil Sabores"
              className="headericon me-2"
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
            <ul className="navbar-nav header__menu">
              <li className="nav-item" style={{ display: "none" }} id="perfilMenuItem">
                <Link className="nav-link header__menu-link d-flex align-items-center" to="/configuracion">
                  <i className="fas fa-user-circle me-1"></i> Mi Perfil
                </Link>
              </li>
              <li className="nav-item"><Link className="nav-link header__menu-link" to="/">Inicio</Link></li>
              <li className="nav-item"><Link className="nav-link header__menu-link" to="/productos">Productos</Link></li>
              <li className="nav-item"><a className="nav-link header__menu-link" href="/#nosotros">Nosotros</a></li>
              <li className="nav-item"><a className="nav-link header__menu-link" href="/blogs">Blogs</a></li>
              <li className="nav-item"><Link className="nav-link header__menu-link" to="/contacto">Contacto</Link></li>
            </ul>

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
