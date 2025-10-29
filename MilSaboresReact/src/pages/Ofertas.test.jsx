// src/pages/Ofertas.test.jsx
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Ofertas from "./Ofertas";

describe("Ofertas", () => {
  it("TO-Pages 25: Renderiza correctamente y muestra el título principal 'Ofertas'", () => {
    render(
      <MemoryRouter>
        <Ofertas />
      </MemoryRouter>
    );

    // Busca el título o encabezado que contenga la palabra "Ofertas"
    const title =
      screen.queryByRole("heading", { name: /ofertas/i }) ||
      screen.queryByText(/ofertas/i);

    expect(title).toBeInTheDocument();
  });
});
