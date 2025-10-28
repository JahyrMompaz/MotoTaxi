import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Eye, Package, Tag, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { useAuth } from './AuthContext';
import { useIsMobile } from './ui/use-mobile';

interface Refaccion {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  existencia: number;
  precio: number;
  proveedor?: string;
}

const refaccionesDataInitial: Refaccion[] = [
  { id: 1, codigo: 'REF-001', descripcion: 'Llanta delantera 90/90-12', categoria: 'Llantas', existencia: 45, precio: 450, proveedor: 'Llantas del Norte' },
  { id: 2, codigo: 'REF-002', descripcion: 'Aceite semi-sintético 20W-50', categoria: 'Lubricantes', existencia: 120, precio: 180, proveedor: 'Lubricantes SA' },
  { id: 3, codigo: 'REF-003', descripcion: 'Batería 12V 7Ah', categoria: 'Eléctrico', existencia: 12, precio: 850, proveedor: 'Baterías Express' },
  { id: 4, codigo: 'REF-004', descripcion: 'Pastillas de freno delanteras', categoria: 'Frenos', existencia: 67, precio: 320, proveedor: 'Frenos Pro' },
  { id: 5, codigo: 'REF-005', descripcion: 'Filtro de aire', categoria: 'Filtros', existencia: 89, precio: 125, proveedor: 'Filtros Unidos' },
  { id: 6, codigo: 'REF-006', descripcion: 'Bujía NGK CR7HSA', categoria: 'Motor', existencia: 156, precio: 85, proveedor: 'Refacciones Motor' },
  { id: 7, codigo: 'REF-007', descripcion: 'Espejo retrovisor izquierdo', categoria: 'Accesorios', existencia: 34, precio: 210, proveedor: 'Accesorios Premium' },
  { id: 8, codigo: 'REF-008', descripcion: 'Cable de acelerador', categoria: 'Transmisión', existencia: 5, precio: 95, proveedor: 'Cables y Más' },
];

const categorias = ['Todas', 'Llantas', 'Lubricantes', 'Eléctrico', 'Frenos', 'Filtros', 'Motor', 'Accesorios', 'Transmisión'];

