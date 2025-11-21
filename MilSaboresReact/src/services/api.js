// src/services/api.js
const API_BASE = "http://localhost:8094";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let msg = `Error HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

/* -----------------------------
   PASTELES (PASTEL-CONTROLLER)
------------------------------ */

// GET /api/pasteles/listPasteles
export function getPasteles() {
  return apiFetch("/api/pasteles/listPasteles");
}

// GET /api/pasteles/getPastelByCodigo/{codigo}
export function getPastelByCodigo(codigo) {
  return apiFetch(
    `/api/pasteles/getPastelByCodigo/${encodeURIComponent(codigo)}`
  );
}

// POST /api/pasteles/savePastel
export function createPastel(data) {
  return apiFetch("/api/pasteles/savePastel", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /api/pasteles/updatePastel
export function updatePastel(data) {
  return apiFetch("/api/pasteles/updatePastel", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE /api/pasteles/deletePastelById/{id}
export function deletePastel(id) {
  return apiFetch(`/api/pasteles/deletePastelById/${id}`, {
    method: "DELETE",
  });
}

/* -----------------------------
   ADMINISTRADORES
------------------------------ */

// GET /administradores/activos
export function getAdministradores() {
  return apiFetch("/administradores/activos");
}

/* -----------------------------
   VENDEDORES
------------------------------ */

// GET /api/vendedores/listVendedores
export function getVendedores() {
  return apiFetch("/api/vendedores/listVendedores");
}

/* -----------------------------
   CLIENTES
------------------------------ */

// GET /clientes/activos
export function getClientes() {
  return apiFetch("/clientes/activos");
}

// POST /clientes
export function createCliente(data) {
  return apiFetch("/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
