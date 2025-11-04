// src/components/Mototaxis/mototaxiService.ts
import { api } from "../../lib/api";

export interface Mototaxi {
  id: number;
  modelo: string;
  color: string;
  año: number;
  serie: string;
  precio: number;
  imagen?: string;
  kilometraje?: number;
  observaciones?: string;
}

export async function getMototaxis(): Promise<Mototaxi[]> {
  const res = await fetch((api("/mototaxis")));
  if (!res.ok) throw new Error("Error al obtener mototaxis");
  return res.json();
}

export async function createMototaxi(data: Partial<Mototaxi>): Promise<Mototaxi> {
  const res = await fetch((api("/mototaxis")), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear mototaxi");
  return res.json();
}

export async function updateMototaxi(id: number, data: Partial<Mototaxi>): Promise<Mototaxi> {
  const res = await fetch((api(`/mototaxis/${id}`)), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar mototaxi");
  return res.json();
}

export async function deleteMototaxi(id: number): Promise<void> {
  const res = await fetch((api(`/mototaxis/${id}`)), { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar mototaxi");
}
