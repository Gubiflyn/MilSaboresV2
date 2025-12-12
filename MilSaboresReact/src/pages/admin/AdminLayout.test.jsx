import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import AdminLayout from "./AdminLayout";

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    isAdmin: true
  })
}));

function renderAdminLayout() {
  return render(
    <MemoryRouter>
      <AdminLayout />
    </MemoryRouter>
  );
}

describe("AdminLayout", () => {
  it("TAL-Admin : Renderiza el layout administrativo", () => {
    const { container } = renderAdminLayout();
    expect(container.getElementsByClassName("admin-layout")[0]).toBeInTheDocument();
  });

  it("TAL-Admin 8: Muestra los enlaces de navegación principales", () => {
    renderAdminLayout();
    
    const linksEsperados = ["Dashboard", "Órdenes", "Productos"];
    
    linksEsperados.forEach(linkText => {
      const link = screen.getByRole("link", { name: linkText });
      expect(link).toBeInTheDocument();
    });
  });

  it("TAL-Admin 9: Muestra el botón de cerrar sesión", () => {
    renderAdminLayout();
    const logoutButton = screen.getByRole("button", { name: /cerrar sesión/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("TAL-Admin 10: Renderiza el contenedor principal", () => {
    renderAdminLayout();
    const mainContainer = screen.getByRole("complementary", { class: "admin-content" });
    expect(mainContainer).toBeInTheDocument();
  });

  it("TAL-Admin 11: Muestra el título del Dashboard", () => {
    renderAdminLayout();
    const title = screen.getByRole("heading", { name: /dashboard/i });
    expect(title).toBeInTheDocument();
  });
});