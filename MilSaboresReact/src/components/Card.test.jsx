import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Card from './Card';

describe("Testing Card", () => {
  const mockTorta = {
    codigo: "T-001",
    nombre: "Torta Tres Leches",
    categoria: "Pastelería Tradicional",
    descripcion: "Clásica y húmeda",
    precio: 12990,
    imagen: "/img/tresleches.jpg",
  };

  const onAgregarCarrito = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("CP-Card1: Muestra nombre, categoría y precio formateado", () => {
    render(
      <MemoryRouter>
        <Card torta={mockTorta} onAgregarCarrito={onAgregarCarrito} />
      </MemoryRouter>
    );

    expect(screen.getByText("Torta Tres Leches")).toBeInTheDocument();
    expect(screen.getByText("Pastelería Tradicional")).toBeInTheDocument();
    expect(screen.getByText(/\$12\.990\s*CLP/)).toBeInTheDocument();
  });

  it("CP-Card2: Muestra imagen con alt correcto y link al detalle", () => {
    render(
      <MemoryRouter>
        <Card torta={mockTorta} onAgregarCarrito={onAgregarCarrito} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: mockTorta.nombre });
    expect(link).toHaveAttribute("href", `/detalle/${mockTorta.codigo}`);

    const img = screen.getByRole("img", { name: mockTorta.nombre });
    expect(img).toBeInTheDocument();
  });

  it('CP-Card3: Click en "Agregar al carrito" llama al handler con la torta', () => {
    render(
      <MemoryRouter>
        <Card torta={mockTorta} onAgregarCarrito={onAgregarCarrito} />
      </MemoryRouter>
    );

    const boton = screen.getByRole("button", { name: /agregar al carrito/i });
    fireEvent.click(boton);

    expect(onAgregarCarrito).toHaveBeenCalledTimes(1);
    expect(onAgregarCarrito).toHaveBeenCalledWith(mockTorta);
  });

  it("CP-Card4: Si falta la imagen, el alt sigue siendo accesible y el src puede quedar vacío", () => {
    render(
      <MemoryRouter>
        <Card
          torta={{ ...mockTorta, imagen: "" }}
          onAgregarCarrito={onAgregarCarrito}
        />
      </MemoryRouter>
    );

    const img = screen.getByRole("img", { name: mockTorta.nombre });
    expect(img).toBeInTheDocument();
  });

  it("CP-Card5: Renderiza el botón de agregar", () => {
    render(
      <MemoryRouter>
        <Card torta={mockTorta} onAgregarCarrito={onAgregarCarrito} />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("button", { name: /agregar al carrito/i })
    ).toBeInTheDocument();
  });
});
