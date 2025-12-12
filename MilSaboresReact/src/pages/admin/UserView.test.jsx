import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import UserView from "./UserView";
import * as api from "../../services/api";

// Mock API
vi.mock("../../services/api", () => ({
  getUsuarioByCorreo: vi.fn(),
}));

const mockUser = {
  id: 1,
  nombre: "Juan Pérez",
  correo: "juan@test.com",
  rol: "ADMIN",
  beneficio: "Sí",
  fechaNacimiento: "1990-01-01",
  activo: true,
};

describe("Admin - UserView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TAU-Admin 03: Muestra el estado de carga inicialmente", () => {
    api.getUsuarioByCorreo.mockResolvedValueOnce(mockUser);

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com"]}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<UserView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Cargando usuario/i)
    ).toBeInTheDocument();
  });

  it("TAU-Admin 04: Muestra los datos del usuario cuando la API responde correctamente", async () => {
    api.getUsuarioByCorreo.mockResolvedValueOnce(mockUser);

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com"]}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<UserView />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar dato final
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();

    expect(screen.getByText("juan@test.com")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();

    // Hay dos "Sí": beneficio y activo
    const yesValues = screen.getAllByText("Sí");
    expect(yesValues.length).toBe(2);
  });

  it("TAU-Admin 05: Muestra mensaje de error si el usuario no existe", async () => {
    api.getUsuarioByCorreo.mockResolvedValueOnce(null);

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/noexiste@test.com"]}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<UserView />} />
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
