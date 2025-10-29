import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../context/CartContext", () => ({
  useCart: () => ({ add: vi.fn() }),
}));

vi.mock("bootstrap", () => ({
  Toast: { getOrCreateInstance: () => ({ show: vi.fn() }) },
  Modal: { getOrCreateInstance: () => ({ show: vi.fn() }) },
}));

import Categorias from "./Categorias";

describe("Categorias", () => {
  it("TCTS-Pages 11: Renderiza correctamente el título o encabezado principal", () => {
    render(
      <MemoryRouter>
        <Categorias />
      </MemoryRouter>
    );

    const heading =
      screen.queryByRole("heading", { name: /categor/i }) ||
      screen.queryByText(/categor/i);

    expect(heading).toBeInTheDocument();
  });
});
