import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ add: vi.fn() }),
}));

vi.mock("bootstrap", () => ({
  Toast: { getOrCreateInstance: () => ({ show: vi.fn() }) },
  Modal: { getOrCreateInstance: () => ({ show: vi.fn() }) },
}));

import Productos from "../Productos";

describe("Productos", () => {
  beforeEach(() => localStorage.clear());

  it("TAPTS-Admin 34: render básico con seed", async () => {
    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Nuestros Pasteles/i)).toBeInTheDocument();
    const addButtons = await screen.findAllByRole("button", { name: /Agregar al carrito/i });
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("TAPTS-Admin 34: filtra por 'Tortas Circulares'", async () => {
    localStorage.setItem(
      "tortas_v3",
      JSON.stringify([
        { codigo: "CIR-1", categoria: "Tortas Circulares", nombre: "Circular 1", precio: 10000, imagen: "/img/c1.jpg", descripcion: "A", stock: 5 },
        { codigo: "CIR-2", categoria: "Tortas Circulares", nombre: "Circular 2", precio: 12000, imagen: "/img/c2.jpg", descripcion: "B", stock: 3 },
        { codigo: "TRA-1", categoria: "Pastelería Tradicional", nombre: "Tradicional 1", precio: 8000, imagen: "/img/t1.jpg", descripcion: "C", stock: 2 },
      ])
    );

    render(
      <MemoryRouter>
        <Productos />
      </MemoryRouter>
    );

    const select = await screen.findByLabelText(/Filtrar por Categoría/i);
    fireEvent.change(select, { target: { value: "Tortas Circulares" } });

    const addButtons = await screen.findAllByRole("button", { name: /Agregar al carrito/i });
    expect(addButtons).toHaveLength(2);
    expect(screen.queryByText(/Tradicional 1/i)).toBeNull();
  });
});
