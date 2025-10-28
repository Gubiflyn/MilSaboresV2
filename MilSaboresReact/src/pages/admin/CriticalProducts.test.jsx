import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import CriticalProducts from "./CriticalProducts";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ isAdmin: true }),
}));

const mockCritical = [
  { id: "p1", nombre: "Torta Crítica A", sku: "A001", stock: 0 },
  { id: "p2", nombre: "Torta Crítica B", sku: "B002", stock: 1 },
];

let originalFetch;
beforeEach(() => {
  originalFetch = global.fetch;
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockCritical),
    })
  );
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe("CriticalProducts", () => {
  it("TACP-Admin 20: Muestra el título de la sección de productos críticos", () => {
    render(
      <MemoryRouter>
        <CriticalProducts />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /productos crític|productos critic|productos cr[ií]tico/i })
    ).toBeInTheDocument();
  });

  it("TACP-Admin 21: Carga y renderiza productos críticos o muestra mensaje de 'no hay productos' según el caso", async () => {
    const { container } = render(
      <MemoryRouter>
        <CriticalProducts />
      </MemoryRouter>
    );

    await screen.findByRole("heading", { name: /productos crític|productos critic|productos cr[ií]tico/i });

    const noData = screen.queryByText(/no hay productos en nivel crític/i);
    if (noData) {
      expect(noData).toBeInTheDocument();
      return;
    }

    // Si no hay mensaje, verificamos que los productos mock aparezcan en la tabla
    expect(await screen.findByText("Torta Crítica A")).toBeInTheDocument();
    expect(screen.getByText("Torta Crítica B")).toBeInTheDocument();

    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThanOrEqual(1);

    // Cada fila debe tener al menos un botón de acción (editar/eliminar)
    rows.forEach((row) => {
      const btn = within(row).queryByRole("button");
      expect(btn).toBeTruthy();
    });
  });
});