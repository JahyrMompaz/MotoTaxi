import { useEffect, useState, useMemo } from 'react';
import { Button } from '../ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { CheckCircle, Search, Trash2, Receipt, Bike, Plus, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '../ui/use-mobile';
import { Separator } from '../ui/separator';

import type { Cliente, CrearFacturaPayload, Mototaxi } from './types';
import { FacturaService } from './FacturaService';
import { api } from '../../lib/api';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
};

interface LocalItem {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
  id_origen?: number; 
  tipo_origen?: string; 
}

interface TicketResult {
  id: number;
  folio: string;
  total: number;
  estatus: string;
  created_at: string;
  cliente: { id: number; nombre: string };
}

export default function FacturasFormDialog({ open, onOpenChange, onCreated }: Props) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'ticket' | 'mototaxi'>('ticket');

  // --- Catálogos ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mototaxis, setMototaxis] = useState<Mototaxi[]>([]);

  // --- Encabezado Factura ---
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [usoCFDI, setUsoCFDI] = useState<string>('G03');
  const [metodoPago, setMetodoPago] = useState<string>('PUE');
  const [formaPago, setFormaPago] = useState<string>('01');

  // --- Estado: MODO TICKET ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<TicketResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<string | null>(null);

  // --- Estado: MODO MOTOTAXI ---
  const [addMototaxiId, setAddMototaxiId] = useState<string>('');
  const [addCant, setAddCant] = useState<number>(1);

  // --- Estado: ITEMS ---
  const [items, setItems] = useState<LocalItem[]>([]);

  // Carga inicial
  useEffect(() => {
    if (open && clientes.length === 0) {
      const loadCatalogos = async () => {
        try {
           const [resCl, resMt] = await Promise.all([
             FacturaService.clientes(),
             FacturaService.mototaxis()
           ]);
           setClientes((resCl as any).data || []);
           setMototaxis((resMt as any).data || []);
        } catch { toast.error('Error cargando catálogos'); }
      };
      loadCatalogos();
    }
  }, [open]);

  // Búsqueda en vivo
  useEffect(() => {
    if (activeTab !== 'ticket' || !searchTerm || ticketSeleccionado) {
        setSearchResults([]);
        return;
    }

    const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
            const res = await fetch(api(`/ventas?search=${searchTerm}`), {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            });
            const json = await res.json();
            setSearchResults(json.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, ticketSeleccionado]);

  const totalGlobal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.importe, 0);
  }, [items]);

  // --------------------------------------------------------
  // LOGICA MODO TICKET
  // --------------------------------------------------------
  const handleSelectTicket = async (ticket: TicketResult) => {
      try {
          // CORRECCIÓN 401: Agregamos credenciales y headers
          const res = await fetch(api(`/ventas/${ticket.id}`), {
             headers: { 'Accept': 'application/json' },
             credentials: 'include' 
          });
          
          if (!res.ok) throw new Error('Error al obtener ticket');
          
          const json = await res.json();
          const venta = json.data;

          if (venta.estatus === 'Facturado') {
              toast.warning('Este ticket ya está facturado');
          }

          setClienteId(venta.cliente_id);
          
          const itemsImportados = venta.items.map((i: any) => ({
            descripcion: i.descripcion,
            cantidad: Number(i.cantidad),
            precio_unitario: Number(i.precio_unitario),
            importe: Number(i.importe),
            id_origen: i.producto_id,
            tipo_origen: 'Ticket'
          }));

          setItems(itemsImportados);
          setTicketSeleccionado(venta.folio);
          setSearchTerm(venta.folio);
          setSearchResults([]);
          toast.success('Ticket cargado');

      } catch (e) {
          toast.error('Error al cargar detalles del ticket');
      }
  };

  const handleClearTicket = () => {
      setItems([]);
      setTicketSeleccionado(null);
      setSearchTerm('');
      setClienteId(null);
  };

  // --------------------------------------------------------
  // LOGICA MODO MOTOTAXI
  // --------------------------------------------------------
  const handleAddMototaxi = () => {
      if (!addMototaxiId) return;
      const moto = mototaxis.find(m => m.id === Number(addMototaxiId));
      
      if (moto) {
          const newItem: LocalItem = {
              descripcion: `${moto.modelo} ${moto.color} (Serie: ${moto.serie})`,
              cantidad: addCant,
              precio_unitario: moto.precio,
              importe: moto.precio * addCant,
              id_origen: moto.id,
              tipo_origen: 'Mototaxi'
          };
          setItems([...items, newItem]);
          setAddMototaxiId('');
          toast.success('Mototaxi agregado');
      }
  };

  const handleRemoveItem = (index: number) => {
    const copia = [...items];
    copia.splice(index, 1);
    setItems(copia);
    if (copia.length === 0) {
        setTicketSeleccionado(null);
    }
  };

  // --------------------------------------------------------
  // SUBMIT
  // --------------------------------------------------------
  const submit = async () => {
    if (!clienteId) return toast.error('Selecciona un cliente');
    if (items.length === 0) return toast.error('No hay conceptos');

    const esSoloMototaxi = items.every(i => i.tipo_origen === 'Mototaxi');
    const esSoloTicket = items.every(i => i.tipo_origen === 'Ticket');
    
    let tipoVentaStr = 'Varios';
    if (esSoloMototaxi) tipoVentaStr = 'Mototaxi';
    if (esSoloTicket) tipoVentaStr = 'Refaccion'; 

    const primerMototaxi = items.find(i => i.tipo_origen === 'Mototaxi');

    const payload: CrearFacturaPayload = {
      cliente_id: clienteId,
      tipo: 'Ingreso',
      tipo_venta: tipoVentaStr,
      metodo_pago: metodoPago,
      forma_pago: formaPago,
      uso_cfdi: usoCFDI,
      mototaxi_id: primerMototaxi?.id_origen || null,
      uuid_relacionado: ticketSeleccionado || undefined,
      items: items.map(i => ({
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario
      }))
    };

    try {
      await FacturaService.create(payload);
      toast.success('Factura timbrada exitosamente');
      onCreated();
      onOpenChange(false);
      handleClearTicket();
    } catch (e: any) {
      toast.error('Error al crear factura');
    }
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  const FormBody = (
    <div className="space-y-5 py-2">
      
      {/* 1. DATOS GENERALES (Responsive Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded border">
         <div className="md:col-span-2">
            <Label>Cliente</Label>
            <Select 
                value={clienteId ? String(clienteId) : ''} 
                onValueChange={(v: any) => setClienteId(Number(v))}
                disabled={!!ticketSeleccionado}
            >
                <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar..."/></SelectTrigger>
                <SelectContent>
                    {clientes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                </SelectContent>
            </Select>
         </div>
         <div className="grid grid-cols-2 gap-2 md:contents">
           <div className="md:col-span-1">
              <Label className="text-xs">Método Pago</Label>
              <Select value={metodoPago} onValueChange={setMetodoPago}>
                 <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                 <SelectContent><SelectItem value="PUE">PUE</SelectItem><SelectItem value="PPD">PPD</SelectItem></SelectContent>
              </Select>
           </div>
           <div className="md:col-span-1">
              <Label className="text-xs">Forma Pago</Label>
              <Select value={formaPago} onValueChange={setFormaPago}>
                 <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                 <SelectContent><SelectItem value="01">01 - Efectivo</SelectItem><SelectItem value="03">03 - Transferencia</SelectItem><SelectItem value="04">04 - Tarjeta Crédito</SelectItem><SelectItem value="28">28 - Tarjeta Débito</SelectItem><SelectItem value="99">99 - Por definir</SelectItem></SelectContent>
              </Select>
           </div>
         </div>
         <div className="md:col-span-2">
            <Label className="text-xs">Uso CFDI</Label>
            <Select value={usoCFDI} onValueChange={setUsoCFDI}>
               <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
               <SelectContent><SelectItem value="G01">G01</SelectItem><SelectItem value="G03">G03</SelectItem><SelectItem value="S01">S01</SelectItem></SelectContent>
            </Select>
         </div>
      </div>

      <Separator />

      {/* 2. TABS DE SELECCIÓN */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ticket" disabled={items.length > 0 && !ticketSeleccionado}>
             <Receipt className="h-4 w-4 mr-2"/> Ticket
          </TabsTrigger>
          <TabsTrigger value="mototaxi" disabled={!!ticketSeleccionado}>
             <Bike className="h-4 w-4 mr-2"/> Mototaxi
          </TabsTrigger>
        </TabsList>

        {/* --- MODO TICKET (Responsive) --- */}
        <TabsContent value="ticket" className="space-y-3 mt-4">
             <div className="relative">
                <Label>Buscar Ticket</Label>
                <div className="flex flex-col md:flex-row gap-2 mt-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
                        <Input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Folio (ej. T-2025...)"
                            className="pl-9"
                            disabled={!!ticketSeleccionado}
                        />
                        {isSearching && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-blue-600"/>}
                    </div>
                    {ticketSeleccionado && (
                        <Button variant="outline" onClick={handleClearTicket} className="text-red-600 w-full md:w-auto">
                            <Trash2 className="h-4 w-4 mr-2"/> Limpiar
                        </Button>
                    )}
                </div>

                {/* RESULTADOS */}
                {searchResults.length > 0 && !ticketSeleccionado && (
                    <div className="absolute z-20 w-full bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {searchResults.map(t => (
                            <div key={t.id} className="p-2 hover:bg-blue-50 cursor-pointer border-b text-sm" onClick={() => handleSelectTicket(t)}>
                                <div className="font-bold text-slate-700">{t.folio}</div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{t.cliente.nombre}</span>
                                    <span>${Number(t.total).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </TabsContent>

        {/* --- MODO MOTOTAXI (Responsive) --- */}
        <TabsContent value="mototaxi" className="space-y-3 mt-4">
             <div className="flex flex-col md:flex-row gap-2 items-end">
                <div className="flex-1 w-full">
                    <Label>Seleccionar Mototaxi</Label>
                    <Select value={addMototaxiId} onValueChange={setAddMototaxiId}>
                        <SelectTrigger><SelectValue placeholder="Modelo / Serie..."/></SelectTrigger>
                        <SelectContent>
                            {mototaxis.map(m => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                    {m.modelo} {m.color} - ${m.precio.toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddMototaxi} className="bg-blue-600 text-white w-full md:w-auto mt-2 md:mt-0">
                    <Plus className="h-4 w-4"/> Agregar
                </Button>
             </div>
        </TabsContent>
      </Tabs>

      {/* 3. TABLA DE CONCEPTOS (Scroll en móvil) */}
      <div className="border rounded-md overflow-hidden shadow-sm mt-4">
        <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 uppercase">Conceptos</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[300px]">
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                 <tr><td className="p-4 text-center text-gray-400 text-xs">Sin conceptos</td></tr>
              ) : (
                 items.map((item, idx) => (
                   <tr key={idx} className="bg-white">
                      <td className="p-2 w-12 text-center">{item.cantidad}</td>
                      <td className="p-2">
                          <div className="font-medium text-slate-700">{item.descripcion}</div>
                          <div className="text-[10px] text-gray-400">{item.tipo_origen}</div>
                      </td>
                      <td className="p-2 text-right font-bold text-slate-700">${item.importe.toLocaleString()}</td>
                      <td className="p-2 w-10 text-center">
                          <button title='cancelar' onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4"/></button>
                      </td>
                   </tr>
                 ))
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot className="bg-slate-50 border-t font-bold">
                  <tr>
                      <td colSpan={2} className="p-2 text-right text-[#B02128]">TOTAL</td>
                      <td className="p-2 text-right text-[#B02128] text-lg">${totalGlobal.toLocaleString()}</td>
                      <td></td>
                  </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );

  const Footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-4 pt-4 border-t">
      <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
      <Button onClick={submit} className="bg-[#B02128] text-white" disabled={items.length === 0 || !clienteId}>
        <CheckCircle className="mr-2 h-4 w-4" /> Timbrar
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] overflow-y-auto bg-white p-4">
          <SheetHeader>
            <SheetTitle>Nueva Factura</SheetTitle>
            <SheetDescription> Generacion de CFDI 4.0 </SheetDescription>
            <SheetDescription>Selecciona ticket o mototaxi</SheetDescription>
          </SheetHeader>
          {FormBody}
          {Footer}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-6 w-6 text-[#B02128]"/> Facturación
          </DialogTitle>
          <DialogDescription>
            Carga un ticket de venta o selecciona un mototaxi.
          </DialogDescription>
        </DialogHeader>
        {FormBody}
        {Footer}
      </DialogContent>
    </Dialog>
  );
}