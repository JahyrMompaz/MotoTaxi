import { Mototaxi } from "./mototaxiService";
import { Badge } from "./../ui/badge";
import { Label } from "./../ui/label";

export function MototaxiView({ Mototaxi }: { Mototaxi: Mototaxi }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Modelo</Label>
          <Badge variant="outline">{Mototaxi.modelo}</Badge>
        </div>
      </div>
      <div>
        <Label>Color</Label>
        <p className="text-[#1E293B]">{Mototaxi.color}</p>
      </div>
      <div>
        <Label>Marca</Label>
        <p className="text-[#1E293B]">{Mototaxi.marca}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Codigo</Label>
          <p className="text-[#1E293B]">{Mototaxi.codigo}</p>
        </div>
        <div>
          <Label>Precio Unitario</Label>
          <p className="text-[#B02128] text-lg">${Mototaxi.precio.toLocaleString()}</p>
        </div>
      </div>
      <div>
        <Label>En stock</Label>
        <p className="text-[#1E293B]">{Mototaxi.existencia || "No especificado"}</p>
      </div>
    </div>
  );
}
