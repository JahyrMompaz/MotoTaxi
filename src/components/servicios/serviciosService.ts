import { Servicio } from "./types";
import { api } from "../../lib/api";

export async function getServicios(): Promise<Servicio[]> {
  const res = await fetch((api(`/servicios`)));
  if (!res.ok) throw new Error("Error al obtener servicios");
  return res.json();
}

export async function createServicio(data: Partial<Servicio>): Promise<Servicio> {
  const res = await fetch((api(`/servicios`)), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear servicio");
  return res.json();
}

export async function updateServicio(id: number, data: Partial<Servicio>): Promise<Servicio> {
  const res = await fetch((api(`servicios/${id}`)), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar servicio");
  return res.json();
}

export async function deleteServicio(id: number): Promise<void> {
  const res = await fetch((api(`servicios/${id}`)), { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar servicio");
}

export async function updateEstatus(id: number, estatus: string): Promise<Servicio> {
  const res = await fetch((api(`servicios/${id}/estatus`)), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estatus }),
  });
  if (!res.ok) throw new Error("Error al cambiar estatus");
  return res.json();
}
