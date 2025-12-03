// FacturaService.ts
import { api } from '../../lib/api';
import type {
  Paginator,
  FacturaApi,
  CrearFacturaPayload,
  Cliente,
  Mototaxi,
  Refaccion,
  Servicio,
} from './types';

async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errorText = '';
    try {
      errorText = await res.text();
    } catch {
      // ignore
    }

    throw new Error(errorText || `HTTP ${res.status}`);
  }

  return res.json();
}

export const FacturaService = {
  /** ============================
   * LISTAR FACTURAS (PAGINADO)
   * ============================ */
  async list(page = 1): Promise<Paginator<FacturaApi>> {
    return http<Paginator<FacturaApi>>(api(`/facturas?page=${page}`));
  },

  /** ============================
   * OBTENER UNA FACTURA
   * ============================ */
  async get(id: number): Promise<{ data: FacturaApi }> {
    return http<{ data: FacturaApi }>(api(`/facturas/${id}`));
  },

  /** ============================
   * CREAR FACTURA
   * ============================ */
  async create(payload: CrearFacturaPayload): Promise<{ data: FacturaApi }> {
    return http<{ data: FacturaApi }>(api('/facturas'), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** ============================
   * NOTAS
   * ============================ */
  async notaCredito(payload: CrearFacturaPayload): Promise<{ data: FacturaApi }> {
    return http<{ data: FacturaApi }>(api('/facturas'), {
      method: 'POST',
      body: JSON.stringify({ ...payload, tipo: 'Egreso' }),
    });
  },

  async notaCargo(payload: CrearFacturaPayload): Promise<{ data: FacturaApi }> {
    return http<{ data: FacturaApi }>(api('/facturas/nota-cargo'), {
      method: 'POST',
      body: JSON.stringify({ ...payload, tipo: 'Nota de Cargo' }),
    });
  },

  /** ============================
   * CANCELAR FACTURA
   * ============================ */
  async cancelar(uuid: string, motivo?: string, uuidSustitucion?: string) {
    return http(api(`/facturas/${uuid}/cancelar`), {
      method: 'POST',
      body: JSON.stringify({
        motivo: motivo ?? null,
        uuid_sustitucion: uuidSustitucion ?? null,
      }),
    });
  },

  /** ============================
   * CATÁLOGOS
   * ============================ */
  async clientes(): Promise<{ data: Cliente[] }> {
    return http(api('/clientes'));
  },

  async mototaxis(): Promise<{ data: Mototaxi[] }> {
    return http(api('/mototaxis'));
  },

  async refacciones(): Promise<{ data: Refaccion[] }> {
    return http(api('/refacciones'));
  },

  async servicios(): Promise<Paginator<Servicio> | { data: Servicio[] }> {
    return http<Paginator<Servicio> | { data: Servicio[] }>(api('/servicios'));
  },
};

/** ============================
 * UTILIDAD: Facturas Timbradas
 * ============================ */
export async function getFacturasTimbradas() {
  const res = await fetch(api('/facturas?estatus=Timbrada'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('Error al obtener facturas timbradas');

  return res.json();
}
