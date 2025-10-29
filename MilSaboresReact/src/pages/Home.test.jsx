import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

describe("Home", () => {
  it("THM-Pages 21: Renderiza y muestra marca o título principal", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const h1 =
      screen.queryByRole("heading", { level: 1, name: /mil\s*sabores/i }) ||
      screen.queryByRole("heading", { level: 1 });

    if (h1) {
      expect(h1).toBeInTheDocument();
    } else {

        const occurrences = screen.getAllByText(/mil\s*sabores/i);
      expect(occurrences.length).toBeGreaterThan(0);
    }
  });

  it("THM-Pages 22: Muestra un CTA hacia Productos (botón o link)", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const cta =
      screen.queryByRole("button", {
        name: /(ver|ir a|explorar|ver más).*(producto|tienda)/i,
      }) ||
      screen.queryByRole("link", {
        name: /(ver|ir a|explorar|ver más).*(producto|tienda)/i,
      }) ||
      screen.queryByRole("link", { name: /producto/i });

    if (cta) {
      expect(cta).toBeInTheDocument();
      return;
    }

    const links = screen.queryAllByRole("link");
    const hasProductosHref = links.some(
      (a) =>
        typeof a.getAttribute === "function" &&
        (a.getAttribute("href")?.includes("/productos") ||
          (a.href && /\/productos/i.test(a.href)))
    );

    expect(hasProductosHref).toBe(true);
  });
});
