// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getUsuarios, createCliente } from "../services/api";

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

  /**
   * LOGIN
   * IMPORTANTE: el parámetro `contrasena` debe venir YA HASHEAD0 con scrypt
   * desde el componente (Login.jsx, Register.jsx, etc.).
   */
  const login = async (correo, contrasena) => {
    setLoading(true);
    try {
      const emailNorm = String(correo).toLowerCase().trim();
      // Aquí asumimos que `contrasena` ya es el hash (hexadecimal)
      const hashedPass = String(contrasena);

      let usuarios = [];
      try {
        usuarios = await getUsuarios();
      } catch (err) {
        console.warn("No se pudieron cargar usuarios:", err);
      }

      if (!Array.isArray(usuarios) || !usuarios.length) {
        throw new Error("No se encontraron usuarios en el sistema.");
      }

      const match = usuarios.find(
        (u) =>
          String(u.correo).toLowerCase() === emailNorm &&
          // La BD también guarda el hash en `u.contrasena`
          String(u.contrasena) === hashedPass &&
          (u.activo === undefined || u.activo === true)
      );

      if (!match) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      // Detectar rol
      let detectedRole =
        match.rol ||
        match.tipoUsuario ||
        match.tipo_usuario ||
        match.tipo ||
        match.perfil;

      detectedRole = detectedRole
        ? String(detectedRole).toUpperCase()
        : "CLIENTE";

      if (!["ADMIN", "VENDEDOR", "CLIENTE"].includes(detectedRole)) {
        detectedRole = "CLIENTE";
      }

      // Datos que queremos guardar en sesión
      const authUser = {
        id: match.id,
        nombre: match.nombre,
        correo: match.correo,
        rol: detectedRole,
        tipo: detectedRole,
        beneficio: match.beneficio || null,
        fechaNacimiento: match.fechaNacimiento || null,
        codigoRegistro: match.codigoRegistro || null,
      };

      setUser(authUser);
      return authUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // REGISTRO en BD (aquí ya debe venir la contraseña hasheada en clienteData.contrasena)
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
