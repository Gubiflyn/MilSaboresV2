import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import Carrito from "./Carrito";

const mockItem = {
  codigo: "P001",
  nombre: "Cheesecake Frutos Rojos",
  categoria: "Postre",
  imagen: "/img/cheesecake.jpg",
  precio: 12000,
  cantidad: 2,
};

const mockTorta = {
  codigo: "T001",
  nombre: "Torta de Chocolate",
  categoria: "Torta",
  imagen: "/img/torta-choco.jpg",
  precio: 15000,
  cantidad: 1,
  mensaje: "",
};

describe("Carrito", () => {
  let vaciarCarrito, irAlPago, eliminarProducto, setCantidad, updateMensaje;

  beforeEach(() => {
    vaciarCarrito = vi.fn();
    irAlPago = vi.fn();
    eliminarProducto = vi.fn();
    setCantidad = vi.fn();
    updateMensaje = vi.fn();
  });

  it('TC-01: Muestra el mensaje "Tu carrito está vacío" cuando no hay items', () => {
    render(
      <Carrito
        carrito={[]}
        vaciarCarrito={vaciarCarrito}
        irAlPago={irAlPago}
        eliminarProducto={eliminarProducto}
      />
    );
    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.queryByText(/Total:/i)).not.toBeInTheDocument();
  });

  it("TC-02: Renderiza ítems con nombre, cantidad y total formateado", () => {
    render(
      <Carrito
        carrito={[mockItem]}
        vaciarCarrito={vaciarCarrito}
        irAlPago={irAlPago}
        eliminarProducto={eliminarProducto}
        setCantidad={setCantidad}
      />
    );

    expect(screen.getByText(/Carrito de Compras/i)).toBeInTheDocument();
    expect(screen.getByText(mockItem.nombre)).toBeInTheDocument();
    expect(screen.getByDisplayValue(String(mockItem.cantidad))).toBeInTheDocument();
    expect(screen.getByText(/Total:\s*\$24\.000\s*CLP/i)).toBeInTheDocument();
  });

  it('TC-04: "Eliminar" invoca eliminarProducto con el código del ítem', () => {
    render(
      <Carrito
        carrito={[mockItem]}
        eliminarProducto={eliminarProducto}
        setCantidad={setCantidad}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Eliminar/i }));
    expect(eliminarProducto).toHaveBeenCalledWith(mockItem.codigo);
  });

  it('TC-05: Botones "Vaciar carrito" e "Ir al pago" llaman a sus handlers', () => {
    render(
      <Carrito
        carrito={[mockItem]}
        vaciarCarrito={vaciarCarrito}
        irAlPago={irAlPago}
        setCantidad={setCantidad}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Vaciar carrito/i }));
    expect(vaciarCarrito).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Ir al pago/i }));
    expect(irAlPago).toHaveBeenCalledTimes(1);
  });

});
