// src/components/Servicios/types.ts
export interface Servicio {
  id: number;
  cliente_id: number;
  cliente: string;
  tipo: string;
  tecnico: string;
  fecha_ingreso: string;
  estatus: "Pendiente" | "En Proceso" | "Completado";
  costo_real: number;
  descripcion?: string;
  observaciones?: string;
}
