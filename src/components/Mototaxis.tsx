import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Bike, Calendar, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from './ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useIsMobile } from './ui/use-mobile';

interface Mototaxi {
  id: number;
  modelo: string;
  color: string;
  año: number;
  serie: string;
  precio: number;
  imagen: string;
  kilometraje?: number;
  observaciones?: string;
}

const mototaxisDataInitial: Mototaxi[] = [
  { id: 1, modelo: 'Italika DM150', color: 'Rojo', año: 2024, serie: 'ITK2024-001', precio: 45000, imagen: 'red motorcycle', kilometraje: 0 },
  { id: 2, modelo: 'Vento Rebellion', color: 'Negro', año: 2024, serie: 'VTO2024-002', precio: 52000, imagen: 'black motorcycle', kilometraje: 0 },
  { id: 3, modelo: 'Italika DS150', color: 'Azul', año: 2024, serie: 'ITK2024-003', precio: 48000, imagen: 'blue motorcycle', kilometraje: 0 },
  { id: 4, modelo: 'Vento Workman', color: 'Blanco', año: 2024, serie: 'VTO2024-004', precio: 54000, imagen: 'white motorcycle', kilometraje: 0 },
  { id: 5, modelo: 'Italika DM200', color: 'Verde', año: 2024, serie: 'ITK2024-005', precio: 49000, imagen: 'green motorcycle', kilometraje: 0 },
  { id: 6, modelo: 'Vento Nitrox', color: 'Gris', año: 2024, serie: 'VTO2024-006', precio: 56000, imagen: 'gray motorcycle', kilometraje: 0 },
];

