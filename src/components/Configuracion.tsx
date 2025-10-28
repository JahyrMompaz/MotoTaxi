import { Shield, Building2, FileKey, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

const usuariosData = [
  { id: 1, nombre: 'Admin Principal', email: 'admin@mototaxis.com', rol: 'Administrador', activo: true },
  { id: 2, nombre: 'Juan Pérez', email: 'juan@mototaxis.com', rol: 'Vendedor', activo: true },
  { id: 3, nombre: 'María González', email: 'maria@mototaxis.com', rol: 'Facturista', activo: true },
  { id: 4, nombre: 'Carlos López', email: 'carlos@mototaxis.com', rol: 'Vendedor', activo: false },
];

export function Configuracion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#1E293B]">Configuración</h1>
        <p className="text-[#64748B]">Configuración del sistema y usuarios</p>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" />
            Datos Fiscales
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="gap-2">
            <FileKey className="h-4 w-4" />
            Configuración CFDI
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#1E293B]">Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios del sistema</CardDescription>
                </div>
                <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white">
                  Agregar Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosData.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="text-[#1E293B]">{usuario.nombre}</TableCell>
                        <TableCell className="text-[#64748B]">{usuario.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              usuario.rol === 'Administrador'
                                ? 'text-[#B02128] border-[#B02128]'
                                : 'text-[#64748B]'
                            }
                          >
                            {usuario.rol}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              usuario.activo
                                ? 'bg-green-600 text-white'
                                : 'bg-[#64748B] text-white'
                            }
                          >
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Datos Fiscales de la Empresa</CardTitle>
              <CardDescription>Información fiscal para emisión de CFDI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input id="razonSocial" defaultValue="Mototaxis Pro SA de CV" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rfcEmpresa">RFC</Label>
                  <Input id="rfcEmpresa" defaultValue="MPR890123ABC" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="direccion">Dirección Fiscal</Label>
                <Input
                  id="direccion"
                  defaultValue="Av. Principal 123, Col. Centro, CP 12345"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" defaultValue="555-1234-5678" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emailEmpresa">Email</Label>
                  <Input id="emailEmpresa" defaultValue="facturacion@mototaxis.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="regimenFiscal">Régimen Fiscal</Label>
                  <Input id="regimenFiscal" defaultValue="601 - General de Ley" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white">
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Configuración de Facturación</CardTitle>
              <CardDescription>Parámetros para emisión de CFDI 4.0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pac">Proveedor de Certificación (PAC)</Label>
                  <Input id="pac" defaultValue="PAC Certificado SA" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="certificado">Certificado Digital</Label>
                  <Input id="certificado" defaultValue="CSD_2024.cer" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="serieFactura">Serie de Factura</Label>
                  <Input id="serieFactura" defaultValue="CFDI" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="folioActual">Folio Actual</Label>
                  <Input id="folioActual" type="number" defaultValue="45683" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lugarExpedicion">Lugar de Expedición (CP)</Label>
                <Input id="lugarExpedicion" defaultValue="12345" />
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-[#F1F5F9]">
                <h4 className="text-[#1E293B]">Opciones de Facturación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#1E293B]">Envío automático de facturas</p>
                      <p className="text-xs text-[#64748B]">
                        Enviar CFDI al correo del cliente automáticamente
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#1E293B]">Generar PDF con logo</p>
                      <p className="text-xs text-[#64748B]">
                        Incluir logo de la empresa en PDF
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#1E293B]">Validación previa</p>
                      <p className="text-xs text-[#64748B]">
                        Validar CFDI antes de timbrar
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white">
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Configuración de Seguridad</CardTitle>
              <CardDescription>Opciones de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-[#1E293B]">Autenticación de dos factores</p>
                    <p className="text-xs text-[#64748B]">
                      Requiere código adicional para iniciar sesión
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-[#1E293B]">Cierre de sesión automático</p>
                    <p className="text-xs text-[#64748B]">
                      Cerrar sesión después de 30 minutos de inactividad
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-[#1E293B]">Registro de actividad</p>
                    <p className="text-xs text-[#64748B]">
                      Guardar historial de acciones de usuarios
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-[#1E293B] mb-4">Cambiar Contraseña</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="passwordActual">Contraseña Actual</Label>
                    <Input id="passwordActual" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passwordNueva">Contraseña Nueva</Label>
                    <Input id="passwordNueva" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passwordConfirm">Confirmar Contraseña</Label>
                    <Input id="passwordConfirm" type="password" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-[#B02128] hover:bg-[#8B1A20] text-white">
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
