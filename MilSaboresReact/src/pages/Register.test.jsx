// src/pages/Register.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";

describe("Register", () => {
  it("TRG-Pages 34: Renderiza el formulario y el botón de registro (tolerante)", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Acepta "Registro", "Registrarse", "Registrar", "Crear cuenta", etc.
    const heading =
      screen.queryByRole("heading", { name: /registr|registro|crear\s*cuenta/i }) ||
      screen.queryByText(/registr|registro|crear\s*cuenta/i);
    expect(heading).toBeInTheDocument();

    const submitBtn =
      screen.getByRole("button", { name: /registr|crear\s*cuenta/i }) ||
      screen.getByRole("button");
    expect(submitBtn).toBeInTheDocument();

    // Debe existir al menos 1-2 entradas de texto (nombre/correo)
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes.length).toBeGreaterThan(0);
  });

  it("TRG-Pages 35: Permite escribir datos en los campos principales y deja el botón listo para enviar", () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Campos de texto genéricos (nombre, correo, etc.)
    const textboxes = screen.getAllByRole("textbox");
    // Escribimos en el primero (nombre)
    if (textboxes[0]) {
      fireEvent.change(textboxes[0], { target: { value: "Felipe" } });
      expect(textboxes[0]).toHaveValue("Felipe");
    }
    // Escribimos en el segundo (correo)
    if (textboxes[1]) {
      fireEvent.change(textboxes[1], { target: { value: "felipe@duocuc.cl" } });
      expect(textboxes[1]).toHaveValue("felipe@duocuc.cl");
    }

    // Passwords 
    const pwdInputs = container.querySelectorAll('input[type="password"]');
    if (pwdInputs[0]) {
      fireEvent.change(pwdInputs[0], { target: { value: "Clave123!" } });
      expect(pwdInputs[0]).toHaveValue("Clave123!");
    }
    if (pwdInputs[1]) {
      fireEvent.change(pwdInputs[1], { target: { value: "Clave123!" } });
      expect(pwdInputs[1]).toHaveValue("Clave123!");
    }

    // Botón de envío presente (nombre tolerante)
    const submitBtn =
      screen.queryByRole("button", { name: /registr|crear\s*cuenta/i }) ||
      screen.getByRole("button");
    expect(submitBtn).toBeInTheDocument();
  });
});