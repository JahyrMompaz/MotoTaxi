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
  console.log("Intentando descargar PDF para ID:", id); // Debug

  try {
    // IMPORTANTE: Verifica si en routes/api.php pusiste 'carta-porte' o 'cartas-porte'
    // Aquí asumo SINGULAR 'carta-porte' como definimos en el Paso 1
    const url = api(`/carta-porte/${id}/pdf`); 
    
    console.log("URL de descarga:", url); // Debug

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/pdf",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // Si falla, intentamos leer el mensaje de error del backend
      const errorText = await res.text();
      console.error("Error Backend:", errorText);
      throw new Error("No se pudo generar el PDF. Verifica que la carta esté timbrada.");
    }

    // Proceso de descarga Blob
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Crear link temporal
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `CartaPorte-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
    
    console.log("Descarga iniciada correctamente");

  } catch (error) {
    console.error("Error en downloadCartaPortePDF:", error);
    throw error; // Relanzar para que el componente muestre el Toast
  }

  // En cartaPorteService.ts

function transformCartaPorte(carta: any): CartaPorte {
  // Debug: Ver qué llega crudo del backend
  // console.log("Transformando carta:", carta); 

  return {
    id: carta.id,
    folio: carta.folio,
    fecha: carta.fecha_salida || carta.created_at, // Fallback a fecha creación
    
    // Rutas
    origen: carta.origen_nombre || carta.origen || 'N/A',
    destino: carta.destino_nombre || carta.destino || 'N/A',
    
    // Chofer (Mapeo explícito de snake_case del backend)
    choferNombre: carta.chofer_nombre || carta.operador_nombre || '',
    choferRFC: carta.chofer_rfc || carta.operador_rfc || '',
    choferLicencia: carta.chofer_licencia || carta.operador_licencia || '',
    
    // Vehículo
    vehiculoPlacas: carta.vehiculo_placas || carta.placa_vm || '',
    vehiculoModelo: carta.vehiculo_modelo || carta.anio_modelo_vm || '',
    vehiculoAnio: carta.vehiculo_anio || '',
    vehiculoConfiguracion: carta.vehiculo_configuracion || carta.config_vehicular || '',
    
    // Permisos y Seguros (Nuevos campos mapeados)
    permisoSCT: carta.permiso_sct || '',
    numPermisoSCT: carta.num_permiso_sct || '',
    aseguraNombre: carta.asegura_nombre || carta.asegura_resp_civil || '',
    polizaNumero: carta.poliza_numero || carta.poliza_resp_civil || '',
    
    // Viaje
    horaSalida: carta.hora_salida || '',
    distanciaKm: Number(carta.distancia_total || carta.total_dist_rec || 0),
    observaciones: carta.observaciones || '',
    estatus: carta.estatus,
    
    // Mercancías y Peso
    mercancias: carta.mercancias, // Pasamos el raw (string o array)
    pesoTotal: carta.peso_total || carta.peso_bruto_total || 0,
    
    // Relaciones
    facturasVinculadas: carta.facturas ? carta.facturas.map((f: any) => f.folio) : [],
  };
}
}

