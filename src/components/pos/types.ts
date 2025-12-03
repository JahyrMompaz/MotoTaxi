export interface Cliente {
  id: number;
  nombre: string; // Importante: el error dice que falta este campo
  rfc: string;
  email?: string;
  codigo_postal?: string;
  telefono?: string;
  direccion?: string;
  created_at?: string; // Lo pide el error
}

// ... tus otras interfaces (Refaccion, Servicio) también deberían estar aquí o importadas
export interface Refaccion {
  id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  existencia: number;
}

export interface Servicio {
  id: number;
  tipo: string;
  descripcion?: string;
  costo_real: number;
}