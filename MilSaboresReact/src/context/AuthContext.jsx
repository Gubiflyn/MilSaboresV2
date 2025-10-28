// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import seedUsers from "../data/usuarios.json";

/** Claves de almacenamiento */
const LS_TOKEN = "token";
const LS_USER = "usuario";
const LS_PROFILES = "perfiles";

/** Token simple con expiración (30 min) */
function makeToken(payload) {
  const exp = Date.now() + 30 * 60 * 1000;
  return btoa(JSON.stringify({ ...payload, exp }));
}
function readToken(raw) {
  try {
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

/** Contexto */
const AuthCtx = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // usuario actual (sin password)
  const [token, setToken] = useState(null); // token raw (string)
  const mountedRef = useRef(false);

  /** 1) Semilla de usuarios fijos → se mezcla 1 sola vez con 'perfiles' */
  useEffect(() => {
    const perfiles = JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");
    const merged = [...perfiles];
    seedUsers.forEach((fijo) => {
      if (!merged.some((p) => (p.email || p.correo) === fijo.email)) {
        merged.push(fijo);
      }
    });
    localStorage.setItem(LS_PROFILES, JSON.stringify(merged));
  }, []);

  /** Helpers */
  const hydrate = () => {
    const rawTk = localStorage.getItem(LS_TOKEN);
    const rawUser = localStorage.getItem(LS_USER);

    if (!rawTk || !rawUser) {
      // No hay sesión persistida: limpia estado
      setToken(null);
      setUser(null);
      return;
    }

    const parsed = readToken(rawTk);
    if (!parsed || Date.now() > parsed.exp) {
      // Token inválido/expirado: limpia todo
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
      setToken(null);
      setUser(null);
      return;
    }

    // Sesión válida: rehidrata
    setToken(rawTk);
    try {
      setUser(JSON.parse(rawUser));
    } catch {
      setUser(null);
    }
  };

  /** 2) Rehidratación inicial + escucha de cambios externos (DevTools/otras pestañas) */
  useEffect(() => {
    hydrate();
    mountedRef.current = true;

    const onStorage = (e) => {
      // Si tocan estas llaves, rehidrata el contexto
      if (!e || !e.key) return;
      if ([LS_USER, LS_TOKEN, "authUser", "user", "currentUser"].includes(e.key)) {
        hydrate();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 3) Auto-logout por expiración (polling liviano cada 60s) */
  useEffect(() => {
    const id = setInterval(() => {
      const rawTk = localStorage.getItem(LS_TOKEN);
      const parsed = rawTk ? readToken(rawTk) : null;
      if (!parsed || Date.now() > (parsed?.exp || 0)) {
        // Expirado o inválido → cierra sesión
        localStorage.removeItem(LS_TOKEN);
        localStorage.removeItem(LS_USER);
        if (mountedRef.current) {
          setToken(null);
          setUser(null);
        }
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  /** 4) Login */
  const login = (email, password) => {
    const perfiles = JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");

    // Normaliza perfiles → asegura email/password y otros campos típicos
    const normalizedPerfiles = perfiles.map((u) => ({
      email: u.email || u.correo,
      password: u.password || u.contrasena,
      rol: u.rol || "cliente",
      nombre:
        u.nombre ||
        (u.nombres ? `${u.nombres} ${u.apellidos || ""}`.trim() : "Cliente"),
      fechaNacimiento: u.fechaNacimiento || null,
      beneficio: u.beneficio || null,
      direccion: u.direccion || "",
      region: u.region || "",
      comuna: u.comuna || "",
      telefono: u.telefono || "",
      fotoPerfil: u.fotoPerfil || "",
      // conserva campos originales por si los necesitas
      _raw: u,
    }));

    // Unifica seed + perfiles (evitando duplicados por email)
    const users = [
      ...seedUsers,
      ...normalizedPerfiles.filter(
        (u) => !seedUsers.some((f) => f.email === u.email)
      ),
    ];

    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: "Correo o contraseña incorrectos" };

    // Construye payload del token (ligero)
    const payload = {
      email: found.email,
      rol: found.rol,
      nombre: found.nombre,
      fechaNacimiento: found.fechaNacimiento || null,
      beneficio: found.beneficio || null,
    };

    // Construye el objeto 'usuario' para la app (sin password),
    // enriquecido con dirección/region/comuna si existían en perfiles
    const profileExtra =
      normalizedPerfiles.find((p) => p.email === found.email) || {};
    const userView = {
      email: found.email,
      rol: found.rol,
      nombre: found.nombre,
      fechaNacimiento: found.fechaNacimiento || null,
      beneficio: found.beneficio || null,
      direccion: profileExtra.direccion || "",
      region: profileExtra.region || "",
      comuna: profileExtra.comuna || "",
      telefono: profileExtra.telefono || "",
      fotoPerfil: profileExtra.fotoPerfil || "",
    };

    const tk = makeToken(payload);
    localStorage.setItem(LS_TOKEN, tk);
    localStorage.setItem(LS_USER, JSON.stringify(userView));
    setToken(tk);
    setUser(userView);

    // console.debug("Auth.login ->", { user: userView });
    return { ok: true };
  };

  /** 5) Logout */
  const logout = () => {
    try {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    } finally {
      setToken(null);
      setUser(null);
    }
    // Si quieres ser tajante y limpiar cualquier estado residual de la SPA:
    // window.location.assign("/login");
  };

  /** 6) Derivados */
  const isAuthenticated = useMemo(() => {
    if (!user || !token) return false;
    const payload = readToken(token);
    return !!payload && Date.now() <= payload.exp;
  }, [user, token]);

  const isAdmin = user?.rol === "admin";

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      // opcionalmente podrías exponer hydrate para forzar relectura manual
      // hydrate,
    }),
    [user, token, isAuthenticated, isAdmin]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/** Hook */
export const useAuth = () => useContext(AuthCtx);
