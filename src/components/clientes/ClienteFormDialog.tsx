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
    nombre: "",
    email: "",
    telefono: "",
    created_at: "",
    codigo_postal: "",
  });

  useEffect(() => {
    if (editing) setFormData(editing);
    else setFormData({ id: 0, rfc: "", nombre: "", email: "", telefono: "", created_at: "", codigo_postal: "" });
  }, [editing]);

  const handleSubmit = () => {
    if (!formData.rfc || !formData.nombre || !formData.email || !formData.codigo_postal) {
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
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Empresa S.A. de C.V."
            />
          </div>
          <div>
            <Label>Correo *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          <div>
            <Label>C.P. de domicilio fiscal</Label>
            <Input
              value={formData.codigo_postal}
              onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                placeholder="00417"
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
