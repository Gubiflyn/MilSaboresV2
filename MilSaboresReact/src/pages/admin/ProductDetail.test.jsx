import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import ProductDetail from "./ProductDetail";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  getPastelByCodigo: vi.fn(),
  getPasteles: vi.fn(),
}));

// ===== Mock navigate =====
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProduct = {
  id: 1,
  codigo: "PA-001",
  nombre: "Torta Chocolate",
  precio: 12000,
  stock: 3,
  activo: true,
  categoria: "Tortas",
  descripcion: "Torta clásica de chocolate",
  imagen: "http://test.com/img.jpg",
  createdAt: "2024-01-01",
  updatedAt: "2024-02-01",
};

describe("Admin - ProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TAU-Admin 29: Muestra estado de carga inicialmente", () => {
    api.getPastelByCodigo.mockResolvedValueOnce(mockProduct);

    render(
      <MemoryRouter initialEntries={["/admin/productos/PA-001"]}>
        <Routes>
          <Route
            path="/admin/productos/:codigo"
            element={<ProductDetail />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Cargando producto/i)
    ).toBeInTheDocument();
  });

  it("TAU-Admin 30: Muestra el detalle del producto cuando se encuentra por código", async () => {
    api.getPastelByCodigo.mockResolvedValueOnce(mockProduct);

    render(
        <MemoryRouter initialEntries={["/admin/productos/PA-001"]}>
        <Routes>
            <Route
            path="/admin/productos/:codigo"
            element={<ProductDetail />}
            />
        </Routes>
        </MemoryRouter>
    );

    expect(
        await screen.findByText("Torta Chocolate")
    ).toBeInTheDocument();

    expect(screen.getByText("ID: PA-001")).toBeInTheDocument();

    expect(
        screen.getAllByText("Tortas").length
    ).toBeGreaterThan(0);

    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Stock crítico")).toBeInTheDocument();

    expect(screen.getByText("$ 12.000")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(
        screen.getByText("Torta clásica de chocolate")
    ).toBeInTheDocument();
    });


  it("TAU-Admin 31: Usa fallback buscando en lista cuando no existe por código", async () => {
    api.getPastelByCodigo.mockRejectedValueOnce(
      new Error("No encontrado")
    );
    api.getPasteles.mockResolvedValueOnce([
      { ...mockProduct, codigo: "PA-001" },
    ]);

    render(
      <MemoryRouter initialEntries={["/admin/productos/PA-001"]}>
        <Routes>
          <Route
            path="/admin/productos/:codigo"
            element={<ProductDetail />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Torta Chocolate")
    ).toBeInTheDocument();

    expect(api.getPasteles).toHaveBeenCalledOnce();
  });

  it("TAU-Admin 32: Muestra mensaje de error si el producto no existe", async () => {
    api.getPastelByCodigo.mockRejectedValueOnce(
      new Error("No encontrado")
    );
    api.getPasteles.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/admin/productos/XXX"]}>
        <Routes>
          <Route
            path="/admin/productos/:codigo"
            element={<ProductDetail />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Producto no encontrado/i)
    ).toBeInTheDocument();

    await screen.findByRole("button", {
      name: /Volver al listado/i,
    });
  });

  it("TAU-Admin 33: Permite volver al listado de productos", async () => {
    api.getPastelByCodigo.mockResolvedValueOnce(mockProduct);

    render(
      <MemoryRouter initialEntries={["/admin/productos/PA-001"]}>
        <Routes>
          <Route
            path="/admin/productos/:codigo"
            element={<ProductDetail />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Torta Chocolate");

    await screen.getByRole("button", { name: /Volver/i }).click();

    expect(mockNavigate).toHaveBeenCalledWith(
      "/admin/productos"
    );
  });
});
