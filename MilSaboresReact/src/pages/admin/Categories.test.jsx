import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import Categories from "./Categories";
import * as api from "../../services/api";

// ===== Mock APIs =====
vi.mock("../../services/api", () => ({
  getCategorias: vi.fn(),
  createCategoria: vi.fn(),
  updateCategoria: vi.fn(),
  deleteCategoria: vi.fn(),
  getPasteles: vi.fn(),
}));

const mockCategorias = [
  { id: 1, nombre: "Tortas" },
  { id: 2, nombre: "Cupcakes" },
];

const mockProductos = [
  { id: 10, nombre: "Torta Chocolate", categoria: "Tortas" },
  { id: 11, nombre: "Cupcake Vainilla", categoria: "Cupcakes" },
  { id: 12, nombre: "Cupcake Chocolate", categoria: "Cupcakes" },
];

describe("Admin - Categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getCategorias.mockResolvedValue(mockCategorias);
    api.getPasteles.mockResolvedValue(mockProductos);
  });

  it("TAU-Admin 22: Muestra el listado de categorías con conteo de productos", async () => {
    render(<Categories />);

    // Esperar carga
    expect(
      await screen.findByText("Categorías")
    ).toBeInTheDocument();

    // Categorías ordenadas alfabéticamente
    expect(screen.getByText("Cupcakes")).toBeInTheDocument();
    expect(screen.getByText("Tortas")).toBeInTheDocument();

    // Conteo (Cupcakes = 2, Tortas = 1)
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("TAU-Admin 23: Permite crear una nueva categoría", async () => {
    api.createCategoria.mockResolvedValueOnce({
      id: 3,
      nombre: "Galletas",
    });

    render(<Categories />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /Nueva categoría/i })
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "Galletas");

    await user.click(
      screen.getByRole("button", { name: /Guardar/i })
    );

    expect(api.createCategoria).toHaveBeenCalledWith({
      nombre: "Galletas",
    });

    expect(await screen.findByText("Galletas")).toBeInTheDocument();
  });

  it("TAU-Admin 24: Valida que no se pueda crear una categoría vacía", async () => {
    render(<Categories />);

    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /Nueva categoría/i })
    );

    await user.click(
      screen.getByRole("button", { name: /Guardar/i })
    );

    expect(
      screen.getByText(/La categoría no puede estar vacía/i)
    ).toBeInTheDocument();

    expect(api.createCategoria).not.toHaveBeenCalled();
  });

  it("TAU-Admin 25: Permite editar una categoría existente", async () => {
    api.updateCategoria.mockResolvedValueOnce({
      id: 1,
      nombre: "Tortas Editadas",
    });

    render(<Categories />);

    const user = userEvent.setup();

    await screen.findByText("Tortas");

    await user.click(
      screen.getAllByRole("button", { name: /Editar/i })[0]
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Tortas Editadas");

    await user.click(
      screen.getByRole("button", { name: /Guardar/i })
    );

    expect(api.updateCategoria).toHaveBeenCalled();

    expect(
      await screen.findByText("Tortas Editadas")
    ).toBeInTheDocument();
  });

  it("TAU-Admin 26: Permite eliminar una categoría tras confirmación", async () => {
    api.deleteCategoria.mockResolvedValueOnce({});

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<Categories />);

    await screen.findByText("Cupcakes");

    // Buscar la fila de "Cupcakes" y eliminarla
    const filaCupcakes = screen.getByText("Cupcakes").closest("tr");
    await userEvent.click(
    filaCupcakes.querySelector('button.btn-outline-danger')
    );

    expect(api.deleteCategoria).toHaveBeenCalledWith(2);
  });

});
