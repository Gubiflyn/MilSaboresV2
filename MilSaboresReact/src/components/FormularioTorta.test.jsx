import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FormularioTorta from "./FormularioTorta";

describe("FormularioTorta", () => {
  it("TFT-14: Muestra Nombre y Precio, y el botón de envío", () => {
    render(<FormularioTorta />);

    const nombre = screen.getByPlaceholderText(/nombre/i);
    const precio = screen.getByPlaceholderText(/precio/i);

    expect(nombre).toBeInTheDocument();
    expect(precio).toBeInTheDocument();

    const btn =
      screen.queryByRole("button", { name: /agregar torta/i }) ||
      screen.queryByRole("button", { name: /guardar/i }) ||
      screen.getByRole("button"); 
    expect(btn).toBeInTheDocument();
  });

  it("TFT-15: Permite escribir en 'Nombre' y 'Precio'", () => {
    render(<FormularioTorta />);

    const nombre = screen.getByPlaceholderText(/nombre/i);
    const precio = screen.getByPlaceholderText(/precio/i);

    fireEvent.change(nombre, { target: { value: "Torta Mil Hojas" } });
    fireEvent.change(precio, { target: { value: "12990" } });

    expect(nombre).toHaveValue("Torta Mil Hojas");

    const esNumber = (precio.getAttribute("type") || "").toLowerCase() === "number";
    expect(precio).toHaveValue(esNumber ? 12990 : "12990");
  });
});
