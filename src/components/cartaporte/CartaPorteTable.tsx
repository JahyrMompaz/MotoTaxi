import { CartaPorte } from "./types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Eye,
  Download,
  MapPin,
  User,
  Truck,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { downloadCartaPortePDF } from "./cartaPorteService";

interface Props {
  cartas: CartaPorte[];
  isMobile: boolean;
  onView: (carta: CartaPorte) => void;
}

export function CartaPorteTable({ cartas, isMobile, onView }: Props) {
  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En Tránsito":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Entregada":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case "Pendiente":
        return <Clock className="h-3 w-3" />;
      case "En Tránsito":
        return <Truck className="h-3 w-3" />;
      case "Entregada":
        return <CheckCircle className="h-3 w-3" />;
      case "Cancelada":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // =====================================
  // 🚀 VISTA MÓVIL (CARDS)
  // =====================================
  if (isMobile) {
    return (
      <div className="divide-y divide-gray-200">
        {cartas.map((carta) => (
          <div key={carta.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-[#1E293B]">{carta.folio}</span>
                  <Badge
                    className={`${getStatusColor(
                      carta.estatus
                    )} flex items-center gap-1 text-xs`}
                  >
                    {getStatusIcon(carta.estatus)}
                    <span>{carta.estatus}</span>
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B]">{carta.fecha}</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#64748B] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-[#1E293B]">{carta.origen}</p>
                  <p className="text-xs text-[#64748B]">→ {carta.destino}</p>
                  <p className="text-xs text-[#64748B]">{carta.distanciaKm} km</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#64748B]" />
                <span className="text-sm text-[#1E293B]">
                  {carta.choferNombre}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#64748B]" />
                <span className="text-sm text-[#1E293B]">
                  {carta.vehiculoPlacas} - {carta.vehiculoModelo}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#64748B]" />
                <span className="text-sm text-[#1E293B]">
                  {carta.facturasVinculadas.length} factura(s) vinculada(s)
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[#1E293B] border-gray-300"
                onClick={() => onView(carta)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </Button>

              {carta.estatus !== "Cancelada" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-[#1E293B] border-gray-300"
                  onClick={() => downloadCartaPortePDF(carta.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // =====================================
  // 🖥️ VISTA DESKTOP (TABLA)
  // =====================================
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folio</TableHead>
            <TableHead>Ruta</TableHead>
            <TableHead className="hidden lg:table-cell">Chofer</TableHead>
            <TableHead className="hidden lg:table-cell">Vehículo</TableHead>
            <TableHead>Facturas</TableHead>
            <TableHead className="hidden lg:table-cell">Fecha</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {cartas.map((carta) => (
            <TableRow key={carta.id}>
              <TableCell className="text-[#1E293B]">{carta.folio}</TableCell>

              <TableCell>
                <div className="text-sm">
                  <p className="text-[#1E293B]">{carta.origen}</p>
                  <p className="text-xs text-[#64748B]">→ {carta.destino}</p>
                </div>
              </TableCell>

              <TableCell className="hidden lg:table-cell text-[#64748B]">
                {carta.choferNombre}
              </TableCell>

              <TableCell className="hidden lg:table-cell text-[#64748B]">
                {carta.vehiculoPlacas}
              </TableCell>

              <TableCell>
                <Badge variant="outline">
                  {carta.facturasVinculadas.length}
                </Badge>
              </TableCell>

              <TableCell className="hidden lg:table-cell text-[#64748B]">
                {carta.fecha}
              </TableCell>

              <TableCell>
                <Badge
                  className={`${getStatusColor(
                    carta.estatus
                  )} flex items-center gap-1 w-fit`}
                >
                  {getStatusIcon(carta.estatus)}
                  <span>{carta.estatus}</span>
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#1E293B] hover:text-[#B02128]"
                    onClick={() => onView(carta)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {carta.estatus !== "Cancelada" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#1E293B] hover:text-[#B02128]"
                      title="Descargar"
                      onClick={() => downloadCartaPortePDF(carta.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
