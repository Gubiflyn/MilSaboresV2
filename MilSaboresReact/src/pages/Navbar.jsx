import { Link } from "react-router-dom"     

function Navbar() {
  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg header__nav py-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a className="navbar-brand headerbrand" href="/">
            <img
              src="../../Assets/img/icono.png"
              alt="Mil Sabores"
              className="headericon me-2"
              style={{ height: "32px" }}
            />
            <span className="header__title">Mil Sabores</span>
          </a>
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
                <a
                  className="nav-link header__menu-link d-flex align-items-center"
                  id="perfilMenu"
                  href="/configuracion"
                >
                  <i className="fas fa-user-circle me-1"></i> Mi Perfil
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link header__menu-link" href="/">
                  Inicio
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link header__menu-link" href="/productos">
                  Productos
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link header__menu-link" href="/#nosotros">
                  Nosotros
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link header__menu-link" href="/blogs">
                  Blogs
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link header__menu-link" href="/contacto">
                  Contacto
                </a>
              </li>
            </ul>
            <a href="#" className="header__cart-icon ms-4" aria-label="Carrito de compras">
              <i className="fas fa-shopping-cart fa-lg"></i>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;