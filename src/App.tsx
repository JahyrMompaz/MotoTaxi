import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Clientes } from './components/Clientes';
import { Refacciones } from './components/Refacciones';
import { Mototaxis } from './components/Mototaxis';
import { Servicios } from './components/Servicios';
import { Facturacion } from './components/Facturacion';
import { Reportes } from './components/Reportes';
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
        return <Clientes />;
      case 'refacciones':
        return <Refacciones />;
      case 'mototaxis':
        return <Mototaxis />;
      case 'servicios':
        return <Servicios />;
      case 'facturacion':
        return <Facturacion />;
      case 'reportes':
        return <Reportes />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <Clientes />;
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
