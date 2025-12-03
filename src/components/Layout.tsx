import { useState } from 'react';
import { 
  Users, Wrench, Bike, FileText, BarChart3, Settings, Menu, 
  X, Package, LogOut, ChevronDown, ShoppingCart, Truck, MoreHorizontal 
} from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'; 
import { Badge } from './ui/badge';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const isMobile = useIsMobile();

  const allMenuItems = [
    { id: 'facturacion', label: 'Facturación', icon: FileText, permission: 'facturacion.view' },
    { id: 'cartaPorte', label: 'Carta Porte', icon: Truck, permission: 'cartaPorte.view' },
    { id: 'mototaxis', label: 'Mototaxis', icon: Bike, permission: 'mototaxis.view' },
    { id: 'servicios', label: 'Servicios', icon: Wrench, permission: 'servicios.view' },
    { id: 'puntoDeVenta', label: 'Punto de Venta', icon: ShoppingCart, permission: 'puntoDeVenta.view' }, 
    { id: 'refacciones', label: 'Refacciones', icon: Package, permission: 'refacciones.view' },
    { id: 'clientes', label: 'Clientes', icon: Users, permission: 'clientes.view' },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, permission: 'reportes.view' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, permission: 'configuracion.view' },
  ];

  const menuItems = allMenuItems.filter(item => hasPermission(item.permission));

  // Lógica visual para móvil: Máx 4 items + Botón "Más"
  const MAX_VISIBLE = 4;
  const showMore = isMobile && menuItems.length > MAX_VISIBLE;
  const visibleItems = showMore ? menuItems.slice(0, MAX_VISIBLE) : menuItems;

  const handleMobileNavigate = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador': return 'bg-purple-600 text-white';
      case 'Vendedor': return 'bg-blue-600 text-white';
      case 'Facturista': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header - SIN CAMBIOS */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-14">
        <div className="flex items-center justify-between h-full px-3">
          <div className="flex items-center gap-2">
             <div className="bg-[#B02128] rounded-lg p-1.5">
               <Bike className="h-4 w-4 text-white" />
             </div>
             <span className="text-[#1E293B] text-sm font-semibold">Mototaxis San Juan</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 h-9 px-2">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-[#1E293B]">{user?.fullName}</span>
                    <Badge className={`${getRoleBadgeColor(user?.role || '')} text-[10px] px-1.5 py-0 h-4`}>
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
                    <p className="text-xs text-gray-500">@{user?.username}</p>
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

      {/* Sidebar Desktop - SIN CAMBIOS */}
      <aside className="hidden lg:block lg:fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-[#B02128] text-white shadow-sm'
                    : 'text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-14 lg:pl-64 min-h-screen transition-all duration-200 ${isMobile ? 'pb-20' : ''}`}>
        <div className="p-3 sm:p-6 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Bottom Navigation - Móvil (ADAPTADO) */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
          <div className="flex items-center justify-around h-16 px-1">
            
            {/* 1. Íconos Principales (Tu diseño original) */}
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 h-full active:bg-gray-50 transition-colors ${
                    isActive ? 'text-[#B02128]' : 'text-[#64748B]'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'fill-current/10' : ''}`} />
                  <span className="text-[10px] font-medium truncate w-full text-center px-1">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* 2. Botón "Más" (Solo si hay muchos items) */}
            {showMore && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className={`flex flex-col items-center justify-center gap-1 flex-1 h-full active:bg-gray-50 transition-colors ${
                      // Si la página actual NO está en los visibles, iluminamos "Más"
                      !visibleItems.find(i => i.id === currentPage) ? 'text-[#B02128]' : 'text-[#64748B]'
                    }`}
                  >
                    <Menu className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Más</span>
                  </button>
                </SheetTrigger>
                
                {/* Menú Lateral Desplegable (Tu mismo estilo de lista) */}
                <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0 bg-white">
                  <SheetHeader className="p-4 border-b bg-slate-50 text-left">
                    <SheetTitle className="flex items-center gap-2 text-[#1E293B]">
                      <div className="bg-[#B02128] p-1.5 rounded">
                        <Bike className="h-5 w-5 text-white"/>
                      </div>
                      Menú Completo
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="overflow-y-auto h-full pb-20 p-2">
                    <div className="space-y-1">
                      {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleMobileNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                              isActive
                                ? 'bg-[#B02128]/10 text-[#B02128]'
                                : 'text-[#64748B] hover:bg-slate-50'
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-[#B02128]' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B02128]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}