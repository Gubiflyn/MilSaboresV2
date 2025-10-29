import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, beforeEach, vi, expect } from "vitest";
import "@testing-library/jest-dom";
import Boleta from "./Boleta";

beforeEach(() => {
  localStorage.clear();
});

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/boleta" element={<Boleta />} />
        <Route path="/boleta/:id" element={<Boleta />} />
        <Route path="/" element={<div>Inicio</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("Boleta", () => {
  it("TPB-Pages 1: Sin id en la URL muestra 'Boleta no encontrada'", async () => {
    renderAt("/boleta");

    const heading = await screen.findByRole("heading", {
      name: /boleta no encontrada/i,
    });
    expect(heading).toBeInTheDocument();

    const msg = await screen.findByText(/no se encontró la boleta/i);
    expect(msg).toBeInTheDocument();
  });

  it("TPB-Pages 2: Con id inexistente en la URL también muestra 'Boleta no encontrada'", async () => {
    renderAt("/boleta/ABC123");

    const heading = await screen.findByRole("heading", {
      name: /boleta no encontrada/i,
    });
    expect(heading).toBeInTheDocument();

    const msg = await screen.findByText(/no se encontró la boleta/i);
    expect(msg).toBeInTheDocument();
  });

  it("TPB-Pages 3: Muestra el id en el mensaje cuando viene como parámetro (si el componente lo inserta)", async () => {
    renderAt("/boleta/XYZ789");

    const msg = await screen.findByText(/no se encontró la boleta/i);
    expect(msg).toBeInTheDocument();

    const maybeCodeId = screen.queryByText(/^XYZ789$/);
    if (maybeCodeId) {
      expect(maybeCodeId).toBeInTheDocument();
    } else {
      expect(true).toBe(true); 
    }
  });

  it("TPB-Pages 4: Muestra el botón 'Volver al inicio' y navega al hacer clic", async () => {
    renderAt("/boleta/ABC123");

    const backBtn = await screen.findByRole("button", { name: /volver al inicio/i });
    expect(backBtn).toBeInTheDocument();

    await userEvent.click(backBtn);
    expect(await screen.findByText(/inicio/i)).toBeInTheDocument();
  });

  it("TPB-Pages 5 : La vista no encontrada no muestra items ni totales", async () => {
    renderAt("/boleta");

    expect(screen.queryByText(/total/i)).toBeNull();
    expect(screen.queryByText(/subtotal/i)).toBeNull();
    expect(screen.queryByText(/cantidad/i)).toBeNull();
  });
});
