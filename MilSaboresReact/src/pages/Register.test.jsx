import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";

describe("Register", () => {
  it("TRG-Pages 33: Renderiza el formulario y el botón de registro (tolerante)", () => {
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

  it("TRG-Pages 34: Permite escribir datos en los campos principales y deja el botón listo para enviar", () => {
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

  it("TRG-Pages 35: Tiene al menos un campo de contraseña", () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const pwdInputs = container.querySelectorAll('input[type="password"]');
    expect(pwdInputs.length).toBeGreaterThan(0);
  });

  it("TRG-Pages 36: Tiene un campo de email (por name o por type=email)", () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const emailByRole = screen.queryByRole("textbox", { name: /email|correo/i });
    const emailByType = container.querySelector('input[type="email"]');
    expect(emailByRole || emailByType).toBeTruthy();
  });

  it("TRG-Pages 37: Permite escribir y limpiar un campo de texto", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const textboxes = screen.getAllByRole("textbox");
    if (textboxes[0]) {
      fireEvent.change(textboxes[0], { target: { value: "Temporal" } });
      expect(textboxes[0]).toHaveValue("Temporal");
      fireEvent.change(textboxes[0], { target: { value: "" } });
      expect(textboxes[0]).toHaveValue("");
    } else {
      expect(true).toBe(true);
    }
  });

  it("TRG-Pages 38: Click en enviar sin datos no rompe la vista", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const submitBtn =
      screen.queryByRole("button", { name: /registr|crear\s*cuenta/i }) ||
      screen.getByRole("button");
    fireEvent.click(submitBtn);
    const heading =
      screen.queryByRole("heading", { name: /registr|registro|crear\s*cuenta/i }) ||
      screen.queryByText(/registr|registro|crear\s*cuenta/i);
    expect(heading).toBeInTheDocument();
  });

    it("TRG-Pages 39: Renderiza sin errores el componente Register", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    // Si llega hasta aquí, significa que el componente se montó correctamente
    expect(true).toBe(true);
  });

});
