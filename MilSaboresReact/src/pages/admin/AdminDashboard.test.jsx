// src/pages/admin/AdminDashboard.test.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

// Ajusta el import según tu estructura
import AdminLayout from "./AdminLayout";

function renderAdmin() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminLayout />
    </MemoryRouter>
  );
}

describe("Página Admin - Panel Principal", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("TA-Admin1: Muestra el título principal del panel (Dashboard)", () => {
    renderAdmin();
    expect(
      screen.getByRole("heading", { level: 1, name: /dashboard/i })
    ).toBeInTheDocument();

    // También el subtítulo debajo
    expect(
      screen.getByText(/resumen de las actividades diarias/i)
    ).toBeInTheDocument();
  });

  it("TA-Admin2: Sidebar contiene las secciones principales", () => {
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

  it("TA-Admin3: El botón 'Cerrar Sesión' es visible", () => {
    renderAdmin();
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i })
    ).toBeVisible();
  });

  // 🔹 Nuevo test 1
  it("TA-Admin4: Muestra el correo del usuario administrador en el header", () => {
    renderAdmin();
    const email = screen.getByText(/admin@mail/i);
    expect(email).toBeInTheDocument();
    expect(email).toHaveClass("admin-user-email");
  });

  // 🔹 Nuevo test 2
  it("TA-Admin5: El logo 'Mil Sabores' se muestra correctamente en el sidebar", () => {
    renderAdmin();
    const logo = screen.getByRole("img", { name: /logo mil sabores/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", expect.stringContaining("icono"));
  });

  // 🔹 Nuevo test 3
  it("TA-Admin6: El layout principal de administrador existe y contiene el sidebar", () => {
    renderAdmin();
    const layout = document.querySelector(".admin-layout");
    expect(layout).toBeInTheDocument();

    const sidebar = layout.querySelector(".admin-sidebar");
    expect(sidebar).toBeInTheDocument();
  });
});
