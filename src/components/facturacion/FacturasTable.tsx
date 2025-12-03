import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Eye,
  FileText,
  MinusCircle,
  PlusCircle,
  XCircle,
  Building2,
  Clock,
} from 'lucide-react';

import { useIsMobile } from '../ui/use-mobile';
import type { FacturaView } from './types';

type Props = {
  facturas: FacturaView[];
  hasCreate: boolean;
  canCancel: boolean;

  onView: (f: FacturaView) => void;
  onTimbrarPendiente: (f: FacturaView) => void;
  onDownload: (f: FacturaView) => void;
  onNotaCredito: (f: FacturaView) => void;
  onNotaCargo: (f: FacturaView) => void;
  onCancelar: (f: FacturaView) => void;
};

export default function FacturasTable({
  facturas,
  hasCreate,
  canCancel,
  onView,
  onTimbrarPendiente,
  onDownload,
  onNotaCredito,
  onNotaCargo,
  onCancelar,
}: Props) {
  const isMobile = useIsMobile();

  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case 'Timbrada':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelada':
        return <XCircle className="h-4 w-4" />;
      case 'Pendiente':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'Timbrada':
        return 'bg-green-600 text-white';
      case 'Cancelada':
        return 'bg-red-600 text-white';
      case 'Pendiente':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const FacturaCard = ({ factura }: { factura: FacturaView }) => (
    <div className="p-4 active:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Left section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <div className="mt-0.5">
              <FileText className="h-5 w-5 text-[#1E293B]" />
            </div>

            <div className="flex-1">
              <h3 className="text-[#1E293B] mb-1">{factura.folio}</h3>
              <p className="text-xs text-[#64748B] mb-2">{factura.cliente}</p>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {factura.tipo}
                </Badge>

                <Badge className={`${getStatusColor(factura.estatus)} flex items-center gap-1 text-xs`}>
                  {getStatusIcon(factura.estatus)}
                  <span>{factura.estatus}</span>
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-3">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{factura.rfc}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Calendar className="h-3.5 w-3.5" />
              <span>{factura.fecha}</span>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#B02128]" />
              <span className="text-[#B02128]">${factura.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-col gap-1">
          {/* Ver */}
          <Button variant="ghost" size="icon" onClick={() => onView(factura)}>
            <Eye className="h-4 w-4 text-green-600" />
          </Button>

          {/* Timbrar si pendiente */}
          {factura.estatus === 'Pendiente' && hasCreate && (
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600"
              onClick={() => onTimbrarPendiente(factura)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}

          {/* Acciones si está timbrada */}
          {factura.estatus === 'Timbrada' && (
            <>
              <Button variant="ghost" size="icon" onClick={() => onDownload(factura)}>
                <Download className="h-4 w-4 " />
              </Button>

              {hasCreate && !factura.tipo.includes('Nota') && (
                <>
                  <Button variant="ghost" size="icon" className="text-orange-600" onClick={() => onNotaCredito(factura)}>
                    <MinusCircle className="h-4 w-4 text-orange-600" />
                  </Button>

                  <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => onNotaCargo(factura)}>
                    <PlusCircle className="h-4 w-4 text-blue-600" />
                  </Button>
                </>
              )}

              {canCancel && (
                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => onCancelar(factura)}>
                  <XCircle className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className={isMobile ? 'p-3' : ''}>
        <CardTitle className={`text-[#1E293B] ${isMobile ? 'text-base' : ''}`}>Facturas Emitidas</CardTitle>
      </CardHeader>

      <CardContent className={isMobile ? 'p-0' : ''}>
        {isMobile ? (
          <div className="divide-y divide-gray-100">
            {facturas.map((f) => (
              <FacturaCard key={f.id} factura={f} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">RFC</TableHead>
                  <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {facturas.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.folio}</TableCell>
                    <TableCell>{f.cliente}</TableCell>
                    <TableCell className="hidden md:table-cell text-[#64748B]">{f.rfc}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{f.tipo}</Badge>
                    </TableCell>
                    <TableCell>${f.total.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell">{f.fecha}</TableCell>

                    <TableCell>
                      <Badge className={`${getStatusColor(f.estatus)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(f.estatus)}
                        {f.estatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Ver */}
                        <Button variant="ghost" title="Ver Factura" size="icon" onClick={() => onView(f)}>
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Timbrar */}
                        {f.estatus === 'Pendiente' && hasCreate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600"
                            onClick={() => onTimbrarPendiente(f)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Timbrada -> acciones */}
                        {f.estatus === 'Timbrada' && (
                          <>
                            <Button variant="ghost" size="icon" title="Descargar Factura" onClick={() => onDownload(f)}>
                              <Download className="h-4 w-4" />
                            </Button>

                            {hasCreate && !f.tipo.includes('Nota') && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Nota de Crédito"
                                  onClick={() => onNotaCredito(f)}
                                >
                                  <MinusCircle className="h-4 w-4 text-orange-600" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Nota de Cargo"
                                  className=""
                                  onClick={() => onNotaCargo(f)}
                                >
                                  <PlusCircle className="h-4 w-4 text-blue-600" />
                                </Button>
                              </>
                            )}

                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Cancelar Factura"
                                className="text-red-600"
                                onClick={() => onCancelar(f)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
