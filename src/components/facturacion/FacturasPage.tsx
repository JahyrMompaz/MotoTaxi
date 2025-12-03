import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CheckCircle, Clock, Plus, XCircle, Bike, QrCode, Download, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext'; // Asumo que tienes esto, si no, quítalo
import { useIsMobile } from '../ui/use-mobile';
import { FileText } from 'lucide-react';

// Importa TUS componentes reales
import FacturasFormDialog from './FacturaFormDialog';
import FacturasTable from './FacturasTable';
import { FacturaService } from './FacturaService';
import type { CrearFacturaPayload, FacturaApi, FacturaView, Paginator } from './types';
import { api } from '../../lib/api'; // Función para obtener la URL completa del API

// --- Mapeo de API a Vista ---
function mapApiToView(f: FacturaApi): FacturaView {
  const raw = (f.estatus || '').toString().toLowerCase();
  // Normalizar estatus para que coincida con los badges
  const estatus = raw === 'timbrada' ? 'Timbrada' : raw === 'cancelada' ? 'Cancelada' : 'Pendiente';

  // Usamos el primer item para la descripción principal en la tabla
  const firstItem = f.items?.[0] ?? null; 
  const fecha = f.fecha_emision?.split('T')[0] || 'N/A';

  return {
    id: f.id,
    folio: f.folio,
    cliente: f.cliente?.nombre ?? 'Cliente Desconocido',
    cliente_id: f.cliente?.id ?? 0,
    rfc: f.cliente?.rfc ?? 'XAXX010101000',
    tipo: f.tipo ?? 'Ingreso',
    tipo_venta: f.tipo_venta ?? undefined,
    total: Number(f.total) ?? 0,
    estatus,
    fecha,
    usoCFDI: f.uso_cfdi ?? '',
    formaPago: f.forma_pago ?? '',
    metodoPago: f.metodo_pago ?? '',
    
    // Aquí concatenamos la descripción. Como tu FormDialog guarda "Modelo - Serie" en la descripción del item,
    // esto se mostrará correctamente en la vista previa.
    conceptos: firstItem ? `${firstItem.descripcion}` : '',
    
    // Datos específicos si el backend los enviara en el objeto raíz, 
    // pero como usas items, nos basamos en items para la vista.
    mototaxiId: f.mototaxi_id ?? undefined,
    refaccionId: f.refaccion_id ?? undefined,

    uuid: f.uuid ?? null,
    xml_url: f.xml_url ?? '',
    pdf_url: f.pdf_url ?? '',
  };
}

