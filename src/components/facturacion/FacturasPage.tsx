import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";
import { useIsMobile } from "../ui/use-mobile";
import { FacturasTable } from "./FacturasTable";
import { FacturaFormDialog } from "./FacturaFormDialog";
import { api } from "../../lib/api";

export interface Factura {
  id: number;
  folio: string;
  cliente: string;
  rfc: string;
  tipo: string;
  total: number;
  estatus: string;
  fecha: string;
}

export function FacturasPage() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Factura | null>(null);

  // 📡 Cargar facturas desde el backend
  const fetchFacturas = async () => {
    try {
      const res = await fetch(api("/facturas"));
      if (!res.ok) throw new Error("Error al obtener facturas");
      const data = await res.json();
      setFacturas(data);
    } catch (error) {
      toast.error("No se pudieron cargar las facturas");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  // 🔍 Filtrado
  const filtered = facturas.filter(f =>
    f.cliente.toLowerCase().includes(search.toLowerCase()) ||
    f.folio.toLowerCase().includes(search.toLowerCase())
  );

  // 💾 Guardar factura (crear o editar)
  const handleSave = async (nuevo: Factura) => {
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? (api(`/facturas/${editing.id}`)) : (api("/facturas"));

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });

      if (!res.ok) throw new Error("Error al guardar factura");

      toast.success(editing ? "Factura actualizada" : "Factura creada");
      setDialogOpen(false);
      setEditing(null);
      fetchFacturas();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar la factura");
    }
  };

  // 🗑️ Eliminar factura
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch((api(`/facturas/${id}`)), { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Factura eliminada");
      fetchFacturas();
    } catch {
      toast.error("Error al eliminar factura");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Facturación</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Gestión y timbrado de CFDI 4.0
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] h-4 w-4" />
            <Input
              placeholder="Buscar factura..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {hasPermission("facturacion.create") && (
            <Button
              className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1E293B]">Listado de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <FacturasTable
            facturas={filtered}
            onEdit={(f: any) => {
              setEditing(f);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <FacturaFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        editing={editing}
      />
    </div>
  );
}
