import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";

import Dashboard from "./Dashboard";

describe("Admin - Dashboard", () => {
  it("TAU-Admin 27: Muestra los indicadores principales (KPIs)", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getAllByText("Compras").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Productos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Usuarios").length).toBeGreaterThan(0);

    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("400")).toBeInTheDocument();
    expect(screen.getByText("890")).toBeInTheDocument();
  });

  it("TAU-Admin 28: Muestra los accesos rápidos con navegación correcta", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const quickTiles = document.querySelector(".quick-tiles");
    const links = within(quickTiles).getAllByRole("link");

    const expectedLinks = {
      Órdenes: "/admin/pedidos",
      Productos: "/admin/productos",
      Categorías: "/admin/categorias",
      Usuarios: "/admin/usuarios",
      Reportes: "/admin/reportes",
      Perfil: "/admin/perfil",
    };

    links.forEach((link) => {
      const title = link.querySelector("h4")?.textContent;
      if (expectedLinks[title]) {
        expect(link).toHaveAttribute("href", expectedLinks[title]);
      }
    });
  });
});