export default function FacturasPage() {
  const { hasPermission } = useAuth(); // Opcional
  const isMobile = useIsMobile();

  // Estados de datos
  const [list, setList] = useState<FacturaView[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Paginator<FacturaApi>['meta'] | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados de Diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isNotaCreditoOpen, setIsNotaCreditoOpen] = useState(false);
  const [isNotaCargoOpen, setIsNotaCargoOpen] = useState(false);

  // Selección
  const [selected, setSelected] = useState<FacturaView | null>(null);
  
  // Formularios auxiliares
  const [cancelData, setCancelData] = useState({ motivo: '', uuidSustitucion: '' });
  const [notaData, setNotaData] = useState({ motivo: '', monto: 0, descripcion: '' });

  // --- Carga de Datos ---
  async function load(p = 1) {
    setLoading(true);
    try {
      const res = await FacturaService.list(p);
      setMeta(res.meta);
      const rows = (res.data ?? []).map(mapApiToView);
      setList(rows);
      setPage(p);
    } catch {
      toast.error('Error al cargar el listado de facturas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  // --- Métricas (Calculadas del listado actual o podrías pedir al backend) ---
  const counts = useMemo(() => ({
      timbradas: list.filter((x) => x.estatus === 'Timbrada').length,
      pendientes: list.filter((x) => x.estatus === 'Pendiente').length,
      canceladas: list.filter((x) => x.estatus === 'Cancelada').length,
  }), [list]);

  // --- Handlers ---

  const handleDownload = async (f: FacturaView) => {
    // 1. Validar que tenga UUID
    if (!f.uuid) {
      toast.error('La factura no está timbrada, no se puede descargar PDF.');
      return;
    }

    // 2. Si ya viene la URL directa desde el backend (opcional), úsala
    if (f.pdf_url) {
      window.open(f.pdf_url, '_blank');
      return;
    }

    const toastId = toast.loading('Generando PDF...');

    try {
      // 3. Hacemos la petición al endpoint
      // Nota: Si tu sistema de 'api' o 'fetch' global inyecta el Token automáticamente,
      // esto funcionará perfecto.
      const response = await fetch(api(`/facturas/${f.uuid}/pdf`), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
          // 'Authorization': `Bearer ${token}` // <-- Si tu fetch no inyecta el token, agrégalo aquí
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el archivo');
      }

      // 4. Convertimos la respuesta a un Blob (Binary Large Object)
      const blob = await response.blob();

      // 5. Creamos una URL temporal en el navegador
      const url = window.URL.createObjectURL(blob);
      
      // 6. Creamos un elemento <a> invisible para forzar la descarga
      const link = document.createElement('a');
      link.href = url;
      // Aquí definimos el nombre del archivo que se descargará
      link.setAttribute('download', `${f.folio}.pdf`); 
      document.body.appendChild(link);
      
      // 7. Simulemos el click y limpiamos
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF descargado correctamente', { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error('Error al descargar el PDF', { id: toastId });
    }
  };

  const handleCancelar = async () => {
    if (!selected?.uuid) return toast.error('Esta factura no tiene UUID');
    try {
      await FacturaService.cancelar(
        selected.uuid,
        cancelData.motivo,
        cancelData.motivo === '01' ? cancelData.uuidSustitucion || undefined : undefined
      );
      toast.success('Solicitud de cancelación enviada');
      setIsCancelDialogOpen(false);
      load(page);
    } catch {
      toast.error('Error al cancelar la factura');
    }
  };

  const handleNotaCredito = async () => {
    if (!selected) return;
    try {
      const payloadCompleto: CrearFacturaPayload = {
        // Asegúrate de tener cliente_id en tu objeto selected o búscalo
        cliente_id: selected.cliente_id, 
        
        tipo: 'Egreso', // <--- IMPORTANTE: Egreso para Nota de Crédito
        tipo_venta: selected.tipo_venta || 'Servicio',
        metodo_pago: selected.metodoPago || 'PUE', 
        forma_pago: selected.formaPago || '03', 
        uso_cfdi: 'G02', // <--- IMPORTANTE: G02 = Devoluciones, descuentos o bonificaciones
        
        // Relación Fiscal (Obligatoria para Nota de Crédito)
        uuid_relacionado: selected.uuid || undefined, 

        items: [
          {
            descripcion: notaData.descripcion || 'Bonificación / Devolución',
            cantidad: 1,
            precio_unitario: Number(notaData.monto)
          }
        ]
      };

      await FacturaService.notaCredito(payloadCompleto);
      toast.success('Nota de crédito creada');
      setIsNotaCreditoOpen(false);
      load(page);
    } catch (error) {
      console.error(error);
      toast.error('Error al crear nota de crédito');
    }
  };

  const handleNotaCargo = async () => {
    if (!selected) return;
    try {
      const payloadCompleto = {
        cliente_id: selected.cliente_id,
        tipo: 'Ingreso', // Laravel lo espera
        tipo_venta: selected.tipo_venta || 'Servicio',
        metodo_pago: selected.metodoPago || 'PUE', 
        forma_pago: selected.formaPago || '03', 
        uso_cfdi: selected.usoCFDI || 'G03', 
        
        // Items: Creamos un item nuevo con el cargo extra
        items: [
          {
            descripcion: notaData.descripcion || 'Cargo Extra',
            cantidad: 1,
            precio_unitario: Number(notaData.monto)
          }
        ]
      };

      await FacturaService.notaCargo(payloadCompleto);
      toast.success('Nota de cargo creada');
      setIsNotaCargoOpen(false);
      load(page);
    } catch (error) {
      console.error(error);
      toast.error('Error al crear nota de cargo');
    }
  };

  // --- Render Helpers ---
  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'Timbrada': return 'bg-green-600 text-white';
      case 'Cancelada': return 'bg-red-600 text-white';
      case 'Pendiente': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-24' : ''}`}>
      
      {/* HEADER */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B] text-2xl font-bold">Facturación</h1>
          <p className="text-[#64748B] text-sm">Administración de CFDI 4.0</p>
        </div>
        
        {/* Botón Crear (Desktop/Mobile Logic handled by Dialog) */}
        {hasPermission('facturacion.create') && (
            <Button 
              className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto shadow-sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Nueva Factura
            </Button>
        )}
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="text-green-600 h-6 w-6"/></div>
            <div>
              <p className="text-sm text-gray-500">Timbradas</p>
              <p className="text-2xl font-bold text-gray-800">{counts.timbradas}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full"><Clock className="text-yellow-600 h-6 w-6"/></div>
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-800">{counts.pendientes}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full"><XCircle className="text-red-600 h-6 w-6"/></div>
            <div>
              <p className="text-sm text-gray-500">Canceladas</p>
              <p className="text-2xl font-bold text-gray-800">{counts.canceladas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLA PRINCIPAL */}
      <FacturasTable
        facturas={list}
        hasCreate={hasPermission('facturacion.create')}
        canCancel={hasPermission('facturacion.cancel')}
        onView={(f) => { setSelected(f); setIsViewDialogOpen(true); }}
        onTimbrarPendiente={() => toast.info('El timbrado se realiza al crear la factura.')}
        onDownload={handleDownload}
        onNotaCredito={(f) => { 
          setSelected(f); 
          setNotaData({ motivo: '01', monto: 0, descripcion: '' }); 
          setIsNotaCreditoOpen(true); 
        }}
        onNotaCargo={(f) => {
          setSelected(f);
          setNotaData({ motivo: '01', monto: 0, descripcion: '' });
          setIsNotaCargoOpen(true);
        }}
        onCancelar={(f) => {
          setSelected(f);
          setCancelData({ motivo: '', uuidSustitucion: '' });
          setIsCancelDialogOpen(true);
        }}
      />

      {/* PAGINACIÓN */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-end items-center gap-4 py-4">
          <Button variant="outline" disabled={page <= 1 || loading} onClick={() => load(page - 1)}>Anterior</Button>
          <span className="text-sm text-gray-600">Página {page} de {meta.last_page}</span>
          <Button variant="outline" disabled={page >= meta.last_page || loading} onClick={() => load(page + 1)}>Siguiente</Button>
        </div>
      )}

      {/* === DIALOGOS === */}

      {/* 1. CREAR FACTURA (Tu componente real) */}
      <FacturasFormDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onCreated={() => load(1)} 
      />

      {/* 2. VISTA PREVIA (Estilo PDF del borrador) */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <FileText className="h-5 w-5"/> Vista Previa del Comprobante
            </DialogTitle>
            <DialogDescription>Representación impresa del CFDI 4.0</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="bg-white border shadow-sm p-6 text-sm">
              {/* Encabezado Factura */}
              <div className="flex justify-between border-b-2 border-[#B02128] pb-4 mb-4">
                <div className="flex gap-3">
                   <div className="bg-[#B02128] h-12 w-12 rounded flex items-center justify-center text-white">
                      <Bike className="h-8 w-8" />
                   </div>
                   <div>
                      <h3 className="font-bold text-lg text-gray-800">Mototaxis Pro SA de CV</h3>
                      <p className="text-gray-500 text-xs">RFC: MPR120515ABC</p>
                      <p className="text-gray-500 text-xs">Régimen: 601 - General de Ley PM</p>
                      <p className="text-gray-500 text-xs">Monterrey, NL, México</p>
                   </div>
                </div>
                <div className="text-right">
                   <Badge className={getStatusColor(selected.estatus)}>{selected.estatus}</Badge>
                   <div className="mt-2 text-xs text-gray-600">
                      <p><strong>Folio:</strong> {selected.folio}</p>
                      <p><strong>Fecha:</strong> {selected.fecha}</p>
                      <p><strong>UUID:</strong> {selected.uuid || 'Sin Timbrar'}</p>
                   </div>
                </div>
              </div>

              {/* Datos Cliente */}
              <div className="bg-slate-50 p-3 rounded mb-4 border border-slate-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Receptor</h4>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                   <p><strong>Cliente:</strong> {selected.cliente}</p>
                   <p><strong>RFC:</strong> {selected.rfc}</p>
                   <p><strong>Uso CFDI:</strong> {selected.usoCFDI}</p>
                   <p><strong>Forma Pago:</strong> {selected.formaPago}</p>
                </div>
              </div>

              {/* Conceptos (Tabla) */}
              <div className="mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 text-gray-500 text-xs">
                       <th className="py-2">Cant</th>
                       <th className="py-2">Descripción</th>
                       <th className="py-2 text-right">Unitario</th>
                       <th className="py-2 text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-gray-100">
                       <td className="py-2">1</td>
                       <td className="py-2">
                         <span className="block font-medium">{selected.conceptos}</span>
                         <span className="text-xs text-gray-500">
                           {selected.tipo_venta ? `Categoría: ${selected.tipo_venta}` : ''}
                         </span>
                       </td>
                       <td className="py-2 text-right">${selected.total.toLocaleString()}</td>
                       <td className="py-2 text-right">${selected.total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totales y QR */}
              <div className="flex justify-between items-end">
                 <div className="flex gap-3 items-center">
                    <div className="h-20 w-20 bg-gray-100 border flex items-center justify-center">
                       <QrCode className="text-gray-400 h-12 w-12"/>
                    </div>
                    <div className="text-[10px] text-gray-400 max-w-[200px] break-all">
                       {selected.uuid ? `||1.1|${selected.uuid}|${selected.fecha}|...||` : 'Cadena original no disponible hasta timbrado.'}
                    </div>
                 </div>

                 <div className="w-48">
                    <div className="flex justify-between py-1 text-gray-600">
                       <span>Subtotal:</span>
                       <span>${(selected.total / 1.16).toLocaleString('es-MX', {maximumFractionDigits:2})}</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-600">
                       <span>IVA (16%):</span>
                       <span>${(selected.total - (selected.total / 1.16)).toLocaleString('es-MX', {maximumFractionDigits:2})}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg text-[#B02128]">
                       <span>Total:</span>
                       <span>${selected.total.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              {/* Botones Acciones PDF */}
              <div className="mt-6 flex justify-end gap-2 print:hidden">
                 <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2"/> Imprimir
                 </Button>
                 {selected.pdf_url && (
                    <Button onClick={() => handleDownload(selected)} className="bg-[#B02128] text-white">
                       <Download className="h-4 w-4 mr-2"/> Descargar PDF
                    </Button>
                 )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. CANCELAR */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Factura</AlertDialogTitle>
            <AlertDialogDescription>Esta acción es irreversible ante el SAT.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-3">
             <div className="grid gap-2">
               <Label>Motivo de cancelación</Label>
               <Select onValueChange={(v: any) => setCancelData({...cancelData, motivo: v})}>
                 <SelectTrigger><SelectValue placeholder="Seleccione..."/></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="01">01 - Comprobante emitido con errores con relación</SelectItem>
                   <SelectItem value="02">02 - Comprobante emitido con errores sin relación</SelectItem>
                   <SelectItem value="03">03 - No se llevó a cabo la operación</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             {cancelData.motivo === '01' && (
                <div className="grid gap-2">
                  <Label>UUID Sustitución</Label>
                  <Input placeholder="Folio fiscal que sustituye" onChange={(e) => setCancelData({...cancelData, uuidSustitucion: e.target.value})} />
                </div>
             )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar} className="bg-red-600 text-white">Confirmar Cancelación</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 4. NOTA DE CRÉDITO */}
      <Dialog open={isNotaCreditoOpen} onOpenChange={setIsNotaCreditoOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Crear Nota de Crédito</DialogTitle>
      <DialogDescription>Generar egreso relacionado a la factura {selected?.folio}</DialogDescription>
    </DialogHeader>
    <div className="space-y-3 py-2">
      <div className="grid gap-2">
        <Label>Motivo</Label>
        <Select onValueChange={(v: any) => setNotaData({...notaData, motivo: v})} defaultValue="02">
          <SelectTrigger><SelectValue placeholder="Seleccione..."/></SelectTrigger>
          <SelectContent>
            <SelectItem value="01">Devolución</SelectItem>
            <SelectItem value="02">Descuento</SelectItem>
            <SelectItem value="03">Bonificación</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Monto</Label>
        <Input 
          type="number" 
          placeholder="0.00"
          onChange={(e) => setNotaData({...notaData, monto: Number(e.target.value)})} 
        />
      </div>
      <div className="grid gap-2">
        <Label>Descripción</Label>
        <Textarea 
          placeholder="Razón del descuento o devolución"
          onChange={(e) => setNotaData({...notaData, descripcion: e.target.value})} 
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsNotaCreditoOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleNotaCredito} className="bg-orange-600 text-white">
        Generar Nota
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      
      {/* 5. NOTA DE CARGO */}
      <Dialog open={isNotaCargoOpen} onOpenChange={setIsNotaCargoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nota de Cargo</DialogTitle>
            <DialogDescription>Generar ingreso adicional relacionado a la factura {selected?.folio}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
              <div className="grid gap-2">
                <Label>Motivo</Label>
                <Input value="Ajuste de precio" disabled /> 
              </div>
              <div className="grid gap-2">
                <Label>Monto</Label>
                <Input type="number" onChange={(e) => setNotaData({...notaData, monto: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>Descripción</Label>
                <Textarea onChange={(e) => setNotaData({...notaData, descripcion: e.target.value})} />
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotaCargoOpen(false)}>Cancelar</Button>
              <Button onClick={handleNotaCargo} className="bg-blue-600 text-white">Generar Cargo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}