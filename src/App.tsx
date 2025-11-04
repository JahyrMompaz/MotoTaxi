import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { ClientesPage } from './components/clientes/ClientesPage';
import { Clientes } from './components/Clientes';
import { Refacciones } from './components/Refacciones';
import { RefaccionesPage } from './components/refacciones/RefaccionesPage';
import { Mototaxis } from './components/Mototaxis';
import { MototaxiPage } from './components/mototaxis/MototaxiPage';
import { Servicios } from './components/Servicios';
import { ServicioPage } from './components/servicios/ServicioPage';
import { Facturacion } from './components/Facturacion';
import { FacturasPage } from './components/facturacion/FacturasPage';
import { Reportes } from './components/Reportes';
import { ReportesPage } from './components/reportes/ReportesPage';
import { Configuracion } from './components/Configuracion';
import { Toaster } from './components/ui/sonner';

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
        reportes: 'reportes.view',
        configuracion: 'configuracion.view',
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
      case 'facturacion':
        return <FacturasPage />;
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
