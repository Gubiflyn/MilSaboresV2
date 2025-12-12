import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import Users from "./Users";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  getUsuarios: vi.fn(),
}));

const mockUsers = [
  {
    nombre: "Juan Pérez",
    correo: "juan@test.com",
    rol: "ADMIN",
    beneficio: "Sí",
    fechaNacimiento: "1990-01-01",
  },
  {
    nombre: "María López",
    correo: "maria@test.com",
    rol: "CLIENTE",
    beneficio: "No",
    fechaNacimiento: "1995-05-10",
  },
];

describe("Admin - Users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TAU-Admin 01: Muestra la lista de usuarios o el mensaje 'No hay usuarios para mostrar'", async () => {
    api.getUsuarios.mockResolvedValueOnce(mockUsers);

    const { container } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    await waitFor(() => {
      const hasUser = screen.queryByText("Juan Pérez");
      const hasEmpty = screen.queryByText(/No hay usuarios para mostrar/i);
      if (!hasUser && !hasEmpty) {
        throw new Error("Aún no carga usuarios ni mensaje vacío");
      }
    });

    if (screen.queryByText("Juan Pérez")) {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("juan@test.com")).toBeInTheDocument();

      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBeGreaterThan(0);
    } else {
      expect(
        screen.getByText(/No hay usuarios para mostrar/i)
      ).toBeInTheDocument();
    }
  });

  it("TAU-Admin 02: Permite filtrar usuarios por nombre o correo", async () => {
    api.getUsuarios.mockResolvedValueOnce(mockUsers);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    await screen.findByText("Juan Pérez");

    const input = screen.getByPlaceholderText(/Buscar por nombre o correo/i);
    const user = userEvent.setup();

    await user.type(input, "maría");

    expect(screen.getByText("María López")).toBeInTheDocument();
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
  });
});
