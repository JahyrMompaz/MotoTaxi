import { Badge } from "../ui/badge";
import { JSX } from "react";
import {
  MapPin,
  Truck,
  User,
  Package,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "../ui/separator";

// No importamos CartaPorte de types para evitar conflictos, usamos 'any' para máxima flexibilidad
interface Props {
  carta: any; 
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element | null;
}

export function CartaPorteView({ carta, getStatusColor, getStatusIcon }: Props) {
  if (!carta) return null;

  console.log("Datos recibidos en CartaPorteView:", carta); // DEBUG

  // 1. PARSEO ROBUSTO DE MERCANCÍAS
  let mercanciasList: any[] = [];
  try {
    if (Array.isArray(carta.mercancias)) {
        // Ya es un array (ideal)
        mercanciasList = carta.mercancias;
    } else if (typeof carta.mercancias === 'string') {
        // Es un string JSON, intentamos parsear
        // A veces viene con comillas escapadas raras, limpiamos si es necesario
        const jsonString = carta.mercancias;
        mercanciasList = JSON.parse(jsonString);
    }
  } catch (e) {
    console.error("Error al parsear mercancías:", e, carta.mercancias);
  }

  // 2. EXTRACCIÓN DE DATOS (BUSCAMOS EN TODAS PARTES)
  // Vehículo
  const placas = carta.vehiculoPlacas || carta.vehiculo_placas || carta.placa_vm || 'N/A';
  const modelo = carta.vehiculoModelo || carta.vehiculo_modelo || carta.anio_modelo_vm || 'N/A';
  const anio = carta.vehiculoAnio || carta.vehiculo_anio || ''; 
  const config = carta.vehiculoConfiguracion || carta.vehiculo_configuracion || carta.config_vehicular || 'N/A';
  const permiso = carta.permisoSCT || carta.permiso_sct || 'N/A';
  const numPermiso = carta.numPermisoSCT || carta.num_permiso_sct || carta.num_permiso || 'N/A';
  
  // Operador
  const chofer = carta.choferNombre || carta.chofer_nombre || carta.operador_nombre || 'N/A';
  const rfcChofer = carta.choferRFC || carta.chofer_rfc || carta.operador_rfc || 'N/A';
  const licencia = carta.choferLicencia || carta.chofer_licencia || carta.operador_licencia || 'N/A';
  
  // Seguro
  const aseguradora = carta.aseguraNombre || carta.asegura_nombre || carta.seguro_nombre || carta.asegura_resp_civil || 'N/A';
  const poliza = carta.polizaNumero || carta.poliza_numero || carta.seguro_poliza || carta.poliza_resp_civil || 'N/A';

  // Peso
  const pesoTotal = carta.pesoTotal || carta.peso_total || carta.peso_bruto_total || 0;

  return (
    <div className="py-4 font-sans text-slate-800">
      
      {/* HOJA ESTILO CARTA */}
      <div className="bg-white border border-gray-300 shadow-sm p-8 space-y-6 max-w-4xl mx-auto">

        {/* --- HEADER --- */}
        <div className="flex justify-between items-start border-b-2 border-[#B02128] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#B02128] uppercase tracking-wide">Mototaxis Pro</h1>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p><strong className="text-gray-700">RFC:</strong> MPR120515ABC</p>
              <p><strong className="text-gray-700">Régimen:</strong> 601 - General de Ley PM</p>
              <p>Av. Principal 1000, Col. Centro, CP 64000</p>
              <p>Monterrey, Nuevo León, México</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Carta Porte 3.1</h2>
            <div className="text-xl font-bold text-[#1E293B] mt-1">{carta.folio}</div>
            
            <div className="mt-3 flex flex-col items-end gap-1">
              <Badge className={`${getStatusColor(carta.estatus)} px-3 py-1 rounded-full text-[10px]`}>
                {getStatusIcon(carta.estatus)}
                <span className="ml-1 uppercase">{carta.estatus}</span>
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Fecha:</strong> {carta.fecha} {carta.horaSalida ? `• ${carta.horaSalida}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN 1: RUTA --- */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 border-b pb-1">
            <MapPin className="h-4 w-4 text-[#B02128]"/> Ruta del Transporte
          </h3>
          <div className="grid grid-cols-2 gap-8 text-sm">
            {/* Origen */}
            <div className="relative pl-4 border-l-2 border-green-500">
              <span className="absolute -left-[5px] -top-1 h-2 w-2 rounded-full bg-green-500"></span>
              <p className="text-xs font-bold text-green-700 uppercase mb-1">Origen</p>
              <p className="font-semibold text-gray-800">{carta.origen}</p>
              <p className="text-xs text-gray-500 mt-1">Salida: {carta.fecha} {carta.horaSalida}</p>
            </div>

            {/* Destino */}
            <div className="relative pl-4 border-l-2 border-red-500">
              <span className="absolute -left-[5px] -bottom-1 h-2 w-2 rounded-full bg-red-500"></span>
              <p className="text-xs font-bold text-red-700 uppercase mb-1">Destino</p>
              <p className="font-semibold text-gray-800">{carta.destino}</p>
              <p className="text-xs text-gray-500 mt-1">Distancia: {carta.distanciaKm} km</p>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN 2: MERCANCÍAS --- */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 border-b pb-1">
            <Package className="h-4 w-4 text-[#B02128]"/> Mercancías
          </h3>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2">Clave SAT</th>
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2 text-center">Cant</th>
                  <th className="px-4 py-2">Unidad</th>
                  <th className="px-4 py-2 text-right">Peso (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mercanciasList.length > 0 ? mercanciasList.map((m, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 font-mono text-xs">{m.clave_sat || m.BienesTransp}</td>
                    <td className="px-4 py-2 font-medium text-gray-700">{m.descripcion || m.Descripcion}</td>
                    <td className="px-4 py-2 text-center">{m.cantidad || m.Cantidad}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{m.unidad_sat || m.ClaveUnidad}</td>
                    <td className="px-4 py-2 text-right font-mono">{m.peso_kg || m.PesoEnKg}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400 italic">Sin mercancías registradas</td></tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 font-bold text-xs text-gray-700">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right uppercase">Peso Bruto Total</td>
                  <td className="px-4 py-2 text-right">{pesoTotal} kg</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* --- SECCIÓN 3: TRANSPORTE Y OPERADOR --- */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Vehículo */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 border-b pb-1">
              <Truck className="h-4 w-4 text-[#B02128]"/> Vehículo
            </h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Placas:</span>
                <span className="font-mono font-bold">{placas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Modelo / Año:</span>
                <span>{modelo} {anio ? `(${anio})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Configuración:</span>
                <span>{config}</span>
              </div>
              <Separator className="my-2"/>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Permiso SCT:</span>
                <span>{permiso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Num. Permiso:</span>
                <span>{numPermiso}</span>
              </div>
            </div>
          </div>

          {/* Operador y Seguro */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 border-b pb-1">
                <User className="h-4 w-4 text-[#B02128]"/> Operador
              </h3>
              <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                <p className="font-bold text-gray-800">{chofer}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>RFC: {rfcChofer}</span>
                  <span>Licencia: {licencia}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 border-b pb-1">
                <ShieldCheck className="h-4 w-4 text-[#B02128]"/> Seguro
              </h3>
              <div className="text-xs text-gray-600 px-2 space-y-1">
                <p><strong>Aseguradora:</strong> {aseguradora}</p>
                <p><strong>Póliza:</strong> {poliza}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN 4: FACTURAS RELACIONADAS --- */}
        {carta.facturasVinculadas && carta.facturasVinculadas.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 border-b pb-1">
              <FileText className="h-4 w-4 text-[#B02128]"/> Documentos Relacionados
            </h3>
            <div className="flex flex-wrap gap-2">
              {carta.facturasVinculadas.map((folio: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700">
                  Factura {folio}
                </Badge>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}