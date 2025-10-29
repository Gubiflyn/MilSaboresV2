import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import UserNew from "./UserNew.jsx";

describe("UserNew", () => {
  it("TAUN-Admin 39: muestra el título 'Nuevo usuario' y el botón 'Crear'", () => {
    render(
      <MemoryRouter>
        <UserNew />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Nuevo usuario/i })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Crear/i })).toBeInTheDocument();
  });
});
