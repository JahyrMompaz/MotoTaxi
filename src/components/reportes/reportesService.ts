// src/components/Reportes/reportesService.ts
import { api } from "../../lib/api";

export interface Venta {
  fecha: string;
  tipo: string;
  cliente: string;
  total: number;
}

export interface IngresoMensual {
  mes: string;
  ingresos: number;
}

export async function getReporteVentas(
  params?: { fechaInicio?: string; fechaFin?: string; tipo?: string }
): Promise<Venta[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch((api(`/reportes/ventas?${query}`)));
  if (!res.ok) throw new Error("Error al obtener reportes de ventas");
  return res.json();
}

export async function getIngresosMensuales(): Promise<IngresoMensual[]> {
  const res = await fetch((api(`/reportes/ingresos`)));
  if (!res.ok) throw new Error("Error al obtener ingresos mensuales");
  return res.json();
}
