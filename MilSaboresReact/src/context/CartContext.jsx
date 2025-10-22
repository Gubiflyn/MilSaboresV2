import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadCarrito, saveCarrito } from '../utils/localstorageHelper';

// 1 Creamos el contexto global
const CartContext = createContext();

// 2 Hook personalizado para usar el contexto en cualquier componente
export const useCart = () => useContext(CartContext);

// 3️ Proveedor del carrito (envuelve toda la app)
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

  // Agregar producto al carrito (respeta mensaje si viene, suma cantidad)
  const add = (producto) => {
    setCarrito((prev) => {
      const idx = prev.findIndex((it) => it.codigo === producto.codigo);
      if (idx >= 0) {
        const copy = [...prev];
        const prevItem = copy[idx];
        copy[idx] = {
          ...prevItem,
          cantidad: (prevItem.cantidad || 1) + (producto.cantidad || 1),
          mensaje:
            producto.mensaje !== undefined ? producto.mensaje : prevItem.mensaje
        };
        return copy;
      }
      return [...prev, { ...producto, cantidad: producto.cantidad || 1 }];
    });
  };

  // Eliminar producto
  const remove = (codigo) =>
    setCarrito((prev) => prev.filter((item) => item.codigo !== codigo));

  // Vaciar carrito
  const clear = () => setCarrito([]);

  // Establecer cantidad exacta (mínimo 1)
  const setQty = (codigo, qty) => {
    const q = Math.max(1, parseInt(qty, 10) || 1);
    setCarrito((prev) =>
      prev.map((it) =>
        it.codigo === codigo ? { ...it, cantidad: q } : it
      )
    );
  };

  // Actualizar solo el mensaje personalizado
  const updateMessage = (codigo, mensaje) => {
    setCarrito((prev) =>
      prev.map((it) =>
        it.codigo === codigo ? { ...it, mensaje: (mensaje || '').slice(0, 50) } : it
      )
    );
  };

  // Total calculado (por conveniencia)
  const total = carrito.reduce(
    (sum, item) => sum + (item.precio || 0) * (item.cantidad || 1),
    0
  );

  // Exportamos todo en el Provider
  return (
    <CartContext.Provider
      value={{ carrito, add, remove, clear, setQty, updateMessage, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
