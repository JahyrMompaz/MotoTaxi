import { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle, XCircle, Clock, Eye, Download, QrCode, Building2, Calendar, CreditCard, Bike } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useIsMobile } from './ui/use-mobile';

interface Factura {
  id: number;
  folio: string;
  cliente: string;
  rfc: string;
  tipo: string;
  total: number;
  estatus: string;
  fecha: string;
  usoCFDI?: string;
  formaPago?: string;
  conceptos?: string;
  mototaxiId?: number;
  mototaxiModelo?: string;
  mototaxiSerie?: string;
  refaccionId?: number;
  refaccionCodigo?: string;
  refaccionDescripcion?: string;
}

interface Mototaxi {
  id: number;
  modelo: string;
  color: string;
  año: number;
  serie: string;
  precio: number;
}

interface Refaccion {
  id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  existencia: number;
}

// Datos de mototaxis disponibles
const mototaxisDisponibles: Mototaxi[] = [
  { id: 1, modelo: 'Italika DM150', color: 'Rojo', año: 2024, serie: 'ITK2024-001', precio: 45000 },
  { id: 2, modelo: 'Vento Rebellion', color: 'Negro', año: 2024, serie: 'VTO2024-002', precio: 52000 },
  { id: 3, modelo: 'Italika DS150', color: 'Azul', año: 2024, serie: 'ITK2024-003', precio: 48000 },
  { id: 4, modelo: 'Vento Workman', color: 'Blanco', año: 2024, serie: 'VTO2024-004', precio: 54000 },
  { id: 5, modelo: 'Italika DM200', color: 'Verde', año: 2024, serie: 'ITK2024-005', precio: 49000 },
  { id: 6, modelo: 'Vento Nitrox', color: 'Gris', año: 2024, serie: 'VTO2024-006', precio: 56000 },
];

// Datos de refacciones disponibles
const refaccionesDisponibles: Refaccion[] = [
  { id: 1, codigo: 'REF-001', descripcion: 'Llanta delantera 90/90-12', precio: 450, existencia: 45 },
  { id: 2, codigo: 'REF-002', descripcion: 'Aceite semi-sintético 20W-50', precio: 180, existencia: 120 },
  { id: 3, codigo: 'REF-003', descripcion: 'Batería 12V 7Ah', precio: 850, existencia: 12 },
  { id: 4, codigo: 'REF-004', descripcion: 'Pastillas de freno delanteras', precio: 320, existencia: 67 },
  { id: 5, codigo: 'REF-005', descripcion: 'Filtro de aire', precio: 125, existencia: 89 },
  { id: 6, codigo: 'REF-006', descripcion: 'Bujía NGK CR7HSA', precio: 85, existencia: 156 },
];

const facturasDataInitial: Factura[] = [
  { id: 1, folio: 'CFDI-45678', cliente: 'Transportes del Norte', rfc: 'ABC123456789', tipo: 'Refacciones', total: 5400, estatus: 'Timbrada', fecha: '2024-10-20', usoCFDI: 'G03', formaPago: '01', refaccionId: 3, refaccionCodigo: 'REF-003', refaccionDescripcion: 'Batería 12V 7Ah' },
  { id: 2, folio: 'CFDI-45679', cliente: 'Logística Express', rfc: 'DEF987654321', tipo: 'Mototaxi', total: 52000, estatus: 'Timbrada', fecha: '2024-10-21', usoCFDI: 'G01', formaPago: '03', mototaxiId: 2, mototaxiModelo: 'Vento Rebellion', mototaxiSerie: 'VTO2024-002' },
  { id: 3, folio: 'CFDI-45680', cliente: 'Mototaxis del Sur', rfc: 'GHI456789123', tipo: 'Servicio', total: 3200, estatus: 'Pendiente', fecha: '2024-10-22', usoCFDI: 'G03', formaPago: '01', conceptos: 'Servicio de mantenimiento preventivo' },
  { id: 4, folio: 'CFDI-45681', cliente: 'Comercializadora Global', rfc: 'JKL789123456', tipo: 'Refacciones', total: 8900, estatus: 'Timbrada', fecha: '2024-10-22', usoCFDI: 'G01', formaPago: '04', refaccionId: 3, refaccionCodigo: 'REF-003', refaccionDescripcion: 'Batería 12V 7Ah' },
  { id: 5, folio: 'CFDI-45682', cliente: 'Transportes del Norte', rfc: 'ABC123456789', tipo: 'Servicio', total: 2800, estatus: 'Cancelada', fecha: '2024-10-23', usoCFDI: 'G03', formaPago: '01', conceptos: 'Servicio de reparación de motor' },
];

