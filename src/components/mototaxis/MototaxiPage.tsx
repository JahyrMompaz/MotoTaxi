import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Mototaxi, getMototaxis, createMototaxi, updateMototaxi, deleteMototaxi } from "./mototaxiService";
import { MototaxiForm } from "./MototaxiForm";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from "../ui/alert-dialog";

export function MototaxiPage() {
  const [mototaxis, setMototaxis] = useState<Mototaxi[]>([]);
  const [selectedMoto, setSelectedMoto] = useState<Mototaxi | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadMototaxis();
  }, []);

  const loadMototaxis = async () => {
    try {
      const data = await getMototaxis();
      setMototaxis(data);
    } catch (err) {
      toast.error("Error al cargar mototaxis");
    }
  };

  const handleCreate = async (data: Partial<Mototaxi>) => {
    try {
      if (!data.modelo || !data.serie || !data.precio || !data.imagen) {
        toast.error("Por favor completa todos los campos");
        return;
      }
      if (selectedMoto) {
        await updateMototaxi(selectedMoto.id, data);
        toast.success("Mototaxi actualizada");
        setSelectedMoto(null);
        setIsDialogOpen(false);
        loadMototaxis();
      } else {
      await createMototaxi(data);
      toast.success("Mototaxi registrada");
      setIsDialogOpen(false);
      loadMototaxis();
      }
    } catch {
      toast.error("Error al crear mototaxi");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMototaxi(id);
      toast.success("Mototaxi eliminada");
      loadMototaxis();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-[#1E293B]">Mototaxis</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#B02128] text-white">
              <Plus className="h-4 w-4 mr-2" /> Nueva Unidad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <MototaxiForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mototaxis.map((moto) => (
          <div key={moto.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <img src={moto.imagen} alt={moto.modelo} className="h-40 w-full object-cover rounded" />
            <h3 className="text-[#1E293B] mt-2">{moto.modelo}</h3>
            <p className="text-sm text-[#64748B]">Serie: {moto.serie}</p>
            <p className="text-[#B02128] text-lg">${moto.precio.toLocaleString()}</p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
              <AlertDialog>
                <AlertDialogContent className="bg-white">
                  <p>¿Eliminar {moto.modelo}?</p>
                  <div className="flex justify-end gap-2 mt-3">
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 text-white"
                      onClick={() => handleDelete(moto.id)}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
