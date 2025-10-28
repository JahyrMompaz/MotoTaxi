import { useState } from 'react';
import { Plus, Search, Eye, Clock, CheckCircle, AlertCircle, Edit, Trash2, RefreshCw, Wrench, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useAuth } from './AuthContext';
import { useIsMobile } from './ui/use-mobile';

interface Servicio {
  id: number;
  cliente: string;
  tipo: string;
  tecnico: string;
  fecha: string;
  estatus: string;
  costo: number;
  descripcion?: string;
  refacciones?: string;
}

const serviciosDataInitial: Servicio[] = [
  { id: 1, cliente: 'Transportes del Norte', tipo: 'Mantenimiento Preventivo', tecnico: 'Juan Pérez', fecha: '2024-10-20', estatus: 'Completado', costo: 1200, descripcion: 'Servicio preventivo general', refacciones: 'Aceite, filtros' },
  { id: 2, cliente: 'Logística Express', tipo: 'Reparación Motor', tecnico: 'Carlos López', fecha: '2024-10-22', estatus: 'En Proceso', costo: 3500, descripcion: 'Reparación de motor completa', refacciones: 'Pistones, anillos' },
  { id: 3, cliente: 'Mototaxis del Sur', tipo: 'Cambio de Llantas', tecnico: 'Ana Martínez', fecha: '2024-10-23', estatus: 'Pendiente', costo: 1800, descripcion: 'Cambio de llantas delanteras y traseras' },
  { id: 4, cliente: 'Comercializadora Global', tipo: 'Servicio Eléctrico', tecnico: 'Luis García', fecha: '2024-10-18', estatus: 'Completado', costo: 2200, descripcion: 'Revisión sistema eléctrico' },
  { id: 5, cliente: 'Transportes del Norte', tipo: 'Mantenimiento Correctivo', tecnico: 'Juan Pérez', fecha: '2024-10-21', estatus: 'En Proceso', costo: 2800, descripcion: 'Corrección de fallas detectadas' },
];

