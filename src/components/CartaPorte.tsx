import { useState, useEffect } from 'react';
import { Plus, Truck, FileText, Eye, Download, MapPin, User, Calendar, Clock, Package, CheckCircle, XCircle, Bike } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useIsMobile } from './ui/use-mobile';
import {
  getCartasPorte,
  createCartaPorte,
  updateCartaPorte,
  deleteCartaPorte
} from "./cartaporte/cartaPorteService";


interface CartaPorte {
  id: number;
  folio: string;
  fecha: string;
  origen: string;
  destino: string;
  choferNombre: string;
  choferLicencia: string;
  vehiculoPlacas: string;
  vehiculoModelo: string;
  facturasVinculadas: string[];
  estatus: 'Pendiente' | 'En Tránsito' | 'Entregada' | 'Cancelada';
  distanciaKm: number;
}

export function CartaPorte() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [cartasPorte, setCartasPorte] = useState<CartaPorte[]>([
    {
      id: 1,
      folio: 'CP-2024-001',
      fecha: '15/01/2024',
      origen: 'Monterrey, NL',
      destino: 'Ciudad de México, CDMX',
      choferNombre: 'Juan Pérez García',
      choferLicencia: 'A1234567',
      vehiculoPlacas: 'ABC-123-D',
      vehiculoModelo: 'Freightliner Cascadia 2022',
      facturasVinculadas: ['CFDI-2024-001', 'CFDI-2024-002'],
      estatus: 'Entregada',
      distanciaKm: 920,
    },
    {
      id: 2,
      folio: 'CP-2024-002',
      fecha: '18/01/2024',
      origen: 'Guadalajara, JAL',
      destino: 'Monterrey, NL',
      choferNombre: 'Carlos Martínez López',
      choferLicencia: 'B9876543',
      vehiculoPlacas: 'XYZ-789-E',
      vehiculoModelo: 'Kenworth T680 2021',
      facturasVinculadas: ['CFDI-2024-005'],
      estatus: 'En Tránsito',
      distanciaKm: 680,
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCarta, setSelectedCarta] = useState<CartaPorte | null>(null);
  
  // Facturas timbradas disponibles para vincular
  const [facturasDisponibles] = useState([
    { folio: 'CFDI-2024-001', cliente: 'Transportes del Norte SA', total: 145000 },
    { folio: 'CFDI-2024-002', cliente: 'Logística Express SA', total: 98500 },
    { folio: 'CFDI-2024-003', cliente: 'Mototaxis Rápidos SA', total: 125000 },
    { folio: 'CFDI-2024-004', cliente: 'Distribuidora Regional SA', total: 87000 },
    { folio: 'CFDI-2024-005', cliente: 'Comercial del Bajío SA', total: 112000 },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    choferNombre: '',
    choferRFC: '',
    choferLicencia: '',
    vehiculoPlacas: '',
    vehiculoModelo: '',
    vehiculoAnio: '',
    vehiculoConfiguracion: '',
    fechaSalida: '',
    horaSalida: '',
    distanciaKm: '',
    facturasSeleccionadas: [] as string[],
    observaciones: '',
  });

  const resetForm = () => {
    setFormData({
      origen: '',
      destino: '',
      choferNombre: '',
      choferRFC: '',
      choferLicencia: '',
      vehiculoPlacas: '',
      vehiculoModelo: '',
      vehiculoAnio: '',
      vehiculoConfiguracion: '',
      fechaSalida: '',
      horaSalida: '',
      distanciaKm: '',
      facturasSeleccionadas: [],
      observaciones: '',
    });
  };

  const handleCreate = () => {
    if (!formData.origen || !formData.destino || !formData.choferNombre || !formData.vehiculoPlacas || formData.facturasSeleccionadas.length === 0) {
      toast.error('Por favor completa todos los campos requeridos y selecciona al menos una factura');
      return;
    }

    const newCarta: CartaPorte = {
      id: cartasPorte.length + 1,
      folio: `CP-2024-${String(cartasPorte.length + 1).padStart(3, '0')}`,
      fecha: new Date().toLocaleDateString('es-MX'),
      origen: formData.origen,
      destino: formData.destino,
      choferNombre: formData.choferNombre,
      choferLicencia: formData.choferLicencia,
      vehiculoPlacas: formData.vehiculoPlacas,
      vehiculoModelo: formData.vehiculoModelo,
      facturasVinculadas: formData.facturasSeleccionadas,
      estatus: 'Pendiente',
      distanciaKm: Number(formData.distanciaKm),
    };

    setCartasPorte([newCarta, ...cartasPorte]);
    toast.success('Carta Porte creada exitosamente');
    setIsCreateOpen(false);
    resetForm();
  };

  const openViewDialog = (carta: CartaPorte) => {
    setSelectedCarta(carta);
    setIsViewDialogOpen(true);
  };

  const handleToggleFactura = (folio: string) => {
    setFormData(prev => ({
      ...prev,
      facturasSeleccionadas: prev.facturasSeleccionadas.includes(folio)
        ? prev.facturasSeleccionadas.filter(f => f !== folio)
        : [...prev.facturasSeleccionadas, folio]
    }));
  };

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En Tránsito':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Entregada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case 'Pendiente':
        return <Clock className="h-3 w-3" />;
      case 'En Tránsito':
        return <Truck className="h-3 w-3" />;
      case 'Entregada':
        return <CheckCircle className="h-3 w-3" />;
      case 'Cancelada':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl text-[#1E293B]">Carta Porte</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Gestión de complementos de Carta Porte CFDI 4.0
          </p>
        </div>
        {hasPermission('facturacion.create') && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#B02128] hover:bg-[#8F1A20] text-white w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carta Porte
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748B]">Total</p>
                <p className="text-2xl text-[#1E293B] mt-1">{cartasPorte.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748B]">En Tránsito</p>
                <p className="text-2xl text-[#1E293B] mt-1">
                  {cartasPorte.filter(c => c.estatus === 'En Tránsito').length}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748B]">Entregadas</p>
                <p className="text-2xl text-[#1E293B] mt-1">
                  {cartasPorte.filter(c => c.estatus === 'Entregada').length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748B]">Pendientes</p>
                <p className="text-2xl text-[#1E293B] mt-1">
                  {cartasPorte.filter(c => c.estatus === 'Pendiente').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cartas Porte List */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-[#1E293B]">Cartas Porte Registradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isMobile ? (
            /* Vista Móvil - Tarjetas */
            <div className="divide-y divide-gray-200">
              {cartasPorte.map((carta) => (
                <div key={carta.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-[#1E293B]">{carta.folio}</span>
                        <Badge className={`${getStatusColor(carta.estatus)} flex items-center gap-1 text-xs`}>
                          {getStatusIcon(carta.estatus)}
                          <span>{carta.estatus}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B]">{carta.fecha}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[#64748B] flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-[#1E293B]">{carta.origen}</p>
                        <p className="text-xs text-[#64748B]">→ {carta.destino}</p>
                        <p className="text-xs text-[#64748B]">{carta.distanciaKm} km</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#64748B]" />
                      <span className="text-sm text-[#1E293B]">{carta.choferNombre}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#64748B]" />
                      <span className="text-sm text-[#1E293B]">{carta.vehiculoPlacas} - {carta.vehiculoModelo}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#64748B]" />
                      <span className="text-sm text-[#1E293B]">
                        {carta.facturasVinculadas.length} factura(s) vinculada(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[#1E293B] border-gray-300"
                      onClick={() => openViewDialog(carta)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    {carta.estatus !== 'Cancelada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[#1E293B] border-gray-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vista Desktop - Tabla */
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead className="hidden lg:table-cell">Chofer</TableHead>
                    <TableHead className="hidden lg:table-cell">Vehículo</TableHead>
                    <TableHead>Facturas</TableHead>
                    <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartasPorte.map((carta) => (
                    <TableRow key={carta.id}>
                      <TableCell className="text-[#1E293B]">{carta.folio}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-[#1E293B]">{carta.origen}</p>
                          <p className="text-xs text-[#64748B]">→ {carta.destino}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[#64748B]">
                        {carta.choferNombre}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[#64748B]">
                        {carta.vehiculoPlacas}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{carta.facturasVinculadas.length}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-[#64748B]">
                        {carta.fecha}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(carta.estatus)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(carta.estatus)}
                          <span>{carta.estatus}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#1E293B] hover:text-[#B02128]"
                            onClick={() => openViewDialog(carta)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {carta.estatus !== 'Cancelada' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-[#1E293B] hover:text-[#B02128]"
                              title="Descargar"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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

      {/* Create Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetContent side="bottom" className="bg-white h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-[#1E293B]">Nueva Carta Porte</SheetTitle>
              <SheetDescription>Completa la información del transporte y vincula las facturas</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-4">
              {/* Datos del Origen y Destino */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Origen y Destino
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="origen">Origen *</Label>
                    <Input
                      id="origen"
                      value={formData.origen}
                      onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                      placeholder="Ciudad, Estado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destino">Destino *</Label>
                    <Input
                      id="destino"
                      value={formData.destino}
                      onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                      placeholder="Ciudad, Estado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="distancia">Distancia (km) *</Label>
                    <Input
                      id="distancia"
                      type="number"
                      value={formData.distanciaKm}
                      onChange={(e) => setFormData({ ...formData, distanciaKm: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Datos del Chofer */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos del Chofer
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="choferNombre">Nombre Completo *</Label>
                    <Input
                      id="choferNombre"
                      value={formData.choferNombre}
                      onChange={(e) => setFormData({ ...formData, choferNombre: e.target.value })}
                      placeholder="Nombre del chofer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="choferRFC">RFC</Label>
                    <Input
                      id="choferRFC"
                      value={formData.choferRFC}
                      onChange={(e) => setFormData({ ...formData, choferRFC: e.target.value })}
                      placeholder="ABCD123456XXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="choferLicencia">Número de Licencia *</Label>
                    <Input
                      id="choferLicencia"
                      value={formData.choferLicencia}
                      onChange={(e) => setFormData({ ...formData, choferLicencia: e.target.value })}
                      placeholder="A1234567"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Datos del Vehículo */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Datos del Vehículo
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="vehiculoPlacas">Placas *</Label>
                    <Input
                      id="vehiculoPlacas"
                      value={formData.vehiculoPlacas}
                      onChange={(e) => setFormData({ ...formData, vehiculoPlacas: e.target.value })}
                      placeholder="ABC-123-D"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehiculoModelo">Modelo</Label>
                    <Input
                      id="vehiculoModelo"
                      value={formData.vehiculoModelo}
                      onChange={(e) => setFormData({ ...formData, vehiculoModelo: e.target.value })}
                      placeholder="Marca y modelo del vehículo"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="vehiculoAnio">Año</Label>
                      <Input
                        id="vehiculoAnio"
                        value={formData.vehiculoAnio}
                        onChange={(e) => setFormData({ ...formData, vehiculoAnio: e.target.value })}
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehiculoConfiguracion">Configuración</Label>
                      <Select
                        value={formData.vehiculoConfiguracion}
                        onValueChange={(value: any) => setFormData({ ...formData, vehiculoConfiguracion: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="C2">C2 - Camión 2 ejes</SelectItem>
                          <SelectItem value="C3">C3 - Camión 3 ejes</SelectItem>
                          <SelectItem value="T3S2">T3S2 - Tractocamión</SelectItem>
                          <SelectItem value="T3S3">T3S3 - Tractocamión 3 ejes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fecha y Hora */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha y Hora de Salida
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fechaSalida">Fecha</Label>
                    <Input
                      id="fechaSalida"
                      type="date"
                      value={formData.fechaSalida}
                      onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaSalida">Hora</Label>
                    <Input
                      id="horaSalida"
                      type="time"
                      value={formData.horaSalida}
                      onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Facturas Vinculadas */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Facturas a Transportar *
                </h3>
                <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                  {facturasDisponibles.map((factura) => (
                    <div
                      key={factura.folio}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={factura.folio}
                          checked={formData.facturasSeleccionadas.includes(factura.folio)}
                          onCheckedChange={() => handleToggleFactura(factura.folio)}
                        />
                        <Label htmlFor={factura.folio} className="cursor-pointer">
                          <p className="text-sm text-[#1E293B]">{factura.folio}</p>
                          <p className="text-xs text-[#64748B]">{factura.cliente}</p>
                        </Label>
                      </div>
                      <span className="text-sm text-[#1E293B]">
                        ${factura.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#64748B]">
                  {formData.facturasSeleccionadas.length} factura(s) seleccionada(s)
                </p>
              </div>

              <Separator />

              {/* Observaciones */}
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas adicionales sobre el transporte..."
                  rows={3}
                />
              </div>
            </div>
            <SheetFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                className="flex-1 bg-[#B02128] hover:bg-[#8F1A20] text-white"
              >
                Crear Carta Porte
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1E293B]">Nueva Carta Porte</DialogTitle>
              <DialogDescription>Completa la información del transporte y vincula las facturas timbradas</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Datos del Origen y Destino */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Origen y Destino
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="origen-desktop">Origen *</Label>
                    <Input
                      id="origen-desktop"
                      value={formData.origen}
                      onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                      placeholder="Ciudad, Estado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destino-desktop">Destino *</Label>
                    <Input
                      id="destino-desktop"
                      value={formData.destino}
                      onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                      placeholder="Ciudad, Estado"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="distancia-desktop">Distancia (km) *</Label>
                  <Input
                    id="distancia-desktop"
                    type="number"
                    value={formData.distanciaKm}
                    onChange={(e) => setFormData({ ...formData, distanciaKm: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />

              {/* Datos del Chofer */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos del Chofer
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="choferNombre-desktop">Nombre Completo *</Label>
                    <Input
                      id="choferNombre-desktop"
                      value={formData.choferNombre}
                      onChange={(e) => setFormData({ ...formData, choferNombre: e.target.value })}
                      placeholder="Nombre del chofer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="choferRFC-desktop">RFC</Label>
                    <Input
                      id="choferRFC-desktop"
                      value={formData.choferRFC}
                      onChange={(e) => setFormData({ ...formData, choferRFC: e.target.value })}
                      placeholder="ABCD123456XXX"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="choferLicencia-desktop">Número de Licencia *</Label>
                  <Input
                    id="choferLicencia-desktop"
                    value={formData.choferLicencia}
                    onChange={(e) => setFormData({ ...formData, choferLicencia: e.target.value })}
                    placeholder="A1234567"
                  />
                </div>
              </div>

              <Separator />

              {/* Datos del Vehículo */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Datos del Vehículo
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="vehiculoPlacas-desktop">Placas *</Label>
                    <Input
                      id="vehiculoPlacas-desktop"
                      value={formData.vehiculoPlacas}
                      onChange={(e) => setFormData({ ...formData, vehiculoPlacas: e.target.value })}
                      placeholder="ABC-123-D"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehiculoModelo-desktop">Modelo</Label>
                    <Input
                      id="vehiculoModelo-desktop"
                      value={formData.vehiculoModelo}
                      onChange={(e) => setFormData({ ...formData, vehiculoModelo: e.target.value })}
                      placeholder="Marca y modelo del vehículo"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="vehiculoAnio-desktop">Año</Label>
                    <Input
                      id="vehiculoAnio-desktop"
                      value={formData.vehiculoAnio}
                      onChange={(e) => setFormData({ ...formData, vehiculoAnio: e.target.value })}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehiculoConfiguracion-desktop">Configuración</Label>
                    <Select
                      value={formData.vehiculoConfiguracion}
                      onValueChange={(value: any) => setFormData({ ...formData, vehiculoConfiguracion: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C2">C2 - Camión 2 ejes</SelectItem>
                        <SelectItem value="C3">C3 - Camión 3 ejes</SelectItem>
                        <SelectItem value="T3S2">T3S2 - Tractocamión</SelectItem>
                        <SelectItem value="T3S3">T3S3 - Tractocamión 3 ejes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fecha y Hora */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha y Hora de Salida
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fechaSalida-desktop">Fecha</Label>
                    <Input
                      id="fechaSalida-desktop"
                      type="date"
                      value={formData.fechaSalida}
                      onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaSalida-desktop">Hora</Label>
                    <Input
                      id="horaSalida-desktop"
                      type="time"
                      value={formData.horaSalida}
                      onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Facturas Vinculadas */}
              <div className="space-y-3">
                <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Facturas a Transportar *
                </h3>
                <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                  {facturasDisponibles.map((factura) => (
                    <div
                      key={factura.folio}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`${factura.folio}-desktop`}
                          checked={formData.facturasSeleccionadas.includes(factura.folio)}
                          onCheckedChange={() => handleToggleFactura(factura.folio)}
                        />
                        <Label htmlFor={`${factura.folio}-desktop`} className="cursor-pointer">
                          <p className="text-sm text-[#1E293B]">{factura.folio}</p>
                          <p className="text-xs text-[#64748B]">{factura.cliente}</p>
                        </Label>
                      </div>
                      <span className="text-sm text-[#1E293B]">
                        ${factura.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#64748B]">
                  {formData.facturasSeleccionadas.length} factura(s) seleccionada(s)
                </p>
              </div>

              <Separator />

              {/* Observaciones */}
              <div>
                <Label htmlFor="observaciones-desktop">Observaciones</Label>
                <Textarea
                  id="observaciones-desktop"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Notas adicionales sobre el transporte..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-[#B02128] hover:bg-[#8F1A20] text-white"
              >
                Crear Carta Porte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[900px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Complemento Carta Porte 2.0</DialogTitle>
            <DialogDescription className="sr-only">Vista previa del complemento de Carta Porte</DialogDescription>
          </DialogHeader>
          {selectedCarta && (
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
                        <p className="text-xs text-[#64748B]">Transporte de Mototaxis y Refacciones</p>
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
                    <Badge className={`${getStatusColor(selectedCarta.estatus)} mb-2`}>
                      {getStatusIcon(selectedCarta.estatus)}
                      <span className="ml-1">{selectedCarta.estatus}</span>
                    </Badge>
                    <div className="text-xs text-[#64748B] space-y-0.5">
                      <p className="text-[#1E293B] uppercase">Complemento Carta Porte 2.0</p>
                      <p className="text-lg text-[#B02128]">{selectedCarta.folio}</p>
                      <p className="text-[#64748B]">Fecha: {selectedCarta.fecha}</p>
                      <p className="text-[#64748B]">Hora: 08:00:00</p>
                    </div>
                  </div>
                </div>

                {/* Información del Transporte */}
                <div className="border border-gray-300 rounded p-3">
                  <h3 className="text-xs uppercase text-[#64748B] mb-3 bg-[#1E293B] text-white px-3 py-2 -m-3 mb-3 rounded-t">
                    Información del Autotransporte Federal
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#64748B]">Permiso SCT:</p>
                      <p className="text-[#1E293B]">TPAF01 - Autotransporte Federal de Carga</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Número de Permiso:</p>
                      <p className="text-[#1E293B]">12345678</p>
                    </div>
                  </div>
                </div>

                {/* Ubicaciones */}
                <div className="border border-gray-300 rounded p-3">
                  <h3 className="text-xs uppercase text-[#64748B] mb-3 bg-green-600 text-white px-3 py-2 -m-3 mb-3 rounded-t flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicaciones de Origen y Destino
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Origen */}
                    <div className="border-l-4 border-green-500 pl-3">
                      <p className="text-xs uppercase text-green-700 mb-2">Origen</p>
                      <div className="text-sm space-y-1">
                        <p className="text-[#1E293B]">{selectedCarta.origen}</p>
                        <p className="text-xs text-[#64748B]">Distancia Recorrida: 0 km</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                          <div>
                            <p className="text-[#64748B]">Fecha/Hora Salida:</p>
                            <p className="text-[#1E293B]">{selectedCarta.fecha} 08:00</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Destino */}
                    <div className="border-l-4 border-red-500 pl-3">
                      <p className="text-xs uppercase text-red-700 mb-2">Destino</p>
                      <div className="text-sm space-y-1">
                        <p className="text-[#1E293B]">{selectedCarta.destino}</p>
                        <p className="text-xs text-[#64748B]">Distancia Total: {selectedCarta.distanciaKm} km</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                          <div>
                            <p className="text-[#64748B]">Fecha/Hora Llegada Est.:</p>
                            <p className="text-[#1E293B]">{selectedCarta.fecha} 18:00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos del Autotransporte */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  <h3 className="text-xs uppercase text-white bg-[#1E293B] px-3 py-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Identificación Vehicular
                  </h3>
                  <div className="p-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-[#64748B]">Configuración Vehicular:</p>
                      <p className="text-[#1E293B]">C2 - Camión Unitario (2 llantas eje delantero y 4 llantas en eje trasero)</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Placa Vehicular:</p>
                      <p className="text-[#1E293B]">{selectedCarta.vehiculoPlacas}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Año Modelo:</p>
                      <p className="text-[#1E293B]">2022</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-[#64748B]">Modelo:</p>
                      <p className="text-[#1E293B]">{selectedCarta.vehiculoModelo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Aseguradora:</p>
                      <p className="text-[#1E293B]">AXA Seguros SA</p>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs text-[#64748B]">Póliza de Seguro:</p>
                      <p className="text-[#1E293B]">POL-2024-987654321</p>
                    </div>
                  </div>
                </div>

                {/* Datos del Operador */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  <h3 className="text-xs uppercase text-white bg-[#1E293B] px-3 py-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Operador del Transporte
                  </h3>
                  <div className="p-3 grid grid-cols-3 gap-3 text-sm">
                    <div className="col-span-2">
                      <p className="text-xs text-[#64748B]">Nombre del Operador:</p>
                      <p className="text-[#1E293B]">{selectedCarta.choferNombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">RFC:</p>
                      <p className="text-[#1E293B]">PEGJ850101XXX</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Número de Licencia:</p>
                      <p className="text-[#1E293B]">{selectedCarta.choferLicencia}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-[#64748B]">Registro de Identidad Tributaria:</p>
                      <p className="text-[#1E293B]">Residente en México</p>
                    </div>
                  </div>
                </div>

                {/* Mercancías Transportadas */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  <h3 className="text-xs uppercase text-white bg-[#B02128] px-3 py-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Mercancías Transportadas
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-300">
                        <tr className="text-xs text-[#64748B]">
                          <th className="text-left px-3 py-2">Bienes Transportados</th>
                          <th className="text-left px-3 py-2">Clave SAT</th>
                          <th className="text-left px-3 py-2">Descripción</th>
                          <th className="text-right px-3 py-2">Cantidad</th>
                          <th className="text-right px-3 py-2">Peso (kg)</th>
                          <th className="text-left px-3 py-2">Embalaje</th>
                          <th className="text-left px-3 py-2">Doc. Aduanero</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-3 text-[#1E293B]">Mototaxis y Refacciones</td>
                          <td className="px-3 py-3 text-[#64748B] text-xs">25171600</td>
                          <td className="px-3 py-3 text-[#1E293B]">Vehículos de motor de tres ruedas y refacciones automotrices</td>
                          <td className="px-3 py-3 text-right text-[#1E293B]">1.00</td>
                          <td className="px-3 py-3 text-right text-[#1E293B]">850.00</td>
                          <td className="px-3 py-3 text-[#64748B] text-xs">4H - Caja de madera natural</td>
                          <td className="px-3 py-3 text-[#64748B] text-xs">CFDI - Comprobante Fiscal</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 bg-gray-50 border-t border-gray-300">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-[#64748B]">Peso Total:</p>
                        <p className="text-[#1E293B]">850.00 kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B]">Unidad de Peso:</p>
                        <p className="text-[#1E293B]">KGM - Kilogramo</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B]">Material Peligroso:</p>
                        <p className="text-[#1E293B]">No</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documentos Vinculados */}
                <div className="border border-gray-300 rounded overflow-hidden">
                  <h3 className="text-xs uppercase text-white bg-[#1E293B] px-3 py-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CFDIs Relacionados
                  </h3>
                  <div className="p-3">
                    <div className="space-y-2">
                      {selectedCarta.facturasVinculadas.map((folio, index) => (
                        <div key={folio} className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                          <div>
                            <p className="text-xs text-[#64748B]">Folio Fiscal:</p>
                            <p className="text-[#1E293B] text-xs break-all">A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#64748B]">Serie/Folio:</p>
                            <p className="text-[#1E293B]">{folio}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#64748B]">Fecha:</p>
                            <p className="text-[#1E293B]">{selectedCarta.fecha}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#64748B]">Estatus:</p>
                            <Badge variant="outline" className="text-xs">Timbrado</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-800">
                        <strong>Total de CFDIs Vinculados:</strong> {selectedCarta.facturasVinculadas.length} factura(s) timbrada(s)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Figura de Transporte */}
                <div className="border border-gray-300 rounded p-3">
                  <h3 className="text-xs uppercase text-[#64748B] mb-3">Figura de Transporte</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-[#64748B]">Tipo de Figura:</p>
                      <p className="text-[#1E293B]">01 - Operador</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">Nombre:</p>
                      <p className="text-[#1E293B]">{selectedCarta.choferNombre}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-[#64748B] pt-4 border-t border-gray-300 space-y-1">
                  <p className="text-[#1E293B]">Este documento es una representación impresa del Complemento Carta Porte 2.0</p>
                  <p>Generado conforme a las especificaciones del SAT para el transporte de mercancías</p>
                  <p className="mt-2">Fecha de Generación: {selectedCarta.fecha} 12:00:00</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button className="bg-[#B02128] hover:bg-[#8F1A20] text-white">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
