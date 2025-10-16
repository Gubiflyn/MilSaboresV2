import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadCarrito, saveCarrito } from "../utils/localstorageHelper";

const CartCtx = createContext(null);

const initial = () => loadCarrito() || [];

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const t = action.item; // { codigo, nombre, precio, imagen, cantidad? }
      const idx = state.findIndex(it => it.codigo === t.codigo);
      if (idx >= 0) {
        const next = [...state];
        next[idx] = { ...next[idx], cantidad: (next[idx].cantidad || 1) + (t.cantidad || 1) };
        return next;
      }
      return [...state, { ...t, cantidad: t.cantidad || 1 }];
    }
    case "SET_QTY": {
      const { codigo, cantidad } = action;
      if (cantidad <= 0) return state.filter(it => it.codigo !== codigo);
      return state.map(it => it.codigo === codigo ? { ...it, cantidad } : it);
    }
    case "REMOVE":
      return state.filter(it => it.codigo !== action.codigo);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [carrito, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => { saveCarrito(carrito); }, [carrito]);

  const totals = useMemo(() => {
    const count = carrito.reduce((a, t) => a + (t.cantidad || 1), 0);
    const subtotal = carrito.reduce((a, t) => a + (t.precio || 0) * (t.cantidad || 1), 0);
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;
    return { count, subtotal, iva, total };
  }, [carrito]);

  const api = {
    carrito,
    totals,
    add: (item) => dispatch({ type: "ADD", item }),
    setQty: (codigo, cantidad) => dispatch({ type: "SET_QTY", codigo, cantidad }),
    remove: (codigo) => dispatch({ type: "REMOVE", codigo }),
    clear: () => dispatch({ type: "CLEAR" })
  };

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