export function Servicios() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>(serviciosDataInitial);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [formData, setFormData] = useState({
    cliente: '',
    tipo: '',
    tecnico: '',
    fecha: '',
    estatus: 'Pendiente',
    costo: 0,
    descripcion: '',
    refacciones: '',
  });

  const filteredServicios = servicios.filter(
    (servicio) =>
      servicio.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case 'Completado':
        return <CheckCircle className="h-4 w-4" />;
      case 'En Proceso':
        return <Clock className="h-4 w-4" />;
      case 'Pendiente':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'Completado':
        return 'bg-green-600 text-white';
      case 'En Proceso':
        return 'bg-blue-600 text-white';
      case 'Pendiente':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-[#64748B] text-white';
    }
  };

  const serviciosActivos = filteredServicios.filter((s) => s.estatus !== 'Completado');
  const serviciosCompletados = filteredServicios.filter((s) => s.estatus === 'Completado');

  const resetForm = () => {
    setFormData({
      cliente: '',
      tipo: '',
      tecnico: '',
      fecha: '',
      estatus: 'Pendiente',
      costo: 0,
      descripcion: '',
      refacciones: '',
    });
  };

  const handleAdd = () => {
    if (!formData.cliente || !formData.tipo || !formData.tecnico || !formData.fecha) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const newServicio: Servicio = {
      id: Math.max(...servicios.map(s => s.id)) + 1,
      ...formData,
    };

    setServicios([...servicios, newServicio]);
    toast.success('Servicio registrado exitosamente');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedServicio) return;

    if (!formData.cliente || !formData.tipo || !formData.tecnico || !formData.fecha) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setServicios(servicios.map(s => 
      s.id === selectedServicio.id 
        ? { ...s, ...formData }
        : s
    ));
    toast.success('Servicio actualizado exitosamente');
    setIsEditDialogOpen(false);
    setSelectedServicio(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedServicio) return;
    
    setServicios(servicios.filter(s => s.id !== selectedServicio.id));
    toast.success('Servicio eliminado exitosamente');
    setIsDeleteDialogOpen(false);
    setSelectedServicio(null);
  };

  const openEditDialog = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setFormData({
      cliente: servicio.cliente,
      tipo: servicio.tipo,
      tecnico: servicio.tecnico,
      fecha: servicio.fecha,
      estatus: servicio.estatus,
      costo: servicio.costo,
      descripcion: servicio.descripcion || '',
      refacciones: servicio.refacciones || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setIsDeleteDialogOpen(true);
  };

  const openStatusDialog = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setNewStatus(servicio.estatus);
    setIsStatusDialogOpen(true);
  };

  const handleStatusChange = () => {
    if (!selectedServicio) return;

    setServicios(servicios.map(s => 
      s.id === selectedServicio.id 
        ? { ...s, estatus: newStatus }
        : s
    ));
    
    const statusMessages: { [key: string]: string } = {
      'Pendiente': 'Servicio marcado como Pendiente',
      'En Proceso': 'Servicio marcado como En Proceso',
      'Completado': 'Servicio finalizado exitosamente'
    };
    
    toast.success(statusMessages[newStatus] || 'Estatus actualizado');
    setIsStatusDialogOpen(false);
    setSelectedServicio(null);
  };

  const FormContent = () => (
    <>
      <div className="grid gap-2">
        <Label htmlFor="cliente">Cliente *</Label>
        <Select value={formData.cliente} onValueChange={(value) => setFormData({ ...formData, cliente: value })}>
          <SelectTrigger className={isMobile ? "h-11" : ""}>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Transportes del Norte">Transportes del Norte</SelectItem>
            <SelectItem value="Logística Express">Logística Express</SelectItem>
            <SelectItem value="Mototaxis del Sur">Mototaxis del Sur</SelectItem>
            <SelectItem value="Comercializadora Global">Comercializadora Global</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tipo">Tipo de Servicio *</Label>
        <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
          <SelectTrigger className={isMobile ? "h-11" : ""}>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mantenimiento Preventivo">Mantenimiento Preventivo</SelectItem>
            <SelectItem value="Mantenimiento Correctivo">Mantenimiento Correctivo</SelectItem>
            <SelectItem value="Reparación Motor">Reparación Motor</SelectItem>
            <SelectItem value="Servicio Eléctrico">Servicio Eléctrico</SelectItem>
            <SelectItem value="Cambio de Llantas">Cambio de Llantas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tecnico">Técnico Asignado *</Label>
        <Select value={formData.tecnico} onValueChange={(value) => setFormData({ ...formData, tecnico: value })}>
          <SelectTrigger className={isMobile ? "h-11" : ""}>
            <SelectValue placeholder="Seleccionar técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
            <SelectItem value="Carlos López">Carlos López</SelectItem>
            <SelectItem value="Ana Martínez">Ana Martínez</SelectItem>
            <SelectItem value="Luis García">Luis García</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción del Servicio</Label>
        <Textarea
          id="descripcion"
          placeholder="Detalles del servicio a realizar..."
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={3}
          className={isMobile ? "h-20" : ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fecha">Fecha de Ingreso *</Label>
          <Input 
            id="fecha" 
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            className={isMobile ? "h-11" : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="estatus">Estatus</Label>
          <Select value={formData.estatus} onValueChange={(value) => setFormData({ ...formData, estatus: value })}>
            <SelectTrigger className={isMobile ? "h-11" : ""}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En Proceso">En Proceso</SelectItem>
              <SelectItem value="Completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="costo">Costo Estimado</Label>
        <Input 
          id="costo" 
          type="number" 
          placeholder="0.00"
          value={formData.costo}
          onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) || 0 })}
          className={isMobile ? "h-11" : ""}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="refacciones">Refacciones Utilizadas</Label>
        <Textarea
          id="refacciones"
          placeholder="Lista de refacciones y costos..."
          value={formData.refacciones}
          onChange={(e) => setFormData({ ...formData, refacciones: e.target.value })}
          rows={2}
          className={isMobile ? "h-16" : ""}
        />
      </div>
    </>
  );

  const ServicioCard = ({ servicio, showAllActions = true }: { servicio: Servicio; showAllActions?: boolean }) => (
    <div className="p-4 active:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <div className="mt-0.5">
              <Wrench className="h-5 w-5 text-[#B02128]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#1E293B] mb-1">{servicio.tipo}</h3>
              <p className="text-xs text-[#64748B] mb-2">{servicio.cliente}</p>
              <Badge className={`${getStatusColor(servicio.estatus)} flex items-center gap-1 w-fit text-xs`}>
                {getStatusIcon(servicio.estatus)}
                <span>{servicio.estatus}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1.5 mt-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <User className="h-3.5 w-3.5" />
              <span>{servicio.tecnico}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{servicio.fecha}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-[#B02128]" />
              <span className="text-[#B02128]">${servicio.costo.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 text-[#1E293B]"
            onClick={() => openViewDialog(servicio)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {showAllActions && hasPermission('servicios.edit') && (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-green-600"
                onClick={() => openStatusDialog(servicio)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-[#1E293B]"
                onClick={() => openEditDialog(servicio)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
          {showAllActions && hasPermission('servicios.delete') && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 text-[#64748B]"
              onClick={() => openDeleteDialog(servicio)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-20' : ''}`}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Servicios</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Gestión de servicios y mantenimientos</p>
        </div>
        {hasPermission('servicios.create') && !isMobile && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto text-sm h-9" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1E293B]">Registrar Servicio</DialogTitle>
              <DialogDescription className="sr-only">Formulario para registrar un nuevo servicio de mantenimiento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormContent />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleAdd}>
                Registrar Servicio
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        )}

        {/* Botón Flotante + Sheet para Móvil */}
        {hasPermission('servicios.create') && isMobile && (
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
                    <SheetTitle className="text-[#1E293B]">Nuevo Servicio</SheetTitle>
                    <SheetDescription className="sr-only">Formulario para registrar un nuevo servicio</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <FormContent />
                  </div>
                  <SheetFooter className="p-4 border-t bg-white flex-row gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 h-11">
                      Cancelar
                    </Button>
                    <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white flex-1 h-11" onClick={handleAdd}>
                      Guardar
                    </Button>
                  </SheetFooter>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B] z-10" />
        <Input
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 ${isMobile ? 'h-10' : ''}`}
        />
      </div>

      <Tabs defaultValue="activos" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 w-full">
          <TabsTrigger value="activos" className="flex-1">
            Activos ({serviciosActivos.length})
          </TabsTrigger>
          <TabsTrigger value="completados" className="flex-1">
            Completados ({serviciosCompletados.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className={isMobile ? "p-3" : ""}>
              <CardTitle className={`text-[#1E293B] ${isMobile ? "text-base" : ""}`}>Servicios Activos</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-0" : ""}>
              {isMobile ? (
                /* Vista Móvil - Tarjetas */
                <div className="divide-y divide-gray-100">
                  {serviciosActivos.map((servicio) => (
                    <ServicioCard key={servicio.id} servicio={servicio} showAllActions={true} />
                  ))}
                </div>
              ) : (
                /* Vista Desktop - Tabla */
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo de Servicio</TableHead>
                        <TableHead className="hidden md:table-cell">Técnico</TableHead>
                        <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                        <TableHead>Estatus</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviciosActivos.map((servicio) => (
                        <TableRow key={servicio.id}>
                          <TableCell className="text-[#1E293B]">{servicio.cliente}</TableCell>
                          <TableCell className="text-[#1E293B]">{servicio.tipo}</TableCell>
                          <TableCell className="hidden md:table-cell text-[#64748B]">
                            {servicio.tecnico}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-[#64748B]">
                            {servicio.fecha}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(servicio.estatus)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(servicio.estatus)}
                              <span>{servicio.estatus}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#1E293B]">
                            ${servicio.costo.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-[#1E293B] hover:text-[#B02128]"
                                onClick={() => openViewDialog(servicio)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {hasPermission('servicios.edit') && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => openStatusDialog(servicio)}
                                    title="Cambiar estatus"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-[#1E293B] hover:text-[#B02128]"
                                    onClick={() => openEditDialog(servicio)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {hasPermission('servicios.delete') && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-[#64748B] hover:text-red-600"
                                  onClick={() => openDeleteDialog(servicio)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="completados">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className={isMobile ? "p-3" : ""}>
              <CardTitle className={`text-[#1E293B] ${isMobile ? "text-base" : ""}`}>Servicios Completados</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "p-0" : ""}>
              {isMobile ? (
                /* Vista Móvil - Tarjetas */
                <div className="divide-y divide-gray-100">
                  {serviciosCompletados.map((servicio) => (
                    <ServicioCard key={servicio.id} servicio={servicio} showAllActions={false} />
                  ))}
                </div>
              ) : (
                /* Vista Desktop - Tabla */
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo de Servicio</TableHead>
                        <TableHead className="hidden md:table-cell">Técnico</TableHead>
                        <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                        <TableHead>Estatus</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviciosCompletados.map((servicio) => (
                        <TableRow key={servicio.id}>
                          <TableCell className="text-[#1E293B]">{servicio.cliente}</TableCell>
                          <TableCell className="text-[#1E293B]">{servicio.tipo}</TableCell>
                          <TableCell className="hidden md:table-cell text-[#64748B]">
                            {servicio.tecnico}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-[#64748B]">
                            {servicio.fecha}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(servicio.estatus)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(servicio.estatus)}
                              <span>{servicio.estatus}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#1E293B]">
                            ${servicio.costo.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#1E293B] hover:text-[#B02128]"
                              onClick={() => openViewDialog(servicio)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Detalles del Servicio</DialogTitle>
            <DialogDescription className="sr-only">Vista detallada de la información del servicio</DialogDescription>
          </DialogHeader>
          {selectedServicio && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#64748B]">Cliente</Label>
                  <p className="text-[#1E293B] mt-1">{selectedServicio.cliente}</p>
                </div>
                <div>
                  <Label className="text-[#64748B]">Fecha</Label>
                  <p className="text-[#1E293B] mt-1">{selectedServicio.fecha}</p>
                </div>
              </div>
              <div>
                <Label className="text-[#64748B]">Tipo de Servicio</Label>
                <p className="text-[#1E293B] mt-1">{selectedServicio.tipo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#64748B]">Técnico Asignado</Label>
                  <p className="text-[#1E293B] mt-1">{selectedServicio.tecnico}</p>
                </div>
                <div>
                  <Label className="text-[#64748B]">Estatus</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedServicio.estatus)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(selectedServicio.estatus)}
                      <span>{selectedServicio.estatus}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedServicio.descripcion && (
                <div>
                  <Label className="text-[#64748B]">Descripción</Label>
                  <p className="text-[#1E293B] mt-1">{selectedServicio.descripcion}</p>
                </div>
              )}
              {selectedServicio.refacciones && (
                <div>
                  <Label className="text-[#64748B]">Refacciones Utilizadas</Label>
                  <p className="text-[#1E293B] mt-1">{selectedServicio.refacciones}</p>
                </div>
              )}
              <div>
                <Label className="text-[#64748B]">Costo Total</Label>
                <p className="text-[#B02128] mt-1 text-2xl">
                  ${selectedServicio.costo.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Editar Servicio</DialogTitle>
            <DialogDescription className="sr-only">Formulario para editar datos del servicio</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormContent />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleEdit}>
              Actualizar Servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Cambiar Estatus</DialogTitle>
            <DialogDescription className="sr-only">Cambiar el estatus del servicio</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Nuevo Estatus</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En Proceso">En Proceso</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleStatusChange}>
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1E293B]">¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
