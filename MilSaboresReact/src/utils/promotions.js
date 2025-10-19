// src/utils/promotions.js
import usuariosSeed from "../data/usuarios.json";

// Redondeo tipo CLP
const CLP = (n) => Math.max(0, Math.round(Number(n) || 0));

/* =========================
   Helpers de perfiles/usuarios
   ========================= */
const loadProfiles = () => {
  try {
    // 1) Si existe en localStorage (key 'perfiles'), úsalo
    const ls = JSON.parse(localStorage.getItem("perfiles") || "[]");
    if (Array.isArray(ls) && ls.length) return ls;

    // 2) Fallback: mapear usuarios.json al formato esperado por las promos
    const seed = Array.isArray(usuariosSeed) ? usuariosSeed : [];
    return seed.map(u => ({
      correo: u.email,                  // alias 'correo'/'email'
      email: u.email,
      fechaNacimiento: u.fechaNacimiento || null,
      beneficio: (u.beneficio || "").toUpperCase().trim(), // ej: "50%"
      codigoRegistro: (u.codigoRegistro || "").toUpperCase().trim()
    }));
  } catch {
    // último recurso: vacío
    return [];
  }
};

const findProfileByEmail = (email) => {
  if (!email) return null;
  const perfiles = loadProfiles();
  const e = String(email).toLowerCase();
  return perfiles.find((p) => (p.correo || p.email || "").toLowerCase() === e) || null;
};

const calcAge = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return null;
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
};

const isBirthdayToday = (isoDate) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return false;
  const t = new Date();
  return d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

const isDuocEmail = (email) => /\b@duocuc\.cl$/i.test(String(email || "").trim());

/* =========================
   Helpers de ítems
   ========================= */
const lineTotal = (item) => {
  const p = Number(item?.precio || 0);
  const q = Number(item?.cantidad || 1);
  return CLP(p * q);
};

const isCake = (item) => {
  const cat = (item?.categoria || "").toLowerCase();
  const name = (item?.nombre || "").toLowerCase();
  return cat.includes("torta") || name.includes("torta");
};

/* =========================
   Lógica principal de promociones
   ========================= */
/**
 * items: array de { precio, cantidad, ... }
 * customerEmail: string (correo del formulario o del usuario logueado)
 * Devuelve:
 * {
 *   subtotal, descuento, total,
 *   breakdown: {
 *     porcentaje,          // 0 | 0.1 | 0.5
 *     percDiscount,        // monto por % aplicado
 *     birthdayDiscount,    // monto por torta gratis DUOC (1 unidad)
 *     detalles: [string],  // mensajes informativos
 *     applied: { isOver50, isFelices50, isDuocBirthday }
 *   }
 * }
 */
export function applyPromotions({ items = [], customerEmail = "" } = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = CLP(safeItems.reduce((acc, it) => acc + lineTotal(it), 0));

  // Perfil por email (usuarios.json o localStorage 'perfiles')
  const profile = findProfileByEmail(customerEmail);
  const age = calcAge(profile?.fechaNacimiento);
  const beneficio = (profile?.beneficio || "").toUpperCase().trim();
  const usedCode = (profile?.codigoRegistro || "").toUpperCase().trim();

  // Flags
  const isOver50 = (Number.isFinite(age) && age >= 50) || beneficio === "50%";
  const isFelices50 = usedCode === "FELICES50";
  const isDuocBirthday = isDuocEmail(customerEmail) && isBirthdayToday(profile?.fechaNacimiento);

  // 1) Torta gratis (DUOC en cumpleaños): descuenta 1 torta (la más barata)
  let birthdayDiscount = 0;
  if (isDuocBirthday) {
    const tortas = safeItems
      .filter((it) => isCake(it) && Number(it.precio) > 0 && Number(it.cantidad) > 0)
      .map((it) => ({ ...it, precioU: Number(it.precio) }));

    if (tortas.length > 0) {
      const cheapest = tortas.reduce((min, it) => (it.precioU < min.precioU ? it : min), tortas[0]);
      birthdayDiscount = CLP(cheapest.precioU); // 1 unidad gratis
    }
  }

  // Subtotal luego de torta gratis
  const baseAfterBirthday = CLP(subtotal - birthdayDiscount);

  // 2) Descuento porcentual:
  //    - Si es mayor de 50 => 50%
  //    - Sino, si usó FELICES50 => 10%
  //    - Sino => 0%
  let perc = 0;
  if (isOver50) perc = 0.5;
  else if (isFelices50) perc = 0.1;

  const percDiscount = CLP(baseAfterBirthday * perc);

  // Totales finales
  const descuento = CLP(birthdayDiscount + percDiscount);
  const total = CLP(subtotal - descuento);

  // Mensajes
  const detalles = [];
  if (isDuocBirthday) detalles.push("Torta gratis por cumpleaños DUOC (1 unidad).");
  if (isOver50) detalles.push("Descuento 50% por ser mayor de 50 años.");
  else if (isFelices50) detalles.push("Descuento 10% permanente por código FELICES50.");

  return {
    subtotal,
    descuento,
    total,
    breakdown: {
      porcentaje: perc,
      percDiscount,
      birthdayDiscount,
      detalles,
      applied: { isOver50, isFelices50, isDuocBirthday }
    }
  };
}
