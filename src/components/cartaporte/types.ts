// src/features/carta-porte/types.ts

// 1. Definición de Cliente (Faltaba exportar esto)
export interface Cliente {
  id: number;
  nombre: string;
  rfc: string;
  codigo_postal?: string;
  email?: string;
  regimen_fiscal?: string;
}

export interface MercanciaItem {
  clave_sat: string;
  descripcion: string;
  cantidad: number;
  unidad_sat: string;
  peso_kg: number;
  material_peligroso?: 'Sí' | 'No';
  cve_material_peligroso?: string;
  embalaje?: string;
}

export interface CartaPorteFormData {
  // Para el formulario usamos string porque los inputs/selects manejan strings
  cliente_id: string; 

  origen_nombre: string;
  origen_cp: string;
  origen_estado_clave: string;
  origen_municipio: string;
  origen_calle: string;
  origen_numero_ext: string;
  origen_colonia: string;
  origen_localidad: string;

  destino_nombre: string;
  destino_cp: string;
  destino_estado_clave: string;
  destino_municipio: string;
  destino_calle: string;
  destino_numero_ext: string;
  destino_colonia: string;
  destino_localidad: string;

  choferNombre: string;
  choferRFC: string;
  choferLicencia: string;
  
  vehiculoPlacas: string;
  vehiculoModelo: string;
  vehiculoAnio: string;
  vehiculoConfiguracion: string;
  
  permisoSCT: string;
  numPermisoSCT: string;
  aseguraNombre: string;
  polizaNumero: string;

  fechaSalida: string;
  horaSalida: string;
  fechaLlegada: string;
  distanciaKm: string;
  pesoTotal: string;

  facturasSeleccionadas: string[];
  mercancias: MercanciaItem[];
  observaciones: string;
}

export interface CartaPortePayload extends Omit<Partial<CartaPorteFormData>, 'cliente_id'> {
  cliente_id?: number;
  tipo_cfdi: 'T';
  distancia_total: number;
  peso_total: number;
  num_total_mercancias: number;
  unidad_peso: 'KGM';
  factura_ids: number[];
  estatus?: string;
  
  // Mapeos snake_case
  fecha_salida?: string;
  fecha_llegada?: string;
  hora_salida?: string | null;
  
  permiso_sct?: string;
  num_permiso_sct?: string;
  config_vehicular?: string;
  placa_vm?: string;
  anio_modelo_vm?: number;
  
  asegura_nombre?: string;
  poliza_numero?: string;
  
  operador_rfc?: string;
  operador_nombre?: string;
  operador_licencia?: string;
}

export interface FacturaTimbrada {
  id: number;
  folio: string;
  cliente: string;
  total: number;
  cliente_id: number;
}

// Interfaz para la VISTA y el LISTADO
export interface CartaPorte {
  id: number;
  folio: string;
  fecha: string;
  origen: string;
  destino: string;
  
  // Campos del Chofer
  choferNombre: string;
  choferRFC: string;
  choferLicencia: string;
  
  // Campos del Vehículo
  vehiculoPlacas: string;
  vehiculoModelo: string;
  vehiculoAnio: string;
  vehiculoConfiguracion: string;
  
  // Campos Extra (Permisos y Seguros)
  permisoSCT?: string;
  numPermisoSCT?: string;
  aseguraNombre?: string;
  polizaNumero?: string;
  
  horaSalida: string;
  distanciaKm: number;
  observaciones: string;
  estatus: string;
  
  facturasVinculadas: string[];
  
  // Mercancías
  mercancias?: string | any[];
  pesoTotal?: number | string;
}