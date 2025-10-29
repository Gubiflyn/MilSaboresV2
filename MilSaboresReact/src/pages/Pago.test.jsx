import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Pago from "./Pago";

vi.mock("../context/CartContext", () => ({ useCart: vi.fn() }));
vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

describe("Pago", () => {
  beforeEach(() => vi.clearAllMocks());

  it("TPG-Pages 26: Muestra 'Tu carrito está vacío.' cuando no hay productos", () => {
    useCart.mockReturnValue({ carrito: [], clear: vi.fn() });
    useAuth.mockReturnValue({ isAuthenticated: true, user: { nombre: "Felipe" } });

    render(
      <MemoryRouter>
        <Pago />
      </MemoryRouter>
    );

    expect(screen.getByText(/tu carrito está vacío\./i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pagar ahora/i })).not.toBeInTheDocument();
  });

  it("TPG-Pages 27: Con items muestra Resumen y 'Total a pagar' con algún monto", () => {
    useCart.mockReturnValue({
      carrito: [{ id: 1, nombre: "Torta Chocolate", precio: 12000, cantidad: 1 }],
      clear: vi.fn(),
    });
    useAuth.mockReturnValue({ isAuthenticated: true, user: { nombre: "Felipe" } });

    render(
      <MemoryRouter>
        <Pago />
      </MemoryRouter>
    );

    expect(screen.getByText(/pago de tu compra/i)).toBeInTheDocument();
    expect(screen.getByText(/resumen/i)).toBeInTheDocument();
    expect(screen.getByText(/total a pagar/i)).toBeInTheDocument();

    const priceRegex = /\$\s*12[.\s,]?000/i;
    const prices = screen.getAllByText(priceRegex);
    expect(prices.length).toBeGreaterThan(0);
  });

  it("TPG-Pages 28: Si no está autenticado, igualmente renderiza la pantalla de pago con el formulario", () => {
    useCart.mockReturnValue({
      carrito: [{ id: 1, nombre: "Torta", precio: 12000, cantidad: 1 }],
      clear: vi.fn(),
    });
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter>
        <Pago />
      </MemoryRouter>
    );

    expect(screen.getByText(/pago/i)).toBeInTheDocument();
    expect(screen.getByText(/nombre en la tarjeta/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pagar ahora/i })).toBeInTheDocument();
  });
});
