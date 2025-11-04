// src/components/Servicios/types.ts
export interface Servicio {
  id: number;
  cliente: string;
  tipo: string;
  tecnico: string;
  fecha: string;
  estatus: "Pendiente" | "En Proceso" | "Completado";
  costo: number;
  descripcion?: string;
  refacciones?: string;
}
