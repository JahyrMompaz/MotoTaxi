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
  activo?: boolean; // Agregado por si lo usas
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

  // Claves que gestionamos manualmente o ignoramos
  const ignoreKeys = ["imagen", "imagenFile"];

  Object.entries(data).forEach(([key, value]) => {
    if (ignoreKeys.includes(key)) return;
    if (value === undefined || value === null || value === "") return;
    
    // CORRECCIÓN 422: Convertir booleanos a "1" o "0"
    if (typeof value === 'boolean') {
        formData.append(key, value ? "1" : "0");
    } else {
        formData.append(key, String(value));
    }
  });

  const res = await fetch((api("/mototaxis")), {
    method: "POST",
    headers: { "Accept": "application/json" }, // Importante para evitar redirecciones
    credentials: "include",
    body: formData,
  });
  
  if (!res.ok) throw new Error("Error al crear mototaxi");
  return res.json();
}

export async function updateMototaxi(id: number, data: Partial<Mototaxi>): Promise<Mototaxi> {
  const formData = new FormData();

  // Truco para Laravel PUT con archivos
  formData.append("_method", "PUT");

  // Solo adjuntamos archivo si el usuario subió uno nuevo
  if (data.imagenFile) {
    formData.append("imagen", data.imagenFile);
  }

  const ignoreKeys = ["imagen", "imagenFile"];

  Object.entries(data).forEach(([key, value]) => {
    if (ignoreKeys.includes(key)) return;
    if (value === undefined || value === null || value === "") return;

    // CORRECCIÓN 422: Convertir booleanos a "1" o "0"
    if (typeof value === 'boolean') {
        formData.append(key, value ? "1" : "0");
    } else {
        formData.append(key, String(value));
    }
  });

  const res = await fetch(api(`/mototaxis/${id}`), {
    method: "POST", // Se envía como POST físico
    headers: { 
        "Accept": "application/json" // CORRECCIÓN CORS/REDIRECT
    },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al actualizar mototaxi");
  }
  
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