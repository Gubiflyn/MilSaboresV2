function Footer() {
  return (
    <footer className="footer py-4">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <div className="footerbrand mb-2">
              <img
                src="public/img/icono.png"
                alt="Mil Sabores"
                className="headericon me-2"
                style={{ height: "32px" }}
              />
              <span className="footer__title">Mil Sabores</span>
            </div>
            <div className="footer__social-links mb-2">
              <a href="#" className="footer__social-link me-3">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="footer__social-link me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="footer__social-link">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
            <p className="footer__copyright mb-0">
              &copy; 2025 Mil Sabores - Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 d-flex flex-column align-items-md-end text-center text-md-end">
            <h5 className="footer__newsletter-title mb-2">
              Suscríbete a nuestro newsletter
            </h5>
            <form className="newsletter-form d-flex justify-content-center justify-content-md-end">
              <div className="input-group newsletter-input-group w-100">
                <input
                  type="email"
                  className="form-control newsletter-form__input"
                  placeholder="Tu correo electrónico"
                  aria-label="Tu correo electrónico"
                  required
                />
                <button className="btn btn--accent" type="submit">
                  Suscribirse
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;