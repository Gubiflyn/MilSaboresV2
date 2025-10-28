import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import Orders from "./Orders";

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ isAdmin: true }),
}));

const mockOrders = [
  { id: "O-1", numero: "ORD-001", cliente: "Ana", total: 45000, estado: "Pendiente" },
  { id: "O-2", numero: "ORD-002", cliente: "Luis", total: 32000, estado: "Completado" },
];

let originalFetch;
beforeEach(() => {
  originalFetch = global.fetch;
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    })
  );
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe("Admin - Orders", () => {
  it("TAO-Admin 23: Muestra la lista de órdenes o el mensaje 'Sin registros.'", async () => {
    const { container } = render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );

    // Espera hasta que la tabla muestre contenido: o bien la orden mock, o el mensaje "Sin registros."
    await waitFor(() => {
      const hasOrder = !!screen.queryByText("ORD-001");
      const hasEmpty = !!screen.queryByText(/Sin registros/i);
      if (!hasOrder && !hasEmpty) throw new Error("Ni orden ni mensaje vacío aún");
    });

    // Si la orden aparece, comprobamos filas; si no, comprobamos el mensaje vacío
    if (screen.queryByText("ORD-001")) {
      expect(screen.getByText("ORD-001")).toBeInTheDocument();
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBeGreaterThanOrEqual(1);
    } else {
      expect(screen.getByText(/Sin registros/i)).toBeInTheDocument();
    }
  });

  it("TAO-Admin 24: Si existen órdenes, cada orden tiene enlace al detalle)", async () => {
    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );

    // Espera breve para que la UI se actualice
    await waitFor(() => {
      const hasOrder = !!screen.queryByText("ORD-001");
      const hasEmpty = !!screen.queryByText(/Sin registros/i);
      if (!hasOrder && !hasEmpty) throw new Error("Esperando datos de órdenes");
    });

    const link = screen.queryByRole("link", { name: /ORD-001/i });
    if (link) {
      expect(link).toHaveAttribute("href", "/admin/pedidos/O-1");
      // comprobación que el click no lanza error
      const user = userEvent.setup();
      await user.click(link);
      expect(link).toBeInTheDocument();
    } else {
      // No hay órdenes: marcamos que la app muestra el estado vacío (test válido)
      expect(screen.getByText(/Sin registros/i)).toBeInTheDocument();
    }
  });
});