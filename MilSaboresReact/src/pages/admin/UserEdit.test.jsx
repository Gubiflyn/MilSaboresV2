import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import UserEdit from "./UserEdit.jsx";

describe("UserEdit", () => {
  it("TAUE-Admin 37: muestra el título, el aviso de 'no encontrado' y el enlace Volver", () => {
    render(
      <MemoryRouter>
        <UserEdit />
      </MemoryRouter>
    );

    // Título
    expect(
      screen.getByRole("heading", { name: /Editar usuario/i })
    ).toBeInTheDocument();

    // Aviso de no encontrado
    expect(
      screen.getByText(/No se encontró el usuario/i)
    ).toBeInTheDocument();

    // Enlace para volver
    expect(
      screen.getByRole("link", { name: /← Volver/i })
    ).toBeInTheDocument();
  });
});
