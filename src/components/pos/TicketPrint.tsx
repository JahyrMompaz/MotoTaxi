import { useEffect, useRef } from 'react';
import { Printer, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../ui/dialog';

// Tipos que coinciden con la respuesta de tu VentaController
export interface TicketData {
  folio: string;
  created_at: string;
  cliente: { nombre: string; rfc: string };
  items: Array<{
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    importe: number;
  }>;
  subtotal: number;
  iva: number;
  total: number;
}

interface Props {
  data: TicketData | null;
  open: boolean;
  onClose: () => void;
}

export function TicketPrint({ data, open, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  // Función para abrir la ventana de impresión
  const handlePrint = () => {
    if (!data) return;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    // Generamos el HTML crudo del ticket
    const htmlContent = `
      <html>
        <head>
          <title>Ticket ${data.folio}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
            .title { font-size: 16px; font-weight: bold; }
            .info { margin-bottom: 5px; }
            .items-table { width: 100%; text-align: left; }
            .totals { text-align: right; margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 10px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MOTOTAXIS PRO</div>
            <div>RFC: MPR120515ABC</div>
            <div>Monterrey, NL</div>
          </div>
          
          <div class="info">
            <strong>Folio:</strong> ${data.folio}<br/>
            <strong>Fecha:</strong> ${new Date(data.created_at).toLocaleString()}<br/>
            <strong>Cliente:</strong> ${data.cliente.nombre}<br/>
          </div>

          <table class="items-table">
            <thead>
              <tr style="border-bottom: 1px solid #000;">
                <th>Cant</th>
                <th>Desc</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.cantidad}</td>
                  <td>${item.descripcion}</td>
                  <td align="right">$${Number(item.importe).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal: $${Number(data.subtotal).toFixed(2)}</div>
            <div>IVA: $${Number(data.iva).toFixed(2)}</div>
            <div style="font-size: 14px; font-weight: bold;">TOTAL: $${Number(data.total).toFixed(2)}</div>
          </div>

          <div class="footer">
            ¡Gracias por su compra!<br/>
            Este ticket no es factura fiscal.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Esperar a que cargue y mandar imprimir
    setTimeout(() => {
      printWindow.print();
      printWindow.close(); // Opcional: cerrar ventana tras imprimir
    }, 500);
  };

  // Auto-imprimir al abrir (opcional)
  /* useEffect(() => {
    if (open && data) handlePrint();
  }, [open, data]); */

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10 text-green-500" />
            Venta Exitosa
          </DialogTitle>
        </DialogHeader>

        <div className="bg-gray-50 p-4 rounded border font-mono text-xs border-gray-200 max-h-[300px] overflow-y-auto">
            <div className="text-center font-bold mb-2">FOLIO: {data.folio}</div>
            <div className="space-y-1">
               {data.items.map((item, i) => (
                 <div key={i} className="flex justify-between">
                    <span>{item.cantidad} x {item.descripcion}</span>
                    <span>${Number(item.importe).toFixed(2)}</span>
                 </div>
               ))}
            </div>
            <div className="border-t border-gray-300 mt-2 pt-2 text-right font-bold text-lg">
                ${Number(data.total).toFixed(2)}
            </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={onClose} variant="outline">Cerrar</Button>
          <Button onClick={handlePrint} className="bg-[#B02128] text-white">
            <Printer className="h-4 w-4 mr-2"/> Imprimir Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}