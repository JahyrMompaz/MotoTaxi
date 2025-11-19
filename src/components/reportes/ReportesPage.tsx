import { useEffect, useState } from "react";
import { Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "./../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../ui/card";
import { Input } from "./../ui/input";
import { Label } from "./../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../ui/table";
import { ReportChart } from "./ReportChart";
import { useIsMobile } from "./../ui/use-mobile";
import { getReporteVentas, getIngresosMensuales, Venta, IngresoMensual } from "./reportesService";
import { toast } from "sonner";

export function ReportesPage() {
  const isMobile = useIsMobile();
  const [tipo, setTipo] = useState("ventas");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([]);

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);

  useEffect(() => {
    loadIngresos();
    loadVentas();
  }, []);

  const loadVentas = async () => {
    try {
      const data = await getReporteVentas({ tipo, fechaInicio, fechaFin });
      setVentas(data);
    } catch {
      toast.error("Error al obtener reportes de ventas");
    }
  };

  const loadIngresos = async () => {
    try {
      const data = await getIngresosMensuales();
      setIngresos(data);
    } catch {
      toast.error("Error al cargar ingresos");
    }
  };

  return (
    <div className={`space-y-4 ${isMobile ? "pb-4" : ""}`}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Reportes</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Análisis y reportes de ventas</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1E293B]">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha Fin</Label>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue placeholder="Tipo de venta" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventas">Todas</SelectItem>
                  <SelectItem value="refacciones">Refacciones</SelectItem>
                  <SelectItem value="mototaxis">Mototaxis</SelectItem>
                  <SelectItem value="servicios">Servicios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-[#B02128] text-white" onClick={loadVentas}>
                <Calendar className="h-4 w-4 mr-2" /> Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-[#64748B] text-sm">Total Ventas</p><p className="text-2xl text-[#1E293B]">${totalVentas.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[#64748B] text-sm">Promedio por Venta</p><p className="text-2xl text-[#1E293B]">${(totalVentas / (ventas.length || 1)).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[#64748B] text-sm">Transacciones</p><p className="text-2xl text-[#1E293B]">{ventas.length}</p></CardContent></Card>
      </div>

      {/* Gráfica */}
      <Card>
        <CardHeader><CardTitle className="text-[#1E293B]">Ingresos Mensuales</CardTitle></CardHeader>
        <CardContent><ReportChart data={ingresos} /></CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader><CardTitle className="text-[#1E293B]">Detalle de Ventas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.map((v, i) => (
                <TableRow key={i}>
                  <TableCell>{v.fecha}</TableCell>
                  <TableCell>{v.tipo}</TableCell>
                  <TableCell>{v.cliente}</TableCell>
                  <TableCell className="text-right">${v.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-[#F1F5F9]">
                <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                <TableCell className="text-right text-[#B02128]">${totalVentas.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
