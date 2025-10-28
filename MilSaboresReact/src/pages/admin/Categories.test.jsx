import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom';

import Categories from './Categories';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAdmin: true }),
}));

const mockCategories = [
  { id: 'c1', nombre: 'Pastelería Tradicional' },
  { id: 'c2', nombre: 'Postres Individuales' },
];

let originalFetch;
beforeEach(() => {
  originalFetch = global.fetch;
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    })
  );
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

describe('Admin - Categories', () => {
  it('TAC-Admin 17: Muestra el título de la sección de categorías', () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /categor/i })).toBeInTheDocument();
  });

  it('TAC-Admin 18: Carga y renderiza la lista de categorías desde la API', async () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(await screen.findByText('Pastelería Tradicional')).toBeInTheDocument();
    expect(screen.getByText('Postres Individuales')).toBeInTheDocument();
  });

  it('TAC-Admin 19:Cada categoría muestra el botón "Editar" y existe el botón "Nuevo +"', async () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    const item = await screen.findByText('Pastelería Tradicional');
    const row = item.closest('tr') || item.closest('li') || item.closest('*');

    const btnEditar = within(row).getByRole('button', { name: /editar/i });
    expect(btnEditar).toBeInTheDocument();

    // Botón para crear nueva categoría
    expect(screen.getByRole('button', { name: /nuevo\s*\+/i })).toBeInTheDocument();
  });
});