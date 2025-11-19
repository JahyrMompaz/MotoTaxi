import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CheckCircle, Clock, Plus, XCircle, Download, MinusCircle, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
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
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../AuthContext';
import { useIsMobile } from '../ui/use-mobile';
import { toast } from 'sonner';

import FacturasFormDialog from './FacturaFormDialog';
import FacturasTable from './FacturasTable';
import { FacturaService } from './FacturaService';
import type { FacturaApi, FacturaView, Paginator } from './types';

function mapApiToView(f: FacturaApi): FacturaView {
  const raw = (f.estatus || '').toString().toLowerCase();

  const estatus =
    raw === 'timbrada' ? 'Timbrada' : raw === 'cancelada' ? 'Cancelada' : 'Pendiente';

  const firstItem = f.items?.[0] ?? null;
  const fecha =
    f.fecha_emision?.split('T')[0] || new Date().toISOString().split('T')[0];

  return {
    id: f.id,
    folio: f.folio,
    cliente: f.cliente?.nombre ?? '',
    rfc: f.cliente?.rfc ?? '',
    tipo: f.tipo ?? 'Ingreso',
    tipo_venta: f.tipo_venta ?? undefined,
    total: f.total ?? 0,
    estatus,
    fecha,
    usoCFDI: f.uso_cfdi ?? '',
    formaPago: f.forma_pago ?? '',
    metodoPago: f.metodo_pago ?? '',
    conceptos: firstItem?.descripcion ?? '',
    uuid: f.uuid ?? null,
    xml_url: f.xml_url ?? '',
    pdf_url: f.pdf_url ?? '',
  };
}

