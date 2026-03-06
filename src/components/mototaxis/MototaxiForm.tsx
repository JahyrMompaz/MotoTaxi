import { Label } from "./../ui/label";
import { Input } from "./../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../ui/select"; 
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
      marca: "",        
      modelo: "", 
      color: "", 
      anio: new Date().getFullYear(),
      motor: "",         
      cilindraje: "",    
      transmision: "",  
      combustible: "",   
      pedimento: "",      
      aduana: "",         
      fecha_pedimento: "", 
      precio: 0, 
      existencia: 0,     
      imagenFile: null,
      activo: true
    }
  );

  // Lógica de imagen
  const getInitialPreview = (img?: string) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return `${BASE_STORAGE_URL}${img}`;
  };

  const [preview, setPreview] = useState(getInitialPreview(moto?.imagen));

  useEffect(() => {
    if (moto?.imagen) {
        setPreview(getInitialPreview(moto.imagen));
    }
  }, [moto]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5000000) {
      toast.error("La imagen no debe superar 5MB");
      return;
    }
    setFormData({ ...formData, imagenFile: file });
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    // --- VALIDACIÓN ESTRICTA ---
    if (
        !formData.marca || 
        !formData.modelo || 
        !formData.numero_serie || 
        !formData.motor ||
        !formData.color ||
        !formData.precio
    ) {
      toast.error("Por favor completa los campos obligatorios (Marca, Modelo, Color, Serie, Motor y Precio)");
      return;
    }

    if (formData.precio <= 0) {
        toast.error("El precio debe ser mayor a 0");
        return;
    }
    
    const payload: Partial<Mototaxi> = { 
        ...formData, 
        imagenFile: formData.imagenFile ?? undefined 
    };
    onSubmit(payload);
  };

  return (
    <div className="flex flex-col" style={{ maxHeight: 'calc(90vh - 160px)' }}>
      {/* Contenedor con scroll */}
      <div className="overflow-y-auto pr-2 space-y-4">
        
        {/* SECCIÓN 1: DATOS GENERALES */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b pb-1 mb-3 sticky top-0 bg-white z-10">
            Datos Generales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Marca *</Label>
              <Input 
                placeholder="Ej. BAJAJ"
                value={formData.marca} 
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })} 
              />
            </div>
            <div>
              <Label>Modelo (Año) *</Label>
              <Input 
                type="number" 
                value={formData.anio} 
                onChange={(e) => setFormData({ ...formData, anio: +e.target.value })} 
              />
            </div>
            <div>
              <Label>Versión *</Label>
              <Input 
                placeholder="Ej. RE 4S" 
                value={formData.modelo} 
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} 
              />
            </div>
            <div>
              <Label>Color *</Label>
              <Input 
                placeholder="Ej. ROJO"
                value={formData.color} 
                onChange={(e) => setFormData({ ...formData, color: e.target.value })} 
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: IDENTIFICACIÓN ÚNICA */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <Label>NIV / Serie (Chasis) *</Label>
               <Input 
                 value={formData.numero_serie} 
                 onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })} 
                 className="uppercase"
                 placeholder="XXXXXXXXXXXXXXXX"
               />
            </div>
            <div>
               <Label>Número de Motor *</Label>
               <Input 
                 value={formData.motor} 
                 onChange={(e) => setFormData({ ...formData, motor: e.target.value })} 
                 className="uppercase"
                 placeholder="XXXXXXXX"
               />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: FICHA TÉCNICA */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b pb-1 mb-3 sticky top-0 bg-white z-10">
            Ficha Técnica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <div>
                <Label>Cilindraje</Label>
                <Input 
                    placeholder="Ej. 205 CC"
                    value={formData.cilindraje} 
                    onChange={(e) => setFormData({...formData, cilindraje: e.target.value})} 
                />
             </div>
             <div>
                <Label>Transmisión</Label>
                <Select 
                    value={formData.transmision} 
                    onValueChange={(v: any) => setFormData({...formData, transmision: v})}
                >
                   <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="ESTÁNDAR">Estándar</SelectItem>
                      <SelectItem value="AUTOMÁTICA">Automática</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div>
                <Label>Combustible</Label>
                <Input 
                    placeholder="Ej. GASOLINA"
                    value={formData.combustible} 
                    onChange={(e) => setFormData({...formData, combustible: e.target.value})} 
                />
             </div>
          </div>
        </div>

        {/* SECCIÓN 4: IMPORTACIÓN / LEGAL */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b pb-1 mb-3 sticky top-0 bg-white z-10">
            Legalidad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="col-span-full">
                <Label>Aduana</Label>
                <Input 
                    placeholder="Ej. 430 VERACRUZ" 
                    value={formData.aduana} 
                    onChange={(e) => setFormData({ ...formData, aduana: e.target.value })} 
                />
             </div>
             <div>
                <Label>Num. Pedimento</Label>
                <Input 
                    placeholder="Ej. 25 43 1925..." 
                    value={formData.pedimento} 
                    onChange={(e) => setFormData({ ...formData, pedimento: e.target.value })} 
                />
             </div>
             <div>
                <Label>Fecha Pedimento</Label>
                <Input 
                    type="date" 
                    value={formData.fecha_pedimento} 
                    onChange={(e) => setFormData({ ...formData, fecha_pedimento: e.target.value })} 
                />
             </div>
          </div>
        </div>

        {/* SECCIÓN 5: VENTA */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b pb-1 mb-3 sticky top-0 bg-white z-10">
            Inventario
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label className="text-red-700 font-bold">Precio Venta *</Label>
                <Input 
                    type="number" 
                    className="text-lg font-bold" 
                    value={formData.precio} 
                    onChange={(e) => setFormData({ ...formData, precio: +e.target.value })} 
                />
            </div>
            <div>
                <Label>Existencia</Label>
                <Input 
                    type="number" 
                    value={formData.existencia} 
                    onChange={(e) => setFormData({ ...formData, existencia: Number(e.target.value) })} 
                />
            </div>
          </div>
        </div>

        {/* SECCIÓN 6: FOTOGRAFÍA */}
        <div className="pb-4">
          <div className="space-y-2">
              <Label>Fotografía</Label>
              {preview && (
                <div className="mb-2 border rounded-md overflow-hidden w-32 h-32 flex items-center justify-center bg-gray-50">
                    <ImageWithFallback src={preview} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>
      </div>

      {/* Botón fijo en la parte inferior */}
      <div className="pt-4 mt-4 border-t bg-white sticky bottom-0">
        <button
          onClick={handleSubmit}
          className="w-full bg-[#B02128] hover:bg-[#8B1A20] text-white rounded-md py-3 font-bold transition-colors"
        >
          Guardar Mototaxi
        </button>
      </div>
    </div>
  );
}