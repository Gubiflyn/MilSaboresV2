import seed from "../data/usuarios.json";

// Normaliza perfiles guardados en localStorage (registro)
function normalizePerfiles(rawPerfiles = []) {
  return (rawPerfiles || [])
    .map((p) => {
      const nombrePlano =
        (p.nombre ?? "").toString().trim() ||
        `${p.nombres || ""} ${p.apellidos || ""}`.trim();
      const emailPlano = (p.email ?? p.correo ?? "").toString().trim().toLowerCase();

      return {
        nombre: nombrePlano || "Sin nombre",
        email: emailPlano,
        rol: p.rol || "cliente",
        beneficio: p.beneficio || "—",
        fechaNacimiento: p.fechaNacimiento || "—",
      };
    })
    .filter((u) => !!u.email);
}

// Normaliza usuarios del seed
function normalizeSeed(seedUsers = []) {
  return (seedUsers || []).map((u) => ({
    nombre: u.nombre || "Sin nombre",
    email: (u.email || "").toLowerCase(),
    rol: u.rol || "cliente",
    beneficio: u.beneficio || "—",
    fechaNacimiento: u.fechaNacimiento || "—",
  }));
}

// Evita duplicados por email (último gana)
function uniqueByEmail(arr) {
  const map = new Map();
  for (const u of arr) {
    if (!u?.email) continue;
    map.set(u.email.toLowerCase(), u);
  }
  return [...map.values()];
}

// === API pública ===
export function getAllUsers() {
  const rawPerfiles = JSON.parse(localStorage.getItem("perfiles") || "[]");
  const perfiles = normalizePerfiles(rawPerfiles);
  const seedUsers = normalizeSeed(seed);
  return uniqueByEmail([...seedUsers, ...perfiles]);
}

export function findUserByEmail(email) {
  if (!email) return null;
  const all = getAllUsers();
  return all.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
}

// Lee historial de órdenes desde distintas llaves posibles
function readAllOrdersFromLS() {
  const keys = ["ordenes_v1", "orders_v1", "historialCompras", "ordenes", "orders"];
  for (const k of keys) {
    try {
      const arr = JSON.parse(localStorage.getItem(k) || "[]");
      if (Array.isArray(arr) && arr.length) return arr;
    } catch {}
  }
  return [];
}

export function getOrderHistoryByEmail(email) {
  const all = readAllOrdersFromLS();

  // Soporta distintas estructuras: {userEmail}, {usuario:{email}}, {cliente:{email}}, etc.
  const byEmail = (o) =>
    (o.userEmail || o.email || o?.usuario?.email || o?.cliente?.email || "")
      .toString()
      .toLowerCase() === (email || "").toLowerCase();

  const list = all.filter(byEmail);

  // Ordenar descendente por fecha si existe (date, fecha, createdAt…)
  const getDate = (o) => new Date(o.date || o.fecha || o.createdAt || o.created_at || 0).getTime();
  return list.sort((a, b) => getDate(b) - getDate(a));
}
