import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

describe("Login (básico)", () => {
  it("TLG-Pages 25: Renderiza y permite ingresar email y contraseña", () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Email por placeholder
    const emailInput = screen.getByPlaceholderText(/alguien@duocuc\.cl/i);
    const passwordInput = container.querySelector('input[type="password"]');
    const submitBtn = screen.getByRole("button", { name: /iniciar/i });

    // Asegura que existen
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();

    // Simula escritura
    fireEvent.change(emailInput, { target: { value: "test@duocuc.cl" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    expect(emailInput).toHaveValue("test@duocuc.cl");
    expect(passwordInput).toHaveValue("123456");
  });
});
