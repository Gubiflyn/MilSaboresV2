import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const initialOptions = {
  "client-id": "Aev3dQRh1fK6jdMKqkrkXQkwqIiiX8h5Du5Orqc4y5GmMwBKuY46bL71n2kSAIIph4DuBz4gHrLF0PK6",
  currency: "USD",
  intent: "capture",
  components: "buttons", 
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PayPalScriptProvider options={initialOptions}>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </PayPalScriptProvider>
    </BrowserRouter>
  </StrictMode>
);
