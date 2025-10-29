import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import UserView from "./UserView.jsx";

describe("UserView", () => {
  it("TAURS-Admin 41: renderiza correctamente la vista del usuario (sin error crítico)", () => {
    render(
      <MemoryRouter>
        <UserView />
      </MemoryRouter>
    );

    // El componente debe mostrar algún título o sección principal
    const title =
      screen.queryByText(/usuario/i) ||
      screen.queryByRole("heading") ||
      screen.queryByText(/detalle/i);

    // Solo valida que algo se renderiza
    expect(title).toBeTruthy();
  });
});
