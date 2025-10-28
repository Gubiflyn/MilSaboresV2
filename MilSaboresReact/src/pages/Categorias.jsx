import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { useCart } from "../context/CartContext";
import tortasJson from "../data/tortas.json";

const LS_KEY = "tortas_v3";

export default function Categorias() {
  const [tortas, setTortas] = useState([]);
  const { add } = useCart();

  // Cargar productos desde localStorage o archivo JSON
  useEffect(() => {
    const guardadas = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (guardadas === null) {
      localStorage.setItem(LS_KEY, JSON.stringify(tortasJson));
      setTortas(tortasJson);
    } else {
      setTortas(guardadas);
    }
  }, []);

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const set = new Set(tortas.map((t) => t.categoria).filter(Boolean));
    return Array.from(set);
  }, [tortas]);

  // Agregar al carrito
  const handleAgregar = (torta) => {
    add({ ...torta, cantidad: 1 });
  };

  if (tortas.length === 0) {
    return (
      <section className="container py-5">
        <h2 className="text-center mb-4">Categorías y Productos</h2>
        <p className="text-center text-muted">No hay productos disponibles.</p>
      </section>
    );
  }

  return (
    <section className="container py-5">
      <h2 className="text-center mb-4">Categorías y Productos</h2>

      {/* Índice de categorías */}
      {categorias.length > 1 && (
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
          {categorias.map((cat) => (
            <a
              key={cat}
              href={`#cat-${encodeURIComponent(cat)}`}
              className="btn btn-outline-primary btn-sm"
            >
              {cat}
            </a>
          ))}
        </div>
      )}

      {categorias.map((cat) => {
        const lista = tortas.filter((t) => t.categoria === cat);
        return (
          <div key={cat} className="mb-5">
            <h3
              id={`cat-${encodeURIComponent(cat)}`}
              className="mb-3 text-capitalize"
            >
              {cat}
            </h3>

            <div className="row row-cols-1 row-cols-md-3 g-4">
              {lista.map((torta) => (
                <Card
                  key={torta.codigo}
                  torta={torta}
                  onAgregarCarrito={handleAgregar}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