export function Facturacion() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [facturas, setFacturas] = useState<Factura[]>(facturasDataInitial);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    rfc: '',
    tipo: '',
    usoCFDI: '',
    formaPago: '',
    metodoPago: '',
    conceptos: '',
    total: 0,
    notas: '',
    mototaxiId: 0,
    refaccionId: 0,
  });
  const [cancelData, setCancelData] = useState({
    motivo: '',
    uuidSustitucion: '',
  });

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case 'Timbrada':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelada':
        return <XCircle className="h-4 w-4" />;
      case 'Pendiente':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'Timbrada':
        return 'bg-green-600 text-white';
      case 'Cancelada':
        return 'bg-red-600 text-white';
      case 'Pendiente':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-[#64748B] text-white';
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      rfc: '',
      tipo: '',
      usoCFDI: '',
      formaPago: '',
      metodoPago: '',
      conceptos: '',
      total: 0,
      notas: '',
      mototaxiId: 0,
      refaccionId: 0,
    });
  };

  // Actualizar precio automáticamente cuando se selecciona una mototaxi o refacción
  useEffect(() => {
    if (formData.tipo === 'Mototaxi' && formData.mototaxiId > 0) {
      const mototaxi = mototaxisDisponibles.find(m => m.id === formData.mototaxiId);
      if (mototaxi) {
        setFormData(prev => ({ ...prev, total: mototaxi.precio }));
      }
    } else if (formData.tipo === 'Refacciones' && formData.refaccionId > 0) {
      const refaccion = refaccionesDisponibles.find(r => r.id === formData.refaccionId);
      if (refaccion) {
        setFormData(prev => ({ ...prev, total: refaccion.precio }));
      }
    }
  }, [formData.mototaxiId, formData.refaccionId, formData.tipo]);

  const handleAdd = (timbrar: boolean) => {
    if (!formData.cliente || !formData.tipo || !formData.usoCFDI) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    // Validar que se haya seleccionado una mototaxi o refacción según el tipo
    if (formData.tipo === 'Mototaxi' && !formData.mototaxiId) {
      toast.error('Por favor selecciona una mototaxi');
      return;
    }

    if (formData.tipo === 'Refacciones' && !formData.refaccionId) {
      toast.error('Por favor selecciona una refacción');
      return;
    }

    const newFactura: Factura = {
      id: Math.max(...facturas.map(f => f.id)) + 1,
      folio: `CFDI-${45682 + facturas.length + 1}`,
      cliente: formData.cliente,
      rfc: formData.rfc,
      tipo: formData.tipo,
      total: formData.total,
      estatus: timbrar ? 'Timbrada' : 'Pendiente',
      fecha: new Date().toISOString().split('T')[0],
      usoCFDI: formData.usoCFDI,
      formaPago: formData.formaPago,
      conceptos: formData.conceptos,
    };

    // Agregar datos de mototaxi si aplica
    if (formData.tipo === 'Mototaxi' && formData.mototaxiId) {
      const mototaxi = mototaxisDisponibles.find(m => m.id === formData.mototaxiId);
      if (mototaxi) {
        newFactura.mototaxiId = mototaxi.id;
        newFactura.mototaxiModelo = mototaxi.modelo;
        newFactura.mototaxiSerie = mototaxi.serie;
      }
    }

    // Agregar datos de refacción si aplica
    if (formData.tipo === 'Refacciones' && formData.refaccionId) {
      const refaccion = refaccionesDisponibles.find(r => r.id === formData.refaccionId);
      if (refaccion) {
        newFactura.refaccionId = refaccion.id;
        newFactura.refaccionCodigo = refaccion.codigo;
        newFactura.refaccionDescripcion = refaccion.descripcion;
      }
    }

    setFacturas([...facturas, newFactura]);
    toast.success(timbrar ? 'Factura timbrada exitosamente' : 'Borrador guardado exitosamente');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleCancel = () => {
    if (!selectedFactura) return;
    
    if (!cancelData.motivo) {
      toast.error('Por favor selecciona un motivo de cancelación');
      return;
    }

    if (cancelData.motivo === '01' && !cancelData.uuidSustitucion) {
      toast.error('Por favor ingresa el UUID de la factura de sustitución');
      return;
    }
    
    setFacturas(facturas.map(f => 
      f.id === selectedFactura.id 
        ? { ...f, estatus: 'Cancelada' }
        : f
    ));
    toast.success('Factura anulada exitosamente en el SAT');
    setIsCancelDialogOpen(false);
    setSelectedFactura(null);
    setCancelData({ motivo: '', uuidSustitucion: '' });
  };

  const handleDownload = (factura: Factura) => {
    toast.success(`Descargando factura ${factura.folio}...`);
  };

  const openViewDialog = (factura: Factura) => {
    setSelectedFactura(factura);
    setIsViewDialogOpen(true);
  };

  const openCancelDialog = (factura: Factura) => {
    setSelectedFactura(factura);
    setCancelData({ motivo: '', uuidSustitucion: '' });
    setIsCancelDialogOpen(true);
  };

  const handleTimbrarPendiente = (factura: Factura) => {
    setFacturas(facturas.map(f => 
      f.id === factura.id 
        ? { ...f, estatus: 'Timbrada' }
        : f
    ));
    toast.success(`Factura ${factura.folio} timbrada exitosamente`);
  };

  const FormContent = () => (
    <>
      <div className="grid gap-2">
        <Label htmlFor="cliente">Cliente *</Label>
        <Select value={formData.cliente} onValueChange={(value: string) => {
          const rfcMap: Record<string, string> = {
            'Transportes del Norte': 'ABC123456789',
            'Logística Express': 'DEF987654321',
            'Mototaxis del Sur': 'GHI456789123',
            'Comercializadora Global': 'JKL789123456',
          };
          setFormData({ ...formData, cliente: value, rfc: rfcMap[value] || '' });
        }}>
          <SelectTrigger className={isMobile ? "h-11" : ""}>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Transportes del Norte">Transportes del Norte - ABC123456789</SelectItem>
            <SelectItem value="Logística Express">Logística Express - DEF987654321</SelectItem>
            <SelectItem value="Mototaxis del Sur">Mototaxis del Sur - GHI456789123</SelectItem>
            <SelectItem value="Comercializadora Global">Comercializadora Global - JKL789123456</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tipoVenta">Tipo de Venta *</Label>
          <Select value={formData.tipo} onValueChange={(value: string) => setFormData({ ...formData, tipo: value, mototaxiId: 0, refaccionId: 0, total: 0 })}>
            <SelectTrigger className={isMobile ? "h-11" : ""}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Refacciones">Refacciones</SelectItem>
              <SelectItem value="Mototaxi">Mototaxi</SelectItem>
              <SelectItem value="Servicio">Servicio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="usoCFDI">Uso CFDI *</Label>
          <Select value={formData.usoCFDI} onValueChange={(value: string) => setFormData({ ...formData, usoCFDI: value })}>
            <SelectTrigger className={isMobile ? "h-11" : ""}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
              <SelectItem value="G03">G03 - Gastos en general</SelectItem>
              <SelectItem value="P01">P01 - Por definir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selector de Mototaxi */}
      {formData.tipo === 'Mototaxi' && (
        <div className="grid gap-2 p-4 border border-[#B02128] rounded-lg bg-red-50">
          <Label htmlFor="mototaxi">Seleccionar Mototaxi *</Label>
          <Select 
            value={formData.mototaxiId.toString()} 
            onValueChange={(value: string) => setFormData({ ...formData, mototaxiId: parseInt(value) })}
          >
            <SelectTrigger className={isMobile ? "h-11" : ""}>
              <SelectValue placeholder="Seleccionar mototaxi" />
            </SelectTrigger>
            <SelectContent>
              {mototaxisDisponibles.map((moto) => (
                <SelectItem key={moto.id} value={moto.id.toString()}>
                  {moto.modelo} ({moto.color}) - Serie: {moto.serie} - ${moto.precio.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.mototaxiId > 0 && (
            <div className="text-sm text-[#64748B] mt-2">
              {(() => {
                const moto = mototaxisDisponibles.find(m => m.id === formData.mototaxiId);
                return moto ? (
                  <div className="space-y-1">
                    <p><span className="font-medium">Modelo:</span> {moto.modelo}</p>
                    <p><span className="font-medium">Color:</span> {moto.color}</p>
                    <p><span className="font-medium">Año:</span> {moto.año}</p>
                    <p><span className="font-medium">Serie:</span> {moto.serie}</p>
                    <p><span className="font-medium">Precio:</span> ${moto.precio.toLocaleString()}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}

      {/* Selector de Refacción */}
      {formData.tipo === 'Refacciones' && (
        <div className="grid gap-2 p-4 border border-[#1E293B] rounded-lg bg-slate-50">
          <Label htmlFor="refaccion">Seleccionar Refacción *</Label>
          <Select 
            value={formData.refaccionId.toString()} 
            onValueChange={(value: string) => setFormData({ ...formData, refaccionId: parseInt(value) })}
          >
            <SelectTrigger className={isMobile ? "h-11" : ""}>
              <SelectValue placeholder="Seleccionar refacción" />
            </SelectTrigger>
            <SelectContent>
              {refaccionesDisponibles.map((ref) => (
                <SelectItem key={ref.id} value={ref.id.toString()}>
                  {ref.codigo} - {ref.descripcion} - ${ref.precio.toLocaleString()} (Stock: {ref.existencia})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.refaccionId > 0 && (
            <div className="text-sm text-[#64748B] mt-2">
              {(() => {
                const ref = refaccionesDisponibles.find(r => r.id === formData.refaccionId);
                return ref ? (
                  <div className="space-y-1">
                    <p><span className="font-medium">Código:</span> {ref.codigo}</p>
                    <p><span className="font-medium">Descripción:</span> {ref.descripcion}</p>
                    <p><span className="font-medium">Precio:</span> ${ref.precio.toLocaleString()}</p>
                    <p><span className="font-medium">Existencia:</span> {ref.existencia} unidades</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="formaPago">Forma de Pago</Label>
          <Select value={formData.formaPago} onValueChange={(value: string) => setFormData({ ...formData, formaPago: value })}>
            <SelectTrigger className={isMobile ? "h-11" : ""}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="01">01 - Efectivo</SelectItem>
              <SelectItem value="03">03 - Transferencia</SelectItem>
              <SelectItem value="04">04 - Tarjeta de Crédito</SelectItem>
              <SelectItem value="28">28 - Tarjeta de Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="metodoPago">Método de Pago</Label>
          <Select value={formData.metodoPago} onValueChange={(value: string) => setFormData({ ...formData, metodoPago: value })}>
            <SelectTrigger className={isMobile ? "h-11" : ""}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUE">PUE - Pago en una sola exhibición</SelectItem>
              <SelectItem value="PPD">PPD - Pago en parcialidades</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conceptos solo para Servicio */}
      {formData.tipo === 'Servicio' && (
        <div className="grid gap-2">
          <Label htmlFor="conceptos">Conceptos / Descripción del Servicio</Label>
          <Textarea
            id="conceptos"
            placeholder="Descripción del servicio prestado..."
            value={formData.conceptos}
            onChange={(e) => setFormData({ ...formData, conceptos: e.target.value })}
            rows={3}
            className={isMobile ? "h-20" : ""}
          />
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="total">Total</Label>
        <Input 
          id="total" 
          type="number"
          placeholder="0.00"
          value={formData.total}
          onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
          disabled={formData.tipo === 'Mototaxi' || formData.tipo === 'Refacciones'}
          className={`${formData.tipo === 'Mototaxi' || formData.tipo === 'Refacciones' ? 'bg-gray-100' : ''} ${isMobile ? 'h-11' : ''}`}
        />
        {(formData.tipo === 'Mototaxi' || formData.tipo === 'Refacciones') && (
          <p className="text-xs text-[#64748B]">
            El total se calcula automáticamente según el {formData.tipo === 'Mototaxi' ? 'mototaxi' : 'refacción'} seleccionado
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notas">Notas / Observaciones</Label>
        <Textarea 
          id="notas" 
          placeholder="Notas adicionales..."
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={2}
          className={isMobile ? "h-16" : ""}
        />
      </div>
    </>
  );

  const FacturaCard = ({ factura }: { factura: Factura }) => (
    <div className="p-4 active:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <div className="mt-0.5">
              <FileText className="h-5 w-5 text-[#1E293B]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#1E293B] mb-1">{factura.folio}</h3>
              <p className="text-xs text-[#64748B] mb-2">{factura.cliente}</p>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{factura.tipo}</Badge>
                <Badge className={`${getStatusColor(factura.estatus)} flex items-center gap-1 text-xs`}>
                  {getStatusIcon(factura.estatus)}
                  <span>{factura.estatus}</span>
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5 mt-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{factura.rfc}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{factura.fecha}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#B02128]" />
              <span className="text-[#B02128]">${factura.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 text-[#1E293B]"
            onClick={() => openViewDialog(factura)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {factura.estatus === 'Pendiente' && hasPermission('facturacion.create') && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 text-green-600"
              onClick={() => handleTimbrarPendiente(factura)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {factura.estatus === 'Timbrada' && (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-[#1E293B]"
                onClick={() => handleDownload(factura)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {hasPermission('facturacion.cancel') && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 text-red-600"
                  onClick={() => openCancelDialog(factura)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-20' : ''}`}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Facturación</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Generación de CFDI 4.0</p>
        </div>
        {hasPermission('facturacion.create') && !isMobile && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto text-sm h-9" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Factura
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1E293B]">Generar CFDI 4.0</DialogTitle>
              <DialogDescription className="sr-only">Formulario para generar una nueva factura CFDI 4.0</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormContent />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-[#1E293B] hover:bg-[#0F172A] text-white"
                onClick={() => handleAdd(false)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button 
                className="bg-[#B02128] hover:bg-[#8B1A20] text-white" 
                onClick={() => handleAdd(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Timbrar Factura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}

        {/* Botón Flotante + Sheet para Móvil */}
        {hasPermission('facturacion.create') && isMobile && (
          <>
            <Button 
              className="bg-[#B02128] hover:bg-[#8B1A20] text-white fixed bottom-20 right-4 z-50 shadow-lg h-14 w-14 rounded-full p-0"
              onClick={() => { resetForm(); setIsAddDialogOpen(true); }}
            >
              <Plus className="h-6 w-6" />
            </Button>
            
            <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <SheetContent side="bottom" className="h-[90vh] bg-white p-0">
                <div className="h-full flex flex-col">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-[#1E293B]">Nueva Factura CFDI 4.0</SheetTitle>
                    <SheetDescription className="sr-only">Formulario para generar factura</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <FormContent />
                  </div>
                  <SheetFooter className="p-4 border-t bg-white flex-col gap-2">
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 h-11">
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-[#1E293B] hover:bg-[#0F172A] text-white flex-1 h-11"
                        onClick={() => handleAdd(false)}
                      >
                        Borrador
                      </Button>
                    </div>
                    <Button 
                      className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full h-11" 
                      onClick={() => handleAdd(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Timbrar
                    </Button>
                  </SheetFooter>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Timbradas</p>
                <p className="text-2xl text-[#1E293B]">
                  {facturas.filter((f) => f.estatus === 'Timbrada').length}
                </p>
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
                <p className="text-2xl text-[#1E293B]">
                  {facturas.filter((f) => f.estatus === 'Pendiente').length}
                </p>
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
                <p className="text-2xl text-[#1E293B]">
                  {facturas.filter((f) => f.estatus === 'Cancelada').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className={isMobile ? "p-3" : ""}>
          <CardTitle className={`text-[#1E293B] ${isMobile ? "text-base" : ""}`}>Facturas Emitidas</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-0" : ""}>
          {isMobile ? (
            /* Vista Móvil - Tarjetas */
            <div className="divide-y divide-gray-100">
              {facturas.map((factura) => (
                <FacturaCard key={factura.id} factura={factura} />
              ))}
            </div>
          ) : (
            /* Vista Desktop - Tabla */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">RFC</TableHead>
                    <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturas.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell className="text-[#1E293B]">{factura.folio}</TableCell>
                      <TableCell className="text-[#1E293B]">{factura.cliente}</TableCell>
                      <TableCell className="hidden md:table-cell text-[#64748B]">
                        {factura.rfc}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{factura.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-[#1E293B]">
                        ${factura.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[#64748B]">
                        {factura.fecha}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(factura.estatus)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(factura.estatus)}
                          <span>{factura.estatus}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-[#1E293B] hover:text-[#B02128]"
                            onClick={() => openViewDialog(factura)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {factura.estatus === 'Pendiente' && hasPermission('facturacion.create') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleTimbrarPendiente(factura)}
                              title="Timbrar factura"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {factura.estatus === 'Timbrada' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-[#1E293B] hover:text-[#B02128]"
                                onClick={() => handleDownload(factura)}
                                title="Descargar XML/PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {hasPermission('facturacion.cancel') && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-[#64748B] hover:text-red-600"
                                  onClick={() => openCancelDialog(factura)}
                                  title="Cancelar factura"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Vista Previa CFDI 4.0</DialogTitle>
            <DialogDescription className="sr-only">Vista previa de la factura electrónica</DialogDescription>
          </DialogHeader>
          {selectedFactura && (
            <div className="py-4">
              {/* Documento estilo PDF */}
              <div className="bg-white border-2 border-gray-300 p-6 space-y-4">
                
                {/* Header - Logo y Datos del Emisor */}
                <div className="flex justify-between items-start border-b-2 border-[#B02128] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-[#B02128] rounded-lg p-2">
                        <Bike className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl text-[#1E293B]">Mototaxis Pro SA de CV</h2>
                        <p className="text-xs text-[#64748B]">Venta de Mototaxis y Refacciones</p>
                      </div>
                    </div>
                    <div className="text-xs text-[#64748B] space-y-0.5">
                      <p>RFC: MPR120515ABC</p>
                      <p>Régimen Fiscal: 601 - General de Ley Personas Morales</p>
                      <p>Av. Principal 1000, Col. Centro, CP 64000</p>
                      <p>Monterrey, Nuevo León, México</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(selectedFactura.estatus)} mb-2`}>
                      {selectedFactura.estatus}
                    </Badge>
                    <div className="text-xs text-[#64748B] space-y-0.5">
                      <p className="text-[#1E293B]">Folio Fiscal:</p>
                      <p className="break-all text-[10px] bg-gray-100 px-2 py-1 rounded">
                        {selectedFactura.folio.replace('CFDI-', '')}A1B2-C3D4-E5F6-G7H8-I9J0K1L2
                      </p>
                      <p className="text-[#1E293B] mt-2">Serie y Folio:</p>
                      <p className="text-lg">{selectedFactura.folio}</p>
                      <p className="text-[#64748B]">{selectedFactura.fecha}</p>
                    </div>
                  </div>
                </div>

                {/* Datos del Receptor */}
                <div className="border border-gray-300 rounded p-3">
                  <h3 className="text-xs uppercase text-[#64748B] mb-2">Receptor</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-[#64748B]">Nombre / Razón Social:</p>
                      <p className="text-[#1E293B]">{selectedFactura.cliente} SA de CV</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">RFC:</p>
                      <p className="text-[#1E293B]">{selectedFactura.rfc}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Uso CFDI:</p>
                      <p className="text-[#1E293B]">{selectedFactura.usoCFDI} - {selectedFactura.usoCFDI === 'G01' ? 'Adquisición de mercancías' : selectedFactura.usoCFDI === 'G03' ? 'Gastos en general' : 'Por definir'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Régimen Fiscal:</p>
                      <p className="text-[#1E293B]">601 - General de Ley Personas Morales</p>
                    </div>
                  </div>
                </div>

                {/* Conceptos */}
                <div>
                  <h3 className="text-xs uppercase text-[#64748B] mb-2 bg-gray-100 px-3 py-2 rounded-t">Conceptos</h3>
                  <div className="border border-gray-300 rounded-b overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-300">
                        <tr className="text-xs text-[#64748B]">
                          <th className="text-left px-3 py-2">Cantidad</th>
                          <th className="text-left px-3 py-2">Clave</th>
                          <th className="text-left px-3 py-2">Descripción</th>
                          <th className="text-right px-3 py-2">Valor Unitario</th>
                          <th className="text-right px-3 py-2">Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-3 text-[#1E293B]">1.00</td>
                          <td className="px-3 py-3 text-[#64748B] text-xs">
                            {selectedFactura.tipo === 'Mototaxi' && '25171600'}
                            {selectedFactura.tipo === 'Refacciones' && selectedFactura.refaccionCodigo}
                            {selectedFactura.tipo === 'Servicio' && '81112000'}
                          </td>
                          <td className="px-3 py-3 text-[#1E293B]">
                            {selectedFactura.tipo === 'Mototaxi' && `${selectedFactura.mototaxiModelo} - Serie: ${selectedFactura.mototaxiSerie}`}
                            {selectedFactura.tipo === 'Refacciones' && selectedFactura.refaccionDescripcion}
                            {selectedFactura.tipo === 'Servicio' && (selectedFactura.conceptos || 'Servicio de mantenimiento')}
                          </td>
                          <td className="px-3 py-3 text-right text-[#1E293B]">${selectedFactura.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-3 text-right text-[#1E293B]">${selectedFactura.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totales */}
                <div className="flex justify-between items-start">
                  <div className="text-xs space-y-1 text-[#64748B]">
                    <p><span className="font-medium text-[#1E293B]">Forma de Pago:</span> {selectedFactura.formaPago || '01'} - {selectedFactura.formaPago === '01' ? 'Efectivo' : selectedFactura.formaPago === '03' ? 'Transferencia' : selectedFactura.formaPago === '04' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}</p>
                    <p><span className="font-medium text-[#1E293B]">Método de Pago:</span> PUE - Pago en una sola exhibición</p>
                    <p><span className="font-medium text-[#1E293B]">Moneda:</span> MXN - Peso Mexicano</p>
                  </div>
                  
                  <div className="min-w-[250px] border border-gray-300 rounded overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-sm flex justify-between border-b border-gray-300">
                      <span className="text-[#64748B]">Subtotal:</span>
                      <span className="text-[#1E293B]">${(selectedFactura.total / 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 text-sm flex justify-between border-b border-gray-300">
                      <span className="text-[#64748B]">IVA (16%):</span>
                      <span className="text-[#1E293B]">${(selectedFactura.total - (selectedFactura.total / 1.16)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="bg-[#B02128] px-4 py-3 flex justify-between">
                      <span className="text-white">Total:</span>
                      <span className="text-white text-lg">${selectedFactura.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Sello Digital y QR */}
                <div className="border-t-2 border-gray-300 pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Sello Digital del CFDI:</p>
                        <p className="text-[9px] text-[#1E293B] bg-gray-50 p-2 rounded break-all leading-tight">
                          aB3dEf7Gh9IjKl2MnOpQr4StUv6WxYz8AcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRs...
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Sello Digital del SAT:</p>
                        <p className="text-[9px] text-[#1E293B] bg-gray-50 p-2 rounded break-all leading-tight">
                          xY9zAb1CdEf3GhIj5KlMn7OpQr9StUv2WxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKl...
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Cadena Original del Complemento:</p>
                        <p className="text-[9px] text-[#1E293B] bg-gray-50 p-2 rounded break-all leading-tight">
                          ||1.1|{selectedFactura.folio.replace('CFDI-', '')}A1B2-C3D4-E5F6-G7H8-I9J0K1L2|{selectedFactura.fecha}T12:00:00|SAT970701NN3|MPR120515ABC|...
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <p className="text-[#64748B]">No. Certificado SAT:</p>
                          <p className="text-[#1E293B]">00001000000507654321</p>
                        </div>
                        <div>
                          <p className="text-[#64748B]">No. Certificado Emisor:</p>
                          <p className="text-[#1E293B]">00001000000412345678</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded p-4">
                      <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded flex items-center justify-center mb-2">
                        <QrCode className="h-24 w-24 text-gray-400" />
                      </div>
                      <p className="text-[10px] text-center text-[#64748B] leading-tight">
                        Escanea el código QR para verificar<br />
                        la validez de esta factura en el portal del SAT
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-[#64748B] pt-4 border-t border-gray-300">
                  <p>Este documento es una representación impresa de un CFDI</p>
                  <p className="mt-1">Fecha de Certificación: {selectedFactura.fecha} 12:00:00</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-white sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1E293B]">Cancelar Factura</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción anulará la factura en el SAT. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="motivo">Motivo de Cancelación *</Label>
              <Select value={cancelData.motivo} onValueChange={(value: string) => setCancelData({ ...cancelData, motivo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">01 - Comprobante emitido con errores con relación</SelectItem>
                  <SelectItem value="02">02 - Comprobante emitido con errores sin relación</SelectItem>
                  <SelectItem value="03">03 - No se llevó a cabo la operación</SelectItem>
                  <SelectItem value="04">04 - Operación nominativa relacionada en una factura global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cancelData.motivo === '01' && (
              <div className="grid gap-2">
                <Label htmlFor="uuid">UUID de Sustitución *</Label>
                <Input 
                  id="uuid"
                  placeholder="UUID de la factura que sustituye"
                  value={cancelData.uuidSustitucion}
                  onChange={(e) => setCancelData({ ...cancelData, uuidSustitucion: e.target.value })}
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Anular Factura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
