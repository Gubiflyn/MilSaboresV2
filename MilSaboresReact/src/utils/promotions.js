// src/utils/promotions.js

// === Redondeo CLP ===
const CLP = (n) => Math.max(0, Math.round(Number(n) || 0));

/* =========================
   Helpers de lectura/normalización
   ========================= */
const safeJSON = (raw, fallback) => {
  try { return JSON.parse(raw); } catch { return fallback; }
};

const readLSRaw = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const readLS = (key) => safeJSON(readLSRaw(key), null);

const normalizeUser = (u = {}) => {
  const email = String(u.email || u.correo || "").trim();
  const beneficio = String(u.beneficio || "").trim();
  const codigoRegistro = String(
    u.codigoRegistro || u.codigo || u.cupon || ""
  ).trim();
  const fechaNacimiento = u.fechaNacimiento || null;

  return {
    email,
    correo: email,
    beneficio,
    codigoRegistro,
    fechaNacimiento,
  };
};

// ahora el último visto por email sobreescribe (queremos que ms_user gane)
const dedupeByEmail = (arr) => {
  const m = new Map();
  for (const it of arr) {
    const e = String(it.email || it.correo || "").toLowerCase();
    if (!e) continue;
    m.set(e, it);
  }
  return [...m.values()];
};

const loadProfiles = () => {
  const sources = [];

  // 1) Sesión actual de Mil Sabores
  const msUser = readLS("ms_user");
  if (msUser && typeof msUser === "object") {
    sources.push(normalizeUser(msUser));
  }

  // 2) Colecciones tipo lista
  for (const key of ["perfiles", "usuarios", "users"]) {
    const arr = readLS(key);
    if (Array.isArray(arr)) sources.push(...arr.map(normalizeUser));
  }

  // 3) Posibles usuarios sueltos
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
  return (
    perfiles.find(
      (p) => (p.correo || p.email || "").toLowerCase() === e
    ) || null
  );
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
    return (
      qs.get("code") ||
      qs.get("cupon") ||
      qs.get("coupon") ||
      ""
    ).trim();
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
export function applyPromotions({
  items = [],
  customerEmail = "",
  couponCode = "",
} = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = CLP(
    safeItems.reduce((acc, it) => acc + lineTotal(it), 0)
  );

  // Perfil por email
  const profile = findProfileByEmail(customerEmail);
  const age = calcAge(profile?.fechaNacimiento);
  const beneficio = normCode(profile?.beneficio);

  // código asociado SOLO al perfil + query param + parámetro directo
  const profileCode = normCode(profile?.codigoRegistro);
  const queryCode = normCode(getQueryCoupon());
  const paramCode = normCode(couponCode);

  const effectiveCoupon = paramCode || profileCode || queryCode;

  // Flags de reglas
  const isOver50Flag =
    beneficio === "50%" ||
    beneficio === "MAYOR50" ||
    beneficio === "MAYOR_50";

  const isOver50 =
    (Number.isFinite(age) && age >= 50) || isOver50Flag;

  const hasFelices50 = effectiveCoupon === "FELICES50";

  const isDuocBday =
    isDuocEmail(customerEmail) &&
    isBirthdayToday(profile?.fechaNacimiento);

  // 1) Torta gratis (DUOC + cumpleaños)
  let cakeDiscount = 0;
  if (isDuocBday) {
    const tortas = safeItems
      .filter(
        (it) =>
          isCake(it) &&
          Number(it.precio) > 0 &&
          Number(it.cantidad) > 0
      )
      .map((it) => ({ ...it, precioU: Number(it.precio) }));
    if (tortas.length > 0) {
      const cheapest = tortas.reduce((min, it) =>
        it.precioU < min.precioU ? it : min
      , tortas[0]);
      cakeDiscount = CLP(cheapest.precioU);
    }
  }

  const baseAfterCake = CLP(subtotal - cakeDiscount);

  // 2) Porcentaje: 50% si mayor de 50, si no 10% si FELICES50
  let perc = 0;
  if (isOver50) perc = 0.5;
  else if (hasFelices50) perc = 0.1;

  const percDiscount = CLP(baseAfterCake * perc);

  const descuento = CLP(cakeDiscount + percDiscount);
  const total = CLP(subtotal - descuento);

  const detalles = [];
  if (isDuocBday)
    detalles.push(
      "Torta gratis por cumpleaños con correo DUOC (1 unidad)."
    );
  if (isOver50)
    detalles.push("Descuento 50% por ser mayor de 50 años.");
  else if (hasFelices50)
    detalles.push("Descuento 10% por código FELICES50.");

  return {
    subtotal,
    descuento,
    total,
    breakdown: {
      porcentaje: perc,
      percDiscount,
      cakeDiscount,
      detalles,
      applied: { isOver50, hasFelices50, isDuocBday },
    },
  };
}
