import { useEffect, useRef, useState } from "react";
// Si usas tu AuthContext, puedes descomentar esto y aprovechar el user autenticado
// import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR = "/img/default-profile.png"; // pon ese archivo en /public/img/

export default function Configuración() {
  // const { user: authUser } = useAuth(); // opcional si manejas usuario por contexto
  const formRef = useRef(null);

  // Cargamos desde localStorage manteniendo compatibilidad con tu proyecto antiguo
  const getUsuarioLS = () => {
    try { return JSON.parse(localStorage.getItem("usuario")) || {}; }
    catch { return {}; }
  };

  const inicio = getUsuarioLS();
  const [foto, setFoto] = useState(inicio.fotoPerfil || DEFAULT_AVATAR);
  const [form, setForm] = useState({
    nombre: inicio.nombre || inicio.nombres || "",
    apellidos: inicio.apellidos || "",
    correo: inicio.correo || inicio.email || "",
  });
  const [editando, setEditando] = useState(false);
  const [ok, setOk] = useState("");
  const fotoAntesRef = useRef(foto); // para restaurar si se cancela

  // Si tu AuthContext expone el usuario real, podrías sincronizarlo aquí:
  // useEffect(() => {
  //   if (authUser) {
  //     setForm(f => ({
  //       ...f,
  //       nombre: authUser.nombre || authUser.nombres || f.nombre,
  //       apellidos: authUser.apellidos || f.apellidos,
  //       correo: authUser.email || authUser.correo || f.correo,
  //     }));
  //     if (authUser.fotoPerfil) setFoto(authUser.fotoPerfil);
  //   }
  // }, [authUser]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  const onFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await toBase64(file);
      setFoto(b64);
    } catch {
      // si algo falla, no rompemos el flujo
    }
  };

  const entrarEdicion = () => {
    fotoAntesRef.current = foto;
    setEditando(true);
    setOk("");
    // limpiamos estilos de validación previos
    formRef.current?.classList.remove("was-validated");
  };

  const cancelar = () => {
    const u = getUsuarioLS();
    setForm({
      nombre: u.nombre || u.nombres || "",
      apellidos: u.apellidos || "",
      correo: u.correo || u.email || "",
    });
    setFoto(u.fotoPerfil || DEFAULT_AVATAR);
    setEditando(false);
    setOk("");
    formRef.current?.classList.remove("was-validated");
  };

  const guardar = (e) => {
    e.preventDefault();
    const formEl = formRef.current;
    if (!formEl.checkValidity()) {
      formEl.classList.add("was-validated");
      return;
    }

    const usuarioActualizado = {
      ...getUsuarioLS(),
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      email: form.correo.trim(),     // compatibilidad con tu código anterior
      fotoPerfil: foto,
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setOk("¡Información actualizada correctamente!");
    setEditando(false);
  };

  return (
    <main>
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-6">
              <div className="card shadow-lg p-4 bg-white rounded">
                <div className="config-card__header mb-3">
                  <h3 className="mb-0">Mi Perfil</h3>
                </div>

                <form ref={formRef} className="needs-validation" noValidate onSubmit={guardar}>
                  <div className="d-flex flex-column align-items-center mb-3">
                    <img
                      src={foto || DEFAULT_AVATAR}
                      alt="Foto de perfil"
                      className="profile-img-preview"
                      style={{ width: 128, height: 128, objectFit: "cover", borderRadius: "50%" }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control mt-2"
                      style={{ maxWidth: 220 }}
                      onChange={onFotoChange}
                      disabled={!editando}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label config-card__label" htmlFor="nombre">Nombres</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      className="form-control config-card__input"
                      value={form.nombre}
                      onChange={onChange}
                      readOnly={!editando}
                      required
                    />
                    <div className="invalid-feedback">Por favor, ingresa tus nombres.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label config-card__label" htmlFor="apellidos">Apellidos</label>
                    <input
                      id="apellidos"
                      name="apellidos"
                      type="text"
                      className="form-control config-card__input"
                      value={form.apellidos}
                      onChange={onChange}
                      readOnly={!editando}
                      required
                    />
                    <div className="invalid-feedback">Por favor, ingresa tus apellidos.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label config-card__label" htmlFor="correo">Correo electrónico</label>
                    <input
                      id="correo"
                      name="correo"
                      type="email"
                      className="form-control config-card__input"
                      value={form.correo}
                      onChange={onChange}
                      readOnly={!editando}
                      required
                    />
                    <div className="invalid-feedback">Por favor, ingresa un correo válido.</div>
                  </div>

                  {!editando ? (
                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" className="config-card__btn btn btn-primary" onClick={entrarEdicion}>
                        <i className="fas fa-pen" /> Editar
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <button type="button" className="config-card__cancel btn btn-outline-secondary" onClick={cancelar}>
                        Cancelar
                      </button>
                      <button type="submit" className="config-card__btn btn btn-primary">
                        Aplicar cambios
                      </button>
                    </div>
                  )}
                </form>

                {ok && (
                  <div className="alert alert-success config-card__success mt-3 mb-0">
                    {ok}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
