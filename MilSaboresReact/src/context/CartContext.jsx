import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadCarrito, saveCarrito } from '../utils/localstorageHelper';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const data = loadCarrito();
    if (data) setCarrito(data);
  }, []);

  useEffect(() => {
    saveCarrito(carrito);
  }, [carrito]);

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

  const remove = (codigo) =>
    setCarrito((prev) => prev.filter((item) => item.codigo !== codigo));

  const clear = () => setCarrito([]);

  const setQty = (codigo, qty) => {
    const q = Math.max(1, parseInt(qty, 10) || 1);
    setCarrito((prev) =>
      prev.map((it) =>
        it.codigo === codigo ? { ...it, cantidad: q } : it
      )
    );
  };

  const updateMessage = (codigo, mensaje) => {
    setCarrito((prev) =>
      prev.map((it) =>
        it.codigo === codigo ? { ...it, mensaje: (mensaje || '').slice(0, 50) } : it
      )
    );
  };

  const total = carrito.reduce(
    (sum, item) => sum + (item.precio || 0) * (item.cantidad || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{ carrito, add, remove, clear, setQty, updateMessage, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
