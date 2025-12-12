import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import ProductEdit from "./ProductEdit";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  getPastelByCodigo: vi.fn(),
  getPasteles: vi.fn(),
  updatePastel: vi.fn(),
  deletePastel: vi.fn(),
  getCategorias: vi.fn(),
}));

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
};

const mockCategorias = [
  { id: 1, nombre: "Tortas" },
  { id: 2, nombre: "Cupcakes" },
];

describe("Admin - ProductEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getPastelByCodigo.mockResolvedValue(mockProduct);
    api.getCategorias.mockResolvedValue(mockCategorias);
  });

  it("TAU-Admin 34: Muestra estado de carga inicialmente", () => {
    render(
      <MemoryRouter initialEntries={["/admin/productos/PA-001/editar"]}>
        <Routes>
          <Route
            path="/admin/productos/:code/editar"
            element={<ProductEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Cargando datos/i)
    ).toBeInTheDocument();
  });

  it("TAU-Admin 35: Carga los datos del producto en el formulario", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/productos/PA-001/editar"]}>
        <Routes>
          <Route
            path="/admin/productos/:code/editar"
            element={<ProductEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByDisplayValue("PA-001")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Torta Chocolate")
    ).toBeInTheDocument();

    expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12000")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Tortas")).toBeInTheDocument();
  });

  it("TAU-Admin 36: Permite actualizar el producto y redirige", async () => {
    api.updatePastel.mockResolvedValueOnce({});

    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/admin/productos/PA-001/editar"]}>
        <Routes>
          <Route
            path="/admin/productos/:code/editar"
            element={<ProductEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();

    const nombreInput = await screen.findByDisplayValue(
      "Torta Chocolate"
    );

    await user.clear(nombreInput);
    await user.type(nombreInput, "Torta Editada");

    await user.click(
      screen.getByRole("button", { name: /Guardar cambios/i })
    );

    expect(api.updatePastel).toHaveBeenCalledOnce();
    expect(alertSpy).toHaveBeenCalledWith(
      "Producto actualizado correctamente."
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      "/admin/productos/PA-001"
    );

    alertSpy.mockRestore();
  });

  it("TAU-Admin 37: Permite eliminar el producto tras confirmación", async () => {
    api.deletePastel.mockResolvedValueOnce({});

    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/admin/productos/PA-001/editar"]}>
        <Routes>
          <Route
            path="/admin/productos/:code/editar"
            element={<ProductEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByDisplayValue("PA-001");

    await userEvent.click(
      screen.getByRole("button", { name: /Eliminar/i })
    );

    expect(api.deletePastel).toHaveBeenCalledWith(1);
    expect(alertSpy).toHaveBeenCalledWith("Producto eliminado.");
    expect(mockNavigate).toHaveBeenCalledWith("/admin/productos");

    alertSpy.mockRestore();
  });

  it("TAU-Admin 38: Muestra error si el producto no existe", async () => {
    api.getPastelByCodigo.mockRejectedValueOnce(
      new Error("No encontrado")
    );
    api.getPasteles.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/admin/productos/XXX/editar"]}>
        <Routes>
          <Route
            path="/admin/productos/:code/editar"
            element={<ProductEdit />}
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
});
