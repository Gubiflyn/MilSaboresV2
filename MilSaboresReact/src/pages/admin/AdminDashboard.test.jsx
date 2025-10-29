import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

import AdminLayout from "./AdminLayout";

function renderAdmin() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminLayout />
    </MemoryRouter>
  );
}

describe("Página Admin", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("TAD-Admin 1: Muestra el título principal del panel (Dashboard)", () => {
    renderAdmin();
    expect(
      screen.getByRole("heading", { level: 1, name: /dashboard/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/resumen de las actividades diarias/i)
    ).toBeInTheDocument();
  });

  it("TAD-Admin 2: Sidebar contiene las secciones principales", () => {
    renderAdmin();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /órdenes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /productos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /categorías/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reportes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tienda/i })).toBeInTheDocument();
  });

  it("TAD-Admin 3: El botón 'Cerrar Sesión' es visible", () => {
    renderAdmin();
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeVisible();
  });

  it("TAD-Admin 4: Muestra el correo del usuario administrador", () => {
    renderAdmin();
    const email = screen.getByText(/admin@mail/i);
    expect(email).toBeInTheDocument();
    expect(email).toHaveClass("admin-user-email");
  });

  it("TAD-Admin 5: El logo 'Mil Sabores' se muestra correctamente en el sidebar", () => {
    renderAdmin();
    const logo = screen.getByRole("img", { name: /logo mil sabores/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", expect.stringContaining("icono"));
  });

  it("TAD-Admin 6: El layout principal de administrador existe y contiene el sidebar", () => {
    renderAdmin();
    const layout = document.querySelector(".admin-layout");
    expect(layout).toBeInTheDocument();

    const sidebar = layout.querySelector(".admin-sidebar");
    expect(sidebar).toBeInTheDocument();
  });
});
