import { api } from '../../lib/api';
import { Cliente } from './types';

// Tipos necesarios (Si ya los tienes en otro lado, impórtalos)
export interface VentaItem {
  id: number;
  tipo: 'Refaccion' | 'Servicio';
  cantidad: number;
  precio: number;
  descripcion: string; // Importante para el ticket
}

export interface VentaPayload {
  cliente_id: number;
  items: VentaItem[];
  total: number;
  subtotal: number;
  iva: number;
  metodo_pago?: string;
  observaciones?: string;
}

export const PosService = {
  // Obtener Refacciones reales
  async getRefacciones() {
    const res = await fetch(api('/refacciones'), { 
        headers: { 'Accept': 'application/json' },
        credentials: 'include' 
    });
    if (!res.ok) throw new Error('Error cargando refacciones');
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
  },

  // Obtener Servicios reales
  async getServicios() {
    const res = await fetch(api('/servicios'), { 
        headers: { 'Accept': 'application/json' },
        credentials: 'include' 
    });
    if (!res.ok) throw new Error('Error cargando servicios');
    const json = await res.json();
    // Los servicios a veces vienen envueltos, aseguramos el array
    const data = Array.isArray(json) ? json : json.data || [];
    return data.map((s: any) => ({
        ...s,
        costo_real: Number(s.costo_real) // Asegurar que sea número
    }));
  },

  // Obtener Clientes reales
  async getClientes(): Promise<Cliente[]> {
    const res = await fetch(api('/clientes'), { 
        headers: { 'Accept': 'application/json' },
        credentials: 'include' 
    });
    if (!res.ok) throw new Error('Error cargando clientes');
    const json = await res.json();
    const data = Array.isArray(json) ? json : json.data || [];

    return data.map((c: any) => ({
      id: c.id,
      // Aseguramos que 'nombre' exista. Si tu API devuelve 'razon_social', lo mapeamos aquí.
      nombre: c.nombre || c.razon_social || 'Sin Nombre', 
      rfc: c.rfc,
      email: c.email || '',
      codigo_postal: c.codigo_postal || '',
      telefono: c.telefono || '',
      created_at: c.created_at || new Date().toISOString()
    }));
  },

  // Guardar la Venta (Ticket)
  async guardarVenta(payload: VentaPayload) {
    const res = await fetch(api('/ventas'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al guardar la venta');
    }
    
    return res.json(); // Devuelve la venta creada con folio
  }
};