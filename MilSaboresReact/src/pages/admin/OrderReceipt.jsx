import React from "react";
import { Link } from "react-router-dom";
import Boleta from "../Boleta"; 

export default function OrderReceipt() {
  return (
    <div className="p-3">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{margin:0}}>Boleta (Admin)</h2>
        <Link to="/admin/pedidos" className="btn btn-secondary">Volver a Órdenes</Link>
      </div>
      <Boleta />
    </div>
  );
}
