import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Profile from "./Profile.jsx";

describe("Perfil", () => {
  it("TAPL-Admin 35: muestra el título y el botón de actualizar contraseña", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Perfil del administrador/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Actualizar contraseña/i })
    ).toBeInTheDocument();
  });
});
