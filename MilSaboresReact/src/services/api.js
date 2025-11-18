// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8094";

async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Error HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

// =====================
//  PASTELES / PRODUCTOS
// =====================

export async function getPasteles() {
  const resp = await fetch(`${API_BASE_URL}/pasteles`);
  return handleResponse(resp);
}

export async function getPastelByCodigo(codigo) {
  const resp = await fetch(
    `${API_BASE_URL}/pasteles/codigo/${encodeURIComponent(codigo)}`
  );
  return handleResponse(resp);
}

export async function createPastel(pastel) {
  const resp = await fetch(`${API_BASE_URL}/pasteles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pastel),
  });
  return handleResponse(resp);
}

export async function updatePastel(id, pastel) {
  const resp = await fetch(`${API_BASE_URL}/pasteles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pastel),
  });
  return handleResponse(resp);
}

export async function deletePastel(id) {
  const resp = await fetch(`${API_BASE_URL}/pasteles/${id}`, {
    method: "DELETE",
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `Error HTTP ${resp.status}`);
  }
  return true;
}

// =====================
//  CLIENTES
// =====================

export async function getClientes() {
  const resp = await fetch(`${API_BASE_URL}/clientes`);
  return handleResponse(resp);
}

export async function createCliente(cliente) {
  const resp = await fetch(`${API_BASE_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  return handleResponse(resp);
}

// =====================
//  ADMINISTRADORES
// =====================

export async function getAdministradores() {
  const resp = await fetch(`${API_BASE_URL}/administradores`, {
    headers: {
      // si protegiste estos endpoints con API KEY:
      //"X-API-KEY": "CLAVE_SUPER_SECRETA_123",
    },
  });
  return handleResponse(resp);
}