export function Mototaxis() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [mototaxis, setMototaxis] = useState<Mototaxi[]>(mototaxisDataInitial);
  const [selectedMoto, setSelectedMoto] = useState<Mototaxi | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    modelo: '',
    color: '',
    año: new Date().getFullYear(),
    serie: '',
    precio: 0,
    kilometraje: 0,
    observaciones: '',
    imagen: 'motorcycle',
  });

  const filteredMototaxis = mototaxis.filter(
    (moto) =>
      moto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      moto.serie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      modelo: '',
      color: '',
      año: new Date().getFullYear(),
      serie: '',
      precio: 0,
      kilometraje: 0,
      observaciones: '',
      imagen: 'motorcycle',
    });
    setImagePreview('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imagen: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!formData.modelo || !formData.serie || !formData.color) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const newMoto: Mototaxi = {
      id: Math.max(...mototaxis.map(m => m.id)) + 1,
      ...formData,
      imagen: imagePreview || formData.imagen || `${formData.color.toLowerCase()} motorcycle`,
    };

    setMototaxis([...mototaxis, newMoto]);
    toast.success('Mototaxi registrada exitosamente');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedMoto) return;

    if (!formData.modelo || !formData.serie || !formData.color) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setMototaxis(mototaxis.map(m => 
      m.id === selectedMoto.id 
        ? { ...m, ...formData, imagen: imagePreview || formData.imagen }
        : m
    ));
    toast.success('Mototaxi actualizada exitosamente');
    setIsEditDialogOpen(false);
    setSelectedMoto(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedMoto) return;
    
    setMototaxis(mototaxis.filter(m => m.id !== selectedMoto.id));
    toast.success('Mototaxi eliminada exitosamente');
    setIsDeleteDialogOpen(false);
    setSelectedMoto(null);
  };

  const openEditDialog = (moto: Mototaxi) => {
    setSelectedMoto(moto);
    setFormData({
      modelo: moto.modelo,
      color: moto.color,
      año: moto.año,
      serie: moto.serie,
      precio: moto.precio,
      kilometraje: moto.kilometraje || 0,
      observaciones: moto.observaciones || '',
      imagen: moto.imagen,
    });
    setImagePreview(moto.imagen);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (moto: Mototaxi) => {
    setSelectedMoto(moto);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (moto: Mototaxi) => {
    setSelectedMoto(moto);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-20' : ''}`}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Mototaxis</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Inventario de unidades</p>
        </div>
        {hasPermission('mototaxis.create') && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto text-sm h-9" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Unidad
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#1E293B]">Registrar Nueva Unidad</DialogTitle>
              <DialogDescription className="sr-only">Formulario para registrar una nueva mototaxi</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Select value={formData.modelo} onValueChange={(value) => setFormData({ ...formData, modelo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Italika DM150">Italika DM150</SelectItem>
                    <SelectItem value="Italika DS150">Italika DS150</SelectItem>
                    <SelectItem value="Italika DM200">Italika DM200</SelectItem>
                    <SelectItem value="Vento Rebellion">Vento Rebellion</SelectItem>
                    <SelectItem value="Vento Workman">Vento Workman</SelectItem>
                    <SelectItem value="Vento Nitrox">Vento Nitrox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="color">Color *</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rojo">Rojo</SelectItem>
                      <SelectItem value="Negro">Negro</SelectItem>
                      <SelectItem value="Azul">Azul</SelectItem>
                      <SelectItem value="Blanco">Blanco</SelectItem>
                      <SelectItem value="Verde">Verde</SelectItem>
                      <SelectItem value="Gris">Gris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="año">Año *</Label>
                  <Input 
                    id="año" 
                    type="number"
                    value={formData.año}
                    onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) || new Date().getFullYear() })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serie">Número de Serie *</Label>
                <Input 
                  id="serie" 
                  placeholder="ITK2024-XXX"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="kilometraje">Kilometraje</Label>
                  <Input 
                    id="kilometraje" 
                    type="number"
                    placeholder="0"
                    value={formData.kilometraje}
                    onChange={(e) => setFormData({ ...formData, kilometraje: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imagen">Imagen de la Unidad</Label>
                <Input 
                  id="imagen" 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                {(imagePreview || formData.imagen) && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    <ImageWithFallback 
                      src={imagePreview || formData.imagen} 
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <p className="text-xs text-[#64748B]">
                  Formatos: JPG, PNG, WEBP. Máximo 5MB
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea 
                  id="observaciones" 
                  placeholder="Notas adicionales..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleAdd}>
                Guardar Unidad
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            placeholder="Buscar por modelo o serie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredMototaxis.map((moto) => (
          <Card key={moto.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-0">
              <div className="relative h-48 bg-[#F1F5F9] rounded-t-lg overflow-hidden">
                <ImageWithFallback
                  src={moto.imagen.startsWith('data:') ? moto.imagen : `https://source.unsplash.com/400x300/?${moto.imagen}`}
                  alt={moto.modelo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {hasPermission('mototaxis.update') && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={() => openEditDialog(moto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {hasPermission('mototaxis.delete') && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white text-red-600"
                      onClick={() => openDeleteDialog(moto)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-[#1E293B]">{moto.modelo}</h3>
                <p className="text-sm text-[#64748B]">Serie: {moto.serie}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[#64748B]">Color:</span>
                  <p className="text-[#1E293B]">{moto.color}</p>
                </div>
                <div>
                  <span className="text-[#64748B]">Año:</span>
                  <p className="text-[#1E293B]">{moto.año}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-2xl text-[#B02128]">
                  ${moto.precio.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => openViewDialog(moto)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
                {hasPermission('mototaxis.update') && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(moto)}
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {hasPermission('mototaxis.delete') && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(moto)}
                    className="hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Detalle de Unidad</DialogTitle>
            <DialogDescription className="sr-only">Vista detallada de la información de la unidad</DialogDescription>
          </DialogHeader>
          {selectedMoto && (
            <div className="space-y-4">
              <div className="h-64 bg-[#F1F5F9] rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedMoto.imagen.startsWith('data:') ? selectedMoto.imagen : `https://source.unsplash.com/800x600/?${selectedMoto.imagen}`}
                  alt={selectedMoto.modelo}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B]">Modelo</p>
                  <p className="text-[#1E293B]">{selectedMoto.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Color</p>
                  <p className="text-[#1E293B]">{selectedMoto.color}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Año</p>
                  <p className="text-[#1E293B]">{selectedMoto.año}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Número de Serie</p>
                  <p className="text-[#1E293B]">{selectedMoto.serie}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Kilometraje</p>
                  <p className="text-[#1E293B]">{selectedMoto.kilometraje} km</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Precio</p>
                  <p className="text-2xl text-[#B02128]">
                    ${selectedMoto.precio.toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedMoto.observaciones && (
                <div>
                  <p className="text-sm text-[#64748B]">Observaciones</p>
                  <p className="text-[#1E293B]">{selectedMoto.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1E293B]">Editar Unidad</DialogTitle>
            <DialogDescription className="sr-only">Formulario para editar datos de la unidad</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-modelo">Modelo *</Label>
              <Select value={formData.modelo} onValueChange={(value) => setFormData({ ...formData, modelo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Italika DM150">Italika DM150</SelectItem>
                  <SelectItem value="Italika DS150">Italika DS150</SelectItem>
                  <SelectItem value="Italika DM200">Italika DM200</SelectItem>
                  <SelectItem value="Vento Rebellion">Vento Rebellion</SelectItem>
                  <SelectItem value="Vento Workman">Vento Workman</SelectItem>
                  <SelectItem value="Vento Nitrox">Vento Nitrox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Color *</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rojo">Rojo</SelectItem>
                    <SelectItem value="Negro">Negro</SelectItem>
                    <SelectItem value="Azul">Azul</SelectItem>
                    <SelectItem value="Blanco">Blanco</SelectItem>
                    <SelectItem value="Verde">Verde</SelectItem>
                    <SelectItem value="Gris">Gris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-año">Año *</Label>
                <Input 
                  id="edit-año" 
                  type="number"
                  value={formData.año}
                  onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) || new Date().getFullYear() })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-serie">Número de Serie *</Label>
              <Input 
                id="edit-serie" 
                placeholder="ITK2024-XXX"
                value={formData.serie}
                onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="edit-kilometraje">Kilometraje</Label>
                <Input 
                  id="edit-kilometraje" 
                  type="number"
                  placeholder="0"
                  value={formData.kilometraje}
                  onChange={(e) => setFormData({ ...formData, kilometraje: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-imagen">Imagen de la Unidad</Label>
              <Input 
                id="edit-imagen" 
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              {(imagePreview || formData.imagen) && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  <ImageWithFallback 
                    src={imagePreview || formData.imagen} 
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-[#64748B]">
                Formatos: JPG, PNG, WEBP. Máximo 5MB
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-observaciones">Observaciones</Label>
              <Textarea 
                id="edit-observaciones" 
                placeholder="Notas adicionales..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={2}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1E293B]">¿Eliminar unidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la unidad{' '}
              <span className="font-semibold">{selectedMoto?.modelo} - {selectedMoto?.serie}</span>.
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
