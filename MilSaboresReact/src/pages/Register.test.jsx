import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

vi.mock("scrypt-js", () => ({
  scrypt: vi.fn(async () => new Uint8Array([1, 2, 3])),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
  }),
}));

import Register from "./Register";

describe("Register", () => {
  it("TR-Pages: Renderiza la pantalla de registro sin errores",() => {
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      expect(true).toBe(true);
    }
  );

  it("TR-Pages:Muestra el botón principal de registrarse",() => {
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      const button = screen.getByRole("button", { name: /registrarse/i });
      expect(button).toBeInTheDocument();
    }
  );
});



