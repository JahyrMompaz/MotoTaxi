import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../ui/select";
import { Textarea } from "./../ui/textarea";
import { ImageWithFallback } from "./../figma/ImageWithFallback";
import { useState } from "react";
import { toast } from "sonner";
import { createMototaxi, Mototaxi } from "./../mototaxis/mototaxiService";


interface MototaxiFormProps {
  moto?: Mototaxi;
  onSubmit: (data: Partial<Mototaxi>) => void;
}

export function MototaxiForm({ moto, onSubmit }: MototaxiFormProps) {
  const [formData, setFormData] = useState<Partial<Mototaxi>>(
    moto || { modelo: "", color: "", anio: new Date().getFullYear(), numero_serie: "", precio: 0, imagenFile: null, existencia: 0, codigo: "", marca: "" }
  );
  const [preview, setPreview] = useState(moto?.imagen || "");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDACIONES
    if (file.size > 5000000) {
      toast.error("La imagen no debe superar 5MB");
      return;
    }

    // Guardas File para enviar al backend
    setFormData({ ...formData, imagenFile: file });

    // Solo para previsualización
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
};


  const handleSubmit = () => {
    const payload : Partial<Mototaxi> = { ...formData, imagenFile: formData.imagenFile ?? undefined };
    if (!formData.modelo || !formData.numero_serie) {
      toast.error("Faltan campos obligatorios");
      return;
    }

    onSubmit(payload);
  };

  return (
    <div className="space-y-4">
      {/* Campos principales */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Modelo *</Label>
          <Input id="modelo" value={formData.modelo} onChange={(value: any) => setFormData({ ...formData, modelo: value.target.value })}/>

        </div>
        <div>
          <Label>Color *</Label>
          <Input value={formData.color} onChange={(v: any) => setFormData({ ...formData, color: v.target.value })}/>
        </div>
      </div>

      {/* Más campos */}
      <Label htmlFor="serie">Serie *</Label>
      <Input id="serie" value={formData.numero_serie} onChange={(e: any) => setFormData({ ...formData, numero_serie: e.target.value })} />

      <Label>Codigo</Label>
      <Input value={formData.codigo} onChange={(e: any) => setFormData({ ...formData, codigo: e.target.value })} />

      <Label>Marca</Label>
      <Input value={formData.marca} onChange={(e: any) => setFormData({ ...formData, marca: e.target.value })} />

      <Label>Precio</Label>
      <Input type="number" value={formData.precio} onChange={(e : any) => setFormData({ ...formData, precio: +e.target.value })} />

      <Label>Imagen</Label>
      <Input type="file" accept="image/*" onChange={handleImageUpload} />
      {preview && <ImageWithFallback src={preview} alt="Preview" className="w-32 h-32 object-cover" />}

      <Label>En stock</Label>
      <Input value={formData.existencia} onChange={(e: any) => setFormData({ ...formData, existencia: Number(e.target.value) })} />

      <button
        onClick={handleSubmit}
        className="w-full bg-[#B02128] hover:bg-[#8B1A20] text-white rounded-md py-2"
      >
        Guardar
      </button>
    </div>
  );
}