export function Refacciones() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [refacciones, setRefacciones] = useState<Refaccion[]>(refaccionesDataInitial);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRefaccion, setSelectedRefaccion] = useState<Refaccion | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    categoria: '',
    existencia: 0,
    precio: 0,
    proveedor: '',
  });

  const filteredRefacciones = refacciones.filter(
    (item) =>
      (item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoriaFilter === 'Todas' || item.categoria === categoriaFilter)
  );

  const getStockBadge = (existencia: number) => {
    if (existencia < 10) return <Badge variant="destructive">Bajo Stock</Badge>;
    if (existencia < 30) return <Badge className="bg-yellow-500">Stock Medio</Badge>;
    return <Badge className="bg-green-600">Disponible</Badge>;
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      descripcion: '',
      categoria: '',
      existencia: 0,
      precio: 0,
      proveedor: '',
    });
  };

  const handleAdd = () => {
    if (!formData.codigo || !formData.descripcion || !formData.categoria) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const newRefaccion: Refaccion = {
      id: Math.max(...refacciones.map(r => r.id)) + 1,
      ...formData,
    };

    setRefacciones([...refacciones, newRefaccion]);
    toast.success('Refacción agregada exitosamente');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedRefaccion) return;

    if (!formData.codigo || !formData.descripcion || !formData.categoria) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setRefacciones(refacciones.map(r => 
      r.id === selectedRefaccion.id 
        ? { ...r, ...formData }
        : r
    ));
    toast.success('Refacción actualizada exitosamente');
    setIsEditDialogOpen(false);
    setSelectedRefaccion(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedRefaccion) return;
    
    setRefacciones(refacciones.filter(r => r.id !== selectedRefaccion.id));
    toast.success('Refacción eliminada exitosamente');
    setIsDeleteDialogOpen(false);
    setSelectedRefaccion(null);
  };

  const openEditDialog = (refaccion: Refaccion) => {
    setSelectedRefaccion(refaccion);
    setFormData({
      codigo: refaccion.codigo,
      descripcion: refaccion.descripcion,
      categoria: refaccion.categoria,
      existencia: refaccion.existencia,
      precio: refaccion.precio,
      proveedor: refaccion.proveedor || '',
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (refaccion: Refaccion) => {
    setSelectedRefaccion(refaccion);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (refaccion: Refaccion) => {
    setSelectedRefaccion(refaccion);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-20' : ''}`}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Refacciones</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Catálogo de refacciones y repuestos</p>
        </div>
        {hasPermission('refacciones.create') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto text-sm h-9" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Refacción
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#1E293B]">Nueva Refacción</DialogTitle>
              <DialogDescription className="sr-only">Formulario para agregar una nueva refacción al inventario</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input 
                  id="codigo" 
                  placeholder="REF-001"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea 
                  id="descripcion" 
                  placeholder="Descripción de la refacción"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.filter(c => c !== 'Todas').map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="existencia">Existencia</Label>
                  <Input 
                    id="existencia" 
                    type="number"
                    placeholder="0"
                    value={formData.existencia}
                    onChange={(e) => setFormData({ ...formData, existencia: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input 
                    id="precio" 
                    type="number"
                    placeholder="0.00"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input 
                  id="proveedor" 
                  placeholder="Nombre del proveedor"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleAdd}>
                Guardar Refacción
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className={isMobile ? "p-3" : "p-4"}>
          <div className="flex flex-col gap-3">
            <CardTitle className={`text-[#1E293B] ${isMobile ? "text-base" : "text-lg"}`}>Inventario de Refacciones</CardTitle>
            <div className="flex flex-col gap-2 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Buscar refacción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${isMobile ? "h-10" : ""}`}
                />
              </div>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className={`w-full sm:w-48 ${isMobile ? "h-10" : ""}`}>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "p-0" : ""}>
          {isMobile ? (
            /* Vista Móvil - Tarjetas */
            <div className="divide-y divide-gray-100">
              {filteredRefacciones.map((item) => (
                <div key={item.id} className="p-4 active:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="mt-0.5">
                          <Package className="h-5 w-5 text-[#B02128]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#1E293B] mb-1">{item.descripcion}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{item.codigo}</Badge>
                            <Badge variant="outline" className="text-xs">{item.categoria}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-[#64748B] mb-0.5">
                              <Tag className="h-3 w-3" />
                              <span>Stock</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[#1E293B]">{item.existencia}</span>
                              {getStockBadge(item.existencia)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-[#64748B] mb-0.5">
                              <DollarSign className="h-3 w-3" />
                              <span>Precio</span>
                            </div>
                            <span className="text-[#1E293B]">${item.precio.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 text-[#1E293B]"
                        onClick={() => openViewDialog(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {hasPermission('refacciones.edit') && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 text-[#1E293B]"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('refacciones.delete') && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-9 w-9 text-[#64748B]"
                          onClick={() => openDeleteDialog(item)}
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
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead className="hidden lg:table-cell">Existencia</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRefacciones.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-[#1E293B]">{item.codigo}</TableCell>
                      <TableCell className="text-[#1E293B]">{item.descripcion}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-[#64748B]">
                          {item.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-[#1E293B]">{item.existencia}</span>
                          {getStockBadge(item.existencia)}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#1E293B]">
                        ${item.precio.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-[#1E293B] hover:text-[#B02128]"
                            onClick={() => openViewDialog(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('refacciones.edit') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#1E293B] hover:text-[#B02128]"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('refacciones.delete') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#64748B] hover:text-red-600"
                              onClick={() => openDeleteDialog(item)}
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
            <DialogTitle className="text-[#1E293B]">Editar Refacción</DialogTitle>
            <DialogDescription className="sr-only">Formulario para editar datos de la refacción</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-codigo">Código *</Label>
              <Input 
                id="edit-codigo" 
                placeholder="REF-001"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-descripcion">Descripción *</Label>
              <Textarea 
                id="edit-descripcion" 
                placeholder="Descripción de la refacción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-categoria">Categoría *</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.filter(c => c !== 'Todas').map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-existencia">Existencia</Label>
                <Input 
                  id="edit-existencia" 
                  type="number"
                  placeholder="0"
                  value={formData.existencia}
                  onChange={(e) => setFormData({ ...formData, existencia: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-precio">Precio</Label>
                <Input 
                  id="edit-precio" 
                  type="number"
                  placeholder="0.00"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-proveedor">Proveedor</Label>
              <Input 
                id="edit-proveedor" 
                placeholder="Nombre del proveedor"
                value={formData.proveedor}
                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
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
            <DialogTitle className="text-[#1E293B]">Detalles de la Refacción</DialogTitle>
            <DialogDescription className="sr-only">Vista detallada de la información de la refacción</DialogDescription>
          </DialogHeader>
          {selectedRefaccion && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#64748B]">Código</Label>
                  <p className="text-[#1E293B] mt-1">{selectedRefaccion.codigo}</p>
                </div>
                <div>
                  <Label className="text-[#64748B]">Categoría</Label>
                  <p className="text-[#1E293B] mt-1">
                    <Badge variant="outline">{selectedRefaccion.categoria}</Badge>
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-[#64748B]">Descripción</Label>
                <p className="text-[#1E293B] mt-1">{selectedRefaccion.descripcion}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#64748B]">Existencia</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[#1E293B]">{selectedRefaccion.existencia} unidades</p>
                    {getStockBadge(selectedRefaccion.existencia)}
                  </div>
                </div>
                <div>
                  <Label className="text-[#64748B]">Precio Unitario</Label>
                  <p className="text-[#B02128] mt-1 text-xl">
                    ${selectedRefaccion.precio.toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-[#64748B]">Proveedor</Label>
                <p className="text-[#1E293B] mt-1">{selectedRefaccion.proveedor || 'No especificado'}</p>
              </div>
              <div>
                <Label className="text-[#64748B]">Valor en Inventario</Label>
                <p className="text-[#1E293B] mt-1">
                  ${(selectedRefaccion.existencia * selectedRefaccion.precio).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1E293B]">¿Eliminar refacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la refacción{' '}
              <span className="font-semibold">{selectedRefaccion?.descripcion}</span>.
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
