import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../ui/select";
import { Textarea } from "./../ui/textarea";
import { ImageWithFallback } from "./../figma/ImageWithFallback";
import { useState } from "react";
import { toast } from "sonner";
import { Mototaxi } from "./../mototaxis/mototaxiService";

interface MototaxiFormProps {
  moto?: Mototaxi;
  onSubmit: (data: Partial<Mototaxi>) => void;
}

export function MototaxiForm({ moto, onSubmit }: MototaxiFormProps) {
  const [formData, setFormData] = useState<Partial<Mototaxi>>(
    moto || { modelo: "", color: "", año: new Date().getFullYear(), serie: "", precio: 0 }
  );
  const [preview, setPreview] = useState(moto?.imagen || "");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5000000) {
      toast.error("La imagen no debe superar 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.modelo || !formData.serie) {
      toast.error("Faltan campos obligatorios");
      return;
    }
    onSubmit({ ...formData, imagen: preview });
  };

  return (
    <div className="space-y-4">
      {/* Campos principales */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Modelo *</Label>
          <Select value={formData.modelo} onValueChange={(value: any) => setFormData({ ...formData, modelo: value })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar modelo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Italika DM150">Italika DM150</SelectItem>
              <SelectItem value="Vento Workman">Vento Workman</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Color *</Label>
          <Select value={formData.color} onValueChange={(v: any) => setFormData({ ...formData, color: v })}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Rojo">Rojo</SelectItem>
              <SelectItem value="Negro">Negro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Más campos */}
      <Label htmlFor="serie">Serie *</Label>
      <Input id="serie" value={formData.serie} onChange={(e: any) => setFormData({ ...formData, serie: e.target.value })} />

      <Label>Precio</Label>
      <Input type="number" value={formData.precio} onChange={(e : any) => setFormData({ ...formData, precio: +e.target.value })} />

      <Label>Imagen</Label>
      <Input type="file" accept="image/*" onChange={handleImageUpload} />
      {preview && <ImageWithFallback src={preview} alt="Preview" className="w-full h-40 object-cover" />}

      <Label>Observaciones</Label>
      <Textarea value={formData.observaciones} onChange={(e: any) => setFormData({ ...formData, observaciones: e.target.value })} />

      <button
        onClick={handleSubmit}
        className="w-full bg-[#B02128] hover:bg-[#8B1A20] text-white rounded-md py-2"
      >
        Guardar
      </button>
    </div>
  );
}
