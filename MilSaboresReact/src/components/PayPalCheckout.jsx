import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useMemo, useState } from "react";
import { applyPromotions } from "../utils/promotions";

const CLP_PER_USD = 950; 

export default function PayPalCheckout({ onPaid, customerEmail = "" }) {
  const navigate = useNavigate();
  const { carrito } = useCart();
  const [loading, setLoading] = useState(false);

  const promo = useMemo(
    () =>
      applyPromotions({
        items: carrito,
        customerEmail: customerEmail || "",
      }),
    [carrito, customerEmail]
  );

  const totalCLP = promo.total || 0;
  const totalUSD = (totalCLP / CLP_PER_USD).toFixed(2);

  if (!carrito || carrito.length === 0) {
    return <p className="text-muted">Tu carrito está vacío.</p>;
  }

  return (
    <div style={{ colorScheme: "none" }}>
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", label: "paypal" }}
        disabled={loading}
        createOrder={(data, actions) => {
          setLoading(true);
          return actions.order.create({
            purchase_units: [
              {
                description: "Compra Mil Sabores",
                amount: {
                  currency_code: "USD",
                  value: String(totalUSD), 
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            if (typeof onPaid === "function") {
              onPaid(details);
            } else {
              const orderId = details?.id || data?.orderID;
              navigate(`/boleta/${orderId}`);
            }
          } catch (e) {
            console.error(e);
            alert("No se pudo capturar el pago.");
          } finally {
            setLoading(false);
          }
        }}
        onError={(err) => {
          console.error(err);
          setLoading(false);
          alert("Ocurrió un error con PayPal.");
        }}
      />
      <p className="mt-2 small text-muted text-center">
        Total con promociones: {totalCLP.toLocaleString("es-CL")} CLP ≈ USD {totalUSD}
      </p>
      {(promo?.breakdown?.detalles || []).length > 0 && (
        <ul className="small text-muted mt-2 mb-0">
          {promo.breakdown.detalles.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
