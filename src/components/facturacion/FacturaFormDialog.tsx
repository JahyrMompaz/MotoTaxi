import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Factura } from "./FacturasPage";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (factura: Factura) => void;
  editing: Factura | null;
}

export function FacturaFormDialog({ open, onOpenChange, onSave, editing }: Props) {
  const [formData, setFormData] = useState<Factura>({
    id: 0,
    folio: "",
    cliente: "",
    rfc: "",
    tipo: "",
    total: 0,
    estatus: "Pendiente",
    fecha: "",
  });

  useEffect(() => {
    if (editing) setFormData(editing);
    else
      setFormData({
        id: 0,
        folio: "",
        cliente: "",
        rfc: "",
        tipo: "",
        total: 0,
        estatus: "Pendiente",
        fecha: "",
      });
  }, [editing]);

  const handleSubmit = () => {
    if (!formData.cliente || !formData.rfc || !formData.tipo) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Factura" : "Nueva Factura"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-3">
          <div>
            <Label>Cliente *</Label>
            <Input
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              placeholder="Nombre del cliente"
            />
          </div>
          <div>
            <Label>RFC *</Label>
            <Input
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
              placeholder="RFC"
              maxLength={13}
            />
          </div>
          <div>
            <Label>Tipo *</Label>
            <Input
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              placeholder="Mototaxi, Refacción o Servicio"
            />
          </div>
          <div>
            <Label>Total</Label>
            <Input
              type="number"
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white" onClick={handleSubmit}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
