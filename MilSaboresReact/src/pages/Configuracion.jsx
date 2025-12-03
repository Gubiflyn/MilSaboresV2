// src/pages/Configuracion.jsx
import { useRef, useState, useMemo } from "react";
import regionesComunas from "../data/chile-regiones-comunas.json";
import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR = "/img/default-profile.png";

export default function Configuracion() {
  const formRef = useRef(null);
  const { user: authUser } = useAuth() || {};

  // ---- Obtener datos del usuario en sesión ----
  const getUsuarioSesion = () => {
    try {
      
      const usuarioLS =
        JSON.parse(localStorage.getItem("usuario")) ||
        JSON.parse(localStorage.getItem("authUser")) ||
        JSON.parse(localStorage.getItem("user")) ||
        {};

      
      const auth = { ...usuarioLS, ...(authUser || {}) };

      
      const perfiles = JSON.parse(localStorage.getItem("perfiles") || "[]");
      const correoAuth = (auth.correo || auth.email || "").toLowerCase();

      const perfil = perfiles.find(
        (p) =>
          (p.email || p.correo || "").toLowerCase() === correoAuth
      );

     
      return { ...(perfil || {}), ...auth };
    } catch {
      return authUser || {};
    }
  };

  const inicio = getUsuarioSesion();
  const regiones = useMemo(() => regionesComunas.map((r) => r.region), []);

  const separarNombre = (nombreCompleto = "") => {
    const partes = nombreCompleto.trim().split(" ");
    const nombre = partes.slice(0, -1).join(" ") || partes[0] || "";
    const apellido = partes.slice(-1).join(" ") || "";
    return { nombre, apellido };
  };

  const { nombre, apellido } = separarNombre(
    inicio.nombre || inicio.nombres || ""
  );

  const [foto, setFoto] = useState(inicio.fotoPerfil || DEFAULT_AVATAR);
  const [form, setForm] = useState({
    nombre,
    apellidos: inicio.apellidos || apellido,
    correo: inicio.correo || inicio.email || "",
    direccion: inicio.direccion || "",
    region: inicio.region || "",
    comuna: inicio.comuna || "",
  });

  const [editando, setEditando] = useState(false);
  const [ok, setOk] = useState("");
  const fotoAntesRef = useRef(foto);

  const comunasDeRegion = useMemo(() => {
    const r = regionesComunas.find((x) => x.region === form.region);
    return r ? r.comunas : [];
  }, [form.region]);

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
     
    }
  };

  const entrarEdicion = () => {
    fotoAntesRef.current = foto;
    setEditando(true);
    setOk("");
    formRef.current?.classList.remove("was-validated");
  };

  const cancelar = () => {
    const u = getUsuarioSesion();
    const { nombre, apellido } = separarNombre(u.nombre || u.nombres || "");
    setForm({
      nombre,
      apellidos: u.apellidos || apellido,
      correo: u.correo || u.email || "",
      direccion: u.direccion || "",
      region: u.region || "",
      comuna: u.comuna || "",
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

    const usuarioSesionActual = getUsuarioSesion();

    const usuarioActualizado = {
      ...usuarioSesionActual,
      nombre: `${form.nombre.trim()} ${form.apellidos.trim()}`.trim(),
      nombres: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      email: form.correo.trim(),
      direccion: form.direccion.trim(),
      region: form.region,
      comuna: form.comuna,
      fotoPerfil: foto,
    };

  
    localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

    
    const perfiles = JSON.parse(localStorage.getItem("perfiles") || "[]");
    const idx = perfiles.findIndex(
      (p) =>
        (p.email || p.correo || "").toLowerCase() ===
        (usuarioSesionActual.correo ||
          usuarioSesionActual.email ||
          "").toLowerCase()
    );
    if (idx >= 0) {
      perfiles[idx] = { ...perfiles[idx], ...usuarioActualizado };
      localStorage.setItem("perfiles", JSON.stringify(perfiles));
    }

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
                <div className="config-card__header mb-3 text-center">
                  <h3 className="mb-0">Mi Perfil</h3>
                </div>

                <form
                  ref={formRef}
                  className="needs-validation"
                  noValidate
                  onSubmit={guardar}
                >
                  <div className="d-flex flex-column align-items-center mb-3">
                    <img
                      src={foto || DEFAULT_AVATAR}
                      alt="Foto de perfil"
                      style={{
                        width: 128,
                        height: 128,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "3px solid #f3c1c1",
                      }}
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
                    <label className="form-label">Nombres</label>
                    <input
                      name="nombre"
                      type="text"
                      className="form-control"
                      value={form.nombre}
                      onChange={onChange}
                      readOnly={!editando}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Apellidos</label>
                    <input
                      name="apellidos"
                      type="text"
                      className="form-control"
                      value={form.apellidos}
                      onChange={onChange}
                      readOnly={!editando}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Correo electrónico</label>
                    <input
                      name="correo"
                      type="email"
                      className="form-control"
                      value={form.correo}
                      onChange={onChange}
                      readOnly={!editando}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                      name="direccion"
                      type="text"
                      className="form-control"
                      value={form.direccion}
                      onChange={onChange}
                      readOnly={!editando}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Región</label>
                    <select
                      name="region"
                      className="form-select"
                      value={form.region}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          region: e.target.value,
                          comuna: "",
                        })
                      }
                      disabled={!editando}
                      required
                    >
                      <option value="" disabled>
                        Selecciona una región
                      </option>
                      {regiones.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Comuna</label>
                    <select
                      name="comuna"
                      className="form-select"
                      value={form.comuna}
                      onChange={(e) =>
                        setForm({ ...form, comuna: e.target.value })
                      }
                      disabled={!editando || !form.region}
                      required
                    >
                      <option value="" disabled>
                        {form.region
                          ? "Selecciona una comuna"
                          : "Primero elige una región"}
                      </option>
                      {comunasDeRegion.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!editando ? (
                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={entrarEdicion}
                      >
                        <i className="fas fa-pen" /> Editar
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={cancelar}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Aplicar cambios
                      </button>
                    </div>
                  )}
                </form>

                {ok && (
                  <div className="alert alert-success mt-3 mb-0 text-center">
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
