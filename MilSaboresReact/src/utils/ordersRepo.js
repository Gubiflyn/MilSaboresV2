// src/utils/ordersRepo.js
const KEY = "ordenes_v1";

export function listOrders() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  // order esperado: { id, userEmail, items, total, date, estado, ... }
  const list = listOrders();
  list.push(order);
  localStorage.setItem(KEY, JSON.stringify(list));
  return order;
}

export function getHistoryByEmail(email) {
  const all = listOrders();
  const norm = (s) => (s || "").toString().toLowerCase();
  const isUser = (o) =>
    norm(o.userEmail || o.email || o?.usuario?.email || o?.cliente?.email) === norm(email);

  const toTime = (o) => new Date(o.date || o.fecha || o.createdAt || o.created_at || 0).getTime();
  return all.filter(isUser).sort((a, b) => toTime(b) - toTime(a));
}
