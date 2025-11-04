import { Eye, RefreshCw, Edit, Trash2, User, Calendar, DollarSign, Wrench } from "lucide-react";
import type { JSX } from "react";
import { Button } from "./../ui/button";
import { Badge } from "./../ui/badge";
import { Servicio } from "./types";

interface Props {
  servicio: Servicio;
  showAllActions?: boolean;
  onView: (s: Servicio) => void;
  onEdit?: (s: Servicio) => void;
  onDelete?: (s: Servicio) => void;
  onStatusChange?: (s: Servicio) => void;
  getStatusColor: (estatus: string) => string;
  getStatusIcon: (estatus: string) => JSX.Element | null;
}

export function ServicioCard({
  servicio,
  showAllActions = true,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  getStatusColor,
  getStatusIcon,
}: Props) {
  return (
    <div className="p-4 active:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Wrench className="h-5 w-5 text-[#B02128]" />
            <div className="flex-1">
              <h3 className="text-[#1E293B] mb-1">{servicio.tipo}</h3>
              <p className="text-xs text-[#64748B] mb-2">{servicio.cliente}</p>
              <Badge className={`${getStatusColor(servicio.estatus)} flex items-center gap-1 w-fit text-xs`}>
                {getStatusIcon(servicio.estatus)}
                <span>{servicio.estatus}</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5 mt-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <User className="h-3.5 w-3.5" />
              <span>{servicio.tecnico}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{servicio.fecha}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-[#B02128]" />
              <span className="text-[#B02128]">${servicio.costo.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {showAllActions && (
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" onClick={() => onView(servicio)}>
              <Eye className="h-4 w-4" />
            </Button>
            {onStatusChange && (
              <Button variant="ghost" size="icon" onClick={() => onStatusChange(servicio)}>
                <RefreshCw className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(servicio)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(servicio)}>
                <Trash2 className="h-4 w-4 text-[#64748B]" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
