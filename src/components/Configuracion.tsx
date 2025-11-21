import { use, useEffect, useState } from "react";
import { Shield, Building2, FileKey, Users, Edit } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from "./ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle
} from "./ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { toast } from "sonner";

import { ConfiguracionService } from "./configuracion/configuracionService";

export function Configuracion() {

  // ─────────────────────────────────────────────────────────────
  // ESTADOS
  // ─────────────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    role_id: "",
  });

  // Configuración general
  const [config, setConfig] = useState<any>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Campos del formulario fiscal
  const [razonSocial, setRazonSocial] = useState("");
  const [rfcEmpresa, setRfcEmpresa] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [regimenFiscal, setRegimenFiscal] = useState("");

  // Config CFDI
  const [pac, setPac] = useState("");
  const [certificado, setCertificado] = useState("");
  const [serieFactura, setSerieFactura] = useState("");
  const [folioActual, setFolioActual] = useState(0);
  const [lugarExpedicion, setLugarExpedicion] = useState("");
  const [envioAutomatico, setEnvioAutomatico] = useState(false);
  const [pdfLogo, setPdfLogo] = useState(false);
  const [validacionPrevia, setValidacionPrevia] = useState(false);

  // Seguridad → Contraseña
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // ─────────────────────────────────────────────────────────────
  // CARGAR DATOS INICIALES
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadUsuarios();
    loadConfig();
  }, []);

  useEffect(() => {
  if (selectedUser) {
    setNewUser({
      nombre: selectedUser.nombre,
      username: selectedUser.username,
      email: selectedUser.email,
      password: "",
      role_id: selectedUser.role_id,
    });
  } else {
    setNewUser({
      nombre: "",
      username: "",
      email: "",
      password: "",
      role_id: "",
    });
  }
}, [selectedUser, isAddUserOpen]);


  async function loadUsuarios() {
    try {
      const data = await ConfiguracionService.getUsuarios();
      setUsuarios(data);
    } catch {
      toast.error("No se pudieron cargar los usuarios");
    }
  }

  async function loadConfig() {
    try {
      const data = await ConfiguracionService.getConfig();
      setConfig(data);

      setRazonSocial(data.razon_social || "");
      setRfcEmpresa(data.rfc_empresa || "");
      setDireccion(data.direccion_fiscal || "");
      setTelefono(data.telefono || "");
      setEmailEmpresa(data.email_empresa || "");
      setRegimenFiscal(data.regimen_fiscal || "");

      setPac(data.pac || "");
      setCertificado(data.certificado || "");
      setSerieFactura(data.serie_factura || "");
      setFolioActual(Number(data.folio_actual || 0));
      setLugarExpedicion(data.lugar_expedicion || "");

      setEnvioAutomatico(data.envio_automatico === "1");
      setPdfLogo(data.pdf_con_logo === "1");
      setValidacionPrevia(data.validacion_previa === "1");

    } catch {
      toast.error("No se pudo cargar la configuración");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GUARDAR DATOS FISCALES
  // ─────────────────────────────────────────────────────────────
  async function guardarDatosFiscales() {
    try {
      await ConfiguracionService.saveConfig({
        razon_social: razonSocial,
        rfc_empresa: rfcEmpresa,
        direccion_fiscal: direccion,
        telefono,
        email_empresa: emailEmpresa,
        regimen_fiscal: regimenFiscal,
      });

      toast.success("Datos fiscales guardados");
    } catch {
      toast.error("No se pudieron guardar los datos");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GUARDAR CONFIGURACIÓN CFDI
  // ─────────────────────────────────────────────────────────────
  async function guardarCFDI() {
    try {
      await ConfiguracionService.saveConfig({
        pac,
        certificado,
        serie_factura: serieFactura,
        folio_actual: folioActual,
        lugar_expedicion: lugarExpedicion,
        envio_automatico: envioAutomatico ? "1" : "0",
        pdf_con_logo: pdfLogo ? "1" : "0",
        validacion_previa: validacionPrevia ? "1" : "0",
      });

      toast.success("Configuración CFDI guardada");
    } catch {
      toast.error("No se pudo guardar la configuración");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CAMBIO DE CONTRASEÑA
  // ─────────────────────────────────────────────────────────────
  async function cambiarPassword() {
    try {
      await ConfiguracionService.cambiarPassword({
        current_password: passwordActual,
        password: passwordNueva,
        password_confirmation: passwordConfirm,
      });

      toast.success("Contraseña actualizada");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
    } catch {
      toast.error("Error al cambiar la contraseña");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREAR USUARIO
  // ─────────────────────────────────────────────────────────────
  async function crearUsuario() {
    try {
      if (!newUser.nombre || !newUser.email || !newUser.password || !newUser.role_id) {
        toast.error("Completa todos los campos");
        return;
      }

      await ConfiguracionService.crearUsuario(newUser);

      toast.success("Usuario creado");
      setIsAddUserOpen(false);
      setNewUser({ nombre: "", username: "" , email: "", password: "", role_id: "" });
      loadUsuarios();

    } catch {
      toast.error("No se pudo crear el usuario");
    }
  }

  async function actualizarUsuario() {
  try {
    if (!selectedUser.nombre || !selectedUser.username || !selectedUser.email || !selectedUser.role?.id) {
      toast.error("Completa todos los campos");
      return;
    }

    const payload = {
      nombre: selectedUser.nombre,
      username: selectedUser.username,
      email: selectedUser.email,
      role_id: selectedUser.role.id,  // <-- ESTA ES LA CORRECTA
      password: newUser.password || null,
    };

    await ConfiguracionService.actualizarUsuario(selectedUser.id, payload);

    toast.success("Usuario actualizado");
    setIsAddUserOpen(false);
    setSelectedUser(null);
    loadUsuarios();
  } catch {
    toast.error("No se pudo actualizar el usuario");
  }
}


  // ─────────────────────────────────────────────────────────────
  // RENDER (DISEÑO NO MODIFICADO)
  // ─────────────────────────────────────────────────────────────

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
          {/* <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" />
            Datos Fiscales
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="gap-2">
            <FileKey className="h-4 w-4" />
            Configuración CFDI
          </TabsTrigger> */}
          <TabsTrigger value="seguridad" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/*
        ───────────────────────────────────────────  
        TAB USUARIOS  
        ───────────────────────────────────────────  
        */}
        <TabsContent value="usuarios">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#1E293B]">Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios del sistema</CardDescription>
                </div>
                <Button
                  className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
                  onClick={() => {setIsAddUserOpen(true) ; setSelectedUser(null);}}
                >
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
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario: any) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="text-[#1E293B]">{usuario.nombre}</TableCell>
                        <TableCell className="text-[#64748B]">{usuario.username}</TableCell>
                        <TableCell className="text-[#64748B]">{usuario.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              usuario.role?.name === 'Administrador'
                                ? 'text-[#B02128] border-[#B02128]'
                                : 'text-[#64748B]'
                            }
                          >
                            {usuario.role?.name}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await ConfiguracionService.toggleUsuario(usuario.id);
                                loadUsuarios();
                              } catch {
                                toast.error("No se pudo cambiar el estado");
                              }
                            }}
                          >
                            Desactivar
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(usuario);
                              setIsAddUserOpen(true);
                            }}
                          >
                            <Edit className="h-2 w-2"></Edit>
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

        {/*
        ───────────────────────────────────────────  
        TAB EMPRESA  
        ───────────────────────────────────────────  
        */}
        <TabsContent value="empresa">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Datos Fiscales de la Empresa</CardTitle>
              <CardDescription>Información fiscal para emisión de CFDI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Razón Social</Label>
                  <Input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>RFC</Label>
                  <Input value={rfcEmpresa} onChange={(e) => setRfcEmpresa(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Dirección Fiscal</Label>
                <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Teléfono</Label>
                  <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={emailEmpresa} onChange={(e) => setEmailEmpresa(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Régimen Fiscal</Label>
                  <Input value={regimenFiscal} onChange={(e) => setRegimenFiscal(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
                  onClick={guardarDatosFiscales}
                >
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/*
        ───────────────────────────────────────────  
        TAB CONFIGURACIÓN CFDI  
        ───────────────────────────────────────────  
        */}
        <TabsContent value="facturacion">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Configuración de Facturación</CardTitle>
              <CardDescription>Parámetros para emisión de CFDI 4.0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>PAC</Label>
                  <Input value={pac} onChange={(e) => setPac(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Certificado Digital</Label>
                  <Input value={certificado} onChange={(e) => setCertificado(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Serie de Factura</Label>
                  <Input value={serieFactura} onChange={(e) => setSerieFactura(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Folio Actual</Label>
                  <Input
                    type="number"
                    value={folioActual}
                    onChange={(e) => setFolioActual(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Lugar de Expedición</Label>
                <Input value={lugarExpedicion} onChange={(e) => setLugarExpedicion(e.target.value)} />
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-[#F1F5F9]">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#1E293B]">Envío automático de facturas</p>
                    <p className="text-xs text-[#64748B]">Enviar CFDI automáticamente</p>
                  </div>
                  <Switch
                    checked={envioAutomatico}
                    onCheckedChange={(v: any) => setEnvioAutomatico(!!v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#1E293B]">Generar PDF con logo</p>
                    <p className="text-xs text-[#64748B]">Incluir logo en el PDF</p>
                  </div>
                  <Switch
                    checked={pdfLogo}
                    onCheckedChange={(v: any) => setPdfLogo(!!v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#1E293B]">Validación previa</p>
                    <p className="text-xs text-[#64748B]">Validar CFDI antes de timbrar</p>
                  </div>
                  <Switch
                    checked={validacionPrevia}
                    onCheckedChange={(v: any) => setValidacionPrevia(!!v)}
                  />
                </div>

              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
                  onClick={guardarCFDI}
                >
                  Guardar Configuración
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/*
        ───────────────────────────────────────────  
        TAB SEGURIDAD  
        ───────────────────────────────────────────  
        */}
        <TabsContent value="seguridad">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Configuración de Seguridad</CardTitle>
              <CardDescription>Opciones de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Opciones de Seguridad (Switches del diseño original, no funcionales aún) */}
              {/* <div className="space-y-4">

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-[#1E293B]">Autenticación de dos factores</p>
                    <p className="text-xs text-[#64748B]">Código adicional al iniciar sesión</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-[#1E293B]">Cierre de sesión automático</p>
                    <p className="text-xs text-[#64748B]">Cerrar después de inactividad</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-[#1E293B]">Registro de actividad</p>
                    <p className="text-xs text-[#64748B]">Guardar historial</p>
                  </div>
                  <Switch defaultChecked />
                </div>

              </div> */}

              {/* Cambio de Contraseña */}
              <div className="border-t pt-4">
                <h4 className="text-[#1E293B] mb-4">Cambiar Contraseña</h4>

                <div className="grid gap-4">

                  <div className="grid gap-2">
                    <Label>Contraseña Actual</Label>
                    <Input
                      type="password"
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Nueva Contraseña</Label>
                    <Input
                      type="password"
                      value={passwordNueva}
                      onChange={(e) => setPasswordNueva(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Confirmar Contraseña</Label>
                    <Input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                  </div>

                </div>

              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
                  onClick={cambiarPassword}
                >
                  Actualizar Contraseña
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* ───────────────────────────────────────────
          DIALOG: NUEVO USUARIO
      ─────────────────────────────────────────── */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} >
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>{ !selectedUser ? "Agregar Usuario" : "Actualizar Usuario" }</DialogTitle>
            <DialogDescription>{!selectedUser ? "Registrar un nuevo usuario del sistema" : "Actualizar un usuario del sistema" }</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">

            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input
                value={newUser.nombre}
                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Username</Label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>


            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Rol</Label>
              <select
                className="border rounded px-3 py-2"
                value={newUser.role_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, role_id: e.target.value })
                }
                aria-label="Seleccionar rol de usuario"
              >
                <option value="">Seleccionar...</option>
                <option value="1">Administrador</option>
                <option value="2">Vendedor</option>
                <option value="3">Facturista</option>
              </select>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#B02128] text-white" onClick={selectedUser ? actualizarUsuario: crearUsuario} >
              {selectedUser ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
