import { createContext, useContext, useEffect, useMemo, useState } from "react";
import seedUsers from "../data/users.json";

// helpers localStorage
const LS_TOKEN   = "token";
const LS_USER    = "usuario";
const LS_PROFILES= "perfiles";

// genera un “token” simple con expiración de 30 min (como tu login.js)
function makeToken(payload) {
  const exp = Date.now() + 30 * 60 * 1000;
  return btoa(JSON.stringify({ ...payload, exp }));
}
function readToken(raw) {
  try { return JSON.parse(atob(raw)); } catch { return null; }
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // usuario actual (sin password)
  const [token, setToken] = useState(null);       // token raw

  // Semilla de usuarios fijos (una sola vez)
  useEffect(() => {
    const perfiles = JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");
    const merged = [...perfiles];
    seedUsers.forEach(fijo => {
      if (!merged.some(p => (p.email || p.correo) === fijo.email)) {
        merged.push(fijo);
      }
    });
    localStorage.setItem(LS_PROFILES, JSON.stringify(merged));
  }, []);

  // Cargar sesión si existe
  useEffect(() => {
    const raw = localStorage.getItem(LS_TOKEN);
    const uRaw = localStorage.getItem(LS_USER);
    if (!raw || !uRaw) return;
    const payload = readToken(raw);
    if (!payload || Date.now() > payload.exp) {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
      return;
    }
    setToken(raw);
    setUser(JSON.parse(uRaw));
  }, []);

  // Login
  const login = (email, password) => {
    const perfiles = JSON.parse(localStorage.getItem(LS_PROFILES) || "[]");

    // Unifica seed + perfiles (sin duplicar)
    const users = [
      ...seedUsers,
      ...perfiles.filter(u => !seedUsers.some(f => f.email === (u.email || u.correo))).map(u => ({
        email: u.email || u.correo,
        password: u.password || u.contrasena,
        rol: u.rol || "cliente",
        nombre: u.nombre || (u.nombres ? `${u.nombres} ${u.apellidos || ""}`.trim() : "Cliente"),
        fechaNacimiento: u.fechaNacimiento || null,
        beneficio: u.beneficio || null,
      }))
    ];

    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { ok: false, error: "Correo o contraseña incorrectos" };

    const payload = {
      email: found.email,
      rol: found.rol,
      nombre: found.nombre,
      fechaNacimiento: found.fechaNacimiento || null,
      beneficio: found.beneficio || null
    };

    const tk = makeToken(payload);
    localStorage.setItem(LS_TOKEN, tk);

    const userView = { ...found };
    delete userView.password;
    localStorage.setItem(LS_USER, JSON.stringify(userView));

    setToken(tk);
    setUser(userView);
    return { ok: true };
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    setToken(null);
    setUser(null);
  };

  // Datos derivados
  const isAuthenticated = !!user && !!token && readToken(token)?.exp > Date.now();
  const isAdmin = user?.rol === "admin";

  const value = useMemo(() => ({
    user, isAuthenticated, isAdmin, login, logout
  }), [user, isAuthenticated, isAdmin]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
