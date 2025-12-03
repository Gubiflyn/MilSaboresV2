import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import {
  saveLocalstorage,
  loadFromLocalstorage,
} from "../utils/localstorageHelper";
import { Modal, Toast } from "bootstrap";
import { useCart } from "../context/CartContext";
import { getPasteles } from "../services/api";

const categorias = [
  "Todas",
  "Tortas Cuadradas",
  "Tortas Circulares",
  "Postres Individuales",
  "Productos Sin Azúcar",
  "Pastelería Tradicional",
  "Productos Sin Gluten",
  "Productos Vegana",
];

const LS_KEY = "tortas_v3";

const Productos = () => {
  const [tortas, setTortas] = useState([]);
  const [categoria, setCategoria] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { add } = useCart();

  useEffect(() => {
    const cargarTortas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Intentar siempre API primero
        const data = await getPasteles();
        const normalizadas = Array.isArray(data)
          ? data.map((t) => ({
              ...t,
              stock: t?.stock ?? 0,
             
              categoria:
                typeof t.categoria === "string"
                  ? t.categoria
                  : t.categoria?.nombre || "",
            }))
          : [];

        setTortas(normalizadas);
        saveLocalstorage(LS_KEY, normalizadas);
      } catch (err) {
        console.error("Error al cargar pasteles desde la API:", err);
        setError("No se pudieron cargar los productos desde el servidor.");

        // Fallback: lo que haya en localStorage
        const guardadas = loadFromLocalstorage(LS_KEY);
        if (Array.isArray(guardadas) && guardadas.length) {
          setTortas(guardadas);
        } else {
          setTortas([]);
        }
      } finally {
        setLoading(false);
      }
    };

    cargarTortas();
  }, []);

  const handleAgregar = (torta) => {
    add({ ...torta, cantidad: 1 });

    const toastEl = document.getElementById("toastAgregado");
    if (toastEl) Toast.getOrCreateInstance(toastEl).show();

    const modalEl = document.getElementById("carritoModal");
    if (modalEl) Modal.getOrCreateInstance(modalEl).show();
  };

  const tortasFiltradas =
    categoria === "Todas"
      ? tortas
      : tortas.filter((t) => t.categoria === categoria);

  if (loading) {
    return (
      <div className="container py-5">
        <p className="text-center">Cargando productos...</p>
      </div>
    );
  }

  if (!loading && error && tortas.length === 0) {
    return (
      <div className="container py-5">
        <p className="text-center text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Nuestros Pasteles</h2>
      <div className="mb-4 text-center">
        <label htmlFor="categoryFilter" className="form-label fw-bold">
          Filtrar por Categoría:
        </label>
        <select
          id="categoryFilter"
          className="form-select w-auto d-inline-block"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {tortasFiltradas.length > 0 ? (
          tortasFiltradas.map((torta) => (
            <Card
              key={torta.codigo}
              torta={torta}
              onAgregarCarrito={handleAgregar}
            />
          ))
        ) : (
          <p className="text-center">
            No hay productos disponibles en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
};

export default Productos;
