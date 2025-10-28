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

describe("Página Productos", () => {
  // Test 1: Carga inicial de productos
  it("Muestra productos correctamente al cargar la página", async () => {
    renderPage();
    expect(
      await screen.findByText("Torta Cuadrada de Chocolate")
    ).toBeInTheDocument();
    expect(screen.getByText("Torta Cuadrada de Frutas")).toBeInTheDocument();
  });

  // Test 2: Navegación al detalle
  it("Redirecciona correctamente al hacer click en una torta", async () => {
    renderPage();
    const linkTorta = await screen.findByRole("link", {
      name: "Torta Cuadrada de Chocolate",
    });
    expect(linkTorta).toHaveAttribute("href", "/detalle/TC001");
  });

  // Test 3: Funcionalidad del botón agregar al carrito
  it("Botón 'Agregar al carrito' está presente y visible", async () => {
    renderPage();
    const tituloTorta = await screen.findByText("Torta Cuadrada de Chocolate");
    const cardTorta = tituloTorta.closest(".card") || tituloTorta.closest("*");
    
    const botonAgregar = within(cardTorta).getByRole("button", {
      name: /agregar al carrito/i,
    });
    expect(botonAgregar).toBeVisible();
  });

  // Test 4: Filtrado de categorías
  it("Filtra productos correctamente por categoría", async () => {
    renderPage();
    const user = userEvent.setup();

    // Verificar producto inicial
    const productoInicial = await screen.findByRole("link", {
      name: "Torta Cuadrada de Chocolate",
    });
    expect(productoInicial).toBeInTheDocument();

    // Filtrar por categoría
    const select = screen.getByLabelText(/filtrar por categor/i);
    await user.selectOptions(select, "Productos Vegana");

    // Verificar que aparece el producto filtrado
    expect(
      await screen.findByRole("link", { name: "Torta Vegana de Chocolate" })
    ).toBeInTheDocument();
  });

  // Test 5: Verificación de precios
  it("Muestra precios en formato correcto (CLP)", async () => {
    renderPage();
    const tituloTorta = await screen.findByText("Torta Cuadrada de Chocolate");
    const cardTorta = tituloTorta.closest(".card") || tituloTorta.closest("*");
    
    expect(
      within(cardTorta).getByText(/\$?\s*45\.000\s*CLP/i)
    ).toBeInTheDocument();
  });
});