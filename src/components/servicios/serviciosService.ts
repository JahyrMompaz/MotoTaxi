import { Servicio } from "./types";
import { api } from "../../lib/api";

export async function getServicios(): Promise<Servicio[]> {
  const res = await fetch((api(`/servicios`)), {
    method: "GET",
    headers: { "Accept": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener servicios");
  const json = await res.json();
  const arr = Array.isArray(json) ? json : json.data ?? [];

  return arr.map((s: any) => ({
    id: s.id,

    // ✔ AQUÍ SE CORRIGE EL PROBLEMA
    cliente_id: Number(s.cliente_id),
    cliente: s.cliente.nombre ,
    tipo: s.tipo ,
    tecnico: s.tecnico ,
    fecha_ingreso: s.fecha_ingreso,
    estatus: s.estatus,
    costo_real: s.costo_real,
    descripcion: s.descripcion,
    observaciones: s.observaciones,
  }));
}

export async function createServicio(data: Partial<Servicio>): Promise<Servicio> {
  const res = await fetch((api(`/servicios`)), {
    method: "POST",
    headers: {  "Accept" : "application/json" , "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear servicio");
  return res.json();
}

export async function updateServicio(id: number, data: Partial<Servicio>): Promise<Servicio> {
  const res = await fetch((api(`servicios/${id}`)), {
    method: "PUT",
    headers: {  "Accept" : "application/json", "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar servicio");
  return res.json();
}

export async function deleteServicio(id: number): Promise<void> {
  const res = await fetch((api(`servicios/${id}`)), { 
    method: "DELETE",
    headers: { "Accept": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al eliminar servicio");
}

export async function updateEstatus(id: number, estatus: string): Promise<Servicio> {
  const res = await fetch((api(`servicios/${id}/estatus`)), {
    method: "PATCH",
    headers: {  "Accept" : "application/json" },
    credentials: "include",
    body: JSON.stringify({ estatus }),
  });
  if (!res.ok) throw new Error("Error al cambiar estatus");
  return res.json();
}
