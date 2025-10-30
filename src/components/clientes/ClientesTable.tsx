import { Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useAuth } from "../AuthContext";
import type { Cliente } from "./ClientesPage";

interface Props {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export function ClientesTable({ clientes, onEdit, onDelete }: Props) {
  const { hasPermission } = useAuth();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RFC</TableHead>
            <TableHead>Razón Social</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Fecha Alta</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.rfc}</TableCell>
              <TableCell>{c.razonSocial}</TableCell>
              <TableCell>{c.correo}</TableCell>
              <TableCell>{c.telefono}</TableCell>
              <TableCell>{c.fechaAlta}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {hasPermission("clientes.edit") && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(c)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {hasPermission("clientes.delete") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => onDelete(c.id)}
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
