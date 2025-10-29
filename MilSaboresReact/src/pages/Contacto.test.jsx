import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Contacto from "../pages/Contacto";

describe("Contacto", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("TCT-Pages 17: Muestra el título principal de la página (Contacto / Contáctanos)", () => {
    render(<Contacto />);
    const titulo = screen.getByRole("heading", { name: /contacto|contáctanos/i });
    expect(titulo).toBeInTheDocument();
  });

  it("TCT-Pages 18: Renderiza campos básicos: Nombre, Correo, Mensaje y botón Enviar", () => {
    render(<Contacto />);

    const nombre = screen.getByPlaceholderText(/nombre/i);
    const correo = screen.getByPlaceholderText(/correo/i);
    const mensaje =
      screen.queryByPlaceholderText(/mensaje|escribe tu mensaje/i) ||
      screen.getAllByRole("textbox")[1];

    const btnEnviar = screen.getByRole("button", { name: /enviar|enviar mensaje|enviar consulta/i });

    expect(nombre).toBeInTheDocument();
    expect(correo).toBeInTheDocument();
    expect(mensaje).toBeInTheDocument();
    expect(btnEnviar).toBeInTheDocument();
  });

  it("TCT-Pages 19: Permite escribir en Nombre, Correo y Mensaje", () => {
    render(<Contacto />);

    const nombre = screen.getByPlaceholderText(/nombre/i);
    const correo = screen.getByPlaceholderText(/correo/i);
    const mensaje =
      screen.queryByPlaceholderText(/mensaje|escribe tu mensaje/i) ||
      screen.getAllByRole("textbox")[1];

    fireEvent.change(nombre, { target: { value: "Felipe" } });
    fireEvent.change(correo, { target: { value: "felipe@duocuc.cl" } });
    fireEvent.change(mensaje, { target: { value: "Hola, consulta de prueba." } });

    expect(nombre).toHaveValue("Felipe");
    expect(correo).toHaveValue("felipe@duocuc.cl");
    expect(mensaje).toHaveValue("Hola, consulta de prueba.");
  });

  it('TCT-Pages 20: Al enviar, muestra un alert de “gracias” (mockeado)', () => {
    render(<Contacto />);

    // Rellenamos datos mínimos antes de enviar (por si el componente valida)
    const nombre = screen.getByPlaceholderText(/nombre/i);
    const correo = screen.getByPlaceholderText(/correo/i);
    const mensaje =
      screen.queryByPlaceholderText(/mensaje|escribe tu mensaje/i) ||
      screen.getAllByRole("textbox")[1];

    fireEvent.change(nombre, { target: { value: "Felipe" } });
    fireEvent.change(correo, { target: { value: "felipe@duocuc.cl" } });
    fireEvent.change(mensaje, { target: { value: "Consulta breve." } });

    const btnEnviar = screen.getByRole("button", { name: /enviar|enviar mensaje|enviar consulta/i });
    fireEvent.click(btnEnviar);

    // Aceptamos distintas variantes comunes del mensaje de confirmación
    expect(window.alert).toHaveBeenCalled();
    const allCalls = window.alert.mock.calls.map((c) => String(c[0]).toLowerCase()).join(" ");
    expect(allCalls).toMatch(/gracias|enviado|recibido/);
  });
});
