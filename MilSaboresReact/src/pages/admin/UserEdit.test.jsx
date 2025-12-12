import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import UserEdit from "./UserEdit";
import * as api from "../../services/api";

// ===== Mock APIs =====
vi.mock("../../services/api", () => ({
  getUsuarios: vi.fn(),
  updateUsuario: vi.fn(),
  deleteUsuario: vi.fn(),
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

const mockUsers = [
  {
    id: 1,
    nombre: "Juan Pérez",
    correo: "juan@test.com",
    rol: "CLIENTE",
    beneficio: "MAYOR50",
    fechaNacimiento: "1990-01-01",
  },
];

describe("Admin - UserEdit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getUsuarios.mockResolvedValue(mockUsers);
  });

  it("TAU-Admin 13: Muestra estado de carga inicialmente", () => {
    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com/editar"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/editar"
            element={<UserEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Cargando datos/i)
    ).toBeInTheDocument();
  });

  it("TAU-Admin 14: Carga los datos del usuario en el formulario", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com/editar"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/editar"
            element={<UserEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que el formulario esté listo
    expect(
      await screen.findByDisplayValue("Juan Pérez")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("juan@test.com")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("CLIENTE")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("MAYOR50")
    ).toBeInTheDocument();
  });

  it("TAU-Admin 15: Permite actualizar el usuario y redirige", async () => {
    api.updateUsuario.mockResolvedValue({});

    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com/editar"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/editar"
            element={<UserEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();

    // Esperar carga
    const nombreInput = await screen.findByDisplayValue("Juan Pérez");

    await user.clear(nombreInput);
    await user.type(nombreInput, "Juan Editado");

    await user.click(
      screen.getByRole("button", { name: /Guardar cambios/i })
    );

    expect(api.updateUsuario).toHaveBeenCalledOnce();
    expect(alertSpy).toHaveBeenCalledWith(
      "Usuario actualizado correctamente."
    );
    expect(mockNavigate).toHaveBeenCalledWith("/admin/usuarios");

    alertSpy.mockRestore();
  });

  it("TAU-Admin 16: Permite eliminar el usuario tras confirmación", async () => {
    api.deleteUsuario.mockResolvedValue({});

    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/juan@test.com/editar"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/editar"
            element={<UserEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByDisplayValue("Juan Pérez");

    await userEvent.click(
      screen.getByRole("button", { name: /Eliminar usuario/i })
    );

    expect(api.deleteUsuario).toHaveBeenCalledWith(1);
    expect(alertSpy).toHaveBeenCalledWith("Usuario eliminado.");
    expect(mockNavigate).toHaveBeenCalledWith("/admin/usuarios");

    alertSpy.mockRestore();
  });

  it("TAU-Admin 17: Muestra mensaje si el usuario no existe", async () => {
    api.getUsuarios.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/admin/usuarios/noexiste@test.com/editar"]}>
        <Routes>
          <Route
            path="/admin/usuarios/:id/editar"
            element={<UserEdit />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/No se encontró el usuario solicitado/i)
    ).toBeInTheDocument();
  });
});
