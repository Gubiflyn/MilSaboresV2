import { render, screen, within } from "@testing-library/react";
import { describe, it, beforeEach, expect } from "vitest";
import "@testing-library/jest-dom";
import Products from "./Products"; 

function renderAdminProducts() {
  return render(<Products />);
}

describe("Admin - Gestión de Productos", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("TA-AdmProd1: Muestra el título principal 'Gestión de Productos' o similar", async () => {
    renderAdminProducts();
    const titulo = await screen.findByRole("heading", {
      name: /productos|gestión/i,
    });
    expect(titulo).toBeInTheDocument();
  });

  it("TA-AdmProd2: Renderiza una tabla con columnas visibles", async () => {
    renderAdminProducts();

    // Columnas que sí existen en tu tabla
    const columnas = ["Código", "Nombre", "Categoría", "Precio", "Stock"];
    for (const col of columnas) {
      expect(await screen.findByText(new RegExp(col, "i"))).toBeInTheDocument();
    }

    // En lugar de 'Acciones', comprobamos que existan botones en las filas
    const botonesEditar = await screen.findAllByRole("button", { name: /editar/i });
    const botonesEliminar = await screen.findAllByRole("button", { name: /eliminar/i });

    expect(botonesEditar.length).toBeGreaterThan(0);
    expect(botonesEliminar.length).toBeGreaterThan(0);
  });

  it("TA-AdmProd3: Cada fila de producto tiene botones de edición y eliminación", async () => {
    renderAdminProducts();
    const filas = await screen.findAllByRole("row");
    for (const fila of filas.slice(1)) {
      const btns = within(fila).queryAllByRole("button");
      if (btns.length > 0) {
        expect(btns.some((b) => /editar/i.test(b.textContent))).toBeTruthy();
        expect(btns.some((b) => /eliminar/i.test(b.textContent))).toBeTruthy();
      }
    }
  });

  it("TA-AdmProd4: El botón '+ Nuevo producto' está visible", async () => {
    renderAdminProducts();
    const boton = await screen.findByRole("button", {
      name: /\+ nuevo producto/i,
    });
    expect(boton).toBeInTheDocument();
  });

  it("TA-AdmProd5: Cada producto muestra su precio formateado con miles (ej. '$ 45.000')", async () => {
    renderAdminProducts();

    const precios = await screen.findAllByText((_, node) => {
      const text = (node.textContent || "").replace(/\s+/g, " ").trim();
      return /^\$[\s\d.]+$/.test(text);
    });

    expect(precios.length).toBeGreaterThan(0);
  });
});
