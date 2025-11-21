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

  // Normalizar rol en MAYÚSCULAS
  const rawRole = user?.tipo || user?.rol || "CLIENTE";
  const role = String(rawRole).toUpperCase();

  const isAdmin = role === "ADMIN";
  const isSeller = role === "VENDEDOR";
  const isCliente = role === "CLIENTE";

  // Guardar sesión en localStorage
  useEffect(() => {
    if (user) localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(LS_USER_KEY);
  }, [user]);

  // LOGIN contra BD
  const login = async (correo, contrasena) => {
    setLoading(true);
    try {
      const emailNorm = String(correo).toLowerCase().trim();
      const passNorm = String(contrasena);

      // 1) Admin / Vendedor
      let admins = [];
      try {
        admins = await getAdministradores();
      } catch (err) {
        console.warn("No se pudieron cargar administradores:", err);
      }

      if (Array.isArray(admins)) {
        const adminMatch = admins.find(
          (a) =>
            String(a.correo).toLowerCase() === emailNorm &&
            String(a.contrasena) === passNorm &&
            (a.activo === undefined || a.activo === true)
        );

        if (adminMatch) {
          const rawRole = adminMatch.tipo || adminMatch.rol || "ADMIN";
          const upperRole = String(rawRole).toUpperCase();
          const normalized =
            upperRole === "VENDEDOR" ? "VENDEDOR" : "ADMIN";

          const authUser = {
            id: adminMatch.id,
            nombre: adminMatch.nombre,
            correo: adminMatch.correo,
            rol: normalized,
            tipo: normalized,
          };

          setUser(authUser);
          return authUser;
        }
      }

      // 2) Cliente
      let clientes = [];
      try {
        clientes = await getClientes();
      } catch (err) {
        console.warn("No se pudieron cargar clientes:", err);
      }

      if (Array.isArray(clientes)) {
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

      throw new Error("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // REGISTRO en BD
  const register = async (clienteData) => {
    const nuevo = await createCliente({
      ...clienteData,
      activo: true,
    });
    return nuevo;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAuthenticated: !!user,
        isAdmin,
        isSeller,
        isCliente,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
