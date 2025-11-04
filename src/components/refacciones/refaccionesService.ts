// src/components/Refacciones/refaccionesService.ts
import { Refaccion } from "./types";
import { api } from "../../lib/api";

export async function getRefacciones(): Promise<Refaccion[]> {
  const res = await fetch((api("/refacciones")));
  if (!res.ok) throw new Error("Error al obtener refacciones");
  return res.json();
}

export async function createRefaccion(data: Partial<Refaccion>): Promise<Refaccion> {
  const res = await fetch((api("/refacciones")), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear refacción");
  return res.json();
}

export async function updateRefaccion(id: number, data: Partial<Refaccion>): Promise<Refaccion> {
  const res = await fetch((api(`refacciones/${id}`)), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar refacción");
  return res.json();
}

export async function deleteRefaccion(id: number): Promise<void> {
  const res = await fetch((api(`/${id}`)), { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar refacción");
}
