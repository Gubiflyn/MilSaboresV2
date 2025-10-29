import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";
import Carrito from "./Carrito";

let authState;
let cartState;

vi.mock("../context/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("../context/CartContext", () => ({
  useCart: () => cartState,
}));

beforeEach(() => {
  localStorage.clear();
  authState = {
    isAuthenticated: true,
    isAdmin: false,
    user: { nombre: "Felipe Delgado", email: "felipe@example.com", rol: "user" },
  };
  cartState = {
    carrito: [
      { codigo: "TC001", nombre: "Torta Chocolate", precio: 15000, cantidad: 2 },
      { codigo: "TK002", nombre: "Kuchen Manzana", precio: 9990, cantidad: 1 },
    ],
    removeFromCart: vi.fn(),
    clear: vi.fn(),
    updateQuantity: vi.fn(),
  };
});

const renderCarrito = () =>
  render(
    <MemoryRouter initialEntries={["/carrito"]}>
      <Routes>
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/pago" element={<div>Pantalla de pago</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("Carrito", () => {
  it("TC-Pages 7: Renderiza el título exacto del carrito", async () => {
    renderCarrito();
    const heading = await screen.findByRole("heading", {
      name: /carrito de compras/i,
      level: 2,
    });
    expect(heading).toBeInTheDocument();
  });

  it("TC-Pages 8: Muestra los productos con sus cantidades (en inputs)", async () => {
    renderCarrito();
    expect(await screen.findByText(/torta chocolate/i)).toBeInTheDocument();
    expect(await screen.findByText(/kuchen manzana/i)).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByDisplayValue("1").length).toBeGreaterThanOrEqual(1);
  });

  it("TC-Pages 9: Calcula y muestra el total en CLP", async () => {
    renderCarrito();
    const totalLike = await screen.findByText(/total:\s*\$?\s*39\.?990/i);
    expect(totalLike).toBeInTheDocument();
  });

  it("TC-Pages 10: Muestra el botón 'Ir al pago'", async () => {
    renderCarrito();
    const payBtn = await screen.findByRole("button", { name: /ir al pago/i });
    expect(payBtn).toBeInTheDocument();
    await userEvent.click(payBtn); 
  });
});
