// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAdministradores,
  getClientes,
  createCliente,
} from "../services/api";
import usuariosSeed from "../data/usuarios.json";

const AuthContext = createContext(null);
const LS_USER_KEY = "ms_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Normalizamos el rol siempre en MAYÚSCULAS
  const rawRole = user?.tipo || user?.rol || "CLIENTE";
  const role = String(rawRole).toUpperCase();

  const isAdmin = role === "ADMIN";
  const isSeller = role === "VENDEDOR";
  const isCliente = role === "CLIENTE";

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LS_USER_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = async (correo, contrasena) => {
    setLoading(true);
    try {
      const emailNorm = String(correo).toLowerCase().trim();
      const passNorm = String(contrasena);

      // 1) Intentar usuario de BACKOFFICE vía API (ADMIN o VENDEDOR)
      let admins = [];
      try {
        admins = await getAdministradores();
      } catch (e) {
        console.warn("No se pudieron cargar administradores:", e);
      }

      if (Array.isArray(admins) && admins.length) {
        const adminMatch = admins.find(
          (a) =>
            String(a.correo).toLowerCase() === emailNorm &&
            String(a.contrasena) === passNorm &&
            (a.activo === undefined || a.activo === true)
        );

        if (adminMatch) {
          const rawRole = adminMatch.tipo || adminMatch.rol || "ADMIN";
          const upperRole = String(rawRole).toUpperCase();
          const normalizedRole =
            upperRole === "VENDEDOR" ? "VENDEDOR" : "ADMIN";

          const authUser = {
            id: adminMatch.id,
            nombre: adminMatch.nombre,
            correo: adminMatch.correo,
            rol: normalizedRole,
            tipo: normalizedRole,
          };
          setUser(authUser);
          return authUser;
        }
      }

      // 2) Intentar CLIENTE vía API
      let clientes = [];
      try {
        clientes = await getClientes();
      } catch (e) {
        console.warn("No se pudieron cargar clientes:", e);
      }

      if (Array.isArray(clientes) && clientes.length) {
        const clienteMatch = clientes.find(
          (c) =>
            String(c.correo).toLowerCase() === emailNorm &&
            String(c.contrasena) === passNorm &&
            (c.activo === undefined || c.activo === true)
        );
        if (clienteMatch) {
          const authUser = {
            id: clienteMatch.id,
            nombre: clienteMatch.nombre,
            correo: clienteMatch.correo,
            rol: "CLIENTE",
            tipo: "CLIENTE",
          };
          setUser(authUser);
          return authUser;
        }
      }

      // 3) Usuarios locales de src/data/usuarios.json (semilla)
      if (Array.isArray(usuariosSeed) && usuariosSeed.length) {
        const localMatch = usuariosSeed.find(
          (u) =>
            String(u.email).toLowerCase() === emailNorm &&
            String(u.password) === passNorm
        );

        if (localMatch) {
          const rawRole = localMatch.rol || localMatch.tipo || "cliente";
          const upperRole = String(rawRole).toUpperCase();

          if (upperRole === "ADMIN" || upperRole === "VENDEDOR") {
            // Backoffice local: ADMIN o VENDEDOR
            const normalizedRole =
              upperRole === "VENDEDOR" ? "VENDEDOR" : "ADMIN";

            const authUser = {
              id: localMatch.id ?? null,
              nombre: localMatch.nombre,
              correo: localMatch.email,
              rol: normalizedRole,
              tipo: normalizedRole,
            };
            setUser(authUser);
            return authUser;
          } else {
            // Cliente local
            const authUser = {
              id: localMatch.id ?? null,
              nombre: localMatch.nombre,
              correo: localMatch.email,
              rol: "CLIENTE",
              tipo: "CLIENTE",
            };
            setUser(authUser);
            return authUser;
          }
        }
      }

      throw new Error("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (clienteData) => {
    const nuevoCliente = await createCliente({
      ...clienteData,
      activo: true,
    });
    return nuevoCliente;
  };

  const value = {
    user,
    loading,
    role,          // rol ya normalizado en mayúsculas
    isAuthenticated: !!user,
    isAdmin,
    isSeller,
    isCliente,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
