import { api } from "../../lib/api";
import { CartaPorte, CartaPortePayload } from "./types";

// Helper para transformar de snake_case a camelCase
function transformCartaPorte(carta: any): CartaPorte {
  return {
    id: carta.id,
    folio: carta.folio,
    fecha: carta.fecha_salida,
    origen: carta.origen,
    destino: carta.destino,
    choferNombre: carta.chofer_nombre,
    choferRFC: carta.chofer_rfc,
    choferLicencia: carta.chofer_licencia,
    vehiculoPlacas: carta.vehiculo_placas,
    vehiculoModelo: carta.vehiculo_modelo,
    vehiculoAnio: carta.vehiculo_anio,
    vehiculoConfiguracion: carta.vehiculo_configuracion,
    horaSalida: carta.hora_salida,
    distanciaKm: carta.distancia_km,
    observaciones: carta.observaciones,
    estatus: carta.estatus,
    // Extraer folios de las facturas relacionadas
    facturasVinculadas: carta.facturas?.map((f: any) => f.folio) || [],
  };
}

// Obtener todas las Cartas Porte
export async function getCartasPorte(): Promise<CartaPorte[]> {
  const res = await fetch(api("/cartas-porte"), {
    method: "GET",
    headers: { "Accept": "application/json" },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al obtener Cartas Porte");
  const json = await res.json();
  
  // Laravel Resource devuelve { data: [...] }
  const cartasData = json.data || [];
  return cartasData.map(transformCartaPorte);
}

// Obtener una Carta Porte específica
export async function getCartaPorte(id: number): Promise<CartaPorte> {
  const res = await fetch(api(`/cartas-porte/${id}`), {
    method: "GET",
    headers: { "Accept": "application/json" },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Error al obtener Carta Porte");
  const json = await res.json();
  
  return transformCartaPorte(json.data);
}

// Crear Carta Porte
export async function createCartaPorte(data: CartaPortePayload) {
  const res = await fetch(api("/cartas-porte"), {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Accept": "application/json" 
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al crear Carta Porte");
  }
  
  const json = await res.json();
  return transformCartaPorte(json.data);
}

// Actualizar (principalmente para cambiar estatus)
export async function updateCartaPorte(id: number, data: Partial<CartaPortePayload>) {
  const res = await fetch(api(`/cartas-porte/${id}`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json", 
      "Accept": "application/json" 
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al actualizar Carta Porte");
  }
  
  const json = await res.json();
  return transformCartaPorte(json.data);
}

// Eliminar
export async function deleteCartaPorte(id: number) {
  const res = await fetch(api(`/cartas-porte/${id}`), {
    method: "DELETE",
    credentials: "include",
    headers: { "Accept": "application/json" }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "No se puede eliminar esta carta porte");
  }
  
  return true;
}

// Descargar PDF
export async function downloadCartaPortePDF(id: number) {
  try {
    const res = await fetch(api(`/cartas-porte/${id}/pdf`), {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error al descargar PDF");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Carta-Porte-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    throw error;
  }
}

// Cambiar estatus específicamente
export async function cambiarEstatusCartaPorte(
  id: number, 
  estatus: "Pendiente" | "En Transito" | "Entregada" | "Cancelada"
) {
  return updateCartaPorte(id, { estatus });
}