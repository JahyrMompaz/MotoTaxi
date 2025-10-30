import { Edit, Trash2, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useAuth } from "../AuthContext";
import type { Factura } from "./FacturasPage";
import { Badge } from "../ui/badge";

interface Props {
  facturas: Factura[];
  onEdit: (factura: Factura) => void;
  onDelete: (id: number) => void;
}

export function FacturasTable({ facturas, onEdit, onDelete }: Props) {
  const { hasPermission } = useAuth();

  const getStatusBadge = (estatus: string) => {
    const colors: Record<string, string> = {
      Timbrada: "bg-green-600 text-white",
      Cancelada: "bg-red-600 text-white",
      Pendiente: "bg-yellow-600 text-white",
    };
    const icons: Record<string, JSX.Element> = {
      Timbrada: <CheckCircle className="h-3 w-3" />,
      Cancelada: <XCircle className="h-3 w-3" />,
      Pendiente: <FileText className="h-3 w-3" />,
    };
    return (
      <Badge className={`${colors[estatus] || "bg-gray-500"} flex items-center gap-1`}>
        {icons[estatus] || null}
        {estatus}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folio</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>RFC</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturas.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.folio}</TableCell>
              <TableCell>{f.cliente}</TableCell>
              <TableCell>{f.rfc}</TableCell>
              <TableCell>{f.tipo}</TableCell>
              <TableCell>${f.total.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(f.estatus)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {hasPermission("facturacion.edit") && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(f)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {hasPermission("facturacion.delete") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => onDelete(f.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
