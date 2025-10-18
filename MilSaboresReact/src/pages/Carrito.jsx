// src/pages/Carrito.jsx
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Carrito from "../components/Carrito";

export default function CarritoPage() {
  const navigate = useNavigate();
  const { carrito, clear, remove, setQty, updateMessage } = useCart();

  const vaciarCarrito = () => clear();
  const eliminarProducto = (codigo) => remove(codigo);
  const cambiarCantidad = (codigo, qty) => setQty(codigo, qty);
  const cambiarMensaje = (codigo, msg) => updateMessage(codigo, msg);
  const irAlPago = () => navigate("/pago");

  return (
    <Carrito
      carrito={carrito}
      vaciarCarrito={vaciarCarrito}
      eliminarProducto={eliminarProducto}
      setCantidad={cambiarCantidad}
      updateMensaje={cambiarMensaje}
      irAlPago={irAlPago}
    />
  );
}
