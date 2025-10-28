import { useState } from 'react';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useIsMobile } from './ui/use-mobile';

const reporteVentas = [
  { fecha: '2024-10-01', tipo: 'Refacciones', cliente: 'Transportes del Norte', total: 5400 },
  { fecha: '2024-10-05', tipo: 'Mototaxi', cliente: 'Logística Express', total: 52000 },
  { fecha: '2024-10-08', tipo: 'Servicio', cliente: 'Mototaxis del Sur', total: 3200 },
  { fecha: '2024-10-12', tipo: 'Refacciones', cliente: 'Comercializadora Global', total: 8900 },
  { fecha: '2024-10-15', tipo: 'Mototaxi', cliente: 'Transportes del Norte', total: 48000 },
  { fecha: '2024-10-18', tipo: 'Servicio', cliente: 'Logística Express', total: 2800 },
  { fecha: '2024-10-20', tipo: 'Refacciones', cliente: 'Mototaxis del Sur', total: 6700 },
];

const ingresosMensuales = [
  { mes: 'Ene', ingresos: 215000 },
  { mes: 'Feb', ingresos: 262000 },
  { mes: 'Mar', ingresos: 316000 },
  { mes: 'Abr', ingresos: 296000 },
  { mes: 'May', ingresos: 367000 },
  { mes: 'Jun', ingresos: 427000 },
];

export function Reportes() {
  const isMobile = useIsMobile();
  const [tipoReporte, setTipoReporte] = useState('ventas');

  const totalVentas = reporteVentas.reduce((sum, venta) => sum + venta.total, 0);

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-4' : ''}`}>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[#1E293B]">Reportes</h1>
          <p className="text-[#64748B] text-xs sm:text-sm">Análisis y reportes de ventas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="text-[#1E293B] text-sm h-9 w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm h-9 w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1E293B]">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input id="fechaInicio" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input id="fechaFin" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipoVenta">Tipo de Venta</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventas">Todas las Ventas</SelectItem>
                  <SelectItem value="refacciones">Refacciones</SelectItem>
                  <SelectItem value="mototaxis">Mototaxis</SelectItem>
                  <SelectItem value="servicios">Servicios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-[#B02128] hover:bg-[#8B1A20] text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#B02128] bg-opacity-10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#B02128]" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Total Ventas</p>
                <p className="text-2xl text-[#1E293B]">${totalVentas.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#1E293B] bg-opacity-10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#1E293B]" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Promedio por Venta</p>
                <p className="text-2xl text-[#1E293B]">
                  ${Math.round(totalVentas / reporteVentas.length).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Transacciones</p>
                <p className="text-2xl text-[#1E293B]">{reporteVentas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1E293B]">Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ingresosMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#B02128"
                strokeWidth={3}
                name="Ingresos"
                dot={{ fill: '#B02128', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#1E293B]">Detalle de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {reporteVentas.map((venta, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-[#64748B]">{venta.fecha}</TableCell>
                    <TableCell className="text-[#1E293B]">{venta.tipo}</TableCell>
                    <TableCell className="text-[#1E293B]">{venta.cliente}</TableCell>
                    <TableCell className="text-right text-[#1E293B]">
                      ${venta.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-[#F1F5F9]">
                  <TableCell colSpan={3} className="text-right text-[#1E293B]">
                    Total
                  </TableCell>
                  <TableCell className="text-right text-[#B02128]">
                    ${totalVentas.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
