import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";

const mockAdd = vi.fn();
vi.mock("../context/CartContext", () => ({
  useCart: () => ({ add: mockAdd }),
}));
vi.mock("../../context/CartContext", () => ({
  useCart: () => ({ add: mockAdd }),
}));

vi.mock("../utils/publicUrl", () => ({ publicUrl: (p) => p }));

vi.mock("../data/tortas.json", () => ({
  default: [
    {
      codigo: "T001",
      nombre: "Torta de Chocolate",
      precio: 12000,
      categoria: "Tortas",
      descripcion: "Deliciosa torta de chocolate.",
      imagen: "/img/torta.jpg",
    },
  ],
}));

import Detalle from "./Detalle";

describe("Detalle", () => {
  beforeEach(() => {
    mockAdd.mockClear();
  });

  it("TDLL-Pages 21: Muestra el nombre y permite 'Agregar al carrito' cuando el producto existe", async () => {
    render(
      <MemoryRouter initialEntries={["/detalle/T001"]}>
        <Routes>
          <Route path="/detalle/:codigo" element={<Detalle />} />
        </Routes>
      </MemoryRouter>
    );

    const headings = await screen.findAllByRole("heading", {
      name: /torta de chocolate/i,
    });
    expect(headings.length).toBeGreaterThan(0);

    const btn = screen.getByRole("button", { name: /agregar al carrito/i });
    fireEvent.click(btn);

    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd.mock.calls[0][0]).toMatchObject({ codigo: "T001" });
  });

  it("TDLL-Pages 22: Muestra 'Producto no encontrado' si el código no existe", async () => {
    render(
      <MemoryRouter initialEntries={["/detalle/NO-EXISTE"]}>
        <Routes>
          <Route path="/detalle/:codigo" element={<Detalle />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/producto no encontrado/i)
    ).toBeInTheDocument();
  });
});
