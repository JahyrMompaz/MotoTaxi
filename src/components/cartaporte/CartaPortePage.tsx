import { useState, useEffect } from "react";
import { Plus, Eye, Download, Truck, MapPin, User, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableHead, TableRow, TableCell, TableHeader } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { CartaPorteView } from "./CartaPorteView";
import { downloadCartaPortePDF } from "./cartaPorteService";

import { useAuth } from "../AuthContext";
import { useIsMobile } from "../ui/use-mobile";

import { getCartasPorte, createCartaPorte } from "./cartaPorteService";
import { getFacturasTimbradas } from "../facturacion/FacturaService";

import { CartaPorte, CartaPorteFormData , CartaPortePayload, FacturaTimbrada } from "./types";

// ------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------
export function CartaPortePage() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();

  const [cartasPorte, setCartasPorte] = useState<CartaPorte[]>([]);
  const [facturasDisponibles, setFacturasDisponibles] = useState<any[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [selectedCarta, setSelectedCarta] = useState<CartaPorte | null>(null);

  const [formData, setFormData] = useState<CartaPorteFormData>({
    origen: "",
    destino: "",
    choferNombre: "",
    choferRFC: "",
    choferLicencia: "",
    vehiculoPlacas: "",
    vehiculoModelo: "",
    vehiculoAnio: "",
    vehiculoConfiguracion: "",
    fechaSalida: "",
    horaSalida: "",
    distanciaKm: "",
    facturasSeleccionadas: [],
    observaciones: "",
  });


  
  // ------------------------------------------------------------
  // Cargar información real
  // ------------------------------------------------------------
  const loadCartas = async () => {
    try {
      const data = await getCartasPorte();
      setCartasPorte(data); // paginación Laravel
    } catch (error) {
      console.error("Error al cargar cartas porte:", error);
    }
  };

  const loadFacturas = async () => {
    try {
      const data = await getFacturasTimbradas();
      setFacturasDisponibles(data.data);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
    }
  };

  useEffect(() => {
    loadCartas();
    loadFacturas();
  }, []);

  // ------------------------------------------------------------
  // Reset form
  // ------------------------------------------------------------
  const resetForm = () => {
    setFormData({
      origen: "",
      destino: "",
      choferNombre: "",
      choferRFC: "",
      choferLicencia: "",
      vehiculoPlacas: "",
      vehiculoModelo: "",
      vehiculoAnio: "",
      vehiculoConfiguracion: "",
      fechaSalida: "",
      horaSalida: "",
      distanciaKm: "",
      facturasSeleccionadas: [],
      observaciones: "",
    });
  };

  // ------------------------------------------------------------
  // Crear Carta Porte real
  // ------------------------------------------------------------
  const handleCreate = async () => {
    const payload = {
      origen: formData.origen,
      destino: formData.destino,

      chofer_nombre: formData.choferNombre,
      chofer_rfc: formData.choferRFC,
      chofer_licencia: formData.choferLicencia,

      vehiculo_placas: formData.vehiculoPlacas,
      vehiculo_modelo: formData.vehiculoModelo,
      vehiculo_anio: formData.vehiculoAnio,
      vehiculo_configuracion: formData.vehiculoConfiguracion,

      fecha_salida: formData.fechaSalida,
      hora_salida: formData.horaSalida,

      distancia_km: Number(formData.distanciaKm),

      observaciones: formData.observaciones,

      estatus: "Pendiente",

      factura_ids: formData.facturasSeleccionadas.map((id) => Number(id)),
    };

    try {
      await createCartaPorte(payload);
      await loadCartas();
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error al crear Carta Porte");
    }
  };

  // ------------------------------------------------------------
  // Utilidades UI
  // ------------------------------------------------------------
  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case "Pendiente":
        return "bg-yellow-200 text-yellow-800";
      case "En Transito":
        return "bg-blue-200 text-blue-800";
      case "Entregada":
        return "bg-green-200 text-green-800";
      case "Cancelada":
        return "bg-red-200 text-red-800";
    }
    return "bg-gray-200 text-gray-800";
  };

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case "Pendiente":
        return <Clock className="h-3 w-3" />;
      case "En Transito":
        return <Truck className="h-3 w-3" />;
      case "Entregada":
        return <CheckCircle className="h-3 w-3" />;
      case "Cancelada":
        return <XCircle className="h-3 w-3" />;
    }
    return null;
  };

  // ------------------------------------------------------------
  // Render principal
  // ------------------------------------------------------------
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl text-[#1E293B]">Carta Porte</h1>
          <p className="text-[#64748B] text-sm">Gestión real de complementos Carta Porte CFDI 4.0</p>
        </div>

        {hasPermission("facturacion.create") && (
          <Button className="bg-[#B02128] text-white" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Carta Porte
          </Button>
        )}
      </div>

      {/* Tabla principal */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Cartas Porte Registradas</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Chofer</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cartasPorte.map((carta) => (
                <TableRow key={carta.id}>
                  <TableCell>{carta.folio}</TableCell>
                  <TableCell>{carta.origen}</TableCell>
                  <TableCell>{carta.destino}</TableCell>
                  <TableCell>{carta.choferNombre}</TableCell>
                  <TableCell>{carta.vehiculoPlacas}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(carta.estatus)} flex items-center gap-1`}>
                      {getStatusIcon(carta.estatus)}
                      {carta.estatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedCarta(carta);
                        setIsViewOpen(true);
                      }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => downloadCartaPortePDF(carta.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------
          FORMULARIO (DIALOG DESKTOP / SHEET MOBILE)
      ------------------------------------------------------------------ */}
      {isMobile ? (
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetContent side="bottom" className="bg-white h-[90vh] overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle>Nueva Carta Porte</SheetTitle>
              <SheetDescription>Captura los datos reales</SheetDescription>
            </SheetHeader>

            {/* FORM */}
            <FormContent
              formData={formData}
              setFormData={setFormData}
              facturasDisponibles={facturasDisponibles}
            />

            <SheetFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button className="bg-[#B02128] text-white" onClick={handleCreate}>
                Crear
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">

            <DialogHeader>
              <DialogTitle>Nueva Carta Porte</DialogTitle>
            </DialogHeader>

            <FormContent
              formData={formData}
              setFormData={setFormData}
              facturasDisponibles={facturasDisponibles}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button className="bg-[#B02128] text-white" onClick={handleCreate}>
                Crear
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------------
          DIALOG DE VISTA DETALLADA (PDF STYLE)
      ------------------------------------------------------------------ */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[900px] bg-white max-h-[90vh] overflow-y-auto">

          {selectedCarta && (
  <CartaPorteView
    carta={selectedCarta}
    getStatusColor={getStatusColor}
    getStatusIcon={getStatusIcon}
  />
)}


          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormContentProps {
  formData: CartaPorteFormData;
  setFormData: React.Dispatch<React.SetStateAction<CartaPorteFormData>>;
  facturasDisponibles: FacturaTimbrada[];
}

// =====================================================================
// FORM CONTENT — componente separado para no duplicar código
// =====================================================================
function FormContent({ formData, setFormData, facturasDisponibles }: FormContentProps) {
  return (
    <div className="space-y-4">

      {/* ORIGEN / DESTINO */}
      <div>
        <h3 className="text-sm font-semibold text-[#1E293B]">Ruta</h3>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Label>Origen *</Label>
            <Input
              value={formData.origen}
              onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
            />
          </div>

          <div>
            <Label>Destino *</Label>
            <Input
              value={formData.destino}
              onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* CHOFER */}
      <div>
        <h3 className="text-sm font-semibold text-[#1E293B]">Chofer</h3>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Label>Nombre *</Label>
            <Input
              value={formData.choferNombre}
              onChange={(e) => setFormData({ ...formData, choferNombre: e.target.value })}
            />
          </div>

          <div>
            <Label>RFC</Label>
            <Input
              value={formData.choferRFC}
              onChange={(e) => setFormData({ ...formData, choferRFC: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-3">
          <Label>Licencia *</Label>
          <Input
            value={formData.choferLicencia}
            onChange={(e) => setFormData({ ...formData, choferLicencia: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      {/* VEHICULO */}
      <div>
        <h3 className="text-sm font-semibold text-[#1E293B]">Vehículo</h3>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Label>Placas *</Label>
            <Input
              value={formData.vehiculoPlacas}
              onChange={(e) => setFormData({ ...formData, vehiculoPlacas: e.target.value })}
            />
          </div>

          <div>
            <Label>Modelo *</Label>
            <Input
              value={formData.vehiculoModelo}
              onChange={(e) => setFormData({ ...formData, vehiculoModelo: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Label>Año</Label>
            <Input
              value={formData.vehiculoAnio}
              onChange={(e) => setFormData({ ...formData, vehiculoAnio: e.target.value })}
            />
          </div>
          <div>
            <Label>Configuración</Label>
            <Input
              value={formData.vehiculoConfiguracion}
              onChange={(e) => setFormData({ ...formData, vehiculoConfiguracion: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* FECHA / HORA */}
      <div>
        <h3 className="text-sm font-semibold text-[#1E293B]">Fecha y Hora</h3>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <Label>Fecha *</Label>
            <Input
              type="date"
              value={formData.fechaSalida}
              onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
            />
          </div>

          <div>
            <Label>Hora</Label>
            <Input
              type="time"
              value={formData.horaSalida}
              onChange={(e) => setFormData({ ...formData, horaSalida: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* DISTANCIA */}
      <div>
        <Label>Distancia (km) *</Label>
        <Input
          type="number"
          value={formData.distanciaKm}
          onChange={(e) => setFormData({ ...formData, distanciaKm: e.target.value })}
        />
      </div>

      <Separator />

      {/* FACTURAS */}
      <div>
        <h3 className="text-sm font-semibold text-[#1E293B]">Facturas Timbradas *</h3>
        <div className="border rounded p-3 max-h-56 overflow-y-auto">

          {facturasDisponibles.map((factura: any) => (
            <div key={factura.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.facturasSeleccionadas.includes(factura.id)}
                  onCheckedChange={() => {
                    setFormData({
                      ...formData,
                      facturasSeleccionadas: formData.facturasSeleccionadas.includes(factura.id)
                        ? formData.facturasSeleccionadas.filter((x: any) => x !== factura.id)
                        : [...formData.facturasSeleccionadas, factura.id],
                    });
                  }}
                />
                <Label className="cursor-pointer">
                  {factura.folio} — {factura.cliente}
                </Label>
              </div>

              <span className="text-sm text-[#1E293B]">
                ${factura.total.toLocaleString()}
              </span>
            </div>
          ))}

        </div>
      </div>

      <Separator />

      {/* OBSERVACIONES */}
      <div>
        <Label>Observaciones</Label>
        <Textarea
          rows={3}
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
        />
      </div>

    </div>
  );
}
