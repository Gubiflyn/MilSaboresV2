import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Noticias from "./Noticias";

describe("Noticias", () => {
  it("TNC-Pages 25: Renderiza correctamente y muestra título o encabezado principal", () => {
    render(
      <MemoryRouter>
        <Noticias />
      </MemoryRouter>
    );

    const heading =
      screen.queryByRole("heading", { name: /noticias/i }) ||
      screen.queryByText(/noticias/i);

    expect(heading).toBeInTheDocument();
  });
});
