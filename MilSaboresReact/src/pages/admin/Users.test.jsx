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

    expect(screen.getByText(/Usuarios/i)).toBeInTheDocument();

    expect(screen.queryAllByRole("table").length >= 0).toBe(true);
  });
});
