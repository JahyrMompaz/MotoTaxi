import { useState } from "react";
import { Search, ShoppingCart, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { TicketPrint, TicketData } from './TicketPrint';

// Importamos tipos y servicio
import { Servicio } from "./types";
import { Refaccion } from "./types"; // Por si quieres agregar refacciones al servicio
import { Cliente } from "./types"; // O donde tengas definido Cliente
import { PosService } from "./PosService";

interface Props {
  servicios: Servicio[];
  refacciones: Refaccion[]; // Opcional, por si quieres mezclar
  clientes: Cliente[];
  onUpdateInventory: () => void;
}

interface CartItem {
  id: number;
  descripcion: string; // Nombre del servicio
  precio: number;
  cantidad: number;
  tipo: 'Servicio' | 'Refaccion';
}

export function ServiciosPOS({ servicios, clientes, onUpdateInventory }: Props) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [showTicket, setShowTicket] = useState(false);

  const filtered = servicios.filter((s) =>
    s.tipo.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const addToCart = (serv: Servicio) => {
    // Los servicios no tienen stock, siempre se pueden agregar
    const existing = cart.find((item) => item.id === serv.id && item.tipo === 'Servicio');

    if (existing) {
      setCart(cart.map((item) =>
          item.id === serv.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCart([...cart, { 
          id: serv.id, 
          descripcion: serv.tipo, 
          precio: serv.costo_real, 
          cantidad: 1, 
          tipo: 'Servicio' 
      }]);
    }
  };

  const removeFromCart = (idx: number) => {
    const newCart = [...cart];
    newCart.splice(idx, 1);
    setCart(newCart);
  };

  const handleCobrar = async () => {
    if (!clienteId) return toast.error("Selecciona un cliente");
    if (cart.length === 0) return toast.error("Carrito vacío");

    const payload = {
      cliente_id: Number(clienteId),
      total: total,
      subtotal: total / 1.16,
      iva: total - (total / 1.16),
      items: cart.map((item) => ({
        id: item.id,
        tipo: item.tipo,
        cantidad: item.cantidad,
        precio: item.precio,
        descripcion: item.descripcion
      })),
    };

    try {
      // 1. Guardamos la venta y RECIBIMOS LA RESPUESTA
      const response = await PosService.guardarVenta(payload);
      
      // 2. La respuesta de Laravel trae { message, data: { ...venta } }
      const ventaCreada = response.data; 

      toast.success("Venta realizada con éxito");
      
      // 3. Limpiamos carrito
      setCart([]);
      setClienteId("");
      onUpdateInventory();

      // 4. MOSTRAMOS EL TICKET
      setTicketData(ventaCreada);
      setShowTicket(true);

    } catch (error) {
      toast.error("Error al procesar la venta");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      
      {/* IZQUIERDA: CATÁLOGO SERVICIOS */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar servicio..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-2 content-start">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-blue-500"
              onClick={() => addToCart(item)}
            >
              <CardContent className="p-4">
                <div className="font-bold text-sm text-slate-700 mb-1">{item.tipo}</div>
                <p className="text-xs text-gray-500 line-clamp-2 h-8">{item.descripcion || 'Sin descripción'}</p>
                <div className="mt-2 text-right font-bold text-blue-600">
                  ${item.costo_real.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* DERECHA: TICKET */}
      <div className="flex flex-col bg-white border rounded-lg shadow-sm h-full">
        <div className="p-4 border-b bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-2 text-[#1E293B] font-bold mb-3">
            <ShoppingCart className="h-5 w-5" /> Ticket de Servicio
          </div>
          <Select value={clienteId} onValueChange={setClienteId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccionar Cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-20"/>
              Agrega servicios
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 border rounded-md text-sm bg-white">
                <div className="flex-1">
                  <div className="font-medium text-slate-700">{item.descripcion}</div>
                  <div className="text-xs text-gray-500">
                     {item.cantidad} x ${item.precio}
                  </div>
                </div>
                <div className="font-bold mr-3">${(item.precio * item.cantidad).toLocaleString()}</div>
                <button title="Eliminar" onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-100 border-t rounded-b-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total:</span>
            <span className="text-2xl font-bold text-blue-700">
              ${total.toLocaleString()}
            </span>
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
            onClick={handleCobrar}
            disabled={cart.length === 0}
          >
            Generar Orden
          </Button>
        </div>
      </div>
      <TicketPrint 
        open={showTicket} 
        data={ticketData} 
        onClose={() => setShowTicket(false)} 
      />
    </div>
  );
}