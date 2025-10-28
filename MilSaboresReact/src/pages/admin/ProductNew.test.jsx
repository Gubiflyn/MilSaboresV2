import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";
import ProductNew from "./ProductNew";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isAdmin: true,
    user: { nombre: "Admin Test", rol: "admin" },
  }),
}));

beforeEach(() => {
  localStorage.clear();
});

describe("ProductNew", () => {
  it("TAPN-Admin 30: Renderiza la vista de nuevo producto y muestra los campos principales", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/products/new"]}>
        <Routes>
          <Route path="/admin/products/new" element={<ProductNew />} />
        </Routes>
      </MemoryRouter>
    );

    // Título tolerante 
    const title =
      (await screen.findByText(/nuevo producto|agregar producto|crear producto/i)) ||
      (await screen.findByText(/product new|add product/i));
    expect(title).toBeInTheDocument();

    // Campos principales: nombre = (text), precio/stock = (number)
    const nameInput =
      screen.queryByRole("textbox", { name: /nombre/i }) ||
      screen.getAllByRole("textbox")[0];
    const numberInputs = screen.getAllByRole("spinbutton");

    expect(nameInput).toBeInTheDocument();
    expect(numberInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("TAPN-Admin 31: Permite escribir nombre, precio y stock antes de guardar", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/products/new"]}>
        <Routes>
          <Route path="/admin/products/new" element={<ProductNew />} />
        </Routes>
      </MemoryRouter>
    );

    // Nombre
    const nameInput =
      screen.queryByRole("textbox", { name: /nombre/i }) ||
      screen.getAllByRole("textbox")[0];

    // Precio/Stock
    const numberInputs = screen.getAllByRole("spinbutton");
    const priceInput =
      numberInputs.find((el) => /precio/i.test(el.getAttribute("aria-label") || "")) ||
      numberInputs[0];
    const stockInput =
      numberInputs.find((el) => /stock/i.test(el.getAttribute("aria-label") || "")) ||
      numberInputs[numberInputs.length - 1];

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Torta Tres Leches");
    expect(nameInput).toHaveValue("Torta Tres Leches");

    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, "15990");
    expect(priceInput).toHaveValue(15990);

    await userEvent.clear(stockInput);
    await userEvent.type(stockInput, "8");
    expect(stockInput).toHaveValue(8);
  });

  it("TAPN-Admin 32: Muestra mensaje de info sobre localStorage en la página", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/products/new"]}>
        <Routes>
          <Route path="/admin/products/new" element={<ProductNew />} />
        </Routes>
      </MemoryRouter>
    );

    const infoMessage = await screen.findByText(/localstorage/i);
    expect(infoMessage).toBeInTheDocument();
  });

  it("TAPN-Admin 33: Muestra enlaces de navegación 'Volver' y 'Críticos'", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/products/new"]}>
        <Routes>
          <Route path="/admin/products/new" element={<ProductNew />} />
        </Routes>
      </MemoryRouter>
    );

    const backLink = await screen.findByRole("link", { name: /volver/i });
    const criticalsLink = await screen.findByRole("link", { name: /críticos/i });

    expect(backLink).toBeInTheDocument();
    expect(criticalsLink).toBeInTheDocument();
  });
});
