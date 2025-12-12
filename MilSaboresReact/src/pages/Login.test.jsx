import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
  }),
}));

import Login from "./Login";

describe("Login", () => {
  it("TL-Pages: Renderiza la pantalla de login sin errores",() => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      expect(true).toBe(true);
    }
  );

  it("TL-Pages: Muestra el botón principal para iniciar sesión",() => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const button = screen.getByRole("button", {
        name: /iniciar|login|ingresar/i,
      });

      expect(button).toBeInTheDocument();
    }
  );

  it("TL-Pages: Permite escribir en el campo de correo o usuario",() => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const inputs = screen.getAllByRole("textbox");
      fireEvent.change(inputs[0], { target: { value: "test@mail.cl" } });

      expect(inputs[0].value).toBe("test@mail.cl");
    }
  );
});
