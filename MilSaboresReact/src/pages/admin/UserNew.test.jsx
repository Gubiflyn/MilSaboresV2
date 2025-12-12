import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";

import UserNew from "./UserNew";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  getUsuarios: vi.fn(),
  addAdministrador: vi.fn(),
  addCliente: vi.fn(),
  addVendedor: vi.fn(),
}));

vi.mock("scrypt-js", () => ({
  scrypt: vi.fn(() => Promise.resolve(new Uint8Array(32))),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Admin - UserNew", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getUsuarios.mockResolvedValue([]);
  });

  it("TAU-Admin 06: Muestra el formulario de creación de usuario", () => {
    render(
      <MemoryRouter>
        <UserNew />
      </MemoryRouter>
    );

    expect(screen.getByText(/Nuevo usuario/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ej: Ana")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("usuario@correo.com")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Entre 4 y 15 caracteres")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Crear usuario/i })
    ).toBeInTheDocument();
  });

  it("TAU-Admin 07: Crea un cliente correctamente y redirige", async () => {
    api.addCliente.mockResolvedValue({ id: 1 });

    render(
      <MemoryRouter>
        <UserNew />
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Ej: Ana"),
      "Ana"
    );
    await user.type(
      screen.getByPlaceholderText("usuario@correo.com"),
      "ana@test.com"
    );
    await user.type(
      screen.getByPlaceholderText("Entre 4 y 15 caracteres"),
      "1234"
    );

    await user.click(
      screen.getByRole("button", { name: /Crear usuario/i })
    );

    expect(api.addCliente).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/admin/usuarios");
  });

  it("TAU-Admin 08: Muestra alerta si el correo ya existe", async () => {
    api.getUsuarios.mockResolvedValueOnce([
      { correo: "repetido@test.com" },
    ]);

    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    render(
      <MemoryRouter>
        <UserNew />
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Ej: Ana"),
      "Pedro"
    );
    await user.type(
      screen.getByPlaceholderText("usuario@correo.com"),
      "repetido@test.com"
    );
    await user.type(
      screen.getByPlaceholderText("Entre 4 y 15 caracteres"),
      "1234"
    );

    await user.click(
      screen.getByRole("button", { name: /Crear usuario/i })
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Ya existe un usuario con ese correo."
    );
    expect(api.addCliente).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
