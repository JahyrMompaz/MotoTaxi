import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Eye, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useIsMobile } from './ui/use-mobile';
import { Badge } from './ui/badge';

interface Cliente {
  id: number;
  rfc: string;
  razonSocial: string;
  correo: string;
  telefono: string;
  fechaAlta: string;
  usoCFDI?: string;
  direccion?: string;
}

const clientesDataInitial: Cliente[] = [
  { id: 1, rfc: 'ABC123456789', razonSocial: 'Transportes del Norte SA', correo: 'contacto@tnorte.com', telefono: '555-1234', fechaAlta: '2024-01-15', usoCFDI: 'G03', direccion: 'Av. Principal 123' },
  { id: 2, rfc: 'DEF987654321', razonSocial: 'Logística Express', correo: 'info@logexpress.com', telefono: '555-5678', fechaAlta: '2024-02-20', usoCFDI: 'G01', direccion: 'Calle Comercio 456' },
  { id: 3, rfc: 'GHI456789123', razonSocial: 'Mototaxis del Sur', correo: 'ventas@motsur.com', telefono: '555-9012', fechaAlta: '2024-03-10', usoCFDI: 'G03', direccion: 'Boulevard Sur 789' },
  { id: 4, rfc: 'JKL789123456', razonSocial: 'Comercializadora Global', correo: 'global@comercial.com', telefono: '555-3456', fechaAlta: '2024-04-05', usoCFDI: 'G01', direccion: 'Plaza Centro 321' },
];

