// src/utils/promotions.js
const CLP = (n) => Math.max(0, Math.round(n || 0));

const loadProfiles = () => {
  try { return JSON.parse(localStorage.getItem("perfiles") || "[]"); }
  catch { return []; }
};

const findProfileByEmail = (email) => {
  if (!email) return null;
  const perfiles = loadProfiles();
  return perfiles.find(p => (p.correo || p.email)?.toLowerCase() === email.toLowerCase()) || null;
};

const calcAge = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

const isBirthdayToday = (isoDate) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  const t = new Date();
  return d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

const isDuocEmail = (email) => /\b@duocuc\.cl$/i.test(email || "");

const itemSubtotal = (it) => (it.precio || it.price || 0) * (it.cantidad || it.qty || 1);

export function applyPromotions({ items, customerEmail }) {
  const profile = findProfileByEmail(customerEmail);
  const email = customerEmail || profile?.correo || profile?.email || "";
  const age = calcAge(profile?.fechaNacimiento || profile?.nacimiento || profile?.dob);
  const hasFELICES50 = (profile?.codigoRegistro || profile?.codigo || "").toUpperCase() === "FELICES50";

  // 1) Subtotal base
  const subtotal = CLP(items.reduce((acc, it) => acc + itemSubtotal(it), 0));

  // 2) Descuento %: elegimos el mejor entre 50% (>=50 años) y 10% (FELICES50)
  const perc = Math.max(age >= 50 ? 0.5 : 0, hasFELICES50 ? 0.1 : 0);
  const percDiscount = CLP(subtotal * perc);

  // 3) Torta gratis por cumpleaños DUOC: 1 unidad de la torta más barata
  // Detectamos "torta" por nombre/categoría (case-insensitive).
  let birthdayDiscount = 0;
  let birthdayNote = null;
  if (email && isDuocEmail(email) && isBirthdayToday(profile?.fechaNacimiento || profile?.nacimiento || profile?.dob)) {
    const tortas = items
      .filter(it => {
        const nombre = (it.nombre || it.name || "").toLowerCase();
        const categoria = (it.categoria || it.category || "").toLowerCase();
        return nombre.includes("torta") || categoria.includes("torta");
      })
      .flatMap(it => {
        const qty = it.cantidad || it.qty || 1;
        // Consideramos 1 unidad para la promo
        return qty > 0 ? [{ ref: it, unitPrice: (it.precio || it.price || 0) }] : [];
      })
      .sort((a, b) => a.unitPrice - b.unitPrice);

    if (tortas.length > 0) {
      birthdayDiscount = CLP(tortas[0].unitPrice);
      birthdayNote = `Torta gratis cumpleaños DUOC: -$${birthdayDiscount.toLocaleString("es-CL")} (${tortas[0].ref.nombre || "Torta"})`;
    }
  }

  // 4) Total y detalle
  const descuento = CLP(percDiscount + birthdayDiscount);
  const total = CLP(subtotal - descuento);

  const detalles = [];
  if (perc === 0.5) detalles.push("Descuento 50% por edad (≥50 años)");
  if (perc === 0.1) detalles.push('Descuento 10% de por vida (código "FELICES50")');
  if (birthdayDiscount > 0 && birthdayNote) detalles.push(birthdayNote);

  return {
    subtotal,
    descuento,
    total,
    breakdown: {
      porcentaje: perc,           // 0, 0.1 o 0.5
      percDiscount,               // monto por % aplicado
      birthdayDiscount,           // monto torta gratis
      detalles,                   // textos para mostrar/notas de boleta
      profileUsed: !!profile
    }
  };
}
