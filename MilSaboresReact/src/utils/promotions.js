// src/utils/promotions.js

// === Redondeo CLP ===
const CLP = (n) => Math.max(0, Math.round(Number(n) || 0));

/* =========================
   Helpers de lectura/normalización
   ========================= */
const safeJSON = (raw, fallback) => {
  try { return JSON.parse(raw); } catch { return fallback; }
};

const readLS = (key) => safeJSON(localStorage.getItem(key), null);

const normalizeUser = (u = {}) => {
  const email = String(u.email || u.correo || "").trim();
  const beneficio = String(u.beneficio || "").trim();
  const codigoRegistro = String(u.codigoRegistro || u.codigo || u.cupon || "").trim();
  const fechaNacimiento = u.fechaNacimiento || null;
  return { email, correo: email, beneficio, codigoRegistro, fechaNacimiento };
};

const dedupeByEmail = (arr) => {
  const m = new Map();
  for (const it of arr) {
    const e = String(it.email || it.correo || "").toLowerCase();
    if (!e) continue;
    if (!m.has(e)) m.set(e, it);
  }
  return [...m.values()];
};

const loadProfiles = () => {
  const sources = [];

  // Colecciones tipo lista
  for (const key of ["perfiles", "usuarios", "users"]) {
    const arr = readLS(key);
    if (Array.isArray(arr)) sources.push(...arr.map(normalizeUser));
  }

  // Usuario logeado (llaves habituales)
  for (const key of ["authUser", "user", "usuario", "currentUser"]) {
    const u = readLS(key);
    if (u && typeof u === "object") sources.push(normalizeUser(u));
  }

  return dedupeByEmail(sources);
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
  if (isNaN(d)) return null;
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
};

const isDuocEmail = (email) =>
  /\b@(duocuc|duoc)\.cl$/i.test(String(email || "").trim());

const isBirthdayToday = (isoDate) => {
  if (!isoDate) return false;
  try {
    const [year, month, day] = isoDate.split("-").map(Number);
    const today = new Date();
    return today.getDate() === day && today.getMonth() + 1 === month;
  } catch {
    return false;
  }
};

const getQueryCoupon = () => {
  try {
    const qs = new URLSearchParams(window.location.search);
    return (qs.get("code") || qs.get("cupon") || qs.get("coupon") || "").trim();
  } catch {
    return "";
  }
};

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
   Normalización de códigos/beneficios
   ========================= */
const normCode = (s) => String(s || "").toUpperCase().trim();

/* =========================
   Lógica principal
   ========================= */
/**
 * applyPromotions({ items, customerEmail, couponCode })
 *  - items: array de ítems del carrito
 *  - customerEmail: correo del usuario actual
 *  - couponCode: (opcional) código ingresado (ej: "felices50")
 */
export function applyPromotions({ items = [], customerEmail = "", couponCode = "" } = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = CLP(safeItems.reduce((acc, it) => acc + lineTotal(it), 0));

  // Perfil por email, si existe
  const profile = findProfileByEmail(customerEmail);
  const age = calcAge(profile?.fechaNacimiento);
  const beneficio = normCode(profile?.beneficio);
  const storedCode =
    normCode(profile?.codigoRegistro) ||
    normCode(readLS("codigoRegistro")) ||
    normCode(readLS("cupon")) ||
    normCode(readLS("coupon")) ||
    normCode(getQueryCoupon());

  // Código recibido directamente por parámetro (prioridad alta)
  const paramCode = normCode(couponCode);

  // === Flags
  const isOver50 = (Number.isFinite(age) && age >= 50) || beneficio === "50%";
  const hasFelices50 =
    paramCode === "FELICES50" ||
    storedCode === "FELICES50" ||
    beneficio === "FELICES50";

  // Torta gratis SOLO si: correo DUOC y hoy es su cumpleaños
  const isDuocBday = isDuocEmail(customerEmail) && isBirthdayToday(profile?.fechaNacimiento);

  // 1) Torta gratis por DUOC en cumpleaños: 1 unidad (torta más barata) gratis
  let cakeDiscount = 0;
  if (isDuocBday) {
    const tortas = safeItems
      .filter((it) => isCake(it) && Number(it.precio) > 0 && Number(it.cantidad) > 0)
      .map((it) => ({ ...it, precioU: Number(it.precio) }));
    if (tortas.length > 0) {
      const cheapest = tortas.reduce((min, it) => (it.precioU < min.precioU ? it : min), tortas[0]);
      cakeDiscount = CLP(cheapest.precioU);
    }
  }

  // Base luego de la torta gratis
  const baseAfterCake = CLP(subtotal - cakeDiscount);

  // 2) Porcentajes: 50% si ≥50, sino 10% si FELICES50
  let perc = 0;
  if (isOver50) perc = 0.5;
  else if (hasFelices50) perc = 0.1;

  const percDiscount = CLP(baseAfterCake * perc);

  // Totales
  const descuento = CLP(cakeDiscount + percDiscount);
  const total = CLP(subtotal - descuento);

  const detalles = [];
  if (isDuocBday) detalles.push("Torta gratis por cumpleaños con correo DUOC (1 unidad).");
  if (isOver50) detalles.push("Descuento 50% por ser mayor de 50 años.");
  else if (hasFelices50) detalles.push("Descuento 10% por código FELICES50.");

  return {
    subtotal,
    descuento,
    total,
    breakdown: {
      porcentaje: perc,
      percDiscount,
      cakeDiscount,
      detalles,
      applied: { isOver50, hasFelices50, isDuocBday }
    }
  };
}
