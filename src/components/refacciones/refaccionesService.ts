// src/components/Refacciones/refaccionesService.ts
import { Refaccion } from "./types";
import { api } from "../../lib/api";

export async function getRefacciones(): Promise<Refaccion[]> {
  const res = await fetch((api("/refacciones")), { 
    method: "GET", 
    headers: { "Accept": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener refacciones");
  const json = await res.json();
  return Array.isArray(json) ? json : json.data ?? [];
}

export async function createRefaccion(data: Partial<Refaccion>): Promise<Refaccion> {
  const res = await fetch((api("/refacciones")), {
    method: "POST",
    headers: {  "Accept": "application/json" , "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear refacción");
  return res.json();
}

export async function updateRefaccion(id: number, data: Partial<Refaccion>): Promise<Refaccion> {
  const res = await fetch((api(`/refacciones/${id}`)), {
    method: "PUT",
    headers: {  "Accept": "application/json" , "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar refacción");
  return res.json();
}

export async function deleteRefaccion(id: number): Promise<void> {
  const res = await fetch((api(`/refacciones/${id}`)), { 
    method: "DELETE",
    credentials: "include",
    headers: { "Accept": "application/json" }
  });
  if (!res.ok) throw new Error("Error al eliminar refacción");
}
