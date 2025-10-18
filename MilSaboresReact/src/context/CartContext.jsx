import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadCarrito, saveCarrito } from '../utils/localstorageHelper';

// 1️⃣ Creamos el contexto global
const CartContext = createContext();

// 2️⃣ Hook personalizado para usar el contexto en cualquier componente
export const useCart = () => useContext(CartContext);

// 3️⃣ Proveedor del carrito (envuelve toda la app)
export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const data = loadCarrito();
    if (data) setCarrito(data);
  }, []);

  // Guardar carrito cada vez que cambia
  useEffect(() => {
    saveCarrito(carrito);
  }, [carrito]);

  // Agregar producto al carrito
  const add = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.codigo === producto.codigo);
      if (existe) {
        return prev.map((item) =>
          item.codigo === producto.codigo
            ? { ...item, cantidad: item.cantidad + (producto.cantidad || 1) }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: producto.cantidad || 1 }];
    });
  };

  // Eliminar producto
  const remove = (codigo) =>
    setCarrito((prev) => prev.filter((item) => item.codigo !== codigo));

  // Vaciar carrito
  const clear = () => setCarrito([]);

  // Total calculado (por conveniencia)
  const total = carrito.reduce(
    (sum, item) => sum + item.precio * (item.cantidad || 1),
    0
  );

  // Exportamos todo en el Provider
  return (
    <CartContext.Provider value={{ carrito, add, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  );
};
