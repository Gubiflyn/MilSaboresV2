// src/pages/Carrito.jsx
import { useCart } from "../context/CartContext";
import Carrito from "../components/Carrito";

export default function CarritoPage({ irAlPago }) {
  const { carrito, clear, remove } = useCart();

  const vaciarCarrito = () => clear();
  const eliminarProducto = (codigo) => remove(codigo);

  return (
    <Carrito
      carrito={carrito}
      vaciarCarrito={vaciarCarrito}
      eliminarProducto={eliminarProducto}
      irAlPago={irAlPago}
    />
  );
}
