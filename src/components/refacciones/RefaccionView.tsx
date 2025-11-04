// src/components/Refacciones/RefaccionView.tsx
import { Refaccion } from "./types";
import { Badge } from "./../ui/badge";
import { Label } from "./../ui/label";

export function RefaccionView({ refaccion }: { refaccion: Refaccion }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <p className="text-[#1E293B]">{refaccion.codigo}</p>
        </div>
        <div>
          <Label>Categoría</Label>
          <Badge variant="outline">{refaccion.categoria}</Badge>
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <p className="text-[#1E293B]">{refaccion.descripcion}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Existencia</Label>
          <p className="text-[#1E293B]">{refaccion.existencia}</p>
        </div>
        <div>
          <Label>Precio Unitario</Label>
          <p className="text-[#B02128] text-lg">${refaccion.precio.toLocaleString()}</p>
        </div>
      </div>
      <div>
        <Label>Proveedor</Label>
        <p className="text-[#1E293B]">{refaccion.proveedor || "No especificado"}</p>
      </div>
    </div>
  );
}
