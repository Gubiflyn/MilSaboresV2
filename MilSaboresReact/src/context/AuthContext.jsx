import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import seedUsers from "../data/usuarios.json";

const LS_TOKEN = "token";
const LS_USER = "usuario";
const LS_PROFILES = "perfiles";

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

const AuthCtx = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   
  const [token, setToken] = useState(null); 
  const mountedRef = useRef(false);

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

  const hydrate = () => {
    const rawTk = localStorage.getItem(LS_TOKEN);
    const rawUser = localStorage.getItem(LS_USER);

    if (!rawTk || !rawUser) {
      setToken(null);
      setUser(null);
      return;
    }

    const parsed = readToken(rawTk);
    if (!parsed || Date.now() > parsed.exp) {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
      setToken(null);
      setUser(null);
      return;
    }

    setToken(rawTk);
    try {
      setUser(JSON.parse(rawUser));
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    hydrate();
    mountedRef.current = true;

    const onStorage = (e) => {
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
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const rawTk = localStorage.getItem(LS_TOKEN);
      const parsed = rawTk ? readToken(rawTk) : null;
      if (!parsed || Date.now() > (parsed?.exp || 0)) {
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

  const login = (email, password) => {
    const perfiles = JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");

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
      _raw: u,
    }));

    const users = [
      ...seedUsers,
      ...normalizedPerfiles.filter(
        (u) => !seedUsers.some((f) => f.email === u.email)
      ),
    ];

    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: "Correo o contraseña incorrectos" };

    const payload = {
      email: found.email,
      rol: found.rol,
      nombre: found.nombre,
      fechaNacimiento: found.fechaNacimiento || null,
      beneficio: found.beneficio || null,
    };

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

    return { ok: true };
  };

  const logout = () => {
    try {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

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
    }),
    [user, token, isAuthenticated, isAdmin]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
