import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Configuracion from "./Configuracion";

describe("Configuracion (básico)", () => {
  //Título principal
  it("TCF-Pages 12: Muestra el título 'Mi Perfil'", () => {
    render(<Configuracion />);
    expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
  });

  //Labels principales visibles
  it("TCF-Pages 13: Muestra labels Nombres, Apellidos, Correo electrónico y Dirección", () => {
    render(<Configuracion />);
    expect(screen.getByText(/nombres/i)).toBeInTheDocument();
    expect(screen.getByText(/apellidos/i)).toBeInTheDocument();
    expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/dirección/i)).toBeInTheDocument();
  });

  //Inputs de texto en modo solo-lectura inicialmente
  it("TCF-Pages 14: Los campos de texto están en readonly inicialmente", () => {
    render(<Configuracion />);
    const textboxes = screen.getAllByRole("textbox"); // incluye text y email
    expect(textboxes.length).toBeGreaterThanOrEqual(4);
    textboxes.forEach((el) => {
      expect(el).toHaveAttribute("readonly");
    });
  });

  //Selects de Región y Comuna deshabilitados
it("TCF-Pages 15: Los selects de Región y Comuna están deshabilitados", () => {
  render(<Configuracion />);

  const combos = screen.getAllByRole("combobox");
  expect(combos.length).toBeGreaterThanOrEqual(2);

  // Ambos deben estar deshabilitados inicialmente
  combos.forEach((c) => expect(c).toBeDisabled());

  //chequeo rápido del placeholder de cada uno
  expect(screen.getByText(/selecciona una región/i)).toBeInTheDocument();
  expect(screen.getByText(/primero elige una región/i)).toBeInTheDocument();
});


  //Botón 'Editar' visible (tipo button)
  it("TCF-Pages 16: Existe el botón 'Editar' y está habilitado", () => {
    render(<Configuracion />);
    const btn = screen.getByRole("button", { name: /editar/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeEnabled();
  });
});
