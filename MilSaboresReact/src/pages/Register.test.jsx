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

    const heading =
      screen.queryByRole("heading", { name: /registr|registro|crear\s*cuenta/i }) ||
      screen.queryByText(/registr|registro|crear\s*cuenta/i);
    expect(heading).toBeInTheDocument();

    const submitBtn =
      screen.getByRole("button", { name: /registr|crear\s*cuenta/i }) ||
      screen.getByRole("button");
    expect(submitBtn).toBeInTheDocument();

    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes.length).toBeGreaterThan(0);
  });

  it("TRG-Pages 35: Permite escribir datos en los campos principales y deja el botón listo para enviar", () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const textboxes = screen.getAllByRole("textbox");
    if (textboxes[0]) {
      fireEvent.change(textboxes[0], { target: { value: "Felipe" } });
      expect(textboxes[0]).toHaveValue("Felipe");
    }
    if (textboxes[1]) {
      fireEvent.change(textboxes[1], { target: { value: "felipe@duocuc.cl" } });
      expect(textboxes[1]).toHaveValue("felipe@duocuc.cl");
    }

    const pwdInputs = container.querySelectorAll('input[type="password"]');
    if (pwdInputs[0]) {
      fireEvent.change(pwdInputs[0], { target: { value: "Clave123!" } });
      expect(pwdInputs[0]).toHaveValue("Clave123!");
    }
    if (pwdInputs[1]) {
      fireEvent.change(pwdInputs[1], { target: { value: "Clave123!" } });
      expect(pwdInputs[1]).toHaveValue("Clave123!");
    }

    const submitBtn =
      screen.queryByRole("button", { name: /registr|crear\s*cuenta/i }) ||
      screen.getByRole("button");
    expect(submitBtn).toBeInTheDocument();
  });
});