import { useState } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { TicketPrint, TicketData } from './TicketPrint';
// Importamos los tipos reales y el servicio
import { Refaccion } from "./types"; // Asegúrate que la ruta sea correcta
import { Cliente } from "./types"; // O donde tengas definido Cliente
import { PosService } from "./PosService";

interface Props {
  refacciones: Refaccion[];
  clientes: Cliente[];
  onUpdateInventory: () => void;
}

// Interfaz local para el carrito
interface CartItem extends Refaccion {
  cantidadVenta: number;
}

export function RefaccionesPOS({ refacciones, clientes, onUpdateInventory }: Props) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [showTicket, setShowTicket] = useState(false);

  // Filtrar productos en tiempo real
  const filtered = refacciones.filter(
    (r) =>
      r.codigo.toLowerCase().includes(search.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  // Calcular Total
  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidadVenta, 0);

  // Agregar al carrito
  const addToCart = (ref: Refaccion) => {
    if (ref.existencia <= 0) return toast.error("Sin stock disponible");

    const existing = cart.find((item) => item.id === ref.id);

    if (existing) {
      if (existing.cantidadVenta + 1 > ref.existencia) {
        return toast.error("No hay suficiente inventario");
      }
      setCart(
        cart.map((item) =>
          item.id === ref.id ? { ...item, cantidadVenta: item.cantidadVenta + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...ref, cantidadVenta: 1 }]);
    }
  };

  // Quitar del carrito
  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Modificar cantidad manualmente
  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cantidadVenta + delta;
        // Validar stock máximo y mínimo 1
        if (newQty > item.existencia) {
           toast.error("Stock insuficiente");
           return item;
        }
        if (newQty < 1) return item;
        return { ...item, cantidadVenta: newQty };
      }
      return item;
    }));
  };

  // Cobrar (Guardar Venta)
  const handleCobrar = async () => {
    if (!clienteId) return toast.error("Debes seleccionar un cliente");
    if (cart.length === 0) return toast.error("El carrito está vacío");

    const payload = {
      cliente_id: Number(clienteId),
      total: total,
      subtotal: total / 1.16, // Cálculo simple IVA 16%
      iva: total - (total / 1.16),
      items: cart.map((item) => ({
        id: item.id,
        tipo: "Refaccion" as const, // 'as const' para que TS sepa que es literal
        cantidad: item.cantidadVenta,
        precio: item.precio,
        descripcion: item.descripcion // Guardamos nombre histórico
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
      
      {/* IZQUIERDA: CATÁLOGO */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por código o nombre..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-2 content-start">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                item.existencia > 0 ? "border-l-green-500" : "border-l-gray-300 opacity-60"
              }`}
              onClick={() => addToCart(item)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-500">{item.codigo}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${item.existencia > 5 ? 'bg-green-600' : 'bg-orange-500'}`}>
                    Stock: {item.existencia}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 mt-1 line-clamp-2 h-10">
                  {item.descripcion}
                </p>
                <div className="mt-2 text-right font-bold text-[#B02128]">
                  ${item.precio.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* DERECHA: TICKET / CARRITO */}
      <div className="flex flex-col bg-white border rounded-lg shadow-sm h-full">
        {/* Header Ticket */}
        <div className="p-4 border-b bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-2 text-[#1E293B] font-bold mb-3">
            <ShoppingCart className="h-5 w-5" /> Ticket de Venta
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

        {/* Lista Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-20"/>
              Carrito vacío
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 border rounded-md text-sm bg-white">
                <div className="flex-1">
                  <div className="font-medium text-slate-700 line-clamp-1">{item.descripcion}</div>
                  <div className="text-xs text-gray-500">${item.precio} c/u</div>
                </div>
                
                <div className="flex items-center gap-2 mx-2">
                   <button title="Menos" onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="p-1 hover:bg-gray-100 rounded"><Minus className="h-3 w-3"/></button>
                   <span className="w-4 text-center font-bold">{item.cantidadVenta}</span>
                   <button title="Más" onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="p-1 hover:bg-gray-100 rounded"><Plus className="h-3 w-3"/></button>
                </div>

                <div className="text-right">
                  <div className="font-bold">${(item.precio * item.cantidadVenta).toLocaleString()}</div>
                </div>
                <button title="Eliminar" onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Totales */}
        <div className="p-4 bg-slate-100 border-t rounded-b-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total a Pagar:</span>
            <span className="text-2xl font-bold text-[#B02128]">
              ${total.toLocaleString()}
            </span>
          </div>
          <Button 
            className="w-full bg-[#B02128] hover:bg-[#8B1A20] text-white h-12 text-lg"
            onClick={handleCobrar}
            disabled={cart.length === 0}
          >
            Cobrar Ticket
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