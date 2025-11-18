// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAdministradores,
  getClientes,
  createCliente,
} from "../services/api";

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
      // 1) Intentar ADMIN
      let admins = [];
      try {
        admins = await getAdministradores();
      } catch (e) {
        console.warn("No se pudieron cargar administradores:", e);
      }

      if (Array.isArray(admins) && admins.length) {
        const adminMatch = admins.find(
          (a) =>
            String(a.correo).toLowerCase() ===
              String(correo).toLowerCase().trim() &&
            String(a.contrasena) === String(contrasena) &&
            (a.activo === undefined || a.activo === true)
        );
        if (adminMatch) {
          const authUser = {
            id: adminMatch.id,
            nombre: adminMatch.nombre,
            correo: adminMatch.correo,
            rol: "ADMIN",
            tipo: "ADMIN",
          };
          setUser(authUser);
          return authUser;
        }
      }

      // 2) Intentar CLIENTE
      let clientes = [];
      try {
        clientes = await getClientes();
      } catch (e) {
        console.warn("No se pudieron cargar clientes:", e);
      }

      if (Array.isArray(clientes) && clientes.length) {
        const clienteMatch = clientes.find(
          (c) =>
            String(c.correo).toLowerCase() ===
              String(correo).toLowerCase().trim() &&
            String(c.contrasena) === String(contrasena) &&
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

      throw new Error("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (clienteData) => {
    // aquí asumo que el formulario ya pide nombre, rut, apellido, correo, contrasena, comuna, region
    const nuevoCliente = await createCliente({
      ...clienteData,
      activo: true,
    });
    return nuevoCliente;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.rol === "ADMIN" || user?.tipo === "ADMIN",
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
