// src/utils/categories.js
const LS_CATEGORIES = "categorias_v1";

export function getCategories() {
  try {
    const raw = localStorage.getItem(LS_CATEGORIES);
    const arr = raw ? JSON.parse(raw) : [];
    // Normaliza: string[] únicos y ordenados
    return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  } catch {
    return [];
  }
}

export function setCategories(list) {
  const clean = Array.from(new Set((list || []).filter(Boolean)));
  localStorage.setItem(LS_CATEGORIES, JSON.stringify(clean));
}

// Opcional: sembrar desde tortas.json la 1ª vez
export function seedCategoriesFromProducts(products = []) {
  if (!localStorage.getItem(LS_CATEGORIES)) {
    const fromProducts = Array.from(new Set(products.map(p => p.categoria).filter(Boolean)));
    if (fromProducts.length) setCategories(fromProducts);
  }
}
