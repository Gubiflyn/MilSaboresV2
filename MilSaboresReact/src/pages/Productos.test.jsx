import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom";

import { CartProvider } from "../context/CartContext";
import Productos from "./Productos";

function renderPage() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <Productos />
      </CartProvider>
    </MemoryRouter>
  );
}

describe("Productos", () => {
  it("TPTS-Pages 28: Muestra productos correctamente al cargar la página", async () => {
    renderPage();
    expect(
      await screen.findByText("Torta Cuadrada de Chocolate")
    ).toBeInTheDocument();
    expect(screen.getByText("Torta Cuadrada de Frutas")).toBeInTheDocument();
  });

  it("TPTS-Pages 29: Redirecciona correctamente al hacer click en una torta", async () => {
    renderPage();
    const linkTorta = await screen.findByRole("link", {
      name: "Torta Cuadrada de Chocolate",
    });
    expect(linkTorta).toHaveAttribute("href", "/detalle/TC001");
  });

  it("TPTS-Pages 30: Botón 'Agregar al carrito' está presente y visible", async () => {
    renderPage();
    const tituloTorta = await screen.findByText("Torta Cuadrada de Chocolate");
    const cardTorta = tituloTorta.closest(".card") || tituloTorta.closest("*");
    
    const botonAgregar = within(cardTorta).getByRole("button", {
      name: /agregar al carrito/i,
    });
    expect(botonAgregar).toBeVisible();
  });

  it("TPTS-Pages 31: Filtra productos correctamente por categoría", async () => {
    renderPage();
    const user = userEvent.setup();

    const productoInicial = await screen.findByRole("link", {
      name: "Torta Cuadrada de Chocolate",
    });
    expect(productoInicial).toBeInTheDocument();

    const select = screen.getByLabelText(/filtrar por categor/i);
    await user.selectOptions(select, "Productos Vegana");

    expect(
      await screen.findByRole("link", { name: "Torta Vegana de Chocolate" })
    ).toBeInTheDocument();
  });

  it("TPTS-Pages 32: Muestra precios en formato correcto (CLP)", async () => {
    renderPage();
    const tituloTorta = await screen.findByText("Torta Cuadrada de Chocolate");
    const cardTorta = tituloTorta.closest(".card") || tituloTorta.closest("*");
    
    expect(
      within(cardTorta).getByText(/\$?\s*45\.000\s*CLP/i)
    ).toBeInTheDocument();
  });
});