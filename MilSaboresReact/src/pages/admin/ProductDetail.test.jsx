import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("react-router-dom", async (orig) => {
  const actual = await orig();
  return { ...actual, useNavigate: () => vi.fn() };
});

import ProductDetail from "./ProductDetail";

describe("ProductDetail", () => {
  beforeEach(() => {
    localStorage.clear();

    // Semilla mínima en la misma fuente que usa el componente 
    const fakeProducts = [
      {
        id: "p1",
        codigo: "p1",
        sku: "SKU-P1",
        nombre: "Torta Chocolate Test",
        precio: 12345,
        categoria: "tortas",
        descripcion: "Riquísima torta de prueba",
        imagen: "/img/torta-test.jpg",
      },
    ];
    localStorage.setItem("tortas_v1", JSON.stringify(fakeProducts));
  });

  it("TAPD-Admin 25: muestra el producto cuando la URL contiene su id/sku/codigo", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/productos/p1"]}>
        <Routes>
          <Route path="/admin/productos/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Debe aparecer el nombre
    expect(await screen.findByText(/Torta Chocolate Test/i)).toBeInTheDocument();
    // Y el precio formateado
    expect(screen.getByText(/\$ ?12\.345/)).toBeInTheDocument();
  });
});
