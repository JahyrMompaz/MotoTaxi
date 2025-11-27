import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../AuthContext";
import { useIsMobile } from "../ui/use-mobile";
import { toast } from "sonner";
import { ClientesTable } from "./ClientesTable";
import { ClienteFormDialog } from "./ClienteFormDialog";
import { api } from "../../lib/api";

export interface Cliente {
  id: number;
  rfc: string;
  nombre: string;
  email: string;
  telefono: string;
  created_at: string;
  codigo_postal: string;
  regimen_fiscal?: string;
  uso_cfdi_default?: string;
  direccion?: string;
}

export function ClientesPage() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);

  // 🔍 Filtrado
  const filtered = clientes.filter(c =>
    (c.nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.rfc ?? "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await fetch(api("/clientes"), { 
        method: "GET",
        credentials: "include", 
        headers: { "Accept" : "application/json" }
      });
      if (!res.ok) throw new Error("Error al obtener clientes");
      const data = await res.json();
      setClientes(data.data ?? data);
    } catch (error) {
      toast.error("Error al cargar los clientes");
    }
  };
  // ➕ Guardar (Agregar o Editar)
  const handleSave = async (nuevo: Cliente) => {
    try {
        let res;
        if (editing) {
            res = await fetch(api(`/clientes/${nuevo.id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                credentials: "include",
                body: JSON.stringify(nuevo),
            });
        } else {
            res = await fetch(api("/clientes"), {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                credentials: "include",
                body: JSON.stringify(nuevo),
            });
        }
        if (!res.ok) throw new Error("Error al guardar cliente");
        
        toast.success(`Cliente ${editing ? "actualizado" : "agregado"} con éxito`);
        setDialogOpen(false);
        setEditing(null);
        fetchClientes();
    } catch (error) {
        toast.error("Error al guardar el cliente");
    }
  };

  // 🗑️ Eliminar
  const handleDelete = async (id: number) => {
    try {
        const res = await fetch(api(`/clientes/${id}`), { 
          method: "DELETE",
          credentials: "include",
          headers: { "Accept": "application/json" }
        });
        if (!res.ok) throw new Error("Error al eliminar cliente");
        toast.success("Cliente eliminado con éxito");
        fetchClientes();
    } catch (error) {
        toast.error("Error al eliminar el cliente");
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔹 Header y buscador */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Clientes</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Gestión de clientes y datos fiscales</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] h-4 w-4" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {hasPermission("clientes.create") && (
            <Button
              className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          )}
        </div>
      </div>

      {/* 🔹 Tabla */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1E293B]">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientesTable
            clientes={filtered}
            onEdit={(c: any) => {
              setEditing(c);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* 🔹 Dialogo Add/Edit */}
      <ClienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        editing={editing}
      />
    </div>
  );
}
