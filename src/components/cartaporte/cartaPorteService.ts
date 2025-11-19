import { api } from "../../lib/api";
import { CartaPorte, CartaPorteFormData, CartaPortePayload } from "./types";

// Obtener todas las Cartas Porte
export async function getCartasPorte(): Promise<CartaPorte[]> {
  const res = await fetch(api("/cartas-porte"), {
    method: "GET",
    headers: { "Accept": "application/json" },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al obtener Cartas Porte");
  const json = await res.json();
  return json.data;
}

// Crear Carta Porte
export async function createCartaPorte(data: CartaPortePayload) {
  const res = await fetch(api("/cartas-porte"), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear Carta Porte");
  return res.json();
}

// Actualizar
export async function updateCartaPorte(id: number, data: Partial<CartaPorteFormData>) {
  const res = await fetch(api(`/cartas-porte/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al actualizar Carta Porte");
  return res.json();
}

// Eliminar
export async function deleteCartaPorte(id: number) {
  const res = await fetch(api(`/cartas-porte/${id}`), {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al eliminar Carta Porte");
  return true;
}

export async function downloadCartaPortePDF(id: number) {
  const res = await fetch(api(`/cartas-porte/${id}/pdf`), {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    console.error("Error descargando PDF");
    throw new Error("Error al descargar PDF");
  };

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Carta-Porte-${id}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}
