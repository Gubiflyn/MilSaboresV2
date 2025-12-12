import { render, screen } from "@testing-library/react";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import AdminBoletas from "./AdminBoletas";
import * as api from "../../services/api";

// ===== Mock API =====
vi.mock("../../services/api", () => ({
  getBoletas: vi.fn(),
}));

const mockBoletas = [
  {
    id: 1,
    fechaEmision: "2024-01-10T10:00:00Z",
    total: 15000,
    nombreUsuario: "Juan Pérez",
  },
  {
    id: 2,
    fechaEmision: "2024-02-05T12:30:00Z",
    total: 8000,
    nombreUsuario: "María López",
  },
];

describe("Admin - AdminBoletas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TAU-Admin 18: Muestra el estado de carga inicialmente", () => {
    api.getBoletas.mockResolvedValueOnce(mockBoletas);

    render(<AdminBoletas />);

    expect(
      screen.getByText(/Cargando boletas/i)
    ).toBeInTheDocument();
  });

  it("TAU-Admin 19: Muestra la tabla de boletas y el total", async () => {
    api.getBoletas.mockResolvedValueOnce(mockBoletas);

    render(<AdminBoletas />);

    // Esperar estado final
    expect(
      await screen.findByText("Boletas")
    ).toBeInTheDocument();

    // Badge total
    expect(screen.getByText(/Total:\s*2/i)).toBeInTheDocument();

    // IDs
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Clientes
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("María López")).toBeInTheDocument();

    // Totales (formato CL)
    expect(screen.getByText("$15.000")).toBeInTheDocument();
    expect(screen.getByText("$8.000")).toBeInTheDocument();
  });

  it("TAU-Admin 20: Muestra mensaje si no hay boletas", async () => {
    api.getBoletas.mockResolvedValueOnce([]);

    render(<AdminBoletas />);

    expect(
      await screen.findByText(/No hay boletas registradas/i)
    ).toBeInTheDocument();
  });

  it("TAU-Admin 21: Muestra mensaje de error si la API falla", async () => {
    api.getBoletas.mockRejectedValueOnce(
      new Error("Error de servidor")
    );

    render(<AdminBoletas />);

    expect(
      await screen.findByText(/Error:/i)
    ).toBeInTheDocument();
  });
});
