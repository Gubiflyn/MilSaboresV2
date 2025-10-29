import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Configuracion from "./Configuracion";

describe("Configuracion (básico)", () => {
<<<<<<< HEAD
  it("TCF-Pages 11: Muestra el título 'Mi Perfil'", () => {
=======
  //Título principal
  it("TCF-Pages 12: Muestra el título 'Mi Perfil'", () => {
>>>>>>> 5a8a75b4c6191aa203490aef75689025386956b5
    render(<Configuracion />);
    expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
  });

<<<<<<< HEAD
  it("TCF-Pages 12: Muestra labels Nombres, Apellidos, Correo electrónico y Dirección", () => {
=======
  //Labels principales visibles
  it("TCF-Pages 13: Muestra labels Nombres, Apellidos, Correo electrónico y Dirección", () => {
>>>>>>> 5a8a75b4c6191aa203490aef75689025386956b5
    render(<Configuracion />);
    expect(screen.getByText(/nombres/i)).toBeInTheDocument();
    expect(screen.getByText(/apellidos/i)).toBeInTheDocument();
    expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/dirección/i)).toBeInTheDocument();
  });

<<<<<<< HEAD
  it("TCF-Pages 13: Los campos de texto están en readonly inicialmente", () => {
=======
  //Inputs de texto en modo solo-lectura inicialmente
  it("TCF-Pages 14: Los campos de texto están en readonly inicialmente", () => {
>>>>>>> 5a8a75b4c6191aa203490aef75689025386956b5
    render(<Configuracion />);
    const textboxes = screen.getAllByRole("textbox"); 
    expect(textboxes.length).toBeGreaterThanOrEqual(4);
    textboxes.forEach((el) => {
      expect(el).toHaveAttribute("readonly");
    });
  });

<<<<<<< HEAD
it("TCF-Pages 14: Los selects de Región y Comuna están deshabilitados", () => {
=======
  //Selects de Región y Comuna deshabilitados
it("TCF-Pages 15: Los selects de Región y Comuna están deshabilitados", () => {
>>>>>>> 5a8a75b4c6191aa203490aef75689025386956b5
  render(<Configuracion />);

  const combos = screen.getAllByRole("combobox");
  expect(combos.length).toBeGreaterThanOrEqual(2);

  combos.forEach((c) => expect(c).toBeDisabled());

  expect(screen.getByText(/selecciona una región/i)).toBeInTheDocument();
  expect(screen.getByText(/primero elige una región/i)).toBeInTheDocument();
});


<<<<<<< HEAD
  it("TCF-Pages 15: Existe el botón 'Editar' y está habilitado", () => {
=======
  //Botón 'Editar' visible (tipo button)
  it("TCF-Pages 16: Existe el botón 'Editar' y está habilitado", () => {
>>>>>>> 5a8a75b4c6191aa203490aef75689025386956b5
    render(<Configuracion />);
    const btn = screen.getByRole("button", { name: /editar/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeEnabled();
  });
});
