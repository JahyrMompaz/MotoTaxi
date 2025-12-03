import { useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import { Button } from './ui/button';

interface TicketItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface TicketData {
  tipo: 'venta' | 'servicio';
  folio: string;
  fecha: string;
  hora: string;
  cliente?: string;
  vendedor?: string;
  items: TicketItem[];
  subtotal: number;
  iva: number;
  total: number;
  observaciones?: string;
  metodoPago?: string;
  montoPagado?: number;
  cambio?: number;
}

interface TicketPrintProps {
  data: TicketData;
  onClose?: () => void;
}

export function TicketPrint({ data, onClose }: TicketPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = printRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket ${data.folio}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              padding: 5mm;
              font-size: 12px;
              line-height: 1.4;
            }
            .ticket-header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .company-info {
              font-size: 10px;
              margin-bottom: 2px;
            }
            .ticket-info {
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
              font-size: 11px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .items-header {
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
              margin-bottom: 6px;
              font-weight: bold;
              font-size: 11px;
            }
            .item-row {
              margin-bottom: 6px;
              font-size: 11px;
            }
            .item-name {
              font-weight: bold;
              margin-bottom: 2px;
            }
            .item-details {
              display: flex;
              justify-content: space-between;
            }
            .totals {
              border-top: 1px dashed #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 11px;
            }
            .total-row.final {
              font-size: 14px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 6px;
              margin-top: 6px;
            }
            .footer {
              text-align: center;
              border-top: 2px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
              font-size: 10px;
            }
            .observaciones {
              border-top: 1px dashed #000;
              padding-top: 6px;
              margin-top: 6px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSaveAsTxt = () => {
    // Generar contenido del ticket en formato texto plano
    let txtContent = '';
    
    // Header
    txtContent += '================================================\n';
    txtContent += '                  MOTOTAXIS\n';
    txtContent += '      Venta de Refacciones y Servicios\n';
    txtContent += '           RFC: XXXXXXXXXXXXX\n';
    txtContent += '          Tel: (123) 456-7890\n';
    txtContent += '================================================\n\n';
    
    // Información del Ticket
    txtContent += `Folio:                        ${data.folio}\n`;
    txtContent += `Fecha:                        ${data.fecha}\n`;
    txtContent += `Hora:                         ${data.hora}\n`;
    if (data.cliente) {
      txtContent += `Cliente:                      ${data.cliente}\n`;
    }
    if (data.vendedor) {
      const label = data.tipo === 'servicio' ? 'Técnico' : 'Vendedor';
      txtContent += `${label}:                      ${data.vendedor}\n`;
    }
    if (data.metodoPago) {
      txtContent += `Método de Pago:               ${data.metodoPago}\n`;
    }
    if (data.montoPagado) {
      txtContent += `Monto Pagado:                 $${data.montoPagado.toFixed(2)}\n`;
    }
    if (data.cambio) {
      txtContent += `Cambio:                       $${data.cambio.toFixed(2)}\n`;
    }
    txtContent += '------------------------------------------------\n\n';
    
    // Items
    const itemsTitle = data.tipo === 'venta' ? 'PRODUCTOS' : 'SERVICIOS Y REFACCIONES';
    txtContent += `${itemsTitle}\n`;
    txtContent += '================================================\n';
    data.items.forEach((item) => {
      txtContent += `${item.descripcion}\n`;
      const cantPrecio = `${item.cantidad} x $${item.precioUnitario.toFixed(2)}`;
      const subtotal = `$${item.subtotal.toFixed(2)}`;
      const spaces = ' '.repeat(Math.max(1, 48 - cantPrecio.length - subtotal.length));
      txtContent += `${cantPrecio}${spaces}${subtotal}\n\n`;
    });
    
    // Totales
    txtContent += '------------------------------------------------\n';
    txtContent += `Subtotal:                     $${data.subtotal.toFixed(2)}\n`;
    txtContent += `IVA (16%):                    $${data.iva.toFixed(2)}\n`;
    txtContent += '================================================\n';
    txtContent += `TOTAL:                        $${data.total.toFixed(2)}\n`;
    txtContent += '================================================\n\n';
    
    // Observaciones
    if (data.observaciones) {
      txtContent += '------------------------------------------------\n';
      txtContent += 'Observaciones:\n';
      txtContent += `${data.observaciones}\n`;
      txtContent += '------------------------------------------------\n\n';
    }
    
    // Footer
    txtContent += '================================================\n';
    txtContent += '         ¡Gracias por su preferencia!\n';
    txtContent += '\n';
    txtContent += '   Este ticket no es válido como factura fiscal\n';
    txtContent += '\n';
    txtContent += '      Solicite su factura electrónica\n';
    txtContent += '    dentro de las 72 horas siguientes\n';
    txtContent += '================================================\n';
    
    // Crear y descargar el archivo
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.folio}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Vista Previa del Ticket */}
      <div 
        ref={printRef} 
        className="bg-white border-2 border-gray-300 rounded-lg p-6 max-w-[320px] mx-auto shadow-lg"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
          <div className="company-name text-lg mb-1">MOTOTAXIS</div>
          <div className="company-info text-xs">Venta de Refacciones y Servicios</div>
          <div className="company-info text-xs">RFC: XXXXXXXXXXXXX</div>
          <div className="company-info text-xs">Tel: (123) 456-7890</div>
        </div>

        {/* Información del Ticket */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2 text-xs">
          <div className="info-row flex justify-between mb-1">
            <span>Folio:</span>
            <span className="font-bold">{data.folio}</span>
          </div>
          <div className="info-row flex justify-between mb-1">
            <span>Fecha:</span>
            <span>{data.fecha}</span>
          </div>
          <div className="info-row flex justify-between mb-1">
            <span>Hora:</span>
            <span>{data.hora}</span>
          </div>
          {data.cliente && (
            <div className="info-row flex justify-between mb-1">
              <span>Cliente:</span>
              <span>{data.cliente}</span>
            </div>
          )}
          {data.vendedor && (
            <div className="info-row flex justify-between mb-1">
              <span>{data.tipo === 'servicio' ? 'Técnico' : 'Vendedor'}:</span>
              <span>{data.vendedor}</span>
            </div>
          )}
          {data.metodoPago && (
            <div className="info-row flex justify-between mb-1">
              <span>Método de Pago:</span>
              <span>{data.metodoPago}</span>
            </div>
          )}
          {data.montoPagado && (
            <div className="info-row flex justify-between mb-1">
              <span>Monto Pagado:</span>
              <span>${data.montoPagado.toFixed(2)}</span>
            </div>
          )}
          {data.cambio && (
            <div className="info-row flex justify-between mb-1">
              <span>Cambio:</span>
              <span>${data.cambio.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-3">
          <div className="items-header border-b border-gray-800 pb-1 mb-2 text-xs">
            {data.tipo === 'venta' ? 'PRODUCTOS' : 'SERVICIOS Y REFACCIONES'}
          </div>
          {data.items.map((item, index) => (
            <div key={index} className="item-row mb-2 text-xs">
              <div className="item-name mb-1">{item.descripcion}</div>
              <div className="item-details flex justify-between">
                <span>{item.cantidad} x ${item.precioUnitario.toFixed(2)}</span>
                <span className="font-bold">${item.subtotal.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="totals border-t border-dashed border-gray-400 pt-2">
          <div className="total-row flex justify-between mb-1 text-xs">
            <span>Subtotal:</span>
            <span>${data.subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row flex justify-between mb-1 text-xs">
            <span>IVA (16%):</span>
            <span>${data.iva.toFixed(2)}</span>
          </div>
          <div className="total-row final flex justify-between border-t-2 border-gray-800 pt-2 mt-2">
            <span>TOTAL:</span>
            <span>${data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Observaciones */}
        {data.observaciones && (
          <div className="observaciones border-t border-dashed border-gray-400 pt-2 mt-2 text-xs">
            <div className="font-bold mb-1">Observaciones:</div>
            <div>{data.observaciones}</div>
          </div>
        )}

        {/* Footer */}
        <div className="footer text-center border-t-2 border-dashed border-gray-400 pt-3 mt-3 text-xs">
          <div className="mb-1">¡Gracias por su preferencia!</div>
          <div className="text-[10px]">Este ticket no es válido como factura fiscal</div>
          <div className="text-[10px] mt-2">
            Solicite su factura electrónica<br/>
            dentro de las 72 horas siguientes
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleSaveAsTxt}
          className="bg-[#B02128] hover:bg-[#8B1A20] text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Guardar Ticket
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );
}