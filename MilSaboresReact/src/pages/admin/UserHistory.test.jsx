import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import UserHistory from "./UserHistory";
import * as api from "../../services/api";

// ===== Mock APIs =====
vi.mock("../../services/api", () => ({
  getUsuarioByCorreo: vi.fn(),
  getBoletasByUsuarioId: vi.fn(),
}));

const mockUser = {
  id: 1,
  nombre: "Juan Pérez",
  correo: "juan@test.com",
};

const mockOrders = [
  {
    id: 10,
    fechaEmision: "2024-01-10T10:00:00Z",
    total: 12000,
  },
  {
    id: 11,
    fechaEmision: "2024-02-15T12:30:00Z",
    total: 8000,
  },
];

describe("Admin - UserHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TAU-Admin 09: Muestra el estado de carga inicialmente", () => {
    api.getUsuarioByCorreo.mockResolvedValueOnce(mockUser);
    api.getBoletasByUsuarioId.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com/historial"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/historial"
            element={<UserHistory />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Cargando historial/i)
    ).toBeInTheDocument();
  });

  it("TAU-Admin 10: Muestra el historial de compras y el total gastado", async () => {
    api.getUsuarioByCorreo.mockResolvedValueOnce(mockUser);
    api.getBoletasByUsuarioId.mockResolvedValueOnce(mockOrders);

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com/historial"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/historial"
            element={<UserHistory />}
          />
        </Routes>
      </MemoryRouter>
    );

    // 🔑 Esperar un dato FINAL y estable (fin de todos los setState)
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();

    // Email: matcher flexible (texto dividido en nodos)
    expect(
      screen.getByText((content) =>
        content.includes("juan@test.com")
      )
    ).toBeInTheDocument();

    // IDs de boletas
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();

    // Total gastado: 12000 + 8000 = 20000
    expect(screen.getByText("$20.000")).toBeInTheDocument();
  });

  it("TAU-Admin 11: Muestra mensaje cuando el usuario no tiene compras", async () => {
    api.getUsuarioByCorreo.mockResolvedValueOnce(mockUser);
    api.getBoletasByUsuarioId.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com/historial"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/historial"
            element={<UserHistory />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        /No hay registros en el historial de este usuario/i
      )
    ).toBeInTheDocument();
  });

  it("TAU-Admin 12: Muestra error si el usuario no existe", async () => {
    api.getUsuarioByCorreo.mockResolvedValueOnce(null);

    render(
      <MemoryRouter
        initialEntries={[
          "/admin/usuarios/noexiste@test.com/historial",
        ]}
      >
        <Routes>
          <Route
            path="/admin/usuarios/:id/historial"
            element={<UserHistory />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Usuario no encontrado/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Volver a Usuarios/i })
    ).toBeInTheDocument();
  });
});
