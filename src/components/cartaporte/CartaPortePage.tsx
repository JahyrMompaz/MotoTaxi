import { useState, useEffect, useMemo } from "react";
import { Plus, Eye, Download, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableHead, TableRow, TableCell, TableHeader } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";

// Componentes propios
import { CartaPorteForm } from "./CartaPorteForm";
import { CartaPorteView } from "./CartaPorteView";
import { 
  getCartasPorte, 
  createCartaPorte, 
  updateCartaPorte, 
  downloadCartaPortePDF 
} from "./cartaPorteService";
import { FacturaService, getFacturasTimbradas } from "../facturacion/FacturaService"; // Importamos servicio de facturas
import { toast } from "sonner";

import { useAuth } from "../AuthContext";
import { useIsMobile } from "../ui/use-mobile";

// Tipos
import { CartaPorte, CartaPorteFormData, CartaPortePayload, FacturaTimbrada, Cliente } from "./types";

export default function CartaPortePage() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();

  // --- ESTADOS DE DATOS ---
  const [cartasPorte, setCartasPorte] = useState<CartaPorte[]>([]);
  
  // Catálogos para el formulario
  const [clientes, setClientes] = useState<Cliente[]>([]); 
  const [allFacturas, setAllFacturas] = useState<FacturaTimbrada[]>([]); // Todas las facturas disponibles

  // --- ESTADOS DE UI ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCarta, setSelectedCarta] = useState<CartaPorte | null>(null);

  // --- FORMULARIO ---
  const [formData, setFormData] = useState<CartaPorteFormData>({
    cliente_id: "", // Se llena desde el Select
    
    // Direcciones
    origen_nombre: "", origen_cp: "", origen_estado_clave: "", origen_municipio: "",
    origen_calle: "", origen_numero_ext: "", origen_colonia: "", origen_localidad: "",
    
    destino_nombre: "", destino_cp: "", destino_estado_clave: "", destino_municipio: "",
    destino_calle: "", destino_numero_ext: "", destino_colonia: "", destino_localidad: "",
    
    // Transporte
    choferNombre: "", choferRFC: "", choferLicencia: "",
    vehiculoPlacas: "", vehiculoModelo: "", vehiculoAnio: "", vehiculoConfiguracion: "",
    permisoSCT: "TPAF01", numPermisoSCT: "", aseguraNombre: "", polizaNumero: "",
    
    // Viaje
    fechaSalida: "", horaSalida: "00:00", fechaLlegada: "", distanciaKm: "", pesoTotal: "",
    
    // Relaciones
    facturasSeleccionadas: [], mercancias: [], observaciones: "",
  });

  // 1. CARGA DE DATOS INICIALES
  const loadData = async () => {
    try {
      // A. Cartas Porte (Historial)
      const dataCartas = await getCartasPorte();
      setCartasPorte(dataCartas);

      // B. Clientes (Para el Select)
      const resClientes = await FacturaService.clientes();
      setClientes((resClientes as any).data || []);

      // C. Facturas Timbradas (Para vincular)
      const resFacturas = await getFacturasTimbradas();
      const rawFacturas = (resFacturas as any).data || [];
      
      // Mapeamos para asegurar que tenemos el cliente_id
      const facturasMapeadas: FacturaTimbrada[] = rawFacturas.map((f: any) => ({
        id: f.id,
        folio: f.folio,
        total: f.total,
        cliente: typeof f.cliente === 'object' ? f.cliente?.nombre : f.cliente,
        cliente_id: typeof f.cliente === 'object' ? f.cliente?.id : 0 // Guardamos ID para filtrar
      }));
      
      setAllFacturas(facturasMapeadas);

    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos iniciales");
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. FILTRADO DINÁMICO DE FACTURAS
  // Solo mostramos las facturas del cliente seleccionado en el formulario
  const facturasFiltradas = useMemo(() => {
    if (!formData.cliente_id) return [];
    return allFacturas.filter(f => f.cliente_id === Number(formData.cliente_id));
  }, [formData.cliente_id, allFacturas]);

  // 3. CREAR CARTA PORTE
  const handleCreate = async () => {
    // Validaciones
    if (!formData.cliente_id) return toast.error("Debes seleccionar un cliente");
    if (!formData.origen_cp || !formData.destino_cp) return toast.error("Códigos Postales obligatorios");
    if (formData.mercancias.length === 0) return toast.error("Agrega mercancías");
    if (!formData.choferNombre) return toast.error("Chofer obligatorio");

    // Construcción del Payload
    const payload: CartaPortePayload = {
      ...formData,
      tipo_cfdi: 'T',
      
      // Usamos el cliente real seleccionado
      cliente_id: Number(formData.cliente_id), 
      
      // Mapeos de nombres y tipos
      distancia_total: Number(formData.distanciaKm) || 0,
      peso_total: Number(formData.pesoTotal) || 0,
      num_total_mercancias: formData.mercancias.length,
      
      factura_ids: formData.facturasSeleccionadas.map(id => Number(id)),
      hora_salida: formData.horaSalida || undefined,
      observaciones: formData.observaciones || "",
      estatus: "Pendiente",

      unidad_peso: 'KGM',

      // Asegurar campos opcionales del transporte
      anio_modelo_vm: Number(formData.vehiculoAnio) || 2024,
      operador_rfc: formData.choferRFC,
      operador_nombre: formData.choferNombre,
      operador_licencia: formData.choferLicencia,
      asegura_nombre: formData.aseguraNombre,
      poliza_numero: formData.polizaNumero,
      placa_vm: formData.vehiculoPlacas,
      permiso_sct: formData.permisoSCT,
      num_permiso_sct: formData.numPermisoSCT,
      config_vehicular: formData.vehiculoConfiguracion
    };

    try {
      await createCartaPorte(payload);
      toast.success("Carta Porte timbrada exitosamente");
      await loadData();
      setIsCreateOpen(false);
      // resetForm(); // Opcional: limpiar form
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al crear");
    }
  };

  const handleCambiarEstatus = async (id: number, nuevoEstatus: string) => {
    if (!confirm(`¿Cambiar estatus a "${nuevoEstatus}"?`)) return;
    try {
      await updateCartaPorte(id, { estatus: nuevoEstatus });
      toast.success(`Estatus actualizado`);
      await loadData();
      if (selectedCarta && selectedCarta.id === id) {
        setSelectedCarta({ ...selectedCarta, estatus: nuevoEstatus as any });
      }
    } catch { toast.error("Error al actualizar estatus"); }
  };

  // Helpers de UI
  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case "Pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "En Transito": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Entregada": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelada": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case "Pendiente": return <Clock className="h-3 w-3" />;
      case "En Transito": return <Truck className="h-3 w-3" />;
      case "Entregada": return <CheckCircle className="h-3 w-3" />;
      case "Cancelada": return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-24' : ''}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Carta Porte</h1>
          <p className="text-[#64748B] text-sm">Gestión de traslados CFDI 4.0</p>
        </div>
        {hasPermission("facturacion.create") && (
          <Button className="bg-[#B02128] text-white" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Carta Porte
          </Button>
        )}
      </div>

      {/* TABLA HISTORIAL */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Historial de Traslados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead className="hidden md:table-cell">Chofer</TableHead>
                <TableHead className="hidden md:table-cell">Vehículo</TableHead>
                <TableHead>Estatus</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartasPorte.map((carta) => (
                <TableRow key={carta.id}>
                  <TableCell className="font-medium text-[#1E293B]">{carta.folio}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold">{carta.origen}</span>
                      <span className="text-xs text-gray-500">➜ {carta.destino}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600">{carta.choferNombre}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-600">{carta.vehiculoPlacas}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(carta.estatus)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(carta.estatus)} {carta.estatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedCarta(carta); setIsViewOpen(true); }}>
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      {carta.estatus !== 'Cancelada' && (
                        <Button variant="ghost" size="icon" onClick={() => downloadCartaPortePDF(carta.id)}>
                          <Download className="h-4 w-4 text-[#B02128]" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {cartasPorte.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No hay registros</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL CREACIÓN */}
      {isMobile ? (
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetContent side="bottom" className="h-[95vh] overflow-y-auto bg-white">
            <SheetHeader>
              <SheetTitle>Nueva Carta Porte</SheetTitle>
              <SheetDescription>Completa el formulario para timbrar</SheetDescription>
            </SheetHeader>
            <CartaPorteForm 
              formData={formData} setFormData={setFormData} isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} onSubmit={handleCreate} 
              facturasDisponibles={facturasFiltradas} // <--- Pasamos las filtradas
              clientes={clientes} // <--- Pasamos el catálogo
              isMobile={true} 
            />
          </SheetContent>
        </Sheet>
      ) : (
        // En desktop el componente ya trae el Dialog wrapper
        <CartaPorteForm 
          formData={formData} setFormData={setFormData} isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} onSubmit={handleCreate} 
          facturasDisponibles={facturasFiltradas} // <--- Pasamos las filtradas
          clientes={clientes} // <--- Pasamos el catálogo
          isMobile={false} 
        />
      )}

      {/* MODAL DETALLE */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-[900px] bg-white max-h-[90vh] overflow-y-auto">
          {selectedCarta && <CartaPorteView carta={selectedCarta} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />}
          <DialogFooter className="gap-2">
             {selectedCarta?.estatus === 'Pendiente' && <Button className="bg-blue-600 text-white" onClick={() => handleCambiarEstatus(selectedCarta!.id, 'En Transito')}><Truck className="h-4 w-4 mr-2"/> En Tránsito</Button>}
             {selectedCarta?.estatus === 'En Transito' && <Button className="bg-green-600 text-white" onClick={() => handleCambiarEstatus(selectedCarta!.id, 'Entregada')}><CheckCircle className="h-4 w-4 mr-2"/> Entregar</Button>}
             {selectedCarta?.estatus !== 'Cancelada' && <Button variant="destructive" onClick={() => handleCambiarEstatus(selectedCarta!.id, 'Cancelada')}><XCircle className="h-4 w-4 mr-2"/> Cancelar</Button>}
             <Button variant="outline" onClick={() => setIsViewOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}