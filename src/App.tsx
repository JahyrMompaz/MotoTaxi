import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { ClientesPage } from './components/clientes/ClientesPage';

import { RefaccionesPage } from './components/refacciones/RefaccionesPage';

import { MototaxiPage } from './components/mototaxis/MototaxiPage';

import { ServicioPage } from './components/servicios/ServicioPage';

import FacturasPage from './components/facturacion/FacturasPage';

import { ReportesPage } from './components/reportes/ReportesPage';
import { PuntoDeVenta } from './components/pos/PuntoDeVenta';
import { Configuracion } from './components/Configuracion';
import { Toaster } from './components/ui/sonner';

import CartaPortePage from './components/cartaporte/CartaPortePage';

function AppContent() {
  const { user, hasPermission } = useAuth();
  const [currentPage, setCurrentPage] = useState('clientes');

  // Redirigir a una página con permisos si el usuario no tiene acceso a la actual
  useEffect(() => {
    if (user) {
      const pagePermissionMap: Record<string, string> = {
        clientes: 'clientes.view',
        refacciones: 'refacciones.view',
        mototaxis: 'mototaxis.view',
        servicios: 'servicios.view',
        facturacion: 'facturacion.view',
        cartaPorte: 'cartaPorte.view',
        reportes: 'reportes.view',
        configuracion: 'configuracion.view',
        puntoDeVenta: 'puntoDeVenta.view',
      };

      const currentPermission = pagePermissionMap[currentPage];
      if (!hasPermission(currentPermission)) {
        // Buscar la primera página a la que el usuario tenga acceso
        const firstAccessiblePage = Object.keys(pagePermissionMap).find(page => 
          hasPermission(pagePermissionMap[page])
        );
        if (firstAccessiblePage) {
          setCurrentPage(firstAccessiblePage);
        }
      }
    }
  }, [user, currentPage, hasPermission]);

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'clientes':
        return <ClientesPage />;
      case 'refacciones':
        return <RefaccionesPage />;
      case 'mototaxis':
        return <MototaxiPage />;
      case 'servicios':
        return <ServicioPage />;
      case 'puntoDeVenta':
        return <PuntoDeVenta />;
      case 'facturacion':
        return <FacturasPage />;
      case 'cartaPorte':
        return <CartaPortePage />;
      case 'reportes':
        return <ReportesPage />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <ClientesPage />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
