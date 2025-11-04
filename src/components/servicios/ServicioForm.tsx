import { Input } from "./../ui/input";
import { Label } from "./../ui/label";
import { Textarea } from "./../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../ui/select";
import { useIsMobile } from "./../ui/use-mobile";

interface ServicioFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ServicioForm({ formData, setFormData }: ServicioFormProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="grid gap-2">
        <Label>Cliente *</Label>
        <Select value={formData.cliente} onValueChange={(v: any) => setFormData({ ...formData, cliente: v })}>
          <SelectTrigger className={isMobile ? "h-11" : ""}>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Transportes del Norte">Transportes del Norte</SelectItem>
            <SelectItem value="Logística Express">Logística Express</SelectItem>
            <SelectItem value="Mototaxis del Sur">Mototaxis del Sur</SelectItem>
            <SelectItem value="Comercializadora Global">Comercializadora Global</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Tipo de Servicio *</Label>
        <Select value={formData.tipo} onValueChange={(v: any) => setFormData({ ...formData, tipo: v })}>
          <SelectTrigger className={isMobile ? "h-11" : ""}>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mantenimiento Preventivo">Mantenimiento Preventivo</SelectItem>
            <SelectItem value="Mantenimiento Correctivo">Mantenimiento Correctivo</SelectItem>
            <SelectItem value="Reparación Motor">Reparación Motor</SelectItem>
            <SelectItem value="Servicio Eléctrico">Servicio Eléctrico</SelectItem>
            <SelectItem value="Cambio de Llantas">Cambio de Llantas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Técnico Asignado *</Label>
        <Select value={formData.tecnico} onValueChange={(v: any) => setFormData({ ...formData, tecnico: v })}>
          <SelectTrigger className={isMobile ? "h-11" : ""}>
            <SelectValue placeholder="Seleccionar técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
            <SelectItem value="Carlos López">Carlos López</SelectItem>
            <SelectItem value="Ana Martínez">Ana Martínez</SelectItem>
            <SelectItem value="Luis García">Luis García</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Descripción del Servicio</Label>
        <Textarea
          placeholder="Detalles del servicio a realizar..."
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Fecha *</Label>
          <Input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Estatus</Label>
          <Select value={formData.estatus} onValueChange={(v : any) => setFormData({ ...formData, estatus: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En Proceso">En Proceso</SelectItem>
              <SelectItem value="Completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Costo Estimado</Label>
        <Input
          id="costo"
          type="number"
          placeholder="0.00"
          value={formData.costo ?? 0}
          onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Refacciones Utilizadas</Label>
        <Textarea
          placeholder="Lista de refacciones..."
          value={formData.refacciones}
          onChange={(e) => setFormData({ ...formData, refacciones: e.target.value })}
          rows={2}
        />
      </div>
    </>
  );
}
