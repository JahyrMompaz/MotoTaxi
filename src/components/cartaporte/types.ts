export interface CartaPorte {
  id: number;
  folio: string;
  fecha: string;
  origen: string;
  destino: string;
  choferNombre: string;
  choferLicencia: string;
  vehiculoPlacas: string;
  vehiculoModelo: string;
  facturasVinculadas: string[];
  estatus: "Pendiente" | "En Tránsito" | "Entregada" | "Cancelada";
  distanciaKm: number;
}

export interface CartaPorteFormData {
  origen: string;
  destino: string;
  choferNombre: string;
  choferRFC: string;
  choferLicencia: string;
  vehiculoPlacas: string;
  vehiculoModelo: string;
  vehiculoAnio: string;
  vehiculoConfiguracion: string;
  fechaSalida: string;
  horaSalida: string;
  distanciaKm: string;
  facturasSeleccionadas: string[];
  observaciones: string;
}

export interface CartaPortePayload {
  origen: string;
  destino: string;
  chofer_nombre: string;
  chofer_rfc: string | null;
  chofer_licencia: string;
  vehiculo_placas: string;
  vehiculo_modelo: string;
  vehiculo_anio: string | null;
  vehiculo_configuracion: string | null;
  fecha_salida: string;
  hora_salida: string | null;
  distancia_km: number;
  observaciones: string | null;
  estatus: string;
  factura_ids: number[];
}

export interface FacturaTimbrada {
  id: number;
  folio: string;
  cliente: string;
  total: number;
}
