// src/services/api.js
const API_BASE = "http://localhost:8094";

/**
 * Wrapper genérico para fetch contra el backend
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    let cuerpo = "";
    try {
      // Intentamos leer SIEMPRE como texto (aunque sea JSON)
      cuerpo = await res.text();
      if (cuerpo) {
        mensaje = cuerpo;
      }
    } catch {
      // ignoramos error al leer el cuerpo
    }

    // Log detallado en consola para depurar
    console.error(
      "Error en apiFetch:",
      {
        path,
        status: res.status,
        statusText: res.statusText,
      },
      "Cuerpo:",
      cuerpo
    );

    throw new Error(mensaje);
  }

  // Si no hay contenido, devolvemos null
  if (res.status === 204) return null;

  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

/* -------- USUARIOS -------- */

// GET /usuarios
export function getUsuarios() {
  return apiFetch("/usuarios");
}

// GET /usuarioById/{id}
export function getUsuarioById(id) {
  return apiFetch(`/usuarioById/${id}`);
}

// GET /usuarioByCorreo/{correo}
export function getUsuarioByCorreo(correo) {
  return apiFetch(`/usuarioByCorreo/${encodeURIComponent(correo)}`);
}

// POST /addUsuario
export function addUsuario(data) {
  return apiFetch("/addUsuario", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /updateUsuario
export function updateUsuario(data) {
  return apiFetch("/updateUsuario", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE /deleteUsuario/{id}
export function deleteUsuario(id) {
  return apiFetch(`/deleteUsuario/${id}`, {
    method: "DELETE",
  });
}

/* ==========================
   CLIENTES (cliente-controller)
   ========================== */

// GET /clientes/activos  (ya lo usabas)
export function getClientesActivos() {
  return apiFetch("/clientes/activos");
}

// GET /clientes
export function getClientes() {
  return apiFetch("/clientes");
}

// GET /clientes/{id}
export function getClienteById(id) {
  return apiFetch(`/clientes/${id}`);
}

// GET /clientes/region/{region}
export function getClientesByRegion(region) {
  return apiFetch(`/clientes/region/${encodeURIComponent(region)}`);
}

// GET /clientes/comuna/{comuna}
export function getClientesByComuna(comuna) {
  return apiFetch(`/clientes/comuna/${encodeURIComponent(comuna)}`);
}

// POST /clientes
export function createCliente(data) {
  return apiFetch("/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /clientes
export function updateCliente(data) {
  return apiFetch("/clientes", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE /clientes/{id}
export function deleteCliente(id) {
  return apiFetch(`/clientes/${id}`, {
    method: "DELETE",
  });
}

/* ==========================
   VENDEDORES (vendedor-controller)
   ========================== */

// GET /api/vendedores/listVendedores
export function getVendedores() {
  return apiFetch("/api/vendedores/listVendedores");
}

// GET /api/vendedores/getVendedorById/{id}
export function getVendedorById(id) {
  return apiFetch(`/api/vendedores/getVendedorById/${id}`);
}

// GET /api/vendedores/getVendedorByCorreo/{correo}
export function getVendedorByCorreo(correo) {
  return apiFetch(
    `/api/vendedores/getVendedorByCorreo/${encodeURIComponent(correo)}`
  );
}

// POST /api/vendedores/saveVendedor
export function createVendedor(data) {
  return apiFetch("/api/vendedores/saveVendedor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// POST /api/vendedores/saveVendedoresList
export function createVendedoresList(data) {
  return apiFetch("/api/vendedores/saveVendedoresList", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /api/vendedores/updateVendedor
export function updateVendedor(data) {
  return apiFetch("/api/vendedores/updateVendedor", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE /api/vendedores/deleteVendedorById/{id}
export function deleteVendedor(id) {
  return apiFetch(`/api/vendedores/deleteVendedorById/${id}`, {
    method: "DELETE",
  });
}

/* ==========================
   PASTELES (pastel-controller)
   ========================== */

// GET /api/pasteles/listPasteles
export function getPasteles() {
  return apiFetch("/api/pasteles/listPasteles");
}

// GET /api/pasteles/getPastelesByNombre/{nombre}
export function getPastelesByNombre(nombre) {
  return apiFetch(
    `/api/pasteles/getPastelesByNombre/${encodeURIComponent(nombre)}`
  );
}

// GET /api/pasteles/getPastelesByCategoria/{nombreCategoria}
export function getPastelesByCategoria(nombreCategoria) {
  return apiFetch(
    `/api/pasteles/getPastelesByCategoria/${encodeURIComponent(
      nombreCategoria
    )}`
  );
}

// GET /api/pasteles/getPastelById/{id}
export function getPastelById(id) {
  return apiFetch(`/api/pasteles/getPastelById/${id}`);
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

// POST /api/pasteles/savePastelesList
export function createPastelesList(data) {
  return apiFetch("/api/pasteles/savePastelesList", {
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

/* ==========================
   DETALLE BOLETA (detalle-boleta-controller)
   ========================== */

export function getDetallesBoleta() {
  return apiFetch("/api/detalles-boleta/listDetallesBoleta");
}

export function getDetalleBoletaById(id) {
  return apiFetch(`/api/detalles-boleta/getDetalleBoletaById/${id}`);
}

export function getDetallesBoletaByPastelId(idPastel) {
  return apiFetch(
    `/api/detalles-boleta/getDetallesBoletaByPastelId/${idPastel}`
  );
}

export function getDetallesBoletaByBoletaId(idBoleta) {
  return apiFetch(
    `/api/detalles-boleta/getDetallesBoletaByBoletaId/${idBoleta}`
  );
}

export function createDetalleBoleta(data) {
  return apiFetch("/api/detalles-boleta/saveDetalleBoleta", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function createDetallesBoletaList(data) {
  return apiFetch("/api/detalles-boleta/saveDetallesBoletaList", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDetalleBoleta(data) {
  return apiFetch("/api/detalles-boleta/updateDetalleBoleta", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDetalleBoleta(id) {
  return apiFetch(`/api/detalles-boleta/deleteDetalleBoletaById/${id}`, {
    method: "DELETE",
  });
}

/* ==========================
   CATEGORÍAS (categoria-controller)
   ========================== */

// GET /api/categorias/listCategorias
export function getCategorias() {
  return apiFetch("/api/categorias/listCategorias");
}

// GET /api/categorias/getCategoriaById/{id}
export function getCategoriaById(id) {
  return apiFetch(`/api/categorias/getCategoriaById/${id}`);
}

// GET /api/categorias/getCategoriaByNombre/{nombre}
export function getCategoriaByNombre(nombre) {
  return apiFetch(
    `/api/categorias/getCategoriaByNombre/${encodeURIComponent(nombre)}`
  );
}

// POST /api/categorias/saveCategoria
export function createCategoria(data) {
  return apiFetch("/api/categorias/saveCategoria", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// POST /api/categorias/saveCategoriasList
export function createCategoriasList(data) {
  return apiFetch("/api/categorias/saveCategoriasList", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /api/categorias/updateCategoria
export function updateCategoria(data) {
  return apiFetch("/api/categorias/updateCategoria", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE /api/categorias/deleteCategoriaById/{id}
export function deleteCategoria(id) {
  return apiFetch(`/api/categorias/deleteCategoriaById/${id}`, {
    method: "DELETE",
  });
}

/* ==========================
   BOLETAS (boleta-controller)
   ========================== */

// GET /api/boletas/listBoletas
export function getBoletas() {
  return apiFetch("/api/boletas/listBoletas");
}

// GET /api/boletas/getBoletasByVendedorId/{idVendedor}
export function getBoletasByVendedorId(idVendedor) {
  return apiFetch(`/api/boletas/getBoletasByVendedorId/${idVendedor}`);
}

// GET /api/boletas/getBoletasByUsuarioId/{idUsuario}
export function getBoletasByUsuarioId(idUsuario) {
  return apiFetch(`/api/boletas/getBoletasByUsuarioId/${idUsuario}`);
}

// GET /api/boletas/getBoletaById/{id}
export function getBoletaById(id) {
  return apiFetch(`/api/boletas/getBoletaById/${id}`);
}

// POST /api/boletas/saveBoleta
export function createBoleta(data) {
  return apiFetch("/api/boletas/saveBoleta", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// POST /api/boletas/saveBoletasList
export function createBoletasList(data) {
  return apiFetch("/api/boletas/saveBoletasList", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /api/boletas/updateBoleta
export function updateBoleta(data) {
  return apiFetch("/api/boletas/updateBoleta", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// DELETE /api/boletas/deleteBoletaById/{id}
export function deleteBoleta(id) {
  return apiFetch(`/api/boletas/deleteBoletaById/${id}`, {
    method: "DELETE",
  });
}

/* ==========================
   ADMINISTRADORES (administrador-controller)
   ========================== */

// GET /administradores
export function getAdministradores() {
  return apiFetch("/administradores");
}

// GET /administradores/activos
export function getAdministradoresActivos() {
  return apiFetch("/administradores/activos");
}

// GET /administradores/{id}
export function getAdministradorById(id) {
  return apiFetch(`/administradores/${id}`);
}

// GET /administradores/rol/{rol}
export function getAdministradoresByRol(rol) {
  return apiFetch(`/administradores/rol/${encodeURIComponent(rol)}`);
}

// POST /administradores
export function createAdministrador(data) {
  return apiFetch("/administradores", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /administradores
export function updateAdministrador(data) {
  return apiFetch("/administradores", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// PUT /administradores/{id}/rol/{nuevoRol}
export function cambiarRolAdministrador(id, nuevoRol) {
  return apiFetch(
    `/administradores/${id}/rol/${encodeURIComponent(nuevoRol)}`,
    { method: "PUT" }
  );
}

// PUT /administradores/{id}/desactivar
export function desactivarAdministrador(id) {
  return apiFetch(`/administradores/${id}/desactivar`, {
    method: "PUT",
  });
}

// PUT /administradores/{id}/activar
export function activarAdministrador(id) {
  return apiFetch(`/administradores/${id}/activar`, {
    method: "PUT",
  });
}

// DELETE /administradores/{id}
export function deleteAdministrador(id) {
  return apiFetch(`/administradores/${id}`, {
    method: "DELETE",
  });
}

/* =============================
   ADMINISTRADORES
   (para UserNew.jsx)
============================= */

// POST /administradores
export function addAdministrador(data) {
  return apiFetch("/administradores", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* =============================
   VENDEDORES
============================= */

// POST /api/vendedores/saveVendedor
export function addVendedor(data) {
  return apiFetch("/api/vendedores/saveVendedor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* =============================
   CLIENTES
============================= */

// POST /clientes
export function addCliente(data) {
  return apiFetch("/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
