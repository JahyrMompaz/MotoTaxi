// src/components/Mototaxis/mototaxiService.ts
import { api } from "../../lib/api";

export interface Mototaxi {
  id: number;
  modelo: string;
  color: string;
  marca?: string;
  anio: number;
  numero_serie: string;
  precio: number;
  imagen?: string;
  imagenFile?: File | null;
  existencia?: number;
  codigo?: string;
}

export async function getMototaxis(): Promise<Mototaxi[]> {
  const res = await fetch((api("/mototaxis")), { 
    method: "GET", 
    headers: { "Accept": "application/json" },
    credentials: "include",     
  });
  if (!res.ok) throw new Error("Error al obtener mototaxis");
  const json = await res.json();
  return Array.isArray(json) ? json : json.data ?? [];
}

export async function createMototaxi(data: Partial<Mototaxi>): Promise<Mototaxi> {
  const formData = new FormData();
  if (data.imagenFile) {
    formData.append("imagen", data.imagenFile);
  }
  delete data.imagenFile;

  Object.entries(data).forEach(([key, value]) => {
    if( key == "imagen" ||key === "imagenFile") return;
    if (value === undefined || value === null || value ==="") return; 
      formData.append(key, value as any);
  });

  const res = await fetch((api("/mototaxis")), {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al crear mototaxi");
  return res.json();
}

export async function updateMototaxi(id: number, data: Partial<Mototaxi>): Promise<Mototaxi> {
  const formData = new FormData();
  if (data.imagenFile) {
    formData.append("imagen", data.imagenFile);
  }
  delete data.imagenFile;
  Object.entries(data).forEach(([key, value]) => {
    if( key == "imagen" ||key === "imagenFile") return;
    if (value === undefined || value === null || value === "")return; 
      formData.append(key, value as any);
  });

  const res = await fetch((api(`/mototaxis/${id}`)), {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al actualizar mototaxi");
  return res.json();
}

export async function deleteMototaxi(id: number): Promise<void> {
  const res = await fetch((api(`/mototaxis/${id}`)), { 
    method: "DELETE",
    credentials: "include",
    headers: { "Accept": "application/json" }
  });
  if (!res.ok) throw new Error("Error al eliminar mototaxi");
}