export default function FacturasPage() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();

  const [list, setList] = useState<FacturaView[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Paginator<FacturaApi>['meta'] | null>(null);

  // Dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isNotaCreditoOpen, setIsNotaCreditoOpen] = useState(false);
  const [isNotaCargoOpen, setIsNotaCargoOpen] = useState(false);

  const [selected, setSelected] = useState<FacturaView | null>(null);

  const [cancelData, setCancelData] = useState({ motivo: '', uuidSustitucion: '' });
  const [notaData, setNotaData] = useState({ motivo: '', monto: 0, descripcion: '' });

  async function load(p = 1) {
    try {
      const res = await FacturaService.list(p);
      setMeta(res.meta);
      const rows = (res.data ?? []).map(mapApiToView);
      setList(rows);
      setPage(p);
    } catch {
      toast.error('No se pudieron cargar las facturas');
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  const counts = useMemo(
    () => ({
      timbradas: list.filter((x) => x.estatus === 'Timbrada').length,
      pendientes: list.filter((x) => x.estatus === 'Pendiente').length,
      canceladas: list.filter((x) => x.estatus === 'Cancelada').length,
    }),
    [list],
  );

  const handleDownload = (f: FacturaView) => {
    if (f.pdf_url) return window.open(f.pdf_url, '_blank');
    if (f.xml_url) return window.open(f.xml_url, '_blank');
    toast.info('No hay archivos disponibles aún');
  };

  const openViewDialog = (f: FacturaView) => {
    setSelected(f);
    setIsViewDialogOpen(true);
  };

  const openCancelDialog = (f: FacturaView) => {
    setSelected(f);
    setCancelData({ motivo: '', uuidSustitucion: '' });
    setIsCancelDialogOpen(true);
  };

  const cancelar = async () => {
    if (!selected?.uuid) return toast.error('La factura no tiene UUID');

    try {
      await FacturaService.cancelar(
        selected.uuid,
        cancelData.motivo,
        cancelData.motivo === '01' ? cancelData.uuidSustitucion || undefined : undefined,
      );

      toast.success('Factura cancelada');
      setIsCancelDialogOpen(false);
      setSelected(null);
      load(page);
    } catch {
      toast.error('Error al cancelar factura');
    }
  };

  const crearNotaCredito = async () => {
    if (!selected) return;

    if (!notaData.motivo || !notaData.monto || notaData.monto <= 0 || !notaData.descripcion)
      return toast.error('Completa todos los campos');

    try {
      await FacturaService.notaCredito(selected.id, {
        motivo: notaData.motivo,
        monto: notaData.monto,
        descripcion: notaData.descripcion,
        uuid_relacionado: selected.uuid,
      });

      toast.success('Nota de crédito generada');
      setIsNotaCreditoOpen(false);
      load(page);
    } catch {
      toast.error('Error al generar nota de crédito');
    }
  };

  const crearNotaCargo = async () => {
    if (!selected) return;

    if (!notaData.motivo || !notaData.monto || notaData.monto <= 0 || !notaData.descripcion)
      return toast.error('Completa todos los campos');

    try {
      await FacturaService.notaCargo(selected.id, {
        motivo: notaData.motivo,
        monto: notaData.monto,
        descripcion: notaData.descripcion,
        uuid_relacionado: selected.uuid,
      });

      toast.success('Nota de cargo generada');
      setIsNotaCargoOpen(false);
      load(page);
    } catch {
      toast.error('Error al generar nota de cargo');
    }
  };

  const statusBadgeClass = (estatus: string) => {
    switch (estatus) {
      case 'Timbrada':
        return 'bg-green-100 text-green-700';
      case 'Cancelada':
        return 'bg-red-100 text-red-700';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-20' : ''}`}>
      {/* HEADER */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Facturación</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">CFDI 4.0</p>
        </div>

        {hasPermission('facturacion.create') && (
          <Button
            className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        )}
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Timbradas</p>
                <p className="text-2xl text-[#1E293B]">{counts.timbradas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Pendientes</p>
                <p className="text-2xl text-[#1E293B]">{counts.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Canceladas</p>
                <p className="text-2xl text-[#1E293B]">{counts.canceladas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLA */}
      <FacturasTable
        facturas={list}
        hasCreate={hasPermission('facturacion.create')}
        canCancel={hasPermission('facturacion.cancel')}
        onView={openViewDialog}
        onTimbrarPendiente={() => toast.info('El timbrado se hace al crear')}
        onDownload={handleDownload}
        onNotaCredito={(f) => {
          setSelected(f);
          setNotaData({ motivo: '', monto: 0, descripcion: '' });
          setIsNotaCreditoOpen(true);
        }}
        onNotaCargo={(f) => {
          setSelected(f);
          setNotaData({ motivo: '', monto: 0, descripcion: '' });
          setIsNotaCargoOpen(true);
        }}
        onCancelar={openCancelDialog}
      />

      {/* PAGINACIÓN */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-end items-center gap-4">
          <Button disabled={page <= 1} onClick={() => load(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-[#64748B]">
            Página {page} de {meta.last_page}
          </span>
          <Button disabled={page >= meta.last_page} onClick={() => load(page + 1)}>
            Siguiente
          </Button>
        </div>
      )}

      {/* FORM NUEVA FACTURA */}
      <FacturasFormDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onCreated={() => load(page)} />

      {/* VIEW DIALOG */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[820px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Vista Previa CFDI</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* ENCABEZADO */}
              <div className="border p-4 rounded bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#1E293B]">{selected.folio}</h2>
                  <p className="text-sm text-gray-600">UUID: {selected.uuid ?? 'Sin timbrar'}</p>
                </div>
                <Badge className={`${statusBadgeClass(selected.estatus)} h-fit px-3 py-1`}>
                  {selected.estatus}
                </Badge>
              </div>

              {/* CLIENTE */}
              <div className="border rounded p-4 bg-white space-y-2">
                <h3 className="font-semibold text-[#1E293B]">Datos del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <b>Nombre:</b> {selected.cliente}
                  </p>
                  <p>
                    <b>RFC:</b> {selected.rfc}
                  </p>
                  <p>
                    <b>Uso CFDI:</b> {selected.usoCFDI || '-'}
                  </p>
                  <p>
                    <b>Forma de Pago:</b> {selected.formaPago || '-'}
                  </p>
                  <p>
                    <b>Método de Pago:</b> {selected.metodoPago || '-'}
                  </p>
                </div>
              </div>

              {/* FACTURA */}
              <div className="border rounded p-4 bg-white space-y-2">
                <h3 className="font-semibold text-[#1E293B]">Datos de la Factura</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <b>Tipo:</b> {selected.tipo}
                  </p>
                  <p>
                    <b>Tipo de venta:</b> {selected.tipo_venta ?? '-'}
                  </p>
                  <p>
                    <b>Estatus:</b> {selected.estatus}
                  </p>
                  <p>
                    <b>Fecha:</b> {selected.fecha}
                  </p>
                  <p>
                    <b>Total:</b> ${selected.total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* CONCEPTOS */}
              <div className="border rounded p-4 bg-white space-y-2">
                <h3 className="font-semibold text-[#1E293B]">Conceptos</h3>
                <div className="border rounded p-3 bg-slate-50 text-sm">
                  {selected.conceptos || 'Sin conceptos'}
                </div>
              </div>

              {/* ARCHIVOS */}
              {(selected.pdf_url || selected.xml_url) && (
                <div className="flex flex-wrap gap-2">
                  {selected.pdf_url && (
                    <Button onClick={() => window.open(selected.pdf_url!, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                  )}

                  {selected.xml_url && (
                    <Button variant="outline" onClick={() => window.open(selected.xml_url!, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar XML
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CANCELAR FACTURA */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Factura</AlertDialogTitle>
            <AlertDialogDescription>Esta acción cancelará el CFDI ante el SAT.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3 pb-2">
            <div>
              <Label>Motivo *</Label>
              <Select value={cancelData.motivo} onValueChange={(v: any) => setCancelData({ ...cancelData, motivo: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">01 - Comprobante emitido con errores con relación</SelectItem>
                  <SelectItem value="02">02 - Comprobante emitido con errores sin relación</SelectItem>
                  <SelectItem value="03">03 - No se llevó a cabo la operación</SelectItem>
                  <SelectItem value="04">04 - Operación nominativa relacionada en factura global</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cancelData.motivo === '01' && (
              <div>
                <Label>UUID Sustitución *</Label>
                <Input
                  value={cancelData.uuidSustitucion}
                  onChange={(e) => setCancelData({ ...cancelData, uuidSustitucion: e.target.value })}
                  placeholder="UUID de la factura que sustituye"
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Salir</AlertDialogCancel>
            <AlertDialogAction onClick={cancelar} className="bg-red-600 text-white">
              Cancelar XML
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NOTA CRÉDITO */}
      <Dialog open={isNotaCreditoOpen} onOpenChange={setIsNotaCreditoOpen}>
        <DialogContent className="bg-white sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Generar Nota de Crédito</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Label>Motivo *</Label>
            <Input value={notaData.motivo} onChange={(e) => setNotaData({ ...notaData, motivo: e.target.value })} />

            <Label>Monto *</Label>
            <Input
              type="number"
              value={notaData.monto}
              onChange={(e) => setNotaData({ ...notaData, monto: Number(e.target.value) })}
            />

            <Label>Descripción *</Label>
            <Textarea
              value={notaData.descripcion}
              onChange={(e) => setNotaData({ ...notaData, descripcion: e.target.value })}
              rows={3}
            />

            <Button className="bg-orange-600 text-white" onClick={crearNotaCredito}>
              Generar Nota de Crédito
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* NOTA CARGO */}
      <Dialog open={isNotaCargoOpen} onOpenChange={setIsNotaCargoOpen}>
        <DialogContent className="bg-white sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Generar Nota de Cargo</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Label>Motivo *</Label>
            <Input value={notaData.motivo} onChange={(e) => setNotaData({ ...notaData, motivo: e.target.value })} />

            <Label>Monto *</Label>
            <Input
              type="number"
              value={notaData.monto}
              onChange={(e) => setNotaData({ ...notaData, monto: Number(e.target.value) })}
            />

            <Label>Descripción *</Label>
            <Textarea
              value={notaData.descripcion}
              onChange={(e) => setNotaData({ ...notaData, descripcion: e.target.value })}
              rows={3}
            />

            <Button className="bg-blue-600 text-white" onClick={crearNotaCargo}>
              Generar Nota de Cargo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
