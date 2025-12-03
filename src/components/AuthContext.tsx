import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api, apiPublic } from '../lib/api';

export type UserRole = 'Administrador' | 'Vendedor' | 'Facturista';

interface User {
  username: string;
  role: UserRole;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Definición de permisos por rol
const rolePermissions: Record<UserRole, string[]> = {
  Administrador: [
    'clientes.view', 'clientes.create', 'clientes.edit', 'clientes.delete',
    'refacciones.view', 'refacciones.create', 'refacciones.edit', 'refacciones.delete',
    'mototaxis.view', 'mototaxis.create', 'mototaxis.edit', 'mototaxis.delete',
    'servicios.view', 'servicios.create', 'servicios.edit', 'servicios.delete',
    'facturacion.view', 'facturacion.create', 'facturacion.cancel',
    'reportes.view', 'reportes.export',
    'cartaPorte.view', 'cartaPorte.create', 'cartaPorte.edit', 'cartaPorte.delete',
    'configuracion.view', 'configuracion.edit',
    'puntoDeVenta.view', 'puntoDeVenta.create', 'puntoDeVenta.edit', 'puntoDeVenta.delete',
  ],
  Vendedor: [
    'clientes.view', 'clientes.create', 'clientes.edit',
    'refacciones.view', 'refacciones.create', 'refacciones.edit',
    'mototaxis.view', 'mototaxis.create', 'mototaxis.edit',
    'servicios.view', 'servicios.create', 'servicios.edit',
    'reportes.view',
    'puntoDeVenta.view', 'puntoDeVenta.create', 'puntoDeVenta.edit', 'puntoDeVenta.delete',
  ],
  Facturista: [
    'clientes.view', 'clientes.create', 'clientes.edit',
    'mototaxis.view', 'mototaxis.create', 'mototaxis.edit',
    'servicios.view', 'servicios.create', 'servicios.edit',
    'refacciones.view', 'refacciones.create', 'refacciones.edit',
    'facturacion.view', 'facturacion.create', 'facturacion.cancel',
    'cartaPorte.view', 'cartaPorte.create', 'cartaPorte.edit', 'cartaPorte.delete',
    'reportes.view', 'reportes.export',
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

// Usuarios a el backend
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      await fetch(apiPublic('/sanctum/csrf-cookie'), {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch(api('/auth/login'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Accept": "application/json"
         },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      
      const userRes = await fetch(api('/auth/user'), {
        method: "GET",
        credentials: "include",
        headers: { 
          "Accept": "application/json"
         },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user');

      const data = await userRes.json();
      const loggedInUser: User = {
        username: data.username,
        role: data.role,
      fullName: data.full_name,
    };
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    return true;
    } catch (error) {
    console.error('Login error:', error);
    return false;
  }
  };

  const logout = async () => {
    try {
      await fetch(api('/auth/logout'), {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUser(null);
    localStorage.removeItem('user');
  };

    useEffect(() => {
    (async () => {
      try {
        const res = await fetch(api('/auth/user'), {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            username: data.username,
            role: data.role,
            fullName: data.full_name
          });
        }
        
      } catch {}
    })();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  
  return context;
}
