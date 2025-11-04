// src/components/Refacciones/RefaccionForm.tsx
import { useState } from "react";
import { Input } from "./../ui/input";
import { Label } from "./../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../ui/select";
import { Textarea } from "./../ui/textarea";
import { Button } from "./../ui/button";
import { toast } from "sonner";
import { Refaccion } from "./types";

const categorias = ["Llantas", "Lubricantes", "Eléctrico", "Frenos", "Filtros", "Motor", "Accesorios", "Transmisión"];

interface RefaccionFormProps {
  initialData?: Refaccion | null;
  onSubmit: (data: Partial<Refaccion>) => void;
}

export function RefaccionForm({ initialData, onSubmit }: RefaccionFormProps) {
  const [formData, setFormData] = useState<Partial<Refaccion>>(
    initialData || { codigo: "", descripcion: "", categoria: "", existencia: 0, precio: 0, proveedor: "" }
  );

  const handleSubmit = () => {
    if (!formData.codigo || !formData.descripcion || !formData.categoria) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label>Código *</Label>
        <Input
          value={formData.codigo}
          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
          placeholder="REF-001"
        />
      </div>
      <div className="grid gap-2">
        <Label>Descripción *</Label>
        <Textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={2}
          placeholder="Descripción de la refacción"
        />
      </div>
      <div className="grid gap-2">
        <Label>Categoría *</Label>
        <Select value={formData.categoria} onValueChange={(v: any) => setFormData({ ...formData, categoria: v })}>
          <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Existencia</Label>
          <Input
            type="number"
            value={formData.existencia}
            onChange={(e) => setFormData({ ...formData, existencia: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Precio</Label>
          <Input
            type="number"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div>
        <Label>Proveedor</Label>
        <Input
          value={formData.proveedor}
          onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
          placeholder="Nombre del proveedor"
        />
      </div>

      <Button onClick={handleSubmit} className="bg-[#B02128] hover:bg-[#8B1A20] text-white">
        Guardar
      </Button>
    </div>
  );
}