export function Clientes() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>(clientesDataInitial);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isLoadingRFC, setIsLoadingRFC] = useState(false);
  const [formData, setFormData] = useState({
    rfc: '',
    razonSocial: '',
    correo: '',
    telefono: '',
    usoCFDI: '',
    direccion: '',
  });

  // Base de datos simulada de RFCs del SAT
  const rfcDatabase: Record<string, { razonSocial: string; direccion: string }> = {
    'XAXX010101000': {
      razonSocial: 'PUBLICO EN GENERAL',
      direccion: 'SIN DOMICILIO FISCAL'
    },
    'CACX7605101P8': {
      razonSocial: 'COMERCIALIZADORA ABC SA DE CV',
      direccion: 'AV. INSURGENTES SUR 1234, COL. DEL VALLE, BENITO JUAREZ, CDMX, CP 03100'
    },
    'TEMX850315KL9': {
      razonSocial: 'TRANSPORTES EJECUTIVOS MEXICANOS SA DE CV',
      direccion: 'BLVD. MANUEL AVILA CAMACHO 567, COL. LOMAS DE CHAPULTEPEC, MIGUEL HIDALGO, CDMX, CP 11000'
    },
    'MOMO900825RT4': {
      razonSocial: 'MOTOTAXIS Y MOTOCICLETAS SA DE CV',
      direccion: 'CALZ. IGNACIO ZARAGOZA 890, COL. AGRICOLA ORIENTAL, IZTACALCO, CDMX, CP 08500'
    },
    'RESE880512QW2': {
      razonSocial: 'REFACCIONES Y SERVICIOS ESPECIALIZADOS SA DE CV',
      direccion: 'AV. TLAHUAC 2345, COL. SAN LORENZO TEZONCO, IZTAPALAPA, CDMX, CP 09790'
    },
    'LOME950723HJ6': {
      razonSocial: 'LOGISTICA MEXICANA EXPRESS SA DE CV',
      direccion: 'PERIFERICO SUR 4567, COL. JARDINES DEL PEDREGAL, ALVARO OBREGON, CDMX, CP 01900'
    },
    'ABC123456789': {
      razonSocial: 'TRANSPORTES DEL NORTE SA DE CV',
      direccion: 'AV. PRINCIPAL 123, COL. CENTRO, MONTERREY, NL, CP 64000'
    },
    'DEF987654321': {
      razonSocial: 'LOGISTICA EXPRESS SA DE CV',
      direccion: 'CALLE COMERCIO 456, COL. INDUSTRIAL, GUADALAJARA, JAL, CP 44940'
    },
    'GHI456789123': {
      razonSocial: 'MOTOTAXIS DEL SUR SA DE CV',
      direccion: 'BOULEVARD SUR 789, COL. REFORMA, OAXACA, OAX, CP 68050'
    },
    'JKL789123456': {
      razonSocial: 'COMERCIALIZADORA GLOBAL SA DE CV',
      direccion: 'PLAZA CENTRO 321, COL. JUAREZ, PUEBLA, PUE, CP 72000'
    }
  };

  // Función para consultar RFC (simulación de API del SAT)
  const consultarRFC = async (rfc: string) => {
    if (!rfc || rfc.length < 12) return;

    setIsLoadingRFC(true);
    
    // Simular delay de consulta a API
    await new Promise(resolve => setTimeout(resolve, 800));

    const rfcUpper = rfc.toUpperCase().trim();
    const datos = rfcDatabase[rfcUpper];

    if (datos) {
      setFormData(prev => ({
        ...prev,
        razonSocial: datos.razonSocial,
        direccion: datos.direccion
      }));
      toast.success('RFC encontrado - Datos fiscales cargados', {
        description: datos.razonSocial
      });
    } else {
      toast.warning('RFC no encontrado en el padrón', {
        description: 'Verifica el RFC o ingresa los datos manualmente'
      });
    }

    setIsLoadingRFC(false);
  };

  const handleRFCBlur = () => {
    if (formData.rfc && formData.rfc.length >= 12) {
      consultarRFC(formData.rfc);
    }
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.rfc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      rfc: '',
      razonSocial: '',
      correo: '',
      telefono: '',
      usoCFDI: '',
      direccion: '',
    });
  };

  const handleAdd = () => {
    if (!formData.rfc || !formData.razonSocial || !formData.correo) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const newCliente: Cliente = {
      id: Math.max(...clientes.map(c => c.id)) + 1,
      ...formData,
      fechaAlta: new Date().toISOString().split('T')[0],
    };

    setClientes([...clientes, newCliente]);
    toast.success('Cliente agregado exitosamente');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedCliente) return;

    if (!formData.rfc || !formData.razonSocial || !formData.correo) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setClientes(clientes.map(c => 
      c.id === selectedCliente.id 
        ? { ...c, ...formData }
        : c
    ));
    toast.success('Cliente actualizado exitosamente');
    setIsEditDialogOpen(false);
    setSelectedCliente(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedCliente) return;
    
    setClientes(clientes.filter(c => c.id !== selectedCliente.id));
    toast.success('Cliente eliminado exitosamente');
    setIsDeleteDialogOpen(false);
    setSelectedCliente(null);
  };

  const openEditDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      rfc: cliente.rfc,
      razonSocial: cliente.razonSocial,
      correo: cliente.correo,
      telefono: cliente.telefono,
      usoCFDI: cliente.usoCFDI || '',
      direccion: cliente.direccion || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Clientes</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Gestión de clientes y datos fiscales</p>
        </div>
        {hasPermission('clientes.create') && !isMobile && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto text-sm h-9">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cliente
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#1E293B]">Nuevo Cliente</DialogTitle>
              <DialogDescription className="sr-only">Formulario para agregar un nuevo cliente</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rfc" className="flex items-center gap-2">
                  RFC *
                  {isLoadingRFC && (
                    <div className="h-3 w-3 border-2 border-[#B02128] border-t-transparent rounded-full animate-spin"></div>
                  )}
                </Label>
                <Input 
                  id="rfc" 
                  placeholder="ABC123456789 (ingresa y presiona TAB)"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                  onBlur={handleRFCBlur}
                  disabled={isLoadingRFC}
                  maxLength={13}
                  className="uppercase"
                />
                <p className="text-xs text-[#64748B]">
                  💡 Prueba con: ABC123456789, CACX7605101P8, MOMO900825RT4
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="razonSocial">Razón Social *</Label>
                <Input 
                  id="razonSocial" 
                  placeholder="Se llenará automáticamente al consultar RFC"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  disabled={isLoadingRFC}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usoCFDI">Uso CFDI</Label>
                <Select value={formData.usoCFDI} onValueChange={(value: string) => setFormData({ ...formData, usoCFDI: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar uso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                    <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                    <SelectItem value="P01">P01 - Por definir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="correo">Correo Electrónico *</Label>
                <Input 
                  id="correo" 
                  type="email" 
                  placeholder="correo@empresa.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono" 
                  placeholder="555-1234"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="direccion">Dirección Fiscal</Label>
                <Input 
                  id="direccion" 
                  placeholder="Se llenará automáticamente al consultar RFC"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  disabled={isLoadingRFC}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleAdd}>
                Guardar Cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
        
        {/* Botón Flotante + Sheet para Móvil */}
        {hasPermission('clientes.create') && isMobile && (
          <>
            <Button 
              className="bg-[#B02128] hover:bg-[#8B1A20] text-white fixed bottom-20 right-4 z-50 shadow-lg h-14 w-14 rounded-full p-0"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
            
            <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <SheetContent side="bottom" className="h-[90vh] bg-white p-0">
                <div className="h-full flex flex-col">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-[#1E293B]">Nuevo Cliente</SheetTitle>
                    <SheetDescription className="sr-only">Formulario para agregar un nuevo cliente</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rfc-mobile" className="flex items-center gap-2">
                        RFC *
                        {isLoadingRFC && (
                          <div className="h-3 w-3 border-2 border-[#B02128] border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </Label>
                      <Input 
                        id="rfc-mobile"
                        placeholder="ABC123456789"
                        value={formData.rfc}
                        onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                        onBlur={handleRFCBlur}
                        disabled={isLoadingRFC}
                        maxLength={13}
                        className="uppercase h-11"
                      />
                      <p className="text-xs text-[#64748B]">
                        💡 Prueba: ABC123456789, CACX7605101P8
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="razonSocial-mobile">Razón Social *</Label>
                      <Input 
                        id="razonSocial-mobile"
                        placeholder="Automático al consultar RFC"
                        value={formData.razonSocial}
                        onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                        disabled={isLoadingRFC}
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="usoCFDI-mobile">Uso CFDI</Label>
                      <Select value={formData.usoCFDI} onValueChange={(value: string) => setFormData({ ...formData, usoCFDI: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Seleccionar uso" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                          <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                          <SelectItem value="P01">P01 - Por definir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="correo-mobile">Correo Electrónico *</Label>
                      <Input 
                        id="correo-mobile"
                        type="email" 
                        placeholder="correo@empresa.com"
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="telefono-mobile">Teléfono</Label>
                      <Input 
                        id="telefono-mobile"
                        placeholder="555-1234"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="direccion-mobile">Dirección Fiscal</Label>
                      <Input 
                        id="direccion-mobile"
                        placeholder="Automático al consultar RFC"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        disabled={isLoadingRFC}
                        className="h-11"
                      />
                    </div>
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

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className={isMobile ? "p-3" : ""}>
          <div className="flex flex-col gap-3">
            <CardTitle className={`text-[#1E293B] ${isMobile ? "text-base" : ""}`}>Lista de Clientes</CardTitle>
            <div className="relative w-full">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]`} />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${isMobile ? "h-10" : ""}`}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "p-0" : ""}>
          {isMobile ? (
            /* Vista Móvil - Tarjetas */
            <div className="divide-y divide-gray-100">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="p-4 active:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="mt-0.5">
                          <Building2 className="h-5 w-5 text-[#B02128]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#1E293B] truncate mb-1">{cliente.razonSocial}</h3>
                          <Badge variant="outline" className="text-xs">{cliente.rfc}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 mt-3">
                        <div className="flex items-center gap-2 text-xs text-[#64748B]">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{cliente.correo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#64748B]">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{cliente.telefono}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 text-[#1E293B]"
                        onClick={() => openViewDialog(cliente)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {hasPermission('clientes.edit') && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 text-[#1E293B]"
                          onClick={() => openEditDialog(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('clientes.delete') && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 text-[#64748B]"
                          onClick={() => openDeleteDialog(cliente)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
                    <TableHead>RFC</TableHead>
                    <TableHead>Razón Social</TableHead>
                    <TableHead className="hidden md:table-cell">Correo</TableHead>
                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                    <TableHead className="hidden lg:table-cell">Fecha Alta</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="text-[#1E293B]">{cliente.rfc}</TableCell>
                      <TableCell className="text-[#1E293B]">{cliente.razonSocial}</TableCell>
                      <TableCell className="hidden md:table-cell text-[#64748B]">{cliente.correo}</TableCell>
                      <TableCell className="hidden md:table-cell text-[#64748B]">{cliente.telefono}</TableCell>
                      <TableCell className="hidden lg:table-cell text-[#64748B]">{cliente.fechaAlta}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-[#1E293B] hover:text-[#B02128]"
                            onClick={() => openViewDialog(cliente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('clientes.edit') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#1E293B] hover:text-[#B02128]"
                              onClick={() => openEditDialog(cliente)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('clientes.delete') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#64748B] hover:text-red-600"
                              onClick={() => openDeleteDialog(cliente)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Editar Cliente</DialogTitle>
            <DialogDescription className="sr-only">Formulario para editar datos del cliente</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-rfc" className="flex items-center gap-2">
                RFC *
                {isLoadingRFC && (
                  <div className="h-3 w-3 border-2 border-[#B02128] border-t-transparent rounded-full animate-spin"></div>
                )}
              </Label>
              <Input 
                id="edit-rfc" 
                placeholder="ABC123456789"
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                onBlur={handleRFCBlur}
                disabled={isLoadingRFC}
                maxLength={13}
                className="uppercase"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-razonSocial">Razón Social *</Label>
              <Input 
                id="edit-razonSocial" 
                placeholder="Nombre de la empresa"
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                disabled={isLoadingRFC}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-usoCFDI">Uso CFDI</Label>
              <Select value={formData.usoCFDI} onValueChange={(value: string) => setFormData({ ...formData, usoCFDI: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar uso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                  <SelectItem value="G03">G03 - Gastos en general</SelectItem>
                  <SelectItem value="P01">P01 - Por definir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-correo">Correo Electrónico *</Label>
              <Input 
                id="edit-correo" 
                type="email" 
                placeholder="correo@empresa.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input 
                id="edit-telefono" 
                placeholder="555-1234"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-direccion">Dirección Fiscal</Label>
              <Input 
                id="edit-direccion" 
                placeholder="Calle, número, colonia"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                disabled={isLoadingRFC}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Detalles del Cliente</DialogTitle>
            <DialogDescription className="sr-only">Vista detallada de la información del cliente</DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#64748B]">RFC</Label>
                  <p className="text-[#1E293B] mt-1">{selectedCliente.rfc}</p>
                </div>
                <div>
                  <Label className="text-[#64748B]">Fecha de Alta</Label>
                  <p className="text-[#1E293B] mt-1">{selectedCliente.fechaAlta}</p>
                </div>
              </div>
              <div>
                <Label className="text-[#64748B]">Razón Social</Label>
                <p className="text-[#1E293B] mt-1">{selectedCliente.razonSocial}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#64748B]">Uso CFDI</Label>
                  <p className="text-[#1E293B] mt-1">{selectedCliente.usoCFDI || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="text-[#64748B]">Teléfono</Label>
                  <p className="text-[#1E293B] mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#64748B]" />
                    {selectedCliente.telefono}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-[#64748B]">Correo Electrónico</Label>
                <p className="text-[#1E293B] mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#64748B]" />
                  {selectedCliente.correo}
                </p>
              </div>
              <div>
                <Label className="text-[#64748B]">Dirección</Label>
                <p className="text-[#1E293B] mt-1">{selectedCliente.direccion || 'No especificada'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1E293B]">¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{' '}
              <span className="font-semibold">{selectedCliente?.razonSocial}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
