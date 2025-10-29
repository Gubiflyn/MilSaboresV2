import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FormularioTorta from "./FormularioTorta";

/*-------------Prueba de Formulario adicional----------------*/ 
describe("FormularioTorta", () => {
  //Renderiza campos principales y botón
  it("TFT-14: Muestra Nombre y Precio, y el botón de envío", () => {
    render(<FormularioTorta />);

    // No hay labels, usamos placeholders
    const nombre = screen.getByPlaceholderText(/nombre/i);
    const precio = screen.getByPlaceholderText(/precio/i);

    expect(nombre).toBeInTheDocument();
    expect(precio).toBeInTheDocument();

    // Botón tolerante: "Agregar Torta" o "Guardar"
    const btn =
      screen.queryByRole("button", { name: /agregar torta/i }) ||
      screen.queryByRole("button", { name: /guardar/i }) ||
      screen.getByRole("button"); // fallback si cambias el texto
    expect(btn).toBeInTheDocument();
  });

  //Permite escribir en Nombre y Precio
  it("TFT-15: Permite escribir en 'Nombre' y 'Precio'", () => {
    render(<FormularioTorta />);

    const nombre = screen.getByPlaceholderText(/nombre/i);
    const precio = screen.getByPlaceholderText(/precio/i);

    fireEvent.change(nombre, { target: { value: "Torta Mil Hojas" } });
    fireEvent.change(precio, { target: { value: "12990" } });

    expect(nombre).toHaveValue("Torta Mil Hojas");

    // Si el input es type="number", jsdom compara como number
    const esNumber = (precio.getAttribute("type") || "").toLowerCase() === "number";
    expect(precio).toHaveValue(esNumber ? 12990 : "12990");
  });
});
