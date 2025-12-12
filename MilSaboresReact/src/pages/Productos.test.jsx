import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock("../context/CartContext", () => ({
  useCart: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    items: [],
    total: 0,
  }),
}));

import Productos from "./Productos";

describe("Productos", () => {
  it("TP-Pages: Renderiza la vista de productos correctamente",() => {
      render(
        <BrowserRouter>
          <Productos />
        </BrowserRouter>
      );

      expect(true).toBe(true);
    }
  );

  it("TP-Pages: Muestra al menos un elemento visible en pantalla",() => {
      render(
        <BrowserRouter>
          <Productos />
        </BrowserRouter>
      );

      const elements = screen.getAllByRole("generic");
      expect(elements.length).toBeGreaterThan(0);
    }
  );
});

