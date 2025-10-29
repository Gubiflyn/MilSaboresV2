import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";

import OrderReceipt from "./OrderReceipt";

const mockOrder = {
  id: "O-123",
  numero: "OR-123",
  cliente: { nombre: "Juan Perez" },
  items: [{ nombre: "Torta Tres Leches", cantidad: 1, precio: 45000 }],
  total: 45000,
};

describe("OrderReceipt", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TAOR-Admin 22: Muestra título y mensaje cuando no hay orden", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/pedidos/O-123"]}>
        <Routes>
          <Route path="/admin/pedidos/:id" element={<OrderReceipt />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/boleta \(admin\)/i)).toBeInTheDocument();

    expect(screen.getByText(/boleta no encontrada/i)).toBeInTheDocument();
  });
});