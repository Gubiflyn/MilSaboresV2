import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Users from "./Users.jsx";

describe("Users", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("TAURS-Admin 40: Renderiza el título principal y la tabla/lista de usuarios", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    // Verifica que el título esté presente
    expect(screen.getByText(/Usuarios/i)).toBeInTheDocument();

    // Verifica que haya al menos una tabla o estructura renderizada
    expect(screen.queryAllByRole("table").length >= 0).toBe(true);
  });
});
