// ======================================
//  CLIENTE
// ======================================
export interface Cliente {
  id: number;
  nombre: string;
  rfc: string;
  email?: string | null;
}

// ======================================
//  FACTURA ITEM (linea de conceptos)
// ======================================
export interface FacturaItem {
  id?: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number; // ✔ el back lo valida así
  subtotal?: number;
  tipo?: 'producto' | 'servicio' | string;
}

// ======================================
//  RESPUESTA DEL BACKEND (FacturaResource)
// ======================================
export interface FacturaApi {
  id: number;
  folio: string;

  estatus: string;

  uuid?: string | null;
  fecha_emision?: string | null;

  subtotal?: number;
  iva?: number;
  total: number;

  metodo_pago?: string | null;
  forma_pago?: string | null;
  uso_cfdi?: string | null;

  tipo: string;
  tipo_venta?: string | null;

  mototaxi_id?: number | null;
  refaccion_id?: number | null;
  servicio_id?: number | null;

  xml_url?: string | null;
  pdf_url?: string | null;

  cliente: Cliente;

  items: FacturaItem[];
}

// ======================================
//  PAGINACIÓN LARAVEL
// ======================================
export interface Paginator<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
}

// ======================================
//  VISTA PARA EL FRONT (normalización)
// ======================================
export interface FacturaView {
  id: number;
  folio: string;

  cliente: string;
  cliente_id: number;
  rfc: string;

  tipo: string;
  tipo_venta?: string;
  total: number;

  estatus: 'Timbrada' | 'Pendiente' | 'Cancelada' | string;
  fecha: string;

  usoCFDI?: string;
  formaPago?: string;
  metodoPago?: string;
  conceptos?: string;

  // Mototaxi
  mototaxiId?: number;
  mototaxiModelo?: string;
  mototaxiSerie?: string;

  // Refacción
  refaccionId?: number;
  refaccionCodigo?: string;
  refaccionDescripcion?: string;

  // Datos SAT
  uuid?: string | null;
  xml_url?: string | null;
  pdf_url?: string | null;
}

// ======================================
//  CATÁLOGOS
// ======================================
export interface Mototaxi {
  id: number;
  modelo: string;
  color: string;
  año?: number;
  serie: string;
  precio: number;
}

export interface Refaccion {
  id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  existencia?: number;
}

export interface Servicio {
  id: number;
  tipo: string;
  descripcion?: string;
  costo_real: number;
}

// ======================================
//  PAYLOAD PARA CREAR FACTURA
// ======================================
export interface CrearFacturaPayload {
  cliente_id: number;

  servicio_id?: number | null;
  refaccion_id?: number | null;
  mototaxi_id?: number | null;

  tipo: string; // Siempre 'Ingreso' en este formulario
  tipo_venta: string; // 'Refaccion' | 'Mototaxi' | 'Servicio'
  forma_pago: string; // SAT: 01,02,03,04,28,99
  metodo_pago: string; // SAT: PUE, PPD
  uso_cfdi: string; // G01, G03, P01

  items: Array<{
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
  }>;

  uuid_relacionado?: string;
}
