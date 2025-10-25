// src/pages/Productos.test.jsx
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

// Si tu página usa toasts/modals por id, creamos contenedores (no es mock)
function injectPortals() {
  const toast = document.createElement("div");
  toast.id = "toastAgregado";
  document.body.appendChild(toast);

  const modal = document.createElement("div");
  modal.id = "carritoModal";
  document.body.appendChild(modal);
}

describe("Página Productos", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    injectPortals();
  });

  it("TP-Prod1: Muestra las cards iniciales (Chocolate y Frutas visibles)", async () => {
    renderPage();

    expect(
      await screen.findByText("Torta Cuadrada de Chocolate")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Torta Cuadrada de Frutas")
    ).toBeInTheDocument();
  });

  it("TP-Prod2: Cada card tiene link al detalle con /detalle/:codigo", async () => {
    renderPage();

    const linkChoc = await screen.findByRole("link", {
      name: "Torta Cuadrada de Chocolate",
    });
    expect(linkChoc).toHaveAttribute("href", "/detalle/TC001");

    const linkFrut = screen.getByRole("link", {
      name: "Torta Cuadrada de Frutas",
    });
    expect(linkFrut).toHaveAttribute("href", "/detalle/TC002");
  });

  it('TP-Prod3: Cada una de estas 2 cards tiene su botón "Agregar al carrito"', async () => {
    renderPage();

    // Card Chocolate
    const tituloChoc = await screen.findByText("Torta Cuadrada de Chocolate");
    const cardChoc = tituloChoc.closest(".card") || tituloChoc.closest("*");
    if (!cardChoc)
      throw new Error("No se encontró el contenedor de la card de Chocolate");
    const btnChoc = within(cardChoc).getByRole("button", {
      name: /agregar al carrito/i,
    });
    expect(btnChoc).toBeInTheDocument();

    // Card Frutas
    const tituloFrut = screen.getByText("Torta Cuadrada de Frutas");
    const cardFrut = tituloFrut.closest(".card") || tituloFrut.closest("*");
    if (!cardFrut)
      throw new Error("No se encontró el contenedor de la card de Frutas");
    const btnFrut = within(cardFrut).getByRole("button", {
      name: /agregar al carrito/i,
    });
    expect(btnFrut).toBeInTheDocument();
  });

  it("TP-Prod4: Filtrar por categoría (Tortas Cuadradas) mantiene las dos 'Cuadradas' y oculta otras", async () => {
    renderPage();
    const user = userEvent.setup();

    // Verificamos que existe un producto de otra categoría al inicio
    const otroProducto = await screen.findByRole("link", {
      name: "Mousse de Chocolate",
    });
    expect(otroProducto).toBeInTheDocument();

    // Filtramos por 'Tortas Cuadradas'
    const select = screen.getByLabelText(/filtrar por categor/i);
    await user.selectOptions(select, "Tortas Cuadradas");

    // Siguen las dos cuadradas…
    expect(
      screen.getByText("Torta Cuadrada de Chocolate")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Torta Cuadrada de Frutas")
    ).toBeInTheDocument();

    // …y se oculta una que no es de esa categoría
    expect(
      screen.queryByRole("link", { name: "Mousse de Chocolate" })
    ).not.toBeInTheDocument();
  });

  // ===================== NUEVOS TESTS =====================

  it("TP-Prod5: Existe el título principal 'Nuestros Pasteles' como heading", () => {
    renderPage();
    const h2 = screen.getByRole("heading", {
      level: 2,
      name: /nuestros pasteles/i,
    });
    expect(h2).toBeInTheDocument();
  });

  it("TP-Prod6: El select de categorías existe y tiene opciones esperadas", () => {
    renderPage();
    const select = screen.getByLabelText(/filtrar por categor/i);
    expect(select).toBeInTheDocument();

    // Presencia de opciones clave
    expect(screen.getByRole("option", { name: "Todas" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Tortas Cuadradas" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Productos Vegana" })
    ).toBeInTheDocument();
  });

  it("TP-Prod7: El select cambia de valor cuando el usuario selecciona otra categoría", async () => {
    renderPage();
    const user = userEvent.setup();

    const select = screen.getByLabelText(/filtrar por categor/i);
    await user.selectOptions(select, "Productos Vegana");

    // Verificamos que quedó seleccionada
    const opt = screen.getByRole("option", { name: "Productos Vegana" });
    expect(opt.selected).toBe(true);
  });

  it("TP-Prod8: Al filtrar por 'Productos Vegana' aparece 'Torta Vegana de Chocolate'", async () => {
    renderPage();
    const user = userEvent.setup();

    const select = screen.getByLabelText(/filtrar por categor/i);
    await user.selectOptions(select, "Productos Vegana");

    expect(
      await screen.findByRole("link", { name: "Torta Vegana de Chocolate" })
    ).toBeInTheDocument();
  });

  it("TP-Prod9: Al volver a 'Todas' reaparecen productos de otras categorías (p.ej., Chocolate)", async () => {
    renderPage();
    const user = userEvent.setup();

    const select = screen.getByLabelText(/filtrar por categor/i);
    await user.selectOptions(select, "Productos Vegana");
    await user.selectOptions(select, "Todas");

    // Debe volver a estar visible una card de otra categoría
    expect(
      await screen.findByRole("link", { name: "Torta Cuadrada de Chocolate" })
    ).toBeInTheDocument();
  });

  it("TP-Prod10: Cada card muestra su imagen con alt correcto", async () => {
    renderPage();

    const imgChoc = await screen.findByRole("img", {
      name: "Torta Cuadrada de Chocolate",
    });
    expect(imgChoc).toBeInTheDocument();

    const imgFrut = screen.getByRole("img", {
      name: "Torta Cuadrada de Frutas",
    });
    expect(imgFrut).toBeInTheDocument();
  });

  it("TP-Prod11: Cada card muestra el precio en formato CLP (puntos de miles y 'CLP')", async () => {
    renderPage();

    // Card Chocolate (45.000 CLP)
    const tituloChoc = await screen.findByText("Torta Cuadrada de Chocolate");
    const cardChoc = tituloChoc.closest(".card") || tituloChoc.closest("*");
    if (!cardChoc) throw new Error("No se encontró la card de Chocolate");
    expect(
      within(cardChoc).getByText(/\$?\s*45\.000\s*CLP/i)
    ).toBeInTheDocument();

    // Card Frutas (50.000 CLP)
    const tituloFrut = screen.getByText("Torta Cuadrada de Frutas");
    const cardFrut = tituloFrut.closest(".card") || tituloFrut.closest("*");
    if (!cardFrut) throw new Error("No se encontró la card de Frutas");
    expect(
      within(cardFrut).getByText(/\$?\s*50\.000\s*CLP/i)
    ).toBeInTheDocument();
  });

  it('TP-Prod12: El botón "Agregar al carrito" está visible y con nombre accesible correcto en cada card probada', async () => {
    renderPage();

    // Chocolate
    const tituloChoc = await screen.findByText("Torta Cuadrada de Chocolate");
    const cardChoc = tituloChoc.closest(".card") || tituloChoc.closest("*");
    if (!cardChoc) throw new Error("No se encontró la card de Chocolate");
    const btnChoc = within(cardChoc).getByRole("button", {
      name: /agregar al carrito/i,
    });
    expect(btnChoc).toBeVisible();

    // Frutas
    const tituloFrut = screen.getByText("Torta Cuadrada de Frutas");
    const cardFrut = tituloFrut.closest(".card") || tituloFrut.closest("*");
    if (!cardFrut) throw new Error("No se encontró la card de Frutas");
    const btnFrut = within(cardFrut).getByRole("button", {
      name: /agregar al carrito/i,
    });
    expect(btnFrut).toBeVisible();
  });
});
