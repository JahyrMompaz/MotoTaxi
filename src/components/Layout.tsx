import { useState } from 'react';
import { Users, Wrench, Bike, FileText, BarChart3, Settings, Menu, X, Package, LogOut, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from './AuthContext';
import { useIsMobile } from './ui/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const isMobile = useIsMobile();

  const allMenuItems = [
    { id: 'clientes', label: 'Clientes', icon: Users, permission: 'clientes.view' },
    { id: 'refacciones', label: 'Refacciones', icon: Package, permission: 'refacciones.view' },
    { id: 'mototaxis', label: 'Mototaxis', icon: Bike, permission: 'mototaxis.view' },
    { id: 'servicios', label: 'Servicios', icon: Wrench, permission: 'servicios.view' },
    { id: 'facturacion', label: 'Facturación', icon: FileText, permission: 'facturacion.view' },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, permission: 'reportes.view' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, permission: 'configuracion.view' },
  ];

  // Filtrar menú según permisos del usuario
  const menuItems = allMenuItems.filter(item => hasPermission(item.permission));

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-600 text-white';
      case 'Vendedor':
        return 'bg-blue-600 text-white';
      case 'Facturista':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-14">
        <div className="flex items-center justify-between h-full px-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-[#B02128] rounded-lg p-1.5">
                <Bike className="h-4 w-4 text-white" />
              </div>
              <span className="text-[#1E293B] text-sm">Mototaxis Pro</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 h-9 px-2">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-[#1E293B]">{user?.fullName}</span>
                    <Badge className={`${getRoleBadgeColor(user?.role || '')} text-xs px-1.5 py-0`}>
                      {user?.role}
                    </Badge>
                  </div>
                  <div className="w-8 h-8 bg-[#1E293B] rounded-full flex items-center justify-center text-white text-sm">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-500 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm text-[#1E293B]">{user?.fullName}</p>
                    <p className="text-xs text-[#64748B]">@{user?.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar - Solo desktop */}
      <aside
        className="hidden lg:block lg:fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto"
      >
        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-[#B02128] text-white'
                    : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-14 lg:pl-64 min-h-screen ${isMobile ? 'pb-16' : ''}`}>
        <div className="p-3 sm:p-4 lg:p-6">{children}</div>
      </main>

      {/* Bottom Navigation - Solo móvil */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex items-center justify-around h-16 px-2">
            {menuItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                    isActive ? 'text-[#B02128]' : 'text-[#64748B]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
