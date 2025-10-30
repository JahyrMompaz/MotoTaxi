import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Cliente } from "./ClientesPage";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (cliente: Cliente) => void;
  editing: Cliente | null;
}

export function ClienteFormDialog({ open, onOpenChange, onSave, editing }: Props) {
  const [formData, setFormData] = useState<Cliente>({
    id: 0,
    rfc: "",
    razonSocial: "",
    correo: "",
    telefono: "",
    fechaAlta: "",
  });

  useEffect(() => {
    if (editing) setFormData(editing);
    else setFormData({ id: 0, rfc: "", razonSocial: "", correo: "", telefono: "", fechaAlta: "" });
  }, [editing]);

  const handleSubmit = () => {
    if (!formData.rfc || !formData.razonSocial || !formData.correo) {
    toast.error("Por favor, complete todos los campos obligatorios.");
        return
        };
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-3">
          <div>
            <Label>RFC *</Label>
            <Input
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
              maxLength={13}
              placeholder="ABC1234567890"
            />
          </div>
          <div>
            <Label>Razón Social *</Label>
            <Input
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              placeholder="Se llenara automaticamente al consultar RFC"
            />
          </div>
          <div>
            <Label>Correo *</Label>
            <Input
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              placeholder="correo@example.com"
            />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="10 dígitos sin espacios ni guiones"
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
