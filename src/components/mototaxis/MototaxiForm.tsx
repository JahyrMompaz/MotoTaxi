import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { ImageWithFallback } from "./../figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mototaxi } from "./../mototaxis/mototaxiService";

const BASE_STORAGE_URL = "https://sanjuan.desarrollos-404.com/storage/";

interface MototaxiFormProps {
  moto?: Mototaxi;
  onSubmit: (data: Partial<Mototaxi>) => void;
}

export function MototaxiForm({ moto, onSubmit }: MototaxiFormProps) {
  const [formData, setFormData] = useState<Partial<Mototaxi>>(
    moto || { 
      modelo: "", 
      color: "", 
      anio: new Date().getFullYear(), 
      numero_serie: "", 
      precio: 0, 
      imagenFile: null, 
      existencia: 0, 
      codigo: "", 
      marca: "" 
    }
  );

  // Lógica para inicializar el preview correctamente
  const getInitialPreview = (img?: string) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    // Si es ruta relativa, concatenamos la URL del servidor
    return `${BASE_STORAGE_URL}${img}`;
  };

  const [preview, setPreview] = useState(getInitialPreview(moto?.imagen));

  // Actualizar preview si cambia la prop 'moto' (por si acaso)
  useEffect(() => {
    if (moto?.imagen) {
        setPreview(getInitialPreview(moto.imagen));
    }
  }, [moto]);

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

    // Solo para previsualización inmediata
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.modelo || !formData.numero_serie) {
      toast.error("Faltan campos obligatorios");
      return;
    }
    
    // Preparamos el payload
    const payload: Partial<Mototaxi> = { 
        ...formData, 
        // Si hay un archivo nuevo, lo enviamos. Si no, undefined (el servicio lo ignora)
        imagenFile: formData.imagenFile ?? undefined 
    };

    onSubmit(payload);
  };

  return (
    <div className="space-y-4">
      {/* Campos principales */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Modelo *</Label>
          <Input 
            id="modelo" 
            value={formData.modelo} 
            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
          />
        </div>
        <div>
          <Label>Color *</Label>
          <Input 
            value={formData.color} 
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
      </div>

      <Label htmlFor="serie">Serie *</Label>
      <Input 
        id="serie" 
        value={formData.numero_serie} 
        onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })} 
      />

      <Label>Codigo</Label>
      <Input 
        value={formData.codigo} 
        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} 
      />

      <Label>Marca</Label>
      <Input 
        value={formData.marca} 
        onChange={(e) => setFormData({ ...formData, marca: e.target.value })} 
      />

      <Label>Precio</Label>
      <Input 
        type="number" 
        value={formData.precio} 
        onChange={(e) => setFormData({ ...formData, precio: +e.target.value })} 
      />

      <div className="space-y-2">
          <Label>Imagen</Label>
          
          {/* Visualización de la imagen actual o nueva */}
          {preview && (
            <div className="mb-2 border rounded-md overflow-hidden w-32 h-32">
                <ImageWithFallback 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                />
            </div>
          )}

          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
      </div>

      <Label>En stock</Label>
      <Input 
        value={formData.existencia} 
        onChange={(e) => setFormData({ ...formData, existencia: Number(e.target.value) })} 
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-[#B02128] hover:bg-[#8B1A20] text-white rounded-md py-2 mt-4"
      >
        Guardar
      </button>
    </div>
  );
}