import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import ProductEdit from "./ProductEdit";
import dataFallback from "../../data/tortas.json";

// Mock de AuthContext: admin autenticado
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isAdmin: true,
    user: { nombre: "Admin Test", rol: "admin" },
  }),
}));

// Helper para sembrar productos en localStorage
const seedProducts = (items) => {
  try {
    localStorage.setItem("PRODUCTS", JSON.stringify(items));
  } catch {}
};

beforeEach(() => {
  localStorage.clear();
});

describe("ProductEdit", () => {
  it("TAPE-Admin 26: Renderiza la vista de edición para un código existente", async () => {
    const sample = dataFallback[0];
    seedProducts(dataFallback);

    render(
      <MemoryRouter initialEntries={[`/admin/products/${sample.codigo}/edit`]}>
        <Routes>
          <Route path="/admin/products/:codigo/edit" element={<ProductEdit />} />
        </Routes>
      </MemoryRouter>
    );

    // Título
    const heading = await screen.findByText(/editar|editar producto/i);
    expect(heading).toBeInTheDocument();

    // Debe pre-cargar el nombre en algún input, aqui usamos el valor actual
    const nameInput = await screen.findByDisplayValue(new RegExp(sample.nombre, "i"));
    expect(nameInput).toBeInTheDocument();
  });

  it("TAPE-Admin 27: Precarga campos clave (nombre, precio, stock) con los valores del producto", async () => {
    const sample = dataFallback.find((p) => p?.nombre && p?.precio && p?.stock) || dataFallback[0];
    seedProducts(dataFallback);

    render(
      <MemoryRouter initialEntries={[`/admin/products/${sample.codigo}/edit`]}>
        <Routes>
          <Route path="/admin/products/:codigo/edit" element={<ProductEdit />} />
        </Routes>
      </MemoryRouter>
    );

    // Nombre del producto en input
    const nameInput = await screen.findByDisplayValue(new RegExp(sample.nombre, "i"));
    expect(nameInput).toBeInTheDocument();

    // Precio y stock 
    const priceInput = await screen.findByDisplayValue(new RegExp(String(sample.precio)));
    expect(priceInput).toBeInTheDocument();

    const stockInput = await screen.findByDisplayValue(new RegExp(String(sample.stock)));
    expect(stockInput).toBeInTheDocument();
  });

  it("TAPE-Admin 28: Permite editar el nombre del producto (cambio de valor en el input)", async () => {
    const sample = dataFallback[0];
    seedProducts(dataFallback);

    render(
      <MemoryRouter initialEntries={[`/admin/products/${sample.codigo}/edit`]}>
        <Routes>
          <Route path="/admin/products/:codigo/edit" element={<ProductEdit />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = await screen.findByDisplayValue(new RegExp(sample.nombre, "i"));
    expect(nameInput).toBeInTheDocument();

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Nuevo Nombre de Producto");

    // Confirma que el input refleja el nuevo valor
    expect(nameInput).toHaveValue("Nuevo Nombre de Producto");
  });

  it("TAPE-Admin 29: Si el código no existe, muestra 'Producto no encontrado'", async () => {
    seedProducts(dataFallback);

    render(
      <MemoryRouter initialEntries={[`/admin/products/ZZZ999/edit`]}>
        <Routes>
          <Route path="/admin/products/:codigo/edit" element={<ProductEdit />} />
        </Routes>
      </MemoryRouter>
    );

    const notFound = await screen.findByText(/producto no encontrado/i);
    expect(notFound).toBeInTheDocument();
  });
});
