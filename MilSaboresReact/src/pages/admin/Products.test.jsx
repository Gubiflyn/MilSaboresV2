import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import Products from "./Products";
import * as api from "../../services/api";

// ===== Mocks =====
vi.mock("../../services/api", () => ({
  getPasteles: vi.fn(),
  createPastel: vi.fn(),
  updatePastel: vi.fn(),
  deletePastel: vi.fn(),
  getCategorias: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { rol: "ADMIN" },
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockPasteles = [
  {
    id: 1,
    codigo: "PA-001",
    nombre: "Torta Chocolate",
    categoria: "Tortas",
    precio: 12000,
    stock: 3,
  },
  {
    id: 2,
    codigo: "PA-002",
    nombre: "Cupcake Vainilla",
    categoria: "Cupcakes",
    precio: 3000,
    stock: 10,
  },
];

const mockCategorias = [
  { id: 1, nombre: "Tortas", descripcion: "" },
  { id: 2, nombre: "Cupcakes", descripcion: "" },
];

describe("Admin - Products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getPasteles.mockResolvedValue(mockPasteles);
    api.getCategorias.mockResolvedValue(mockCategorias);
  });

  it("TAU-Admin 42: Muestra el listado de productos", async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    expect(await screen.findByText("Torta Chocolate")).toBeInTheDocument();
    expect(screen.getByText("Cupcake Vainilla")).toBeInTheDocument();
    expect(screen.getByText("$ 12.000")).toBeInTheDocument();
    expect(screen.getByText("$ 3.000")).toBeInTheDocument();
  });

  it("TAU-Admin 43: Filtra productos por búsqueda", async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText("Torta Chocolate");

    const searchInput = screen.getByPlaceholderText(
      /Buscar por código, nombre o categoría/i
    );

    await userEvent.type(searchInput, "cupcake");

    expect(screen.queryByText("Torta Chocolate")).not.toBeInTheDocument();
    expect(screen.getByText("Cupcake Vainilla")).toBeInTheDocument();
  });

  it("TAU-Admin 44: Abre el formulario para crear un nuevo producto", async () => {
    render(
        <MemoryRouter>
        <Products />
        </MemoryRouter>
    );

    await screen.findByText("Torta Chocolate");

    await userEvent.click(
        screen.getByRole("button", { name: /^Nuevo producto$/i })
    );

    expect(
        screen.getByRole("button", { name: /^Guardar$/i })
    ).toBeInTheDocument();

    expect(
        screen.getByRole("button", { name: /^Cancelar$/i })
    ).toBeInTheDocument();
    });



  it("TAU-Admin 45: Permite eliminar un producto tras confirmación", async () => {
    api.deletePastel.mockResolvedValueOnce({});

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText("Torta Chocolate");

    const fila = screen
      .getByText("Torta Chocolate")
      .closest("tr");

    await userEvent.click(
      within(fila).getByRole("button", { name: /Eliminar/i })
    );

    expect(api.deletePastel).toHaveBeenCalledWith(1);
  });

  it("TAU-Admin 46: Navega al detalle del producto al presionar Ver", async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await screen.findByText("Torta Chocolate");

    const fila = screen
      .getByText("Torta Chocolate")
      .closest("tr");

    await userEvent.click(
      within(fila).getByRole("button", { name: /Ver/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/admin/productos/PA-001"
    );
  });
});
