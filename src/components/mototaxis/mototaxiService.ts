import { api } from "../../lib/api";

export interface Mototaxi {
  id: number;
  // Identificación
  marca?: string;
  modelo: string;
  anio: number;
  color: string;
  numero_serie: string;
  
  // --- NUEVOS CAMPOS TÉCNICOS ---
  motor?: string;
  cilindraje?: string;
  transmision?: string;
  combustible?: string;

  // --- NUEVOS CAMPOS IMPORTACIÓN ---
  pedimento?: string;
  aduana?: string;
  fecha_pedimento?: string; 

  // Inventario y Venta
  precio: number;
  existencia?: number;
  codigo?: string; 
  activo?: boolean;
  
  // Imagen
  imagen?: string;
  imagenFile?: File | null;
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


  const ignoreKeys = ["imagen", "imagenFile"];

  Object.entries(data).forEach(([key, value]) => {
    if (ignoreKeys.includes(key)) return;
    if (value === undefined || value === null || value === "") return;
    

    if (typeof value === 'boolean') {
        formData.append(key, value ? "1" : "0");
    } else {
        formData.append(key, String(value));
    }
  });

  const res = await fetch((api("/mototaxis")), {
    method: "POST",
    headers: { "Accept": "application/json" },
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al crear mototaxi");
  return res.json();
}

export async function updateMototaxi(id: number, data: Partial<Mototaxi>): Promise<Mototaxi> {
  const formData = new FormData();
  formData.append("_method", "PUT");

  if (data.imagenFile) {
    formData.append("imagen", data.imagenFile);
  }

  const ignoreKeys = ["imagen", "imagenFile"];

  Object.entries(data).forEach(([key, value]) => {
    if (ignoreKeys.includes(key)) return;
    if (value === undefined || value === null || value === "") return;

    if (typeof value === 'boolean') {
        formData.append(key, value ? "1" : "0");
    } else {
        formData.append(key, String(value));
    }
  });

  const res = await fetch(api(`/mototaxis/${id}`), {
    method: "POST", 
    headers: { "Accept": "application/json" },
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