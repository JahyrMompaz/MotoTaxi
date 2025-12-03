import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "../ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MapPin, User, Truck, Package, Plus, Trash2, ShieldCheck, FileText, Calendar } from "lucide-react";
import { CartaPorteFormData, MercanciaItem, FacturaTimbrada, Cliente } from "./types";

interface Props {
  formData: CartaPorteFormData;
  setFormData: (data: CartaPorteFormData) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onSubmit: () => void;
  isMobile: boolean;
  facturasDisponibles: FacturaTimbrada[];
  clientes: Cliente[]; // <--- Recibimos el catálogo
}

export function CartaPorteForm({ 
  formData, setFormData, isOpen, setIsOpen, onSubmit, isMobile, 
  facturasDisponibles, clientes 
}: Props) {
  
  const [newMerc, setNewMerc] = useState<MercanciaItem>({
    clave_sat: '50202301', descripcion: '', cantidad: 1, unidad_sat: 'H87', peso_kg: 0
  });

  const addMercancia = () => {
    setFormData({ ...formData, mercancias: [...formData.mercancias, newMerc] });
    setNewMerc({ clave_sat: '50202301', descripcion: '', cantidad: 1, unidad_sat: 'H87', peso_kg: 0 });
  };

  const removeMercancia = (idx: number) => {
    const list = [...formData.mercancias];
    list.splice(idx, 1);
    setFormData({ ...formData, mercancias: list });
  };

  const toggleFactura = (id: number) => {
    const strId = String(id);
    const current = formData.facturasSeleccionadas;
    const exists = current.includes(strId);
    setFormData({
      ...formData,
      facturasSeleccionadas: exists ? current.filter(x => x !== strId) : [...current, strId]
    });
  };

  const formContent = (
    <div className="space-y-6 py-4">
      
      {/* 0. SELECCIÓN DE CLIENTE (PROPIETARIO DE LA MERCANCÍA) */}
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <Label className="text-yellow-900 font-bold flex items-center gap-2 mb-2">
            <User className="h-4 w-4"/> Cliente (Dueño de la Carga) *
        </Label>
        <Select 
            value={formData.cliente_id} 
            onValueChange={(v: any) => setFormData({ 
                ...formData, 
                cliente_id: v, 
                facturasSeleccionadas: [] // Limpiar selección al cambiar cliente
            })}
        >
          <SelectTrigger className="bg-white border-yellow-300">
            <SelectValue placeholder="Seleccionar Cliente..." />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre} ({c.rfc})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-yellow-700 mt-1">Selecciona al cliente para ver sus facturas disponibles.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 1. ORIGEN */}
        <div className="space-y-3 border p-3 rounded bg-gray-50">
            <h3 className="text-sm font-bold flex items-center gap-2 text-blue-800"><MapPin className="h-4 w-4"/> Origen</h3>
            <div className="grid grid-cols-2 gap-2">
            <div><Label>Remitente</Label><Input value={formData.origen_nombre} onChange={e => setFormData({...formData, origen_nombre: e.target.value})} placeholder="Nombre Bodega" /></div>
            <div><Label>CP *</Label><Input value={formData.origen_cp} onChange={e => setFormData({...formData, origen_cp: e.target.value})} maxLength={5} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
            <div><Label>Estado (Clave)</Label><Input value={formData.origen_estado_clave} onChange={e => setFormData({...formData, origen_estado_clave: e.target.value})} placeholder="SLP" /></div>
            <div><Label>Municipio (Clave)</Label><Input value={formData.origen_municipio} onChange={e => setFormData({...formData, origen_municipio: e.target.value})} placeholder="028" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><Label>Calle y Número</Label><Input value={formData.origen_calle} onChange={e => setFormData({...formData, origen_calle: e.target.value})} /></div>
            <div><Label>Colonia</Label><Input value={formData.origen_colonia} onChange={e => setFormData({...formData, origen_colonia: e.target.value})} /></div>
            <div><Label>Localidad</Label><Input value={formData.origen_localidad} onChange={e => setFormData({...formData, origen_localidad: e.target.value})} /></div>
            </div>
        </div>

        {/* 2. DESTINO */}
        <div className="space-y-3 border p-3 rounded bg-gray-50">
            <h3 className="text-sm font-bold flex items-center gap-2 text-green-800"><MapPin className="h-4 w-4"/> Destino</h3>
            <div className="grid grid-cols-2 gap-2">
            <div><Label>Destinatario</Label><Input value={formData.destino_nombre} onChange={e => setFormData({...formData, destino_nombre: e.target.value})} placeholder="Cliente Final" /></div>
            <div><Label>CP *</Label><Input value={formData.destino_cp} onChange={e => setFormData({...formData, destino_cp: e.target.value})} maxLength={5} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
            <div><Label>Estado (Clave)</Label><Input value={formData.destino_estado_clave} onChange={e => setFormData({...formData, destino_estado_clave: e.target.value})} placeholder="SLP" /></div>
            <div><Label>Municipio (Clave)</Label><Input value={formData.destino_municipio} onChange={e => setFormData({...formData, destino_municipio: e.target.value})} placeholder="028" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><Label>Calle y Número</Label><Input value={formData.destino_calle} onChange={e => setFormData({...formData, destino_calle: e.target.value})} /></div>
            <div><Label>Colonia</Label><Input value={formData.destino_colonia} onChange={e => setFormData({...formData, destino_colonia: e.target.value})} /></div>
            <div><Label>Localidad</Label><Input value={formData.destino_localidad} onChange={e => setFormData({...formData, destino_localidad: e.target.value})} /></div>
            </div>
        </div>
      </div>

      {/* 3. VIAJE */}
      <div className="grid grid-cols-2 gap-3 border p-3 rounded bg-gray-50">
        <h3 className="col-span-2 text-sm font-bold flex items-center gap-2 text-[#1E293B]"><Calendar className="h-4 w-4"/> Datos del Viaje</h3>
        <div><Label>Distancia (km) *</Label><Input type="number" value={formData.distanciaKm} onChange={e => setFormData({...formData, distanciaKm: e.target.value})} /></div>
        <div><Label>Peso Total (kg) *</Label><Input type="number" value={formData.pesoTotal} onChange={e => setFormData({...formData, pesoTotal: e.target.value})} /></div>
        <div><Label>Salida *</Label><Input type="date" value={formData.fechaSalida} onChange={e => setFormData({...formData, fechaSalida: e.target.value})} /></div>
        <div><Label>Hora Salida</Label><Input type="time" value={formData.horaSalida} onChange={e => setFormData({...formData, horaSalida: e.target.value})} /></div>
        <div className="col-span-2"><Label>Llegada Estimada *</Label><Input type="date" value={formData.fechaLlegada} onChange={e => setFormData({...formData, fechaLlegada: e.target.value})} /></div>
      </div>

      {/* 4. FACTURAS */}
      <div className="space-y-2">
         <Label className="flex items-center gap-2"><FileText className="h-4 w-4"/> Vincular Facturas del Cliente</Label>
         <div className="border rounded p-2 max-h-40 overflow-y-auto bg-gray-50">
            {(!formData.cliente_id) && <p className="text-xs text-yellow-600 p-2">Selecciona un cliente arriba para ver sus facturas.</p>}
            {(formData.cliente_id && facturasDisponibles.length === 0) && <p className="text-xs text-gray-500 p-2">Este cliente no tiene facturas timbradas.</p>}
            
            {facturasDisponibles.map(f => (
               <div key={f.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded">
                  <Checkbox 
                    checked={formData.facturasSeleccionadas.includes(String(f.id))}
                    onCheckedChange={() => toggleFactura(f.id)}
                  />
                  <span className="text-xs font-medium">{f.folio}</span>
                  <span className="text-xs text-gray-500">- ${f.total.toLocaleString()}</span>
               </div>
            ))}
         </div>
      </div>

      <Separator />

      {/* 5. MERCANCIAS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[#1E293B]"><Package className="h-4 w-4"/> Mercancías</h3>
        <div className="space-y-2">
          {formData.mercancias.map((m, i) => (
            <div key={i} className="flex items-center justify-between text-xs border p-2 rounded bg-white">
              <span>{m.cantidad} {m.unidad_sat} - {m.descripcion} ({m.peso_kg}kg)</span>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeMercancia(i)}><Trash2 className="h-3 w-3"/></Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 items-end border p-2 rounded bg-slate-50">
           <div className="col-span-1"><Label className="text-xs">Cant</Label><Input className="h-8 text-xs" type="number" value={newMerc.cantidad} onChange={e => setNewMerc({...newMerc, cantidad: Number(e.target.value)})} /></div>
           <div className="col-span-1"><Label className="text-xs">Uni SAT</Label><Input className="h-8 text-xs" value={newMerc.unidad_sat} onChange={e => setNewMerc({...newMerc, unidad_sat: e.target.value})} placeholder="H87"/></div>
           <div className="col-span-1"><Label className="text-xs">Peso kg</Label><Input className="h-8 text-xs" type="number" value={newMerc.peso_kg} onChange={e => setNewMerc({...newMerc, peso_kg: Number(e.target.value)})} placeholder="0"/></div>
           <div className="col-span-1"><Label className="text-xs">Clave</Label><Input className="h-8 text-xs" value={newMerc.clave_sat} onChange={e => setNewMerc({...newMerc, clave_sat: e.target.value})} placeholder="50202301"/></div>
           <div className="col-span-2"><Label className="text-xs">Descripción</Label><Input className="h-8 text-xs" value={newMerc.descripcion} onChange={e => setNewMerc({...newMerc, descripcion: e.target.value})} placeholder="Desc..."/></div>
           <div className="col-span-1"><Button size="sm" onClick={addMercancia} className="w-full h-8 bg-blue-600"><Plus className="h-4 w-4"/></Button></div>
        </div>
      </div>

      <Separator />

      {/* 6. CHOFER / VEHICULO / SEGUROS */}
      <div className="space-y-4 border p-3 rounded bg-gray-50">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[#1E293B]"><Truck className="h-4 w-4"/> Transporte</h3>
        
        <div className="grid grid-cols-2 gap-2">
           <div><Label>Chofer Nombre *</Label><Input value={formData.choferNombre} onChange={e => setFormData({...formData, choferNombre: e.target.value})} /></div>
           <div><Label>Chofer RFC</Label><Input value={formData.choferRFC} onChange={e => setFormData({...formData, choferRFC: e.target.value})} placeholder="XAXX..." /></div>
           <div className="col-span-2"><Label>Licencia *</Label><Input value={formData.choferLicencia} onChange={e => setFormData({...formData, choferLicencia: e.target.value})} /></div>
        </div>

        <Separator className="my-2"/>

        <div className="grid grid-cols-2 gap-2">
           <div><Label>Placas *</Label><Input value={formData.vehiculoPlacas} onChange={e => setFormData({...formData, vehiculoPlacas: e.target.value})} /></div>
           <div><Label>Año *</Label><Input type="number" value={formData.vehiculoAnio} onChange={e => setFormData({...formData, vehiculoAnio: e.target.value})} placeholder="2023" /></div>
           <div><Label>Modelo</Label><Input value={formData.vehiculoModelo} onChange={e => setFormData({...formData, vehiculoModelo: e.target.value})} /></div>
           <div><Label>Configuración *</Label><Input value={formData.vehiculoConfiguracion} onChange={e => setFormData({...formData, vehiculoConfiguracion: e.target.value})} placeholder="VL" /></div>
           <div><Label>Permiso SCT *</Label><Input value={formData.permisoSCT} onChange={e => setFormData({...formData, permisoSCT: e.target.value})} placeholder="TPAF01" /></div>
           <div><Label>Num Permiso *</Label><Input value={formData.numPermisoSCT} onChange={e => setFormData({...formData, numPermisoSCT: e.target.value})} /></div>
        </div>

        <Separator className="my-2"/>

        <div className="grid grid-cols-2 gap-2">
           <div><Label>Aseguradora *</Label><Input value={formData.aseguraNombre} onChange={e => setFormData({...formData, aseguraNombre: e.target.value})} /></div>
           <div><Label>Póliza *</Label><Input value={formData.polizaNumero} onChange={e => setFormData({...formData, polizaNumero: e.target.value})} /></div>
        </div>
      </div>

    </div>
  );

  const Footer = (
    <div className="flex gap-2 justify-end mt-4">
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
      <Button onClick={onSubmit} className="bg-[#B02128] text-white">Timbrar Carta Porte</Button>
    </div>
  );

  if (isMobile) {
    return <Sheet open={isOpen} onOpenChange={setIsOpen}><SheetContent side="bottom" className="h-[95vh] overflow-y-auto"><SheetHeader><SheetTitle>Nueva Carta Porte</SheetTitle></SheetHeader>{formContent}{Footer}</SheetContent></Sheet>;
  }

  return <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="max-w-[800px] h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Nueva Carta Porte</DialogTitle><DialogDescription>Ingresa los datos para el traslado</DialogDescription></DialogHeader>{formContent}{Footer}</DialogContent></Dialog>;
}