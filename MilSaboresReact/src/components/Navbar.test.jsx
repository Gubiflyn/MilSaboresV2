import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "admin@milsabores.cl" },
    isAuthenticated: true,
    isAdmin: true,
    logout: vi.fn(),
  }),
}));

vi.mock("../context/CartContext", () => ({
  useCart: () => ({
    carrito: [
      { codigo: "T1", nombre: "Torta Chocolate", precio: 45000, cantidad: 1 },
    ],
  }),
}));

describe("Navbar", () => {
  it("TNB-16: Muestra el logo o nombre 'Mil Sabores' en el Navbar", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const brand =
      screen.queryByAltText(/mil sabores/i) ||
      screen.queryByText(/mil sabores/i);
    expect(brand).toBeInTheDocument();
  });

  it("TNB-17: Muestra los enlaces de navegación principales", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);

    const algunoPrincipal = links.some((a) =>
      /inicio|productos|carrito|ofertas|admin/i.test(a.textContent || "")
    );
    expect(algunoPrincipal).toBe(true);
  });
});

