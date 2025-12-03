import { useState, useEffect } from 'react';
import { ShoppingCart, Wrench, Package, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { useIsMobile } from '../ui/use-mobile';

// Componentes Hijos
import { RefaccionesPOS } from './RefaccionesPOS';
import { ServiciosPOS } from './ServiciosPOS';

// Servicio y Tipos Reales
import { PosService } from './PosService';
import { Refaccion } from './types'; 
import { Servicio } from './types';
import { Cliente } from './types'; // O importa desde ./types si unificaste

export function PuntoDeVenta() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('refacciones');
  
  // Estados para datos reales
  const [refacciones, setRefacciones] = useState<Refaccion[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga de datos reales
  const loadData = async () => {
    try {
      const [refs, servs, clis] = await Promise.all([
        PosService.getRefacciones(),
        PosService.getServicios(),
        PosService.getClientes()
      ]);
      setRefacciones(refs);
      setServicios(servs);
      setClientes(clis);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar catálogos del POS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaleComplete = () => {
    loadData(); 
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-[#B02128]" />
        <p>Cargando sistema de ventas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER ORIGINAL */}
      <div>
        <h1 className="text-[#1E293B] text-2xl font-bold mb-2">Punto de Venta</h1>
        <p className="text-[#64748B]">Sistema de ventas para refacciones y servicios</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'mb-4' : ''}`}>
          <TabsTrigger 
            value="refacciones" 
            className="data-[state=active]:bg-[#B02128] data-[state=active]:text-white"
          >
            <Package className="h-4 w-4 mr-2" />
            Venta de Refacciones
          </TabsTrigger>
          <TabsTrigger 
            value="servicios" 
            className="data-[state=active]:bg-[#B02128] data-[state=active]:text-white"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Venta de Servicios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="refacciones">
          <RefaccionesPOS 
            refacciones={refacciones}
            clientes={clientes}
            onUpdateInventory={handleSaleComplete}
          />
        </TabsContent>

        <TabsContent value="servicios">
          <ServiciosPOS 
            // Si ServiciosPOS espera 'refacciones', pásaselas, si no, ajusta sus props
            refacciones={refacciones} 
            servicios={servicios}
            clientes={clientes}
            onUpdateInventory={handleSaleComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}