import { render, screen, fireEvent } from "@testing-library/react";
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
    carrito: [],
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  }),
}));

import Detalle from "./Detalle";

describe("Detalle", () => {
  it(
    "Renderiza la vista de detalle sin errores",
    () => {
      render(
        <BrowserRouter>
          <Detalle />
        </BrowserRouter>
      );

      expect(true).toBe(true);
    }
  );

  it(
    "Muestra al menos un elemento visible en pantalla",
    () => {
      render(
        <BrowserRouter>
          <Detalle />
        </BrowserRouter>
      );

      const elements = screen.getAllByRole("generic");
      expect(elements.length).toBeGreaterThan(0);
    }
  );

    it(
    "Muestra información del detalle del producto",
    () => {
        render(
        <BrowserRouter>
            <Detalle />
        </BrowserRouter>
        );

        expect(screen.getByText(/detalle|producto|descripción/i)).toBeInTheDocument();
    }
    );
});
