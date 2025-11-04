import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "./../ui/button";
import { Input } from "./../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../ui/table";
import { Badge } from "./../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./../ui/alert-dialog";
import { useAuth } from "./../AuthContext";
import { useIsMobile } from "./../ui/use-mobile";
import { toast } from "sonner";

import { Servicio } from "./types";
import { ServicioCard } from "./ServicioCard";
import { ServicioForm } from "./ServicioForm";
import {
  getServicios,
  createServicio,
  updateServicio,
  deleteServicio,
  updateEstatus,
} from "./serviciosService";

export function ServicioPage() {
  const { hasPermission } = useAuth();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Pendiente");

  const [formData, setFormData] = useState<Partial<Servicio>>({
    cliente: "",
    tipo: "",
    tecnico: "",
    fecha: "",
    estatus: "Pendiente",
    costo: 0,
    descripcion: "",
    refacciones: "",
  });

  // ─── API ───────────────────────────────────────────────────────────────
  const loadServicios = async () => {
    try {
      const data = await getServicios();
      setServicios(data);
    } catch {
      toast.error("Error al cargar servicios");
    }
  };

  const handleAdd = async () => {
    try {
      if (!formData.cliente || !formData.tipo || !formData.tecnico || !formData.fecha) {
        toast.error("Por favor completa los campos obligatorios");
        return;
      }
      if (selectedServicio) {
        await updateServicio(selectedServicio.id, formData);
        toast.success("Servicio actualizado exitosamente");
        setIsAddDialogOpen(false);
        loadServicios();
        return;
      }else {
      await createServicio(formData);
      toast.success("Servicio registrado exitosamente");
      setIsAddDialogOpen(false);
      loadServicios();
      }
    } catch {
      toast.error("Error al registrar servicio");
    }
  };

  const handleEdit = async () => {
    if (!selectedServicio) return;
    try {
      await updateServicio(selectedServicio.id, formData);
      toast.success("Servicio actualizado exitosamente");
      setIsEditDialogOpen(false);
      loadServicios();
    } catch {
      toast.error("Error al actualizar servicio");
    }
  };

  const handleDelete = async () => {
    if (!selectedServicio) return;
    try {
      await deleteServicio(selectedServicio.id);
      toast.success("Servicio eliminado");
      setIsDeleteDialogOpen(false);
      loadServicios();
    } catch {
      toast.error("Error al eliminar servicio");
    }
  };

  const handleStatusChange = async () => {
    if (!selectedServicio) return;
    try {
      await updateEstatus(selectedServicio.id, newStatus);
      toast.success("Estatus actualizado");
      setIsStatusDialogOpen(false);
      loadServicios();
    } catch {
      toast.error("Error al actualizar estatus");
    }
  };

  useEffect(() => {
    loadServicios();
  }, []);

  // ─── FILTROS Y VISUALIZACIÓN ───────────────────────────────────────────────
  const filteredServicios = servicios.filter(
    (s) =>
      s.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const serviciosActivos = filteredServicios.filter((s) => s.estatus !== "Completado");
  const serviciosCompletados = filteredServicios.filter((s) => s.estatus === "Completado");

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case "Completado":
        return <CheckCircle className="h-4 w-4" />;
      case "En Proceso":
        return <Clock className="h-4 w-4" />;
      case "Pendiente":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case "Completado":
        return "bg-green-600 text-white";
      case "En Proceso":
        return "bg-blue-600 text-white";
      case "Pendiente":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <div className={`space-y-4 ${isMobile ? "pb-20" : ""}`}>
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Servicios</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Gestión de servicios y mantenimientos
          </p>
        </div>

        {hasPermission("servicios.create") && (
          <Button
            className="bg-[#B02128] hover:bg-[#8B1A20] text-white w-full sm:w-auto"
            onClick={() => {
              setFormData({
                cliente: "",
                tipo: "",
                tecnico: "",
                fecha: "",
                estatus: "Pendiente",
                costo: 0,
                descripcion: "",
                refacciones: "",
              });
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
        <Input
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activos" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 w-full">
          <TabsTrigger value="activos" className="flex-1">
            Activos ({serviciosActivos.length})
          </TabsTrigger>
          <TabsTrigger value="completados" className="flex-1">
            Completados ({serviciosCompletados.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: ACTIVOS */}
        <TabsContent value="activos">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Servicios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="divide-y divide-gray-100">
                  {serviciosActivos.map((servicio) => (
                    <ServicioCard
                      key={servicio.id}
                      servicio={servicio}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      onView={(s) => {
                        setSelectedServicio(s);
                        setIsViewDialogOpen(true);
                      }}
                      onEdit={(s) => {
                        setSelectedServicio(s);
                        setFormData(s as any);
                        setIsEditDialogOpen(true);
                      }}
                      onDelete={(s) => {
                        setSelectedServicio(s);
                        setIsDeleteDialogOpen(true);
                      }}
                      onStatusChange={(s) => {
                        setSelectedServicio(s);
                        setNewStatus(s.estatus);
                        setIsStatusDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estatus</TableHead>
                        <TableHead>Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviciosActivos.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.cliente}</TableCell>
                          <TableCell>{s.tipo}</TableCell>
                          <TableCell>{s.tecnico}</TableCell>
                          <TableCell>{s.fecha}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${getStatusColor(
                                s.estatus
                              )} flex items-center gap-1 w-fit`}
                            >
                              {getStatusIcon(s.estatus)}
                              <span>{s.estatus}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>${s.costo.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: COMPLETADOS */}
        <TabsContent value="completados">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="divide-y divide-gray-100">
                  {serviciosCompletados.map((s) => (
                    <ServicioCard
                      key={s.id}
                      servicio={s}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      showAllActions={false}
                      onView={(serv) => {
                        setSelectedServicio(serv);
                        setIsViewDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estatus</TableHead>
                        <TableHead>Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviciosCompletados.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.cliente}</TableCell>
                          <TableCell>{s.tipo}</TableCell>
                          <TableCell>{s.tecnico}</TableCell>
                          <TableCell>{s.fecha}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(s.estatus)}`}>
                              {s.estatus}
                            </Badge>
                          </TableCell>
                          <TableCell>${s.costo.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOGOS */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Servicio</DialogTitle>
          </DialogHeader>
          <ServicioForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
              onClick={handleAdd}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
          </DialogHeader>
          <ServicioForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
              onClick={handleEdit}
            >
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
