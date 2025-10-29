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

    expect(
      screen.getByRole("heading", { name: /Editar usuario/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/No se encontró el usuario/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /← Volver/i })
    ).toBeInTheDocument();
  });
});
