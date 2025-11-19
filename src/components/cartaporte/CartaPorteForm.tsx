import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { MapPin, User, Truck, Calendar, FileText } from "lucide-react";
import { CartaPorteFormData } from "./types";

interface Props {
  formData: CartaPorteFormData;
  setFormData: (data: CartaPorteFormData) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onSubmit: () => void;
  facturasDisponibles: { folio: string; cliente: string; total: number }[];
  isMobile: boolean;
}

export function CartaPorteForm({
  formData,
  setFormData,
  isOpen,
  setIsOpen,
  onSubmit,
  facturasDisponibles,
  isMobile,
}: Props) {
  const handleToggleFactura = (folio: string) => {
    setFormData({
      ...formData,
      facturasSeleccionadas: formData.facturasSeleccionadas.includes(folio)
        ? formData.facturasSeleccionadas.filter((f) => f !== folio)
        : [...formData.facturasSeleccionadas, folio],
    });
  };

  const content = (
    <div className="space-y-4 py-4">
      {/* ====== ORIGEN / DESTINO ====== */}
      <div className="space-y-3">
        <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Origen y Destino
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Origen *</Label>
            <Input
              value={formData.origen}
              onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
              placeholder="Ciudad, Estado"
            />
          </div>
          <div>
            <Label>Destino *</Label>
            <Input
              value={formData.destino}
              onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
              placeholder="Ciudad, Estado"
            />
          </div>
        </div>

        <div>
          <Label>Distancia (km) *</Label>
          <Input
            type="number"
            value={formData.distanciaKm}
            onChange={(e) => setFormData({ ...formData, distanciaKm: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <Separator />

      {/* ====== CHOFER ====== */}
      <div className="space-y-3">
        <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
          <User className="h-4 w-4" />
          Datos del Chofer
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nombre Completo *</Label>
            <Input
              value={formData.choferNombre}
              onChange={(e) => setFormData({ ...formData, choferNombre: e.target.value })}
              placeholder="Nombre del chofer"
            />
          </div>

          <div>
            <Label>RFC</Label>
            <Input
              value={formData.choferRFC}
              onChange={(e) => setFormData({ ...formData, choferRFC: e.target.value })}
              placeholder="ABCD123456XXX"
            />
          </div>
        </div>

        <div>
          <Label>Número de Licencia *</Label>
          <Input
            value={formData.choferLicencia}
            onChange={(e) => setFormData({ ...formData, choferLicencia: e.target.value })}
            placeholder="A1234567"
          />
        </div>
      </div>

      <Separator />

      {/* ====== VEHÍCULO ====== */}
      <div className="space-y-3">
        <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Datos del Vehículo
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Placas *</Label>
            <Input
              value={formData.vehiculoPlacas}
              onChange={(e) => setFormData({ ...formData, vehiculoPlacas: e.target.value })}
              placeholder="ABC-123-D"
            />
          </div>

          <div>
            <Label>Modelo</Label>
            <Input
              value={formData.vehiculoModelo}
              onChange={(e) => setFormData({ ...formData, vehiculoModelo: e.target.value })}
              placeholder="Marca y modelo"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Año</Label>
            <Input
              value={formData.vehiculoAnio}
              onChange={(e) => setFormData({ ...formData, vehiculoAnio: e.target.value })}
              placeholder="2024"
            />
          </div>

          <div>
            <Label>Configuración</Label>
            <Select
              value={formData.vehiculoConfiguracion}
              onValueChange={(v: any) => setFormData({ ...formData, vehiculoConfiguracion: v })}
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

      {/* ====== FECHA Y HORA ====== */}
      <div className="space-y-3">
        <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Fecha y Hora de Salida
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              value={formData.fechaSalida}
              onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
            />
          </div>

          <div>
            <Label>Hora</Label>
            <Input
              type="time"
              value={formData.horaSalida}
              onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ====== FACTURAS ====== */}
      <div className="space-y-3">
        <h3 className="text-sm text-[#1E293B] flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Facturas a Transportar *
        </h3>

        <div className="space-y-2 border p-3 rounded max-h-60 overflow-y-auto">
          {facturasDisponibles.map((f) => (
            <div key={f.folio} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.facturasSeleccionadas.includes(f.folio)}
                  onCheckedChange={() => handleToggleFactura(f.folio)}
                />
                <Label className="cursor-pointer">
                  <p className="text-sm">{f.folio}</p>
                  <p className="text-xs text-gray-500">{f.cliente}</p>
                </Label>
              </div>
              <span className="text-sm">${f.total.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500">
          {formData.facturasSeleccionadas.length} factura(s) seleccionada(s)
        </p>
      </div>

      <Separator />

      {/* ====== OBSERVACIONES ====== */}
      <div>
        <Label>Observaciones</Label>
        <Textarea
          rows={3}
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          placeholder="Notas adicionales..."
        />
      </div>
    </div>
  );

  // MOBILE → Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="bg-white h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nueva Carta Porte</SheetTitle>
            <SheetDescription>
              Completa la información del transporte y vincula las facturas
            </SheetDescription>
          </SheetHeader>

          {content}

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={onSubmit} className="flex-1 bg-[#B02128] text-white">
              Crear
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // DESKTOP → Dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Nueva Carta Porte</DialogTitle>
          <DialogDescription>
            Completa la información del transporte y vincula facturas timbradas
          </DialogDescription>
        </DialogHeader>

        {content}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} className="bg-[#B02128] text-white">
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
