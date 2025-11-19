// src/components/Refacciones/Refacciones.tsx
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Refaccion } from "./types";
import { getRefacciones, createRefaccion, updateRefaccion, deleteRefaccion } from "./refaccionesService";
import { RefaccionForm } from "./RefaccionForm";
import { RefaccionView } from "./RefaccionView";

export function RefaccionesPage() {
  const [refacciones, setRefacciones] = useState<Refaccion[]>([]);
  const [selected, setSelected] = useState<Refaccion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await getRefacciones();
      setRefacciones(data);
    } catch {
      toast.error("Error al cargar refacciones");
    }
  }

  const handleCreate = async (data: Partial<Refaccion>) => {
    try {
      if (!data.codigo || !data.descripcion || data.precio === undefined || data.existencia === undefined) {
        toast.error("Todos los campos son obligatorios");
        return;
      }
      if (data.precio < 0 || data.existencia < 0) {
        toast.error("Precio y existencia deben ser números positivos");
        return;
      }
      if (selected) {
        await updateRefaccion(selected.id, data);
        toast.success("Refacción actualizada");
        setSelected(null);
        setIsDialogOpen(false);
        load();
      } else {
      await createRefaccion(data);
      toast.success("Refacción creada");
      setIsDialogOpen(false);
      load();
      }
    } catch {
      toast.error("Error al crear refacción");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRefaccion(id);
      toast.success("Refacción eliminada");
      load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-[#1E293B]">Refacciones</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#B02128] text-white"><Plus className="h-4 w-4 mr-2" />Agregar</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <RefaccionForm initialData={selected} onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader><CardTitle>Inventario</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748B] border-b">
                <th className="py-2">Código</th>
                <th>Descripción</th>
                <th>Existencia</th>
                <th>Precio</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {refacciones
                .filter(r => (r.descripcion ?? "").toLowerCase().includes(search.toLowerCase()) || (r.codigo ?? "").toLowerCase().includes(search.toLowerCase()))
                .map(r => (
                <tr key={r.id} className="border-b">
                  <td>{r.codigo}</td>
                  <td>{r.descripcion}</td>
                  <td>{r.existencia}</td>
                  <td>${r.precio.toLocaleString()}</td>
                  <td className="text-right flex justify-end gap-2 py-2">
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(r); setIsViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelected(r)
                        setIsDialogOpen(true)
                      }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      handleDelete(r.id);
                    }}><Trash2 className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogContent className="bg-white">
                        <p>¿Eliminar {r.descripcion}?</p>
                        <div className="flex justify-end gap-2 mt-3">
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 text-white" onClick={() => handleDelete(r.id)}>Eliminar</AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          {selected && <RefaccionView refaccion={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
