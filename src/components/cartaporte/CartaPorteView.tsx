import {
  Badge
} from "../ui/badge";
import { JSX } from "react";
import {
  MapPin,
  Truck,
  User,
  Package,
  FileText,
} from "lucide-react";

interface Props {
  carta: any; // puedes reemplazar con tu interface CartaPorte
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element | null;
}

export function CartaPorteView({ carta, getStatusColor, getStatusIcon }: Props) {
  if (!carta) return null;

  return (
    <div className="py-4">
      {/* Documento estilo PDF */}
      <div className="bg-white border-2 border-gray-300 p-6 space-y-4">

        {/* ===========================
            HEADER — LOGO + EMISOR
        ============================ */}
        <div className="flex justify-between items-start border-b-2 border-[#B02128] pb-4">

          {/* Izquierda: Logo + Empresa */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#B02128] rounded-lg p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl text-[#1E293B]">Mototaxis Pro SA de CV</h2>
                <p className="text-xs text-[#64748B]">
                  Transporte de Mototaxis y Refacciones
                </p>
              </div>
            </div>

            <div className="text-xs text-[#64748B] space-y-0.5">
              <p>RFC: MPR120515ABC</p>
              <p>Régimen Fiscal: 601 - General de Ley Personas Morales</p>
              <p>Av. Principal 1000, Col. Centro, CP 64000</p>
              <p>Monterrey, Nuevo León, México</p>
            </div>
          </div>

          {/* Derecha: Folio + Datos */}
          <div className="text-right">
            <Badge className={`${getStatusColor(carta.estatus)} mb-2`}>
              {getStatusIcon(carta.estatus)}
              <span className="ml-1">{carta.estatus}</span>
            </Badge>

            <div className="text-xs text-[#64748B] space-y-1">
              <p className="text-[#1E293B] uppercase">Complemento Carta Porte 2.0</p>
              <p className="text-lg text-[#B02128]">{carta.folio}</p>
              <p className="text-[#64748B]">Fecha: {carta.fecha}</p>
              <p className="text-[#64748B]">Hora: {carta.horaSalida ?? "08:00:00"}</p>
            </div>
          </div>
        </div>

        {/* ===========================
            INFORMACIÓN DEL AUTOTRANSPORTE
        ============================ */}
        <div className="border border-gray-300 rounded p-3">
          <h3 className="text-xs uppercase text-[#64748B] mb-3 bg-[#1E293B] text-white px-3 py-2 -m-3 rounded-t">
            Información del Autotransporte Federal
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#64748B]">Permiso SCT:</p>
              <p className="text-[#1E293B]">TPAF01 - Autotransporte Federal de Carga</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Número de Permiso:</p>
              <p className="text-[#1E293B]">12345678</p>
            </div>
          </div>
        </div>

        {/* ===========================
            UBICACIONES
        ============================ */}
        <div className="border border-gray-300 rounded p-3">
          <h3 className="text-xs uppercase text-[#64748B] mb-3 bg-green-600 text-white px-3 py-2 -m-3 rounded-t flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ubicaciones de Origen y Destino
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* ORIGEN */}
            <div className="border-l-4 border-green-500 pl-3">
              <p className="text-xs uppercase text-green-700 mb-2">Origen</p>
              <div className="text-sm space-y-1">
                <p className="text-[#1E293B]">{carta.origen}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <p className="text-[#64748B]">Fecha/Hora Salida:</p>
                    <p className="text-[#1E293B]">
                      {carta.fecha} {carta.horaSalida ?? "08:00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DESTINO */}
            <div className="border-l-4 border-red-500 pl-3">
              <p className="text-xs uppercase text-red-700 mb-2">Destino</p>
              <div className="text-sm space-y-1">
                <p className="text-[#1E293B]">{carta.destino}</p>
                <p className="text-xs text-[#64748B]">
                  Distancia Total: {carta.distanciaKm} km
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <p className="text-[#64748B]">Fecha/Hora Llegada Est.:</p>
                    <p className="text-[#1E293B]">
                      {carta.fecha} 18:00
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===========================
            VEHÍCULO
        ============================ */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <h3 className="text-xs uppercase text-white bg-[#1E293B] px-3 py-2 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Identificación Vehicular
          </h3>

          <div className="p-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-[#64748B]">Configuración Vehicular:</p>
              <p className="text-[#1E293B]">
                {carta.vehiculoConfiguracion}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Placa Vehicular:</p>
              <p className="text-[#1E293B]">{carta.vehiculoPlacas}</p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Año Modelo:</p>
              <p className="text-[#1E293B]">{carta.vehiculoAnio}</p>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-[#64748B]">Modelo:</p>
              <p className="text-[#1E293B]">{carta.vehiculoModelo}</p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Aseguradora:</p>
              <p className="text-[#1E293B]">AXA Seguros SA</p>
            </div>

            <div className="col-span-3">
              <p className="text-xs text-[#64748B]">Póliza de Seguro:</p>
              <p className="text-[#1E293B]">POL-2024-987654321</p>
            </div>
          </div>
        </div>

        {/* ===========================
            OPERADOR
        ============================ */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <h3 className="text-xs uppercase text-white bg-[#1E293B] px-3 py-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Operador del Transporte
          </h3>

          <div className="p-3 grid grid-cols-3 gap-3 text-sm">
            <div className="col-span-2">
              <p className="text-xs text-[#64748B]">Nombre del Operador:</p>
              <p className="text-[#1E293B]">{carta.choferNombre}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">RFC:</p>
              <p className="text-[#1E293B]">{carta.choferRFC ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Número de Licencia:</p>
              <p className="text-[#1E293B]">{carta.choferLicencia}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[#64748B]">Registro de Identidad Tributaria:</p>
              <p className="text-[#1E293B]">Residente en México</p>
            </div>
          </div>
        </div>

        {/* ===========================
            CFDIs RELACIONADOS
        ============================ */}
        <div className="border border-gray-300 rounded overflow-hidden">
          <h3 className="text-xs uppercase text-white bg-[#1E293B] px-3 py-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CFDIs Relacionados
          </h3>

          <div className="p-3">
            <div className="space-y-2">
              {carta.facturasVinculadas.map((folio: string, index: number) => (
                <div
                  key={folio}
                  className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded border border-gray-200 text-sm"
                >
                  <div>
                    <p className="text-xs text-[#64748B]">Folio Fiscal:</p>
                    <p className="text-[#1E293B] text-xs break-all">
                      A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Serie/Folio:</p>
                    <p className="text-[#1E293B]">{folio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Fecha:</p>
                    <p className="text-[#1E293B]">{carta.fecha}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Estatus:</p>
                    <Badge variant="outline" className="text-xs">Timbrado</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-800">
                <strong>Total de CFDIs Vinculados:</strong>
                {" "}
                {carta.facturasVinculadas.length} factura(s) timbrada(s)
              </p>
            </div>
          </div>
        </div>

        {/* ===========================
            FOOTER
        ============================ */}
        <div className="text-center text-[10px] text-[#64748B] pt-4 border-t border-gray-300 space-y-1">
          <p className="text-[#1E293B]">
            Este documento es una representación impresa del Complemento Carta Porte 2.0
          </p>
          <p>
            Generado conforme a las especificaciones del SAT para el transporte de mercancías
          </p>
          <p className="mt-2">
            Fecha de Generación: {carta.fecha} 12:00:00
          </p>
        </div>

      </div>
    </div>
  );
}
