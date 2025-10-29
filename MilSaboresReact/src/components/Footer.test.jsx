import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import Footer from "./Footer";

describe("Footer (component)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('TFOT-10: Muestra el nombre de la marca "Mil Sabores"', () => {
    render(<Footer />);
    const matches = screen.getAllByText(/Mil Sabores/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0]).toBeVisible();
  });

  it("TFOT-11: Renderiza los enlaces de redes sociales", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.some((a) => a.className.includes("footer__social-link"))).toBe(true);
  });

  it("TFOT-12: Renderiza el logo con alt 'Mil Sabores'", () => {
    render(<Footer />);
    const logo = screen.getByAltText(/Mil Sabores/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", expect.stringContaining("/img/icono.png"));
  });

  it('TFOT-13: Al enviar el formulario muestra un alert con "¡Gracias por suscribirte!"', () => {
    const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Footer />);

    const email = screen.getByRole("textbox", { name: /tu correo/i });
    fireEvent.change(email, { target: { value: "test@mail.com" } }); 

    const submitBtn = screen.getByRole("button", { name: /suscribirse/i });
    fireEvent.click(submitBtn);

    expect(mockAlert).toHaveBeenCalledWith("¡Gracias por suscribirte!");
    mockAlert.mockRestore();
  });
});
