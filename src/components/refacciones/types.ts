// src/components/Refacciones/types.ts
export interface Refaccion {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  existencia: number;
  precio: number;
  proveedor?: string;
}
