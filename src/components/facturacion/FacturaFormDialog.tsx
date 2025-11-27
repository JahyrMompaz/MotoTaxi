// FacturasFormDialog.tsx
import { useEffect, useMemo, useState } from 'react';
import { Button } from './../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './../ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './../ui/sheet';
import { Label } from './../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../ui/select';
import { Input } from './../ui/input';
import { Textarea } from './../ui/textarea';
import { CheckCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from './../ui/use-mobile';

import type { Cliente, Mototaxi, Refaccion, CrearFacturaPayload, Servicio } from './types';
import { FacturaService } from './FacturaService';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
};

export default function FacturasFormDialog({ open, onOpenChange, onCreated }: Props) {
  const isMobile = useIsMobile();

  // Catálogos
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mototaxis, setMototaxis] = useState<Mototaxi[]>([]);
  const [refacciones, setRefacciones] = useState<Refaccion[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  // Formulario
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [tipoVenta, setTipoVenta] = useState<string>(''); // Refaccion | Mototaxi | Servicio
  const [usoCFDI, setUsoCFDI] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<string>('01'); // PUE | PPD
  const [formaPago, setFormaPago] = useState<string>('01'); // 01,02,03,04,28,99
  const [total, setTotal] = useState<number>(0);
  const [mototaxiId, setMototaxiId] = useState<number>(0);
  const [refaccionId, setRefaccionId] = useState<number>(0);
  const [servicioId, setServicioId] = useState<number>(0);

  // === Cargar catálogos ===
  useEffect(() => {
    (async () => {
      try {
        const [cl, mt, rf, sv] = await Promise.all([
          FacturaService.clientes(),
          FacturaService.mototaxis(),
          FacturaService.refacciones(),
          FacturaService.servicios(),
        ]);

        setClientes((cl as any).data ?? []);
        setMototaxis((mt as any).data ?? []);
        setRefacciones((rf as any).data ?? []);
        setServicios((sv as any).data ?? []);
      } catch {
        toast.error('No se pudieron cargar los catálogos');
      }
    })();
  }, []);

  // === Total automático ===
  useEffect(() => {
    if (tipoVenta === 'Mototaxi' && mototaxiId) {
      const m = mototaxis.find((x) => x.id === mototaxiId);
      setTotal(m?.precio ?? 0);
      return;
    }

    if (tipoVenta === 'Refaccion' && refaccionId) {
      const r = refacciones.find((x) => x.id === refaccionId);
      setTotal(r?.precio ?? 0);
      return;
    }

    if (tipoVenta === 'Servicio' && servicioId) {
      const s = servicios.find((x) => x.id === servicioId);
      setTotal(s?.costo_real ?? 0);
      return;
    }

    setTotal(0);
  }, [tipoVenta, mototaxiId, refaccionId, servicioId, mototaxis, refacciones, servicios]);

  // === Construir ITEMS ===
  const itemsPayload = useMemo(() => {
    if (tipoVenta === 'Mototaxi' && mototaxiId) {
      const m = mototaxis.find((x) => x.id === mototaxiId);
      if (m) {
        return [
          {
            descripcion: `${m.modelo} - Serie: ${m.serie}`,
            cantidad: 1,
            precio_unitario: m.precio,
          },
        ];
      }
    }

    if (tipoVenta === 'Refaccion' && refaccionId) {
      const r = refacciones.find((x) => x.id === refaccionId);
      if (r) {
        return [
          {
            descripcion: `${r.codigo} - ${r.descripcion}`,
            cantidad: 1,
            precio_unitario: r.precio,
          },
        ];
      }
    }

    if (tipoVenta === 'Servicio' && servicioId) {
      const s = servicios.find((x) => x.id === servicioId);
      if (s) {
        return [
          {
            descripcion: `${s.tipo} - ${s.descripcion ?? ''}`,
            cantidad: 1,
            precio_unitario: s.costo_real,
          },
        ];
      }
    }

    return [];
  }, [tipoVenta, mototaxiId, refaccionId, servicioId, mototaxis, refacciones, servicios]);

  // === SUBMIT ===
  async function submit() {
    try {
      if (!clienteId || !tipoVenta || !usoCFDI || !metodoPago || !formaPago) {
        toast.error('Completa los campos obligatorios');
        return;
      }

      if (tipoVenta === 'Mototaxi' && !mototaxiId) {
        toast.error('Selecciona una mototaxi');
        return;
      }

      if (tipoVenta === 'Refaccion' && !refaccionId) {
        toast.error('Selecciona una refacción');
        return;
      }

      if (tipoVenta === 'Servicio' && !servicioId) {
        toast.error('Selecciona un servicio');
        return;
      }

      if (itemsPayload.length === 0) {
        toast.error('Agrega al menos un concepto');
        return;
      }

      // === Construcción EXACTA del payload ===
      const payload: CrearFacturaPayload = {
        cliente_id: clienteId,
        tipo: 'Ingreso',
        tipo_venta: tipoVenta,
        metodo_pago: metodoPago || 'PUE',
        forma_pago: formaPago || '01',
        uso_cfdi: usoCFDI,
        items: itemsPayload,
        servicio_id: tipoVenta === 'Servicio' ? servicioId : null,
        mototaxi_id: tipoVenta === 'Mototaxi' ? mototaxiId : null,
        refaccion_id: tipoVenta === 'Refaccion' ? refaccionId : null,
      };

      await FacturaService.create(payload);

      toast.success('Factura creada');
      onOpenChange(false);
      onCreated();
      reset();
    } catch (e: any) {
      toast.error('Error al crear factura');
    }
  }

  const reset = () => {
    setClienteId(null);
    setServicioId(0);
    setTipoVenta('');
    setUsoCFDI('');
    setMetodoPago('PUE');
    setFormaPago('01');
    setTotal(0);
    setMototaxiId(0);
    setRefaccionId(0);
  };

  // ==========================
  // FORM CONTENT
  // ==========================
  const FormContent = (
    <>
      {/* CLIENTE */}
      <div className="grid gap-2">
        <Label>Cliente *</Label>
        <Select value={clienteId ? String(clienteId) : ''} onValueChange={(v: string) => setClienteId(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre} - {c.rfc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TIPO DE VENTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tipo de Venta *</Label>
          <Select
            value={tipoVenta}
            onValueChange={(v: string) => {
              setTipoVenta(v);
              setMototaxiId(0);
              setRefaccionId(0);
              setServicioId(0);
              setTotal(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Refaccion">Refacciones</SelectItem>
              <SelectItem value="Mototaxi">Mototaxi</SelectItem>
              <SelectItem value="Servicio">Servicio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* USO CFDI */}
        <div className="grid gap-2">
          <Label>Uso CFDI *</Label>
          <Select value={usoCFDI} onValueChange={(v: string) => setUsoCFDI(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="G01">G01 - Venta de mercancia</SelectItem>
              <SelectItem value="G03">G03 - Gastos en general</SelectItem>
              <SelectItem value="P01">P01 - Por definir</SelectItem>
              <SelectItem value="S01">S01 - Sin efectos Fiscales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MÉTODO DE PAGO */}
      <div className="grid gap-2">
        <Label>Método de Pago *</Label>
        <Select value={metodoPago} onValueChange={(v: string) => setMetodoPago(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUE">PUE - Pago en una sola exhibición</SelectItem>
            <SelectItem value="PPD">PPD - Pago en parcialidades o diferido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* FORMA DE PAGO */}
      <div className="grid gap-2">
        <Label>Forma de Pago *</Label>
        <Select value={formaPago} onValueChange={(v: string) => setFormaPago(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar forma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="01">01 - Efectivo</SelectItem>
            <SelectItem value="02">02 - Cheque nominativo</SelectItem>
            <SelectItem value="03">03 - Transferencia</SelectItem>
            <SelectItem value="04">04 - Tarjeta de credito</SelectItem>
            <SelectItem value="28">28 - Tarjeta de debito</SelectItem>
            <SelectItem value="99">99 - Por definir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* MOTOTAXI */}
      {tipoVenta === 'Mototaxi' && (
        <div className="grid gap-2 p-4 border rounded bg-red-50">
          <Label>Seleccionar Mototaxi *</Label>
          <Select value={mototaxiId ? String(mototaxiId) : ''} onValueChange={(v: string) => setMototaxiId(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar mototaxi" />
            </SelectTrigger>
            <SelectContent>
              {mototaxis.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.modelo} - {m.color} - Serie {m.serie} - ${m.precio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* REFACCIONES */}
      {tipoVenta === 'Refaccion' && (
        <div className="grid gap-2 p-4 border rounded bg-slate-50">
          <Label>Seleccionar Refacción *</Label>
          <Select value={refaccionId ? String(refaccionId) : ''} onValueChange={(v: string) => setRefaccionId(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar refacción" />
            </SelectTrigger>
            <SelectContent>
              {refacciones.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.codigo} - {r.descripcion} - ${r.precio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* SERVICIO */}
      {tipoVenta === 'Servicio' && (
        <div className="grid gap-2 p-4 border rounded bg-blue-50">
          <Label>Seleccionar Servicio *</Label>
          <Select value={servicioId ? String(servicioId) : ''} onValueChange={(v: string) => setServicioId(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              {servicios.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.tipo} - ${s.costo_real}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {servicioId > 0 && (() => {
            const s = servicios.find((x) => x.id === servicioId);
            return s ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <b>Servicio:</b> {s.tipo}
                </p>
                {s.descripcion && (
                  <p>
                    <b>Descripción:</b> {s.descripcion}
                  </p>
                )}
                <p>
                  <b>Precio:</b> ${s.costo_real}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* TOTAL */}
      {(tipoVenta === 'Mototaxi' || tipoVenta === 'Refaccion' || tipoVenta === 'Servicio') && (
        <div className="grid gap-2">
          <Label>Total</Label>
          <Input disabled value={total} />
        </div>
      )}
    </>
  );

  // ==========================
  // RENDER
  // ==========================
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nueva Factura</SheetTitle>
            <SheetDescription>Crear y timbrar factura</SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-4">{FormContent}</div>
          <SheetFooter className="flex-col gap-2 p-4">
            <Button className="bg-[#B02128] text-white" onClick={() => submit()}>
              <CheckCircle className="h-4 w-4 mr-2" /> Timbrar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Factura CFDI 4.0</DialogTitle>
          <DialogDescription>Crear y timbrar factura</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">{FormContent}</div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          <Button onClick={() => submit()} className="bg-[#B02128] text-white">
            <CheckCircle className="mr-2 h-4 w-4" /> Timbrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
