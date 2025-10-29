import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Reports from "./Reports.jsx";

describe("Reports", () => {
  it("TARS-Admin 36: muestra el título y al menos una tabla (y el botón de exportar)", () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    // Título principal
    expect(screen.getByText(/Reportes/i)).toBeInTheDocument();

    // Hay una o más tablas
    const tables = screen.getAllByRole("table");
    expect(tables.length).toBeGreaterThan(0);

    // Botón de exportación
    expect(
      screen.getByRole("button", { name: /Exportar órdenes \(CSV\)/i })
    ).toBeInTheDocument();
  });
});
