import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Carrito from "../components/Carrito";

export default function CarritoPage() {
  const navigate = useNavigate();
  const { carrito, clear, remove, setQty, updateMessage } = useCart();

  return (
    <Carrito
      carrito={carrito}
      vaciarCarrito={clear}
      eliminarProducto={remove}
      setCantidad={setQty}            
      updateMensaje={updateMessage}
      irAlPago={() => navigate("/pago")}
    />
  );
}
