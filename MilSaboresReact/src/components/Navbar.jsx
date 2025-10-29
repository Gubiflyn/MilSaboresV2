import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar({ carrito: carritoProp }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { carrito: carritoCtx } = useCart();
  const carrito = Array.isArray(carritoProp) ? carritoProp : carritoCtx || [];
  const cantidadTotal = carrito.reduce((sum, t) => sum + (t.cantidad || 1), 0);

  const [fallbackOpen, setFallbackOpen] = useState(false);

  useEffect(() => {
    try {
      const trigger = document.getElementById("userMenu");
      if (trigger && window.bootstrap?.Dropdown) {
        new window.bootstrap.Dropdown(trigger);
      }
    } catch {}
  }, []);

  const closeDropdown = () => setFallbackOpen(false);

  const handleLogout = () => {
    logout();
    closeDropdown();
    navigate("/");
  };

  const handleUserBtnClick = (e) => {
    if (window.bootstrap?.Dropdown) return;
    e.preventDefault();
    setFallbackOpen((v) => !v);
  };

  useEffect(() => {
    if (!fallbackOpen) return;
    const close = (ev) => {
      const menu = document.getElementById("userMenuDropdown");
      const btn = document.getElementById("userMenu");
      if (!menu || !btn) return;
      if (!menu.contains(ev.target) && !btn.contains(ev.target)) {
        setFallbackOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [fallbackOpen]);

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg header__nav py-3 navbar-dark">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link className="navbar-brand header__brand" to="/">
            <img src="/img/icono.png" alt="Mil Sabores" style={{ height: "32px" }} className="me-2" />
            <span className="header__title">Mil Sabores</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav header__menu align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link header__menu-link" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link header__menu-link" to="/ofertas">Ofertas</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link header__menu-link" to="/categorias">Categorías</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link header__menu-link" to="/productos">Productos</Link>
              </li>
              <li className="nav-item">
                <a className="nav-link header__menu-link" href="/#nosotros">Nosotros</a>
              </li>
              <li className="nav-item">
                <Link className="nav-link header__menu-link" to="/blogs">Blogs</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link header__menu-link" to="/contacto">Contacto</Link>
              </li>

              {isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link header__menu-link text-warning fw-semibold" to="/admin">
                    Admin
                  </Link>
                </li>
              )}

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
                    id="userMenu"
                    className="btn nav-link dropdown-toggle header__menu-link"
                    data-bs-toggle="dropdown"
                    aria-expanded={fallbackOpen ? "true" : "false"}
                    onClick={handleUserBtnClick}
                  >
                    Hola, {user?.nombre || "Usuario"}
                  </button>
                  <ul
                    id="userMenuDropdown"
                    className={`dropdown-menu dropdown-menu-end ${fallbackOpen ? "show" : ""}`}
                    style={{ minWidth: 220 }}
                  >
                    <li>
                      <span className="dropdown-item-text small text-muted">{user?.email}</span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/configuracion" onClick={closeDropdown}>
                        <i className="fas fa-user-cog me-2"></i> Configuración
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i> Cerrar sesión
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
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.7rem" }}>
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
