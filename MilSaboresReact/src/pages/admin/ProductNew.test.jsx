import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import ProductNew from "./ProductNew";
import * as api from "../../services/api";

// ===== Mock APIs =====
vi.mock("../../services/api", () => ({
  createPastel: vi.fn(),
  getCategorias: vi.fn(),
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

const mockCategorias = [
  { id: 1, nombre: "Tortas", descripcion: "" },
  { id: 2, nombre: "Cupcakes", descripcion: "" },
];

describe("Admin - ProductNew", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getCategorias.mockResolvedValue(mockCategorias);
  });

  it("TAU-Admin 39: Muestra el formulario de creación de producto", async () => {
    render(
      <MemoryRouter>
        <ProductNew />
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Nuevo producto")
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Crear producto/i }))
      .toBeInTheDocument();
  });

  it("TAU-Admin 40: Crea un producto correctamente y redirige", async () => {
    api.createPastel.mockResolvedValueOnce({});

    const alertSpy = vi
        .spyOn(window, "alert")
        .mockImplementation(() => {});

    const { container } = render(
        <MemoryRouter>
        <ProductNew />
        </MemoryRouter>
    );

    const user = userEvent.setup();

    await screen.findByText("Nuevo producto");

    // Inputs por name (forma correcta aquí)
    await user.type(
        container.querySelector('input[name="codigo"]'),
        "PA-002"
    );

    await user.type(
        container.querySelector('input[name="nombre"]'),
        "Torta Nueva"
    );

    await user.selectOptions(
        container.querySelector('select[name="categoria"]'),
        "Tortas"
    );

    await user.clear(
        container.querySelector('input[name="precio"]')
    );
    await user.type(
        container.querySelector('input[name="precio"]'),
        "15000"
    );

    await user.clear(
        container.querySelector('input[name="stock"]')
    );
    await user.type(
        container.querySelector('input[name="stock"]'),
        "5"
    );

    await user.type(
        container.querySelector('input[name="imagen"]'),
        "http://test.com/img.jpg"
    );

    await user.type(
        container.querySelector('textarea[name="descripcion"]'),
        "Descripción de prueba"
    );

    await user.click(
        screen.getByRole("button", { name: /Crear producto/i })
    );

    expect(api.createPastel).toHaveBeenCalledOnce();
    expect(alertSpy).toHaveBeenCalledWith(
        "Producto creado correctamente."
    );
    expect(mockNavigate).toHaveBeenCalledWith(
        "/admin/productos"
    );

    alertSpy.mockRestore();
    });

  it("TAU-Admin 41: Muestra alerta si faltan campos obligatorios", async () => {
    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ProductNew />
      </MemoryRouter>
    );

    await screen.findByText("Nuevo producto");

    await userEvent.click(
      screen.getByRole("button", { name: /Crear producto/i })
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Código, nombre y categoría son obligatorios."
    );

    expect(api.createPastel).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
